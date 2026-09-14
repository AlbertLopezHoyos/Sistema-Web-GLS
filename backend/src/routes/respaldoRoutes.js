import { Router } from 'express';
import { respaldoService } from '../services/respaldoService.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';
import { ok } from '../utils/apiResponse.js';
import { ValidationError } from '../utils/errors.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    ok(res, await respaldoService.getInfo());
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    ok(res, await respaldoService.generar(req.user), 'Respaldo generado', 201);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/restaurar', async (req, res, next) => {
  try {
    if (req.body.confirmar !== true) {
      throw new ValidationError({}, 'Debe confirmar la restauración con confirmar: true');
    }
    ok(res, await respaldoService.restaurar(req.params.id, req.user), 'Respaldo restaurado');
  } catch (err) {
    next(err);
  }
});

export default router;
