import { ForbiddenError } from '../utils/errors.js';

export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ForbiddenError());
  if (!roles.includes(req.user.rol)) {
    return next(new ForbiddenError('No tiene permisos para esta operación'));
  }
  next();
};

export const requireMutate = (req, res, next) => {
  if (!req.user) return next(new ForbiddenError());
  if (!['admin', 'operaciones'].includes(req.user.rol)) {
    return next(new ForbiddenError('Solo administradores y operaciones pueden modificar datos'));
  }
  next();
};

export const requireAdmin = allowRoles('admin');
