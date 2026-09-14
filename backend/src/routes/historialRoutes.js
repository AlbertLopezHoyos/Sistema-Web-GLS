import { Router } from 'express';
import { trazabilidadService } from '../services/trazabilidadService.js';
import { requireAuth } from '../middleware/auth.js';
import { ok } from '../utils/apiResponse.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    ok(res, await trazabilidadService.getHistorialGeneral(req.query));
  } catch (err) {
    next(err);
  }
});

router.get('/estados', async (req, res, next) => {
  try {
    ok(res, trazabilidadService.getEstadosPermitidos());
  } catch (err) {
    next(err);
  }
});

export default router;
