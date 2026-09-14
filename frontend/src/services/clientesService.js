import { apiClient, ApiError } from './apiClient';

const handleError = (err) => {
  if (err instanceof ApiError && err.errors) throw { errors: err.errors };
  throw err;
};

export const clientesService = {
  async getClientes() {
    return apiClient.get('/clientes');
  },

  async getClienteById(id) {
    try {
      return await apiClient.get(`/clientes/${id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  async getClienteByDocumento(documento) {
    try {
      return await apiClient.get(`/clientes/documento/${encodeURIComponent(documento)}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  async createCliente(data) {
    try {
      return await apiClient.post('/clientes', data);
    } catch (err) {
      handleError(err);
    }
  },

  async updateCliente(id, data) {
    try {
      return await apiClient.put(`/clientes/${id}`, data);
    } catch (err) {
      handleError(err);
    }
  },

  async searchClientes(query) {
    return apiClient.get('/clientes', { q: query });
  },
};
