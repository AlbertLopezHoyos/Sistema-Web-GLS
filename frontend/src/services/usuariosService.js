import { apiClient, ApiError } from './apiClient';

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
    return apiClient.post('/usuarios', data);
  },

  async updateUsuario(id, data) {
    return apiClient.put(`/usuarios/${id}`, data);
  },

  async toggleActivo(id) {
    return apiClient.patch(`/usuarios/${id}/estado`);
  },
};
