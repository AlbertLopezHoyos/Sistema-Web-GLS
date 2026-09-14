import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import env from '../config/env.js';
import { authService } from '../services/authService.js';
import { requireAuth } from '../middleware/auth.js';
import { ok, fail } from '../utils/apiResponse.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Demasiados intentos de inicio de sesión' },
  standardHeaders: true,
  legacyHeaders: false,
});

const cookieOptions = (remember) => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: env.cookie.secure,
  ...(remember ? { maxAge: 7 * 24 * 60 * 60 * 1000 } : {}),
});

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password, remember = false } = req.body;
    const meta = { ip: req.ip, userAgent: req.get('user-agent') };
    const result = await authService.login(email, password, remember, meta);
    res.cookie(env.cookie.name, result.token, cookieOptions(result.remember));
    ok(res, { user: result.user, loginAt: result.loginAt, remember: result.remember });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const data = await authService.getMe(req.user.id, req.authMeta);
    ok(res, data);
  } catch (err) {
    next(err);
  }
});

router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await authService.logout(req.user, { ip: req.ip, userAgent: req.get('user-agent') });
    res.clearCookie(env.cookie.name, { httpOnly: true, sameSite: 'lax', secure: env.cookie.secure });
    ok(res, null, 'Sesión cerrada');
  } catch (err) {
    next(err);
  }
});

router.patch('/profile', requireAuth, async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    ok(res, user, 'Perfil actualizado');
  } catch (err) {
    next(err);
  }
});

export default router;
