import { Router } from 'express';
import { usuariosService } from '../services/usuariosService.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';
import { ok } from '../utils/apiResponse.js';
import { NotFoundError } from '../utils/errors.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    ok(res, await usuariosService.getAll());
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await usuariosService.getById(req.params.id);
    if (!data) throw new NotFoundError('Usuario no encontrado');
    ok(res, data);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    ok(res, await usuariosService.create(req.body, req.user), 'Usuario creado', 201);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    ok(res, await usuariosService.update(req.params.id, req.body, req.user), 'Usuario actualizado');
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/estado', async (req, res, next) => {
  try {
    ok(res, await usuariosService.toggleActivo(req.params.id, req.user), 'Estado actualizado');
  } catch (err) {
    next(err);
  }
});

export default router;
