import { apiClient } from './apiClient';

export const reportesService = {
  async consultar(filters = {}) {
    return apiClient.get('/reportes/envios', filters);
  },

  async registrarExportacion(formato) {
    return apiClient.post('/reportes/exportacion', { formato });
  },
};
