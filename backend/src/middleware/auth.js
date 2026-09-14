import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { query } from '../config/db.js';
import { mapUsuario } from '../utils/mappers.js';
import { UnauthorizedError } from '../utils/errors.js';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.[env.cookie.name];
    if (!token) throw new UnauthorizedError();

    let payload;
    try {
      payload = jwt.verify(token, env.jwt.secret);
    } catch {
      throw new UnauthorizedError('Sesión inválida o expirada');
    }

    const [rows] = await query(
      `SELECT u.*, r.codigo AS rol_codigo
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       WHERE u.id = ? LIMIT 1`,
      [payload.userId]
    );

    const user = mapUsuario(rows[0]);
    if (!user || !user.activo) throw new UnauthorizedError('Usuario inactivo o no encontrado');

    req.user = user;
    req.authMeta = { loginAt: payload.loginAt, remember: payload.remember };
    next();
  } catch (err) {
    next(err);
  }
};
