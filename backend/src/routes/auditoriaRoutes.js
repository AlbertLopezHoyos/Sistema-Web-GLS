import { Router } from 'express';
import { auditoriaController } from '../controllers/auditoriaController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/modulos', auditoriaController.modulos);
router.get('/acciones', auditoriaController.acciones);
router.get('/', auditoriaController.list);

export default router;
