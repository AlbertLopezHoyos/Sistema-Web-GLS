import { query } from '../config/db.js';

export const trazabilidadRepository = {
  async findHistorialByEnvio(codigo) {
    const [rows] = await query(
      `SELECT h.*, e.codigo_envio, es.nombre AS estado_nombre
       FROM historial_envios h
       JOIN envios e ON e.id = h.envio_id
       JOIN estados_envio es ON es.id = h.estado_id
       WHERE e.codigo_envio = ?
       ORDER BY h.fecha_actualizacion ASC`,
      [codigo]
    );
    return rows;
  },

  async findHistorialGeneral(filters = {}) {
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
    return rows;
  },

  async lockEnvioByCodigo(conn, codigo) {
    const [rows] = await conn.execute(
      `SELECT e.*, es.nombre AS estado_nombre FROM envios e
       JOIN estados_envio es ON es.id = e.estado_actual_id
       WHERE e.codigo_envio = ? LIMIT 1 FOR UPDATE`,
      [codigo]
    );
    return rows[0] || null;
  },

  async getEstadoId(conn, nombre) {
    const [rows] = await conn.execute('SELECT id FROM estados_envio WHERE nombre = ? LIMIT 1', [nombre]);
    return rows[0]?.id;
  },

  async updateEnvioEstado(conn, sql, params) {
    await conn.execute(sql, params);
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

  async findHistorialById(historialId) {
    const [rows] = await query(
      `SELECT h.*, e.codigo_envio, es.nombre AS estado_nombre
       FROM historial_envios h
       JOIN envios e ON e.id = h.envio_id
       JOIN estados_envio es ON es.id = h.estado_id
       WHERE h.id = ?`,
      [historialId]
    );
    return rows[0] || null;
  },
};
