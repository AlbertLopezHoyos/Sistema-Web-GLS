import { getConnection } from '../config/db.js';
import { mapEnvio, cotizacionFromJoinRow } from '../utils/mappers.js';
import { calcularCotizacion } from '../utils/cotizacion.js';
import {
  validateRequired, validatePositiveNumber, validateParty, validateDimensiones, validateCotizacionInput,
} from '../utils/validation.js';
import { ValidationError } from '../utils/errors.js';
import { auditService } from './auditService.js';
import { clientesService } from './clientesService.js';
import { enviosRepository } from '../repositories/enviosRepository.js';

const AREA_DEFAULT = 'Área de operaciones';
const INITIAL_STATUS = 'Registrado';
const ACTIVE_STATUSES = ['Registrado', 'En almacén', 'En tránsito', 'En reparto', 'Observado'];

const formatCodigoEnvio = (year, seq) => `ENV-${year}-${String(seq).padStart(4, '0')}`;

const mapRow = (row) => mapEnvio(row, cotizacionFromJoinRow(row));

const validateEnvio = (data) => {
  const errors = {};
  ['origen', 'destino', 'tipoCarga', 'descripcion'].forEach((f) => {
    const err = validateRequired(data[f], f);
    if (err) errors[f] = err;
  });
  const peso = validatePositiveNumber(data.peso, 'Peso');
  if (peso) errors.peso = peso;
  Object.assign(errors, validateDimensiones(data.dimensiones));
  Object.assign(errors, validateParty(data.remitente, 'remitente'));
  Object.assign(errors, validateParty(data.destinatario, 'destinatario'));
  if (data.cotizacion) Object.assign(errors, validateCotizacionInput(data.cotizacion));
  return errors;
};

const hasCotizacionInput = (cotizacion) => cotizacion && (
  cotizacion.distanciaKm !== undefined
  || cotizacion.tarifaPorKg !== undefined
  || cotizacion.tarifaPorM3 !== undefined
  || cotizacion.tarifaPorKm !== undefined
);

export const enviosService = {
  validateEnvioForm: validateEnvio,

  async getEnvios(filters = {}) {
    const rows = await enviosRepository.findAll(filters);
    return rows.map(mapRow);
  },

  async getEnvioByCodigo(codigo) {
    const row = await enviosRepository.findByCodigo(codigo);
    return mapRow(row);
  },

  async getEnviosActivos() {
    const rows = await enviosRepository.findActivos(ACTIVE_STATUSES);
    return rows.map(mapRow);
  },

  async createEnvio(data, actor) {
    const errors = validateEnvio(data);
    if (Object.keys(errors).length) throw new ValidationError(errors);

    const conn = await getConnection();
    try {
      await conn.beginTransaction();

      const year = new Date().getFullYear();
      const seq = await enviosRepository.nextCodigo(conn, year);
      const codigoEnvio = formatCodigoEnvio(year, seq);
      const now = new Date();
      const estadoId = await enviosRepository.getEstadoId(conn, INITIAL_STATUS);

      let clienteId = null;
      let clienteSnapshot = { documento: null, nombres: null, telefono: null, direccion: null, empresa: null };
      if (data.clienteDocumento) {
        const cliente = await clientesService.getByDocumento(data.clienteDocumento);
        if (cliente) {
          clienteId = cliente.id;
          clienteSnapshot = {
            documento: cliente.documento,
            nombres: cliente.nombres,
            telefono: cliente.telefono,
            direccion: cliente.direccion,
            empresa: cliente.empresa,
          };
        }
      }

      let cotizacionEstimada = null;
      if (hasCotizacionInput(data.cotizacion)) {
        cotizacionEstimada = calcularCotizacion({
          peso: data.peso,
          largo: data.dimensiones.largo,
          ancho: data.dimensiones.ancho,
          alto: data.dimensiones.alto,
          unidadMedida: data.dimensiones.unidadMedida,
          distanciaKm: data.cotizacion.distanciaKm ?? 0,
          tarifaPorKg: data.cotizacion.tarifaPorKg ?? 2.5,
          tarifaPorM3: data.cotizacion.tarifaPorM3 ?? 180,
          tarifaPorKm: data.cotizacion.tarifaPorKm ?? 1.2,
          seguroPorcentaje: data.cotizacion.seguroPorcentaje ?? 0,
          moneda: data.cotizacion.moneda ?? 'PEN',
        });
      }

      const envioId = await enviosRepository.insertEnvio(conn, [
        codigoEnvio, clienteId, estadoId,
        data.remitente.nombres.trim(), data.remitente.documento.trim(), data.remitente.telefono.trim(), data.remitente.direccion.trim(),
        data.destinatario.nombres.trim(), data.destinatario.documento.trim(), data.destinatario.telefono.trim(), data.destinatario.direccion.trim(),
        clienteSnapshot.documento, clienteSnapshot.nombres, clienteSnapshot.telefono, clienteSnapshot.direccion, clienteSnapshot.empresa,
        data.origen.trim(), data.destino.trim(), data.tipoCarga.trim(), data.descripcion.trim(), Number(data.peso),
        Number(data.dimensiones.largo), Number(data.dimensiones.ancho), Number(data.dimensiones.alto), data.dimensiones.unidadMedida,
        data.observacion?.trim() || 'Sin observaciones',
        now, now, now, now,
      ]);

      const historialId = `${codigoEnvio}__${now.toISOString()}`;
      await enviosRepository.insertHistorial(conn, [
        historialId, envioId, estadoId, now, 'Registro inicial del envío', AREA_DEFAULT,
        '', '', '', '',
        actor?.email || 'sistema', actor?.id || null,
      ]);

      if (cotizacionEstimada) {
        const d = cotizacionEstimada.desglose;
        await enviosRepository.insertCotizacion(conn, [
          envioId, cotizacionEstimada.moneda,
          Number(data.cotizacion.distanciaKm ?? 0),
          Number(data.cotizacion.tarifaPorKg ?? 2.5),
          Number(data.cotizacion.tarifaPorM3 ?? 180),
          Number(data.cotizacion.tarifaPorKm ?? 1.2),
          Number(data.cotizacion.seguroPorcentaje ?? 0),
          cotizacionEstimada.volumenM3, cotizacionEstimada.pesoVolumetricoKg, cotizacionEstimada.pesoCobradoKg,
          d.costoPorPeso, d.costoPorVolumen, d.costoPorDistancia, d.subtotal, d.seguroMonto, d.totalEstimado,
          cotizacionEstimada.nota,
        ]);
      }

      if (process.env.NODE_ENV === 'test' && data.__testForceFailBeforeAudit) {
        throw new Error('Fallo simulado para prueba de transacción');
      }

      await auditService.registrar({
        accion: 'envio_creado',
        modulo: 'Envíos',
        descripcion: `Envío ${codigoEnvio} registrado`,
        usuarioId: actor?.id,
        usuarioEmail: actor?.email || '',
        rol: actor?.rol || '',
      }, conn);

      await conn.commit();
      return this.getEnvioByCodigo(codigoEnvio);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async getDashboardStats() {
    const { estadoRows, total, ultimosRows } = await enviosRepository.getDashboardAggregates();
    const porEstado = {};
    estadoRows.forEach((r) => { porEstado[r.estado] = Number(r.total); });
    const envios = ultimosRows.map(mapRow);
    return {
      total: Number(total),
      porEstado,
      entregados: porEstado['Entregado'] || 0,
      pendientes: (porEstado['Registrado'] || 0) + (porEstado['En almacén'] || 0) + (porEstado['En tránsito'] || 0) + (porEstado['En reparto'] || 0),
      observados: porEstado['Observado'] || 0,
      ultimos: envios,
    };
  },
};
