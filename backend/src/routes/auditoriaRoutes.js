import { Router } from 'express';
import { auditService } from '../services/auditService.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';
import { ok } from '../utils/apiResponse.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/modulos', (req, res) => ok(res, auditService.getModulos()));
router.get('/acciones', (req, res) => ok(res, auditService.getAcciones()));

router.get('/', async (req, res, next) => {
  try {
    ok(res, await auditService.list(req.query));
  } catch (err) {
    next(err);
  }
});

export default router;
