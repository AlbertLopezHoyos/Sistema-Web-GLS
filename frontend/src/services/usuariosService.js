import { apiClient, ApiError } from './apiClient';

const handleError = (err) => {
  if (err instanceof ApiError && err.errors) throw { errors: err.errors };
  throw err;
};

export const usuariosService = {
  async getUsuarios() {
    return apiClient.get('/usuarios');
  },

  async getUsuarioById(id) {
    try {
      return await apiClient.get(`/usuarios/${id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  async createUsuario(data) {
    try {
      return await apiClient.post('/usuarios', data);
    } catch (err) {
      handleError(err);
    }
  },

  async updateUsuario(id, data) {
    try {
      return await apiClient.put(`/usuarios/${id}`, data);
    } catch (err) {
      handleError(err);
    }
  },

  async toggleActivo(id) {
    return apiClient.patch(`/usuarios/${id}/estado`);
  },
};
