import { getConnection, query } from '../config/db.js';
import { mapEnvio, mapCotizacion } from '../utils/mappers.js';
import { calcularCotizacion } from '../utils/cotizacion.js';
import {
  validateDocumento, validateTelefono, validateRequired, validatePositiveNumber,
} from '../utils/validation.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { auditService } from './auditService.js';
import { clientesService } from './clientesService.js';

const AREA_DEFAULT = 'Área de operaciones';
const INITIAL_STATUS = 'Registrado';
const ACTIVE_STATUSES = ['Registrado', 'En almacén', 'En tránsito', 'En reparto', 'Observado'];

const formatCodigoEnvio = (year, seq) => `ENV-${year}-${String(seq).padStart(4, '0')}`;

const validateEnvio = (data) => {
  const errors = {};
  ['origen', 'destino', 'tipoCarga', 'descripcion'].forEach((f) => {
    const err = validateRequired(data[f], f);
    if (err) errors[f] = err;
  });
  const peso = validatePositiveNumber(data.peso, 'Peso');
  if (peso) errors.peso = peso;
  ['largo', 'ancho', 'alto'].forEach((d) => {
    const err = validatePositiveNumber(data.dimensiones?.[d], d);
    if (err) errors[d] = err;
  });
  const validateParty = (party, prefix) => {
    if (!party) return;
    const n = validateRequired(party.nombres, `${prefix} nombres`);
    if (n) errors[`${prefix}_nombres`] = n;
    const doc = validateDocumento(party.documento);
    if (doc) errors[`${prefix}_documento`] = doc;
    const tel = validateTelefono(party.telefono);
    if (tel) errors[`${prefix}_telefono`] = tel;
    const dir = validateRequired(party.direccion, `${prefix} dirección`);
    if (dir) errors[`${prefix}_direccion`] = dir;
  };
  validateParty(data.remitente, 'remitente');
  validateParty(data.destinatario, 'destinatario');
  return errors;
};

const ENVIO_SELECT = `
  SELECT e.*, es.nombre AS estado_nombre
  FROM envios e
  JOIN estados_envio es ON es.id = e.estado_actual_id
`;

const fetchCotizacion = async (envioId) => {
  const [rows] = await query('SELECT * FROM cotizaciones_envio WHERE envio_id = ? LIMIT 1', [envioId]);
  return rows[0] || null;
};

const buildFilters = (filters, params) => {
  let sql = '';
  if (filters.estado && filters.estado !== 'Todos') {
    sql += ' AND es.nombre = ?';
    params.push(filters.estado);
  }
  if (filters.codigo) {
    sql += ' AND e.codigo_envio LIKE ?';
    params.push(`%${filters.codigo.toUpperCase()}%`);
  }
  if (filters.cliente) {
    const q = `%${filters.cliente.toLowerCase()}%`;
    sql += ` AND (
      LOWER(e.cliente_nombres) LIKE ? OR LOWER(e.cliente_documento) LIKE ?
      OR LOWER(e.remitente_nombres) LIKE ? OR LOWER(e.destinatario_nombres) LIKE ?
    )`;
    params.push(q, q, q, q);
  }
  if (filters.desde) {
    sql += ' AND e.fecha_registro >= ?';
    params.push(new Date(filters.desde));
  }
  if (filters.hasta) {
    const hasta = new Date(filters.hasta);
    hasta.setHours(23, 59, 59, 999);
    sql += ' AND e.fecha_registro <= ?';
    params.push(hasta);
  }
  return sql;
};

export const enviosService = {
  validateEnvioForm: validateEnvio,

  async getEnvios(filters = {}) {
    const params = [];
    let sql = `${ENVIO_SELECT} WHERE 1=1`;
    sql += buildFilters(filters, params);
    sql += ' ORDER BY e.fecha_registro DESC';
    const [rows] = await query(sql, params);
    const envios = [];
    for (const row of rows) {
      const cot = await fetchCotizacion(row.id);
      envios.push(mapEnvio(row, cot));
    }
    return envios;
  },

  async getEnvioByCodigo(codigo) {
    const [rows] = await query(`${ENVIO_SELECT} WHERE e.codigo_envio = ? LIMIT 1`, [codigo]);
    if (!rows[0]) return null;
    const cot = await fetchCotizacion(rows[0].id);
    return mapEnvio(rows[0], cot);
  },

  async getEnviosActivos() {
    const placeholders = ACTIVE_STATUSES.map(() => '?').join(',');
    const [rows] = await query(
      `${ENVIO_SELECT} WHERE es.nombre IN (${placeholders}) ORDER BY e.fecha_registro DESC`,
      ACTIVE_STATUSES
    );
    const envios = [];
    for (const row of rows) {
      const cot = await fetchCotizacion(row.id);
      envios.push(mapEnvio(row, cot));
    }
    return envios;
  },

  async createEnvio(data, actor) {
    const errors = validateEnvio(data);
    if (Object.keys(errors).length) throw new ValidationError(errors);

    const conn = await getConnection();
    try {
      await conn.beginTransaction();

      const year = new Date().getFullYear();
      await conn.execute(
        'INSERT INTO secuencias_envio (anio, contador) VALUES (?, 0) ON DUPLICATE KEY UPDATE anio = anio',
        [year]
      );
      await conn.execute('SELECT contador FROM secuencias_envio WHERE anio = ? FOR UPDATE', [year]);
      await conn.execute('UPDATE secuencias_envio SET contador = contador + 1 WHERE anio = ?', [year]);
      const [seqRows] = await conn.execute('SELECT contador FROM secuencias_envio WHERE anio = ?', [year]);
      const codigoEnvio = formatCodigoEnvio(year, seqRows[0].contador);
      const now = new Date();

      const [estadoRows] = await conn.execute('SELECT id FROM estados_envio WHERE nombre = ? LIMIT 1', [INITIAL_STATUS]);
      const estadoId = estadoRows[0].id;

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
      if (data.cotizacion && (data.cotizacion.distanciaKm || data.cotizacion.tarifaPorKg)) {
        cotizacionEstimada = calcularCotizacion({
          peso: data.peso,
          largo: data.dimensiones.largo,
          ancho: data.dimensiones.ancho,
          alto: data.dimensiones.alto,
          unidadMedida: data.dimensiones.unidadMedida,
          ...data.cotizacion,
        });
      }

      const [insertResult] = await conn.execute(
        `INSERT INTO envios (
          codigo_envio, cliente_id, estado_actual_id,
          remitente_nombres, remitente_documento, remitente_telefono, remitente_direccion,
          destinatario_nombres, destinatario_documento, destinatario_telefono, destinatario_direccion,
          cliente_documento, cliente_nombres, cliente_telefono, cliente_direccion, cliente_empresa,
          origen, destino, tipo_carga, descripcion, peso,
          dim_largo, dim_ancho, dim_alto, dim_unidad, observacion,
          fecha_registro, fecha_ultima_actualizacion, created_at, updated_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          codigoEnvio, clienteId, estadoId,
          data.remitente.nombres.trim(), data.remitente.documento.trim(), data.remitente.telefono.trim(), data.remitente.direccion.trim(),
          data.destinatario.nombres.trim(), data.destinatario.documento.trim(), data.destinatario.telefono.trim(), data.destinatario.direccion.trim(),
          clienteSnapshot.documento, clienteSnapshot.nombres, clienteSnapshot.telefono, clienteSnapshot.direccion, clienteSnapshot.empresa,
          data.origen.trim(), data.destino.trim(), data.tipoCarga.trim(), data.descripcion.trim(), Number(data.peso),
          Number(data.dimensiones.largo), Number(data.dimensiones.ancho), Number(data.dimensiones.alto), data.dimensiones.unidadMedida || 'cm',
          data.observacion?.trim() || 'Sin observaciones',
          now, now, now, now,
        ]
      );

      const envioId = insertResult.insertId;
      const historialId = `${codigoEnvio}__${now.toISOString()}`;
      await conn.execute(
        `INSERT INTO historial_envios (
          id, envio_id, estado_id, fecha_actualizacion, observacion, responsable,
          evidencia_referencia, evidencia_detalle, receptor_nombre, receptor_documento,
          registrado_por, usuario_id
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          historialId, envioId, estadoId, now, 'Registro inicial del envío', AREA_DEFAULT,
          '', '', '', '',
          actor?.email || 'sistema', actor?.id || null,
        ]
      );

      if (cotizacionEstimada) {
        const d = cotizacionEstimada.desglose;
        await conn.execute(
          `INSERT INTO cotizaciones_envio (
            envio_id, moneda, distancia_km, tarifa_por_kg, tarifa_por_m3, tarifa_por_km, seguro_porcentaje,
            volumen_m3, peso_volumetrico_kg, peso_cobrado_kg,
            costo_por_peso, costo_por_volumen, costo_por_distancia, subtotal, seguro_monto, total_estimado, nota
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            envioId, cotizacionEstimada.moneda,
            Number(data.cotizacion.distanciaKm || 0),
            Number(data.cotizacion.tarifaPorKg || 2.5),
            Number(data.cotizacion.tarifaPorM3 || 180),
            Number(data.cotizacion.tarifaPorKm || 1.2),
            Number(data.cotizacion.seguroPorcentaje || 0),
            cotizacionEstimada.volumenM3, cotizacionEstimada.pesoVolumetricoKg, cotizacionEstimada.pesoCobradoKg,
            d.costoPorPeso, d.costoPorVolumen, d.costoPorDistancia, d.subtotal, d.seguroMonto, d.totalEstimado,
            cotizacionEstimada.nota,
          ]
        );
      }

      await auditService.registrar({
        accion: 'envio_creado',
        modulo: 'Envíos',
        descripcion: `Envío ${codigoEnvio} registrado`,
        usuarioId: actor?.id,
        usuarioEmail: actor?.email || '',
        rol: actor?.rol || '',
      });

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
    const envios = await this.getEnvios({});
    const porEstado = {};
    envios.forEach((e) => {
      porEstado[e.estadoActual] = (porEstado[e.estadoActual] || 0) + 1;
    });
    return {
      total: envios.length,
      porEstado,
      entregados: porEstado['Entregado'] || 0,
      pendientes: (porEstado['Registrado'] || 0) + (porEstado['En almacén'] || 0) + (porEstado['En tránsito'] || 0) + (porEstado['En reparto'] || 0),
      observados: porEstado['Observado'] || 0,
      ultimos: envios.slice(0, 5),
    };
  },
};
