import { query } from '../config/db.js';

export const usuariosRepository = {
  async findAll() {
    const [rows] = await query(
      `SELECT u.*, r.codigo AS rol_codigo FROM usuarios u JOIN roles r ON r.id = u.rol_id ORDER BY u.nombres`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await query(
      `SELECT u.*, r.codigo AS rol_codigo FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await query(
      `SELECT u.*, r.codigo AS rol_codigo FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.email = ? LIMIT 1`,
      [email.trim().toLowerCase()]
    );
    return rows[0] || null;
  },

  async getRolId(codigo) {
    const [rows] = await query('SELECT id FROM roles WHERE codigo = ? LIMIT 1', [codigo]);
    return rows[0]?.id;
  },

  async insert(params) {
    await query(
      `INSERT INTO usuarios (id, email, nombres, rol_id, activo, password_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );
  },

  async update(id, params) {
    await query(
      `UPDATE usuarios SET nombres = ?, rol_id = ?, activo = ?, updated_at = ? WHERE id = ?`,
      params
    );
  },

  async setActivo(id, activo, updatedAt) {
    await query('UPDATE usuarios SET activo = ?, updated_at = ? WHERE id = ?', [activo ? 1 : 0, updatedAt, id]);
  },

  async countActiveAdmins(excludeId = null) {
    let sql = `SELECT COUNT(*) AS total FROM usuarios u
      JOIN roles r ON r.id = u.rol_id
      WHERE r.codigo = 'admin' AND u.activo = 1`;
    const params = [];
    if (excludeId) {
      sql += ' AND u.id != ?';
      params.push(excludeId);
    }
    const [rows] = await query(sql, params);
    return rows[0]?.total || 0;
  },
};
