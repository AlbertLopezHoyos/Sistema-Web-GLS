import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { query } from '../config/db.js';
import { mapUsuario } from '../utils/mappers.js';
import { validateEmail, validatePassword, validateRequired } from '../utils/validation.js';
import { ValidationError, UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { auditService } from './auditService.js';

const ROLE_LABELS = { admin: 'Administrador', operaciones: 'Operaciones', consulta: 'Consulta' };

const findByEmail = async (email) => {
  const [rows] = await query(
    `SELECT u.*, r.codigo AS rol_codigo FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.email = ? LIMIT 1`,
    [email.trim().toLowerCase()]
  );
  return rows[0] || null;
};

export const authService = {
  async login(email, password, remember, meta = {}) {
    const errors = {};
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    const passErr = validatePassword(password);
    if (passErr) errors.password = passErr;
    if (Object.keys(errors).length) throw new ValidationError(errors);

    const row = await findByEmail(email);
    const emailNorm = email.trim().toLowerCase();

    if (!row || !(await bcrypt.compare(password, row.password_hash))) {
      await auditService.registrar({
        accion: 'login_fallido',
        modulo: 'Autenticación',
        descripcion: `Intento fallido para ${emailNorm}`,
        usuarioEmail: emailNorm,
        rol: '—',
        ip: meta.ip,
        userAgent: meta.userAgent,
      });
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    const user = mapUsuario(row);
    if (!user.activo) {
      await auditService.registrar({
        accion: 'login_fallido',
        modulo: 'Autenticación',
        descripcion: 'Intento de inicio de sesión con usuario inactivo',
        usuarioId: user.id,
        usuarioEmail: user.email,
        rol: ROLE_LABELS[user.rol],
        ip: meta.ip,
        userAgent: meta.userAgent,
      });
      throw new UnauthorizedError('Usuario inactivo. Contacte al administrador.');
    }

    const loginAt = new Date().toISOString();
    const token = jwt.sign(
      { userId: user.id, loginAt, remember: Boolean(remember) },
      env.jwt.secret,
      { expiresIn: remember ? env.jwt.rememberExpires : env.jwt.sessionExpires }
    );

    await auditService.registrar({
      accion: 'login',
      modulo: 'Autenticación',
      descripcion: 'Inicio de sesión exitoso',
      usuarioId: user.id,
      usuarioEmail: user.email,
      rol: ROLE_LABELS[user.rol],
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return { token, user, loginAt, remember: Boolean(remember) };
  },

  async logout(user, meta = {}) {
    if (user) {
      await auditService.registrar({
        accion: 'logout',
        modulo: 'Autenticación',
        descripcion: 'Cierre de sesión',
        usuarioId: user.id,
        usuarioEmail: user.email,
        rol: ROLE_LABELS[user.rol],
        ip: meta.ip,
        userAgent: meta.userAgent,
      });
    }
  },

  async getMe(userId, authMeta) {
    const [rows] = await query(
      `SELECT u.*, r.codigo AS rol_codigo FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.id = ? LIMIT 1`,
      [userId]
    );
    const user = mapUsuario(rows[0]);
    if (!user || !user.activo) throw new UnauthorizedError();
    return {
      user,
      loginAt: authMeta?.loginAt || null,
      remember: authMeta?.remember || false,
    };
  },

  async updateProfile(userId, data) {
    const nombres = validateRequired(data.nombres, 'Nombres');
    if (nombres) throw new ValidationError({ nombres });

    const [result] = await query(
      'UPDATE usuarios SET nombres = ?, updated_at = ? WHERE id = ?',
      [data.nombres.trim(), new Date(), userId]
    );
    if (result.affectedRows === 0) throw new NotFoundError('Usuario no encontrado');

    const [rows] = await query(
      `SELECT u.*, r.codigo AS rol_codigo FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.id = ?`,
      [userId]
    );
    return mapUsuario(rows[0]);
  },
};
