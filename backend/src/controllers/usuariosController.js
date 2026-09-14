import { usuariosService } from '../services/usuariosService.js';
import { ok } from '../utils/apiResponse.js';
import { NotFoundError } from '../utils/errors.js';

export const usuariosController = {
  async list(req, res, next) {
    try {
      ok(res, await usuariosService.getAll());
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const data = await usuariosService.getById(req.params.id);
      if (!data) throw new NotFoundError('Usuario no encontrado');
      ok(res, data);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      ok(res, await usuariosService.create(req.body, req.user), 'Usuario creado', 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      ok(res, await usuariosService.update(req.params.id, req.body, req.user), 'Usuario actualizado');
    } catch (err) {
      next(err);
    }
  },

  async toggleActivo(req, res, next) {
    try {
      ok(res, await usuariosService.toggleActivo(req.params.id, req.user), 'Estado actualizado');
    } catch (err) {
      next(err);
    }
  },
};
