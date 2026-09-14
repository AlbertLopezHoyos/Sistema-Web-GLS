import bcrypt from 'bcryptjs';
import env from '../config/env.js';
import { query } from '../config/db.js';
import { mapUsuario } from '../utils/mappers.js';
import { validateEmail, validatePassword, validateRequired } from '../utils/validation.js';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors.js';
import { auditService } from './auditService.js';

const ROLES = ['admin', 'operaciones', 'consulta'];

const getRolId = async (codigo) => {
  const [rows] = await query('SELECT id FROM roles WHERE codigo = ? LIMIT 1', [codigo]);
  return rows[0]?.id;
};

export const usuariosService = {
  async getAll() {
    const [rows] = await query(
      `SELECT u.*, r.codigo AS rol_codigo FROM usuarios u JOIN roles r ON r.id = u.rol_id ORDER BY u.nombres`
    );
    return rows.map(mapUsuario);
  },

  async getById(id) {
    const [rows] = await query(
      `SELECT u.*, r.codigo AS rol_codigo FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.id = ? LIMIT 1`,
      [id]
    );
    return mapUsuario(rows[0]);
  },

  async create(data, actor) {
    const errors = {};
    const nombres = validateRequired(data.nombres, 'Nombres');
    if (nombres) errors.nombres = nombres;
    const email = validateEmail(data.email);
    if (email) errors.email = email;
    const pass = validatePassword(data.password);
    if (pass) errors.password = pass;
    if (!ROLES.includes(data.rol)) errors.rol = 'Rol inválido';
    if (Object.keys(errors).length) throw new ValidationError(errors);

    const rolId = await getRolId(data.rol);
    if (!rolId) throw new ValidationError({ rol: 'Rol inválido' });

    const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date();
    const passwordHash = await bcrypt.hash(data.password, env.bcryptRounds);

    try {
      await query(
        `INSERT INTO usuarios (id, email, nombres, rol_id, activo, password_hash, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, ?, ?, ?)`,
        [id, data.email.trim().toLowerCase(), data.nombres.trim(), rolId, passwordHash, now, now]
      );
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') throw new ConflictError('El correo ya está registrado');
      throw err;
    }

    await auditService.registrar({
      accion: 'registro_usuario',
      modulo: 'Usuarios',
      descripcion: `Usuario ${data.email.trim().toLowerCase()} creado`,
      usuarioId: actor?.id,
      usuarioEmail: actor?.email || '',
      rol: actor?.rol || '',
    });

    return this.getById(id);
  },

  async update(id, data, actor) {
    const errors = {};
    const nombres = validateRequired(data.nombres, 'Nombres');
    if (nombres) errors.nombres = nombres;
    if (!ROLES.includes(data.rol)) errors.rol = 'Rol inválido';
    if (Object.keys(errors).length) throw new ValidationError(errors);

    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Usuario no encontrado');

    const rolId = await getRolId(data.rol);
    const now = new Date();
    await query(
      `UPDATE usuarios SET nombres = ?, rol_id = ?, activo = ?, updated_at = ? WHERE id = ?`,
      [data.nombres.trim(), rolId, data.activo !== undefined ? (data.activo ? 1 : 0) : (existing.activo ? 1 : 0), now, id]
    );

    await auditService.registrar({
      accion: 'usuario_modificado',
      modulo: 'Usuarios',
      descripcion: `Usuario ${existing.email} actualizado`,
      usuarioId: actor?.id,
      usuarioEmail: actor?.email || '',
      rol: actor?.rol || '',
    });

    return this.getById(id);
  },

  async toggleActivo(id, actor) {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Usuario no encontrado');

    const now = new Date();
    const nuevoActivo = !existing.activo;
    await query('UPDATE usuarios SET activo = ?, updated_at = ? WHERE id = ?', [nuevoActivo ? 1 : 0, now, id]);

    await auditService.registrar({
      accion: 'usuario_modificado',
      modulo: 'Usuarios',
      descripcion: `Usuario ${existing.email} ${nuevoActivo ? 'activado' : 'desactivado'}`,
      usuarioId: actor?.id,
      usuarioEmail: actor?.email || '',
      rol: actor?.rol || '',
    });

    return this.getById(id);
  },
};
