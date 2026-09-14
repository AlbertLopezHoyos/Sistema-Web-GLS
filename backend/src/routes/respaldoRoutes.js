import { Router } from 'express';
import { respaldoController } from '../controllers/respaldoController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/', respaldoController.info);
router.post('/', respaldoController.generar);
router.post('/:id/restaurar', respaldoController.restaurar);

export default router;
