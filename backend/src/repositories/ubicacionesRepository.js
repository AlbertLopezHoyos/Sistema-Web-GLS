import { query } from '../config/db.js';

export const ubicacionesRepository = {
  async findByEnvio(codigo) {
    const [rows] = await query(
      `SELECT u.*, e.codigo_envio FROM ubicaciones_envio u
       JOIN envios e ON e.id = u.envio_id
       WHERE e.codigo_envio = ?
       ORDER BY u.fecha_registro ASC`,
      [codigo]
    );
    return rows;
  },

  async findEnvioId(codigo) {
    const [rows] = await query('SELECT id FROM envios WHERE codigo_envio = ? LIMIT 1', [codigo]);
    return rows[0]?.id || null;
  },

  async insert(params) {
    await query(
      `INSERT INTO ubicaciones_envio (
        id, envio_id, direccion, latitud, longitud, observacion,
        fecha_registro, responsable, registrado_por, usuario_id
      ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      params
    );
  },

  async findById(id) {
    const [rows] = await query(
      `SELECT u.*, e.codigo_envio FROM ubicaciones_envio u
       JOIN envios e ON e.id = u.envio_id WHERE u.id = ?`,
      [id]
    );
    return rows[0] || null;
  },
};
