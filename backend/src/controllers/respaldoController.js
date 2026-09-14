import { respaldoService } from '../services/respaldoService.js';
import { ok } from '../utils/apiResponse.js';
import { ValidationError } from '../utils/errors.js';

export const respaldoController = {
  async info(req, res, next) {
    try {
      ok(res, await respaldoService.getInfo());
    } catch (err) {
      next(err);
    }
  },

  async generar(req, res, next) {
    try {
      ok(res, await respaldoService.generar(req.user), 'Respaldo generado', 201);
    } catch (err) {
      next(err);
    }
  },

  async restaurar(req, res, next) {
    try {
      if (req.body.confirmar !== true) {
        throw new ValidationError({}, 'Debe confirmar la restauración con confirmar: true');
      }
      ok(res, await respaldoService.restaurar(req.params.id, req.user), 'Respaldo restaurado');
    } catch (err) {
      next(err);
    }
  },
};
