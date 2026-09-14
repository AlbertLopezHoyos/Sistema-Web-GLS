import env from '../config/env.js';
import { authService } from '../services/authService.js';
import { ok } from '../utils/apiResponse.js';

const cookieOptions = (remember) => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: env.cookie.secure,
  ...(remember ? { maxAge: 7 * 24 * 60 * 60 * 1000 } : {}),
});

export const authController = {
  async login(req, res, next) {
    try {
      const { email, password, remember = false } = req.body;
      const meta = { ip: req.ip, userAgent: req.get('user-agent') };
      const result = await authService.login(email, password, remember, meta);
      res.cookie(env.cookie.name, result.token, cookieOptions(result.remember));
      ok(res, { user: result.user, loginAt: result.loginAt, remember: result.remember });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      ok(res, await authService.getMe(req.user.id, req.authMeta));
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      await authService.logout(req.user, { ip: req.ip, userAgent: req.get('user-agent') });
      res.clearCookie(env.cookie.name, { httpOnly: true, sameSite: 'lax', secure: env.cookie.secure });
      ok(res, null, 'Sesión cerrada');
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      ok(res, await authService.updateProfile(req.user.id, req.body), 'Perfil actualizado');
    } catch (err) {
      next(err);
    }
  },
};
