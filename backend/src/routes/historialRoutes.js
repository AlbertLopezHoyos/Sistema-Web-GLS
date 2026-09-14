import { Router } from 'express';
import { historialController } from '../controllers/historialController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', historialController.list);
router.get('/estados', historialController.estados);

export default router;
