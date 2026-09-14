import { query } from '../config/db.js';

export const respaldosRepository = {
  async findAll() {
    const [rows] = await query(
      `SELECT r.*, u.email AS usuario_email FROM respaldos r
       LEFT JOIN usuarios u ON u.id = r.usuario_id
       ORDER BY r.fecha DESC`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await query('SELECT * FROM respaldos WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async insert(params) {
    await query(
      `INSERT INTO respaldos (id, archivo, fecha, estado, tamano_bytes, tipo, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      params
    );
  },
};
