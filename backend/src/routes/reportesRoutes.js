import { Router } from 'express';
import { reportesController } from '../controllers/reportesController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/envios', reportesController.consultar);
router.post('/exportacion', reportesController.exportacion);

export default router;
