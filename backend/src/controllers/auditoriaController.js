import { auditService } from '../services/auditService.js';
import { ok } from '../utils/apiResponse.js';

export const auditoriaController = {
  async list(req, res, next) {
    try {
      ok(res, await auditService.list(req.query));
    } catch (err) {
      next(err);
    }
  },

  async modulos(req, res, next) {
    try {
      ok(res, auditService.getModulos());
    } catch (err) {
      next(err);
    }
  },

  async acciones(req, res, next) {
    try {
      ok(res, auditService.getAcciones());
    } catch (err) {
      next(err);
    }
  },
};
