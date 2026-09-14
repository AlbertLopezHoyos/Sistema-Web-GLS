import { Router } from 'express';
import { enviosService } from '../services/enviosService.js';
import { trazabilidadService } from '../services/trazabilidadService.js';
import { ubicacionesService } from '../services/ubicacionesService.js';
import { requireAuth } from '../middleware/auth.js';
import { requireMutate } from '../middleware/roles.js';
import { ok } from '../utils/apiResponse.js';
import { NotFoundError } from '../utils/errors.js';

const router = Router();

router.use(requireAuth);

router.get('/activos', async (req, res, next) => {
  try {
    ok(res, await enviosService.getEnviosActivos());
  } catch (err) {
    next(err);
  }
});

router.get('/dashboard', async (req, res, next) => {
  try {
    ok(res, await enviosService.getDashboardStats());
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    ok(res, await enviosService.getEnvios(req.query));
  } catch (err) {
    next(err);
  }
});

router.get('/:codigo/historial', async (req, res, next) => {
  try {
    ok(res, await trazabilidadService.getHistorialByEnvio(req.params.codigo));
  } catch (err) {
    next(err);
  }
});

router.get('/:codigo/ubicaciones/ultima', async (req, res, next) => {
  try {
    ok(res, await ubicacionesService.getUltima(req.params.codigo));
  } catch (err) {
    next(err);
  }
});

router.get('/:codigo/ubicaciones', async (req, res, next) => {
  try {
    ok(res, await ubicacionesService.getByEnvio(req.params.codigo));
  } catch (err) {
    next(err);
  }
});

router.get('/:codigo', async (req, res, next) => {
  try {
    const data = await enviosService.getEnvioByCodigo(req.params.codigo);
    if (!data) throw new NotFoundError('Envío no encontrado');
    ok(res, data);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireMutate, async (req, res, next) => {
  try {
    const data = await enviosService.createEnvio(req.body, req.user);
    ok(res, data, 'Envío registrado', 201);
  } catch (err) {
    next(err);
  }
});

router.post('/:codigo/estado', requireMutate, async (req, res, next) => {
  try {
    const data = await trazabilidadService.actualizarEstado(req.params.codigo, req.body, req.user);
    ok(res, data, 'Estado actualizado');
  } catch (err) {
    next(err);
  }
});

router.post('/:codigo/ubicaciones', requireMutate, async (req, res, next) => {
  try {
    const data = await ubicacionesService.registrar(req.params.codigo, req.body, req.user);
    ok(res, data, 'Ubicación registrada', 201);
  } catch (err) {
    next(err);
  }
});

export default router;
