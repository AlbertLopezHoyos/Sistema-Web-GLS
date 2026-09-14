import { enviosService } from '../services/enviosService.js';
import { trazabilidadService } from '../services/trazabilidadService.js';
import { ubicacionesService } from '../services/ubicacionesService.js';
import { ok } from '../utils/apiResponse.js';
import { NotFoundError } from '../utils/errors.js';

export const enviosController = {
  async listActivos(req, res, next) {
    try {
      ok(res, await enviosService.getEnviosActivos());
    } catch (err) {
      next(err);
    }
  },

  async dashboard(req, res, next) {
    try {
      ok(res, await enviosService.getDashboardStats());
    } catch (err) {
      next(err);
    }
  },

  async list(req, res, next) {
    try {
      ok(res, await enviosService.getEnvios(req.query));
    } catch (err) {
      next(err);
    }
  },

  async historial(req, res, next) {
    try {
      ok(res, await trazabilidadService.getHistorialByEnvio(req.params.codigo));
    } catch (err) {
      next(err);
    }
  },

  async ultimaUbicacion(req, res, next) {
    try {
      ok(res, await ubicacionesService.getUltima(req.params.codigo));
    } catch (err) {
      next(err);
    }
  },

  async ubicaciones(req, res, next) {
    try {
      ok(res, await ubicacionesService.getByEnvio(req.params.codigo));
    } catch (err) {
      next(err);
    }
  },

  async getByCodigo(req, res, next) {
    try {
      const data = await enviosService.getEnvioByCodigo(req.params.codigo);
      if (!data) throw new NotFoundError('Envío no encontrado');
      ok(res, data);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      ok(res, await enviosService.createEnvio(req.body, req.user), 'Envío registrado', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateEstado(req, res, next) {
    try {
      ok(res, await trazabilidadService.actualizarEstado(req.params.codigo, req.body, req.user), 'Estado actualizado');
    } catch (err) {
      next(err);
    }
  },

  async registrarUbicacion(req, res, next) {
    try {
      ok(res, await ubicacionesService.registrar(req.params.codigo, req.body, req.user), 'Ubicación registrada', 201);
    } catch (err) {
      next(err);
    }
  },
};
