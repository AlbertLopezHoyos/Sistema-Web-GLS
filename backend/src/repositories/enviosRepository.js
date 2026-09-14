import { query } from '../config/db.js';

const ENVIO_SELECT = `
  SELECT e.*, es.nombre AS estado_nombre,
    c.moneda AS cot_moneda, c.distancia_km AS cot_distancia_km,
    c.tarifa_por_kg AS cot_tarifa_por_kg, c.tarifa_por_m3 AS cot_tarifa_por_m3,
    c.tarifa_por_km AS cot_tarifa_por_km, c.seguro_porcentaje AS cot_seguro_porcentaje,
    c.volumen_m3 AS cot_volumen_m3, c.peso_volumetrico_kg AS cot_peso_volumetrico_kg,
    c.peso_cobrado_kg AS cot_peso_cobrado_kg, c.costo_por_peso AS cot_costo_por_peso,
    c.costo_por_volumen AS cot_costo_por_volumen, c.costo_por_distancia AS cot_costo_por_distancia,
    c.subtotal AS cot_subtotal, c.seguro_monto AS cot_seguro_monto,
    c.total_estimado AS cot_total_estimado, c.nota AS cot_nota
  FROM envios e
  JOIN estados_envio es ON es.id = e.estado_actual_id
  LEFT JOIN cotizaciones_envio c ON c.envio_id = e.id
`;

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

export const enviosRepository = {
  async findAll(filters = {}) {
    const params = [];
    let sql = `${ENVIO_SELECT} WHERE 1=1`;
    sql += buildFilters(filters, params);
    sql += ' ORDER BY e.fecha_registro DESC';
    const [rows] = await query(sql, params);
    return rows;
  },

  async findByCodigo(codigo) {
    const [rows] = await query(`${ENVIO_SELECT} WHERE e.codigo_envio = ? LIMIT 1`, [codigo]);
    return rows[0] || null;
  },

  async findActivos(activeStatuses) {
    const placeholders = activeStatuses.map(() => '?').join(',');
    const [rows] = await query(
      `${ENVIO_SELECT} WHERE es.nombre IN (${placeholders}) ORDER BY e.fecha_registro DESC`,
      activeStatuses
    );
    return rows;
  },

  async getDashboardAggregates() {
    const [estadoRows] = await query(
      `SELECT es.nombre AS estado, COUNT(*) AS total
       FROM envios e JOIN estados_envio es ON es.id = e.estado_actual_id
       GROUP BY es.nombre`
    );
    const [totalRows] = await query('SELECT COUNT(*) AS total FROM envios');
    const [ultimosRows] = await query(
      `${ENVIO_SELECT} ORDER BY e.fecha_registro DESC LIMIT 5`
    );
    return { estadoRows, total: totalRows[0]?.total || 0, ultimosRows };
  },

  async nextCodigo(conn, year) {
    await conn.execute(
      'INSERT INTO secuencias_envio (anio, contador) VALUES (?, 0) ON DUPLICATE KEY UPDATE anio = anio',
      [year]
    );
    await conn.execute('SELECT contador FROM secuencias_envio WHERE anio = ? FOR UPDATE', [year]);
    await conn.execute('UPDATE secuencias_envio SET contador = contador + 1 WHERE anio = ?', [year]);
    const [seqRows] = await conn.execute('SELECT contador FROM secuencias_envio WHERE anio = ?', [year]);
    return seqRows[0].contador;
  },

  async getEstadoId(conn, nombre) {
    const [rows] = await conn.execute('SELECT id FROM estados_envio WHERE nombre = ? LIMIT 1', [nombre]);
    return rows[0]?.id;
  },

  async insertEnvio(conn, params) {
    const [result] = await conn.execute(
      `INSERT INTO envios (
        codigo_envio, cliente_id, estado_actual_id,
        remitente_nombres, remitente_documento, remitente_telefono, remitente_direccion,
        destinatario_nombres, destinatario_documento, destinatario_telefono, destinatario_direccion,
        cliente_documento, cliente_nombres, cliente_telefono, cliente_direccion, cliente_empresa,
        origen, destino, tipo_carga, descripcion, peso,
        dim_largo, dim_ancho, dim_alto, dim_unidad, observacion,
        fecha_registro, fecha_ultima_actualizacion, created_at, updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      params
    );
    return result.insertId;
  },

  async insertHistorial(conn, params) {
    await conn.execute(
      `INSERT INTO historial_envios (
        id, envio_id, estado_id, fecha_actualizacion, observacion, responsable,
        evidencia_referencia, evidencia_detalle, receptor_nombre, receptor_documento,
        registrado_por, usuario_id
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      params
    );
  },

  async insertCotizacion(conn, params) {
    await conn.execute(
      `INSERT INTO cotizaciones_envio (
        envio_id, moneda, distancia_km, tarifa_por_kg, tarifa_por_m3, tarifa_por_km, seguro_porcentaje,
        volumen_m3, peso_volumetrico_kg, peso_cobrado_kg,
        costo_por_peso, costo_por_volumen, costo_por_distancia, subtotal, seguro_monto, total_estimado, nota
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      params
    );
  },

  async countByCodigo(codigo) {
    const [rows] = await query('SELECT COUNT(*) AS total FROM envios WHERE codigo_envio = ?', [codigo]);
    return rows[0]?.total || 0;
  },

  async countHistorialByEnvioCodigo(codigo) {
    const [rows] = await query(
      `SELECT COUNT(*) AS total FROM historial_envios h
       JOIN envios e ON e.id = h.envio_id WHERE e.codigo_envio = ?`,
      [codigo]
    );
    return rows[0]?.total || 0;
  },
};
