import { trazabilidadService } from '../services/trazabilidadService.js';
import { ok } from '../utils/apiResponse.js';

export const historialController = {
  async list(req, res, next) {
    try {
      ok(res, await trazabilidadService.getHistorialGeneral(req.query));
    } catch (err) {
      next(err);
    }
  },

  async estados(req, res, next) {
    try {
      ok(res, trazabilidadService.getEstadosPermitidos());
    } catch (err) {
      next(err);
    }
  },
};
