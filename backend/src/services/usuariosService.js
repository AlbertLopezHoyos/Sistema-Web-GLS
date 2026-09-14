import bcrypt from 'bcryptjs';
import env from '../config/env.js';
import { mapUsuario } from '../utils/mappers.js';
import { validateEmail, validatePassword, validateRequired } from '../utils/validation.js';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors.js';
import { auditService } from './auditService.js';
import { usuariosRepository } from '../repositories/usuariosRepository.js';
import { USER_ROLES } from '../utils/constants.js';

export const usuariosService = {
  async getAll() {
    const rows = await usuariosRepository.findAll();
    return rows.map(mapUsuario);
  },

  async getById(id) {
    const row = await usuariosRepository.findById(id);
    return mapUsuario(row);
  },

  async create(data, actor) {
    const errors = {};
    const nombres = validateRequired(data.nombres, 'Nombres');
    if (nombres) errors.nombres = nombres;
    const email = validateEmail(data.email);
    if (email) errors.email = email;
    const pass = validatePassword(data.password);
    if (pass) errors.password = pass;
    if (!USER_ROLES.includes(data.rol)) errors.rol = 'Rol inválido';
    if (Object.keys(errors).length) throw new ValidationError(errors);

    const rolId = await usuariosRepository.getRolId(data.rol);
    if (!rolId) throw new ValidationError({ rol: 'Rol inválido' });

    const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date();
    const passwordHash = await bcrypt.hash(data.password, env.bcryptRounds);

    try {
      await usuariosRepository.insert([
        id, data.email.trim().toLowerCase(), data.nombres.trim(), rolId, 1, passwordHash, now, now,
      ]);
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
    if (!USER_ROLES.includes(data.rol)) errors.rol = 'Rol inválido';
    if (Object.keys(errors).length) throw new ValidationError(errors);

    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Usuario no encontrado');

    const nuevoActivo = data.activo !== undefined ? Boolean(data.activo) : existing.activo;
    await this.assertCanChangeActivo(existing, actor, nuevoActivo);

    const rolId = await usuariosRepository.getRolId(data.rol);
    const now = new Date();
    await usuariosRepository.update(id, [
      data.nombres.trim(), rolId, nuevoActivo ? 1 : 0, now, id,
    ]);

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

    const nuevoActivo = !existing.activo;
    await this.assertCanChangeActivo(existing, actor, nuevoActivo);

    const now = new Date();
    await usuariosRepository.setActivo(id, nuevoActivo, now);

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

  async assertCanChangeActivo(targetUser, actor, nuevoActivo) {
    if (nuevoActivo) return;

    if (actor?.id === targetUser.id) {
      throw new ValidationError({}, 'No puede desactivar su propia cuenta');
    }

    if (targetUser.rol === 'admin') {
      const otrosAdmins = await usuariosRepository.countActiveAdmins(targetUser.id);
      if (otrosAdmins === 0) {
        throw new ConflictError('No se puede desactivar al último administrador activo');
      }
    }
  },
};
