import { AppError } from '../utils/errors.js';
import env from '../config/env.js';

export const errorHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      ...(err.errors !== undefined ? { errors: err.errors } : {}),
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Registro duplicado' });
  }

  console.error('[ERROR]', err);
  const message = env.nodeEnv === 'production' ? 'Error interno del servidor' : err.message;
  return res.status(500).json({ success: false, message });
};
