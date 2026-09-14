import { getConnection } from '../config/db.js';
import { mapHistorial } from '../utils/mappers.js';
import { validateRequired, validateReceptorDocumento } from '../utils/validation.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { auditService } from './auditService.js';
import { enviosService } from './enviosService.js';
import { trazabilidadRepository } from '../repositories/trazabilidadRepository.js';

const SHIPMENT_STATUSES = ['Registrado', 'En almacén', 'En tránsito', 'En reparto', 'Entregado', 'Observado', 'Cancelado'];
const AREA_DEFAULT = 'Área de operaciones';

export const trazabilidadService = {
  getEstadosPermitidos() {
    return SHIPMENT_STATUSES;
  },

  async getHistorialByEnvio(codigo) {
    const rows = await trazabilidadRepository.findHistorialByEnvio(codigo);
    return rows.map(mapHistorial);
  },

  async getHistorialGeneral(filters = {}) {
    const rows = await trazabilidadRepository.findHistorialGeneral(filters);
    return rows.map((row) => ({
      ...mapHistorial(row),
      cliente: row.cliente_nombres || row.remitente_nombres || '—',
      origen: row.origen || '—',
      destino: row.destino || '—',
    }));
  },

  async actualizarEstado(codigo, data, actor) {
    const errors = {};
    if (!SHIPMENT_STATUSES.includes(data.estado)) errors.estado = 'Estado inválido';
    const obs = validateRequired(data.observacion, 'Observación');
    if (obs) errors.observacion = obs;
    else if (data.observacion.trim().length < 3) errors.observacion = 'Mínimo 3 caracteres';

    if (data.estado === 'Entregado') {
      const ref = validateRequired(data.evidenciaReferencia, 'Referencia de evidencia');
      if (ref) errors.evidenciaReferencia = ref;
      else if (data.evidenciaReferencia.trim().length < 4) errors.evidenciaReferencia = 'Mínimo 4 caracteres';
      const recNom = validateRequired(data.receptorNombre, 'Nombre del receptor');
      if (recNom) errors.receptorNombre = recNom;
      else if (data.receptorNombre.trim().length < 2) errors.receptorNombre = 'Mínimo 2 caracteres';
      const recDoc = validateReceptorDocumento(data.receptorDocumento);
      if (recDoc) errors.receptorDocumento = recDoc;
    }

    if (Object.keys(errors).length) throw new ValidationError(errors);

    const conn = await getConnection();
    try {
      await conn.beginTransaction();

      const envioRow = await trazabilidadRepository.lockEnvioByCodigo(conn, codigo);
      if (!envioRow) throw new NotFoundError('Envío no encontrado');

      const estadoId = await trazabilidadRepository.getEstadoId(conn, data.estado);
      const now = new Date();

      let updateSql = `UPDATE envios SET estado_actual_id = ?, fecha_ultima_actualizacion = ?, updated_at = ?`;
      const updateParams = [estadoId, now, now];

      if (data.estado === 'Entregado') {
        updateSql += `, evidencia_referencia = ?, evidencia_detalle = ?,
          evidencia_receptor_nombre = ?, evidencia_receptor_documento = ?,
          evidencia_fecha = ?, evidencia_registrado_por = ?`;
        updateParams.push(
          data.evidenciaReferencia.trim(),
          (data.evidenciaDetalle || '').trim(),
          data.receptorNombre.trim(),
          data.receptorDocumento.trim(),
          now,
          actor?.email || 'sistema'
        );
      }

      updateSql += ' WHERE id = ?';
      updateParams.push(envioRow.id);
      await trazabilidadRepository.updateEnvioEstado(conn, updateSql, updateParams);

      const historialId = `${codigo}__${now.toISOString()}`;
      await trazabilidadRepository.insertHistorial(conn, [
        historialId, envioRow.id, estadoId, now, data.observacion.trim(), AREA_DEFAULT,
        data.evidenciaReferencia || '', data.evidenciaDetalle || '',
        data.receptorNombre || '', data.receptorDocumento || '',
        actor?.email || 'sistema', actor?.id || null,
      ]);

      await auditService.registrar({
        accion: 'estado_actualizado',
        modulo: 'Trazabilidad',
        descripcion: `Estado de ${codigo} actualizado a ${data.estado}`,
        usuarioId: actor?.id,
        usuarioEmail: actor?.email || '',
        rol: actor?.rol || '',
      }, conn);

      await conn.commit();

      const envio = await enviosService.getEnvioByCodigo(codigo);
      const histRow = await trazabilidadRepository.findHistorialById(historialId);
      return { envio, evento: mapHistorial(histRow) };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};
