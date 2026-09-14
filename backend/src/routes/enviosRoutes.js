import { Router } from 'express';
import { enviosController } from '../controllers/enviosController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireMutate } from '../middleware/roles.js';

const router = Router();

router.use(requireAuth);
router.get('/activos', enviosController.listActivos);
router.get('/dashboard', enviosController.dashboard);
router.get('/', enviosController.list);
router.get('/:codigo/historial', enviosController.historial);
router.get('/:codigo/ubicaciones/ultima', enviosController.ultimaUbicacion);
router.get('/:codigo/ubicaciones', enviosController.ubicaciones);
router.get('/:codigo', enviosController.getByCodigo);
router.post('/', requireMutate, enviosController.create);
router.post('/:codigo/estado', requireMutate, enviosController.updateEstado);
router.post('/:codigo/ubicaciones', requireMutate, enviosController.registrarUbicacion);

export default router;
