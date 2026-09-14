import { reportesService } from '../services/reportesService.js';
import { auditService } from '../services/auditService.js';
import { ok } from '../utils/apiResponse.js';
import { ValidationError } from '../utils/errors.js';
import { EXPORT_FORMATS } from '../utils/constants.js';

const EXPORT_DESCRIPTIONS = {
  CSV: 'Exportación CSV generada',
  Excel: 'Exportación Excel generada',
  PDF: 'Exportación PDF generada',
};

export const reportesController = {
  async consultar(req, res, next) {
    try {
      ok(res, await reportesService.consultar(req.query));
    } catch (err) {
      next(err);
    }
  },

  async exportacion(req, res, next) {
    try {
      const { formato } = req.body;
      if (!formato || !EXPORT_FORMATS.includes(formato)) {
        throw new ValidationError({ formato: `Formato inválido. Permitidos: ${EXPORT_FORMATS.join(', ')}` });
      }

      await auditService.registrar({
        accion: 'exportacion_archivo',
        modulo: 'Reportes',
        descripcion: EXPORT_DESCRIPTIONS[formato],
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
  },
};
