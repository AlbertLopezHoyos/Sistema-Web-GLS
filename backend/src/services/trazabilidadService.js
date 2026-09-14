import { getConnection, query } from '../config/db.js';
import { mapEnvio, mapHistorial } from '../utils/mappers.js';
import { validateRequired, validateReceptorDocumento } from '../utils/validation.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { auditService } from './auditService.js';

const SHIPMENT_STATUSES = ['Registrado', 'En almacén', 'En tránsito', 'En reparto', 'Entregado', 'Observado', 'Cancelado'];
const AREA_DEFAULT = 'Área de operaciones';

export const trazabilidadService = {
  getEstadosPermitidos() {
    return SHIPMENT_STATUSES;
  },

  async getHistorialByEnvio(codigo) {
    const [rows] = await query(
      `SELECT h.*, e.codigo_envio, es.nombre AS estado_nombre
       FROM historial_envios h
       JOIN envios e ON e.id = h.envio_id
       JOIN estados_envio es ON es.id = h.estado_id
       WHERE e.codigo_envio = ?
       ORDER BY h.fecha_actualizacion ASC`,
      [codigo]
    );
    return rows.map(mapHistorial);
  },

  async getHistorialGeneral(filters = {}) {
    let sql = `
      SELECT h.*, e.codigo_envio, es.nombre AS estado_nombre,
             e.origen, e.destino, e.cliente_nombres, e.remitente_nombres
      FROM historial_envios h
      JOIN envios e ON e.id = h.envio_id
      JOIN estados_envio es ON es.id = h.estado_id
      WHERE 1=1`;
    const params = [];

    if (filters.estado && filters.estado !== 'Todos') {
      sql += ' AND es.nombre = ?';
      params.push(filters.estado);
    }
    if (filters.search) {
      const q = `%${filters.search.toLowerCase()}%`;
      sql += ' AND (LOWER(e.codigo_envio) LIKE ? OR LOWER(e.cliente_nombres) LIKE ? OR LOWER(h.observacion) LIKE ?)';
      params.push(q, q, q);
    }
    if (filters.desde) {
      sql += ' AND h.fecha_actualizacion >= ?';
      params.push(new Date(filters.desde));
    }
    if (filters.hasta) {
      const hasta = new Date(filters.hasta);
      hasta.setHours(23, 59, 59, 999);
      sql += ' AND h.fecha_actualizacion <= ?';
      params.push(hasta);
    }

    sql += ' ORDER BY h.fecha_actualizacion DESC';
    const [rows] = await query(sql, params);

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

      const [envioRows] = await conn.execute(
        `SELECT e.*, es.nombre AS estado_nombre FROM envios e
         JOIN estados_envio es ON es.id = e.estado_actual_id
         WHERE e.codigo_envio = ? LIMIT 1 FOR UPDATE`,
        [codigo]
      );
      if (!envioRows[0]) throw new NotFoundError('Envío no encontrado');

      const [estadoRows] = await conn.execute('SELECT id FROM estados_envio WHERE nombre = ? LIMIT 1', [data.estado]);
      const estadoId = estadoRows[0].id;
      const now = new Date();
      const envioRow = envioRows[0];

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
      await conn.execute(updateSql, updateParams);

      const historialId = `${codigo}__${now.toISOString()}`;
      await conn.execute(
        `INSERT INTO historial_envios (
          id, envio_id, estado_id, fecha_actualizacion, observacion, responsable,
          evidencia_referencia, evidencia_detalle, receptor_nombre, receptor_documento,
          registrado_por, usuario_id
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          historialId, envioRow.id, estadoId, now, data.observacion.trim(), AREA_DEFAULT,
          data.evidenciaReferencia || '', data.evidenciaDetalle || '',
          data.receptorNombre || '', data.receptorDocumento || '',
          actor?.email || 'sistema', actor?.id || null,
        ]
      );

      await auditService.registrar({
        accion: 'estado_actualizado',
        modulo: 'Trazabilidad',
        descripcion: `Estado de ${codigo} actualizado a ${data.estado}`,
        usuarioId: actor?.id,
        usuarioEmail: actor?.email || '',
        rol: actor?.rol || '',
      });

      await conn.commit();

      const { enviosService } = await import('./enviosService.js');
      const envio = await enviosService.getEnvioByCodigo(codigo);
      const [histRows] = await query(
        `SELECT h.*, e.codigo_envio, es.nombre AS estado_nombre
         FROM historial_envios h
         JOIN envios e ON e.id = h.envio_id
         JOIN estados_envio es ON es.id = h.estado_id
         WHERE h.id = ?`,
        [historialId]
      );

      return { envio, evento: mapHistorial(histRows[0]) };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};
