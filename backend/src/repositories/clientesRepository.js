import { query } from '../config/db.js';

export const clientesRepository = {
  async findAll() {
    const [rows] = await query('SELECT * FROM clientes ORDER BY nombres');
    return rows;
  },

  async findById(id) {
    const [rows] = await query('SELECT * FROM clientes WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async findByDocumento(documento) {
    const [rows] = await query('SELECT * FROM clientes WHERE documento = ? LIMIT 1', [documento.trim()]);
    return rows[0] || null;
  },

  async search(queryStr) {
    const q = `%${queryStr.trim().toLowerCase()}%`;
    const [rows] = await query(
      `SELECT * FROM clientes
       WHERE LOWER(nombres) LIKE ? OR LOWER(documento) LIKE ? OR LOWER(empresa) LIKE ?
       ORDER BY nombres`,
      [q, q, q]
    );
    return rows;
  },

  async insert(params) {
    await query(
      `INSERT INTO clientes (id, nombres, documento, telefono, direccion, empresa, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );
  },

  async update(id, params) {
    await query(
      `UPDATE clientes SET nombres = ?, telefono = ?, direccion = ?, empresa = ?, updated_at = ? WHERE id = ?`,
      params
    );
  },
};
