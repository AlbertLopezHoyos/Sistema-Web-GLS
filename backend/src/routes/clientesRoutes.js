import { Router } from 'express';
import { clientesService } from '../services/clientesService.js';
import { requireAuth } from '../middleware/auth.js';
import { requireMutate } from '../middleware/roles.js';
import { ok } from '../utils/apiResponse.js';
import { NotFoundError } from '../utils/errors.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const data = req.query.q ? await clientesService.search(req.query.q) : await clientesService.getAll();
    ok(res, data);
  } catch (err) {
    next(err);
  }
});

router.get('/documento/:documento', async (req, res, next) => {
  try {
    const data = await clientesService.getByDocumento(req.params.documento);
    if (!data) throw new NotFoundError('Cliente no encontrado');
    ok(res, data);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await clientesService.getById(req.params.id);
    if (!data) throw new NotFoundError('Cliente no encontrado');
    ok(res, data);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireMutate, async (req, res, next) => {
  try {
    const data = await clientesService.create(req.body, req.user);
    ok(res, data, 'Cliente creado', 201);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireMutate, async (req, res, next) => {
  try {
    const data = await clientesService.update(req.params.id, req.body, req.user);
    ok(res, data, 'Cliente actualizado');
  } catch (err) {
    next(err);
  }
});

export default router;
