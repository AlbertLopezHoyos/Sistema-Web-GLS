import { apiClient, ApiError } from './apiClient';

export const respaldoService = {
  async getInfo() {
    return apiClient.get('/respaldos');
  },

  async generarRespaldo() {
    return apiClient.post('/respaldos');
  },

  async restaurarRespaldo(id) {
    try {
      return await apiClient.post(`/respaldos/${id}/restaurar`, { confirmar: true });
    } catch (err) {
      if (err instanceof ApiError) throw new Error(err.message);
      throw err;
    }
  },
};
