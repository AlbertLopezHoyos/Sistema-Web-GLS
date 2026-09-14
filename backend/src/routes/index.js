import { Router } from 'express';
import { ping } from '../config/db.js';
import authRoutes from './authRoutes.js';
import clientesRoutes from './clientesRoutes.js';
import enviosRoutes from './enviosRoutes.js';
import historialRoutes from './historialRoutes.js';
import reportesRoutes from './reportesRoutes.js';
import usuariosRoutes from './usuariosRoutes.js';
import auditoriaRoutes from './auditoriaRoutes.js';
import respaldoRoutes from './respaldoRoutes.js';
import { ok } from '../utils/apiResponse.js';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    await ping();
    ok(res, { database: 'connected' });
  } catch {
    res.status(503).json({ success: false, message: 'Base de datos no disponible', database: 'disconnected' });
  }
});

router.use('/auth', authRoutes);
router.use('/clientes', clientesRoutes);
router.use('/envios', enviosRoutes);
router.use('/historial', historialRoutes);
router.use('/reportes', reportesRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/auditoria', auditoriaRoutes);
router.use('/respaldos', respaldoRoutes);

export default router;
