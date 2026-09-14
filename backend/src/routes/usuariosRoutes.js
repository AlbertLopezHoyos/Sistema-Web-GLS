import { Router } from 'express';
import { usuariosController } from '../controllers/usuariosController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/', usuariosController.list);
router.get('/:id', usuariosController.getById);
router.post('/', usuariosController.create);
router.put('/:id', usuariosController.update);
router.patch('/:id/estado', usuariosController.toggleActivo);

export default router;
