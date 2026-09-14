import { Router } from 'express';
import { reportesService } from '../services/reportesService.js';
import { auditService } from '../services/auditService.js';
import { requireAuth } from '../middleware/auth.js';
import { ok } from '../utils/apiResponse.js';

const router = Router();

router.use(requireAuth);

router.get('/envios', async (req, res, next) => {
  try {
    ok(res, await reportesService.consultar(req.query));
  } catch (err) {
    next(err);
  }
});

router.post('/exportacion', async (req, res, next) => {
  try {
    const { formato, modulo = 'Reportes' } = req.body;
    await auditService.registrar({
      accion: 'exportacion_archivo',
      modulo,
      descripcion: `Exportación ${formato || 'archivo'} generada`,
      usuarioId: req.user.id,
      usuarioEmail: req.user.email,
      rol: req.user.rol,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    ok(res, { registered: true });
  } catch (err) {
    next(err);
  }
});

export default router;
