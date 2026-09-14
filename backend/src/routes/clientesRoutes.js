import { Router } from 'express';
import { clientesController } from '../controllers/clientesController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireMutate } from '../middleware/roles.js';

const router = Router();

router.use(requireAuth);
router.get('/', clientesController.list);
router.get('/documento/:documento', clientesController.getByDocumento);
router.get('/:id', clientesController.getById);
router.post('/', requireMutate, clientesController.create);
router.put('/:id', requireMutate, clientesController.update);

export default router;
