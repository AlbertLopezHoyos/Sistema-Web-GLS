import { apiClient, ApiError } from './apiClient';

const handleError = (err) => {
  if (err instanceof ApiError && err.errors) throw { errors: err.errors };
  throw err;
};

export const ubicacionesService = {
  async getUbicacionesByEnvio(codigo) {
    return apiClient.get(`/envios/${codigo}/ubicaciones`);
  },

  async getUltimaUbicacion(codigo) {
    return apiClient.get(`/envios/${codigo}/ubicaciones/ultima`);
  },

  async registrarUbicacion(codigo, data) {
    try {
      return await apiClient.post(`/envios/${codigo}/ubicaciones`, data);
    } catch (err) {
      handleError(err);
    }
  },
};
