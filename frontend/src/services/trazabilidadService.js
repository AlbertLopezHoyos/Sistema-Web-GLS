import { apiClient, ApiError } from './apiClient';
import { SHIPMENT_STATUSES } from '../constants/shipmentStatus';

const handleError = (err) => {
  if (err instanceof ApiError && err.errors) throw { errors: err.errors };
  throw err;
};

export const trazabilidadService = {
  async getHistorialByEnvio(codigo) {
    return apiClient.get(`/envios/${codigo}/historial`);
  },

  async getHistorialGeneral(filters = {}) {
    return apiClient.get('/historial', filters);
  },

  async actualizarEstado(codigo, data) {
    try {
      return await apiClient.post(`/envios/${codigo}/estado`, data);
    } catch (err) {
      handleError(err);
    }
  },

  getEstadosPermitidos() {
    return SHIPMENT_STATUSES;
  },
};
