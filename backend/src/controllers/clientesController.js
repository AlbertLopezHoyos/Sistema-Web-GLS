import { clientesService } from '../services/clientesService.js';
import { ok } from '../utils/apiResponse.js';
import { NotFoundError } from '../utils/errors.js';

export const clientesController = {
  async list(req, res, next) {
    try {
      const data = req.query.q ? await clientesService.search(req.query.q) : await clientesService.getAll();
      ok(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getByDocumento(req, res, next) {
    try {
      const data = await clientesService.getByDocumento(req.params.documento);
      if (!data) throw new NotFoundError('Cliente no encontrado');
      ok(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const data = await clientesService.getById(req.params.id);
      if (!data) throw new NotFoundError('Cliente no encontrado');
      ok(res, data);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      ok(res, await clientesService.create(req.body, req.user), 'Cliente creado', 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      ok(res, await clientesService.update(req.params.id, req.body, req.user), 'Cliente actualizado');
    } catch (err) {
      next(err);
    }
  },
};
