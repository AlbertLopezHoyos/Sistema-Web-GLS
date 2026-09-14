import { apiClient } from './apiClient';
import { normalizeText } from '../utils/formatters';

export const reportesService = {
  async consultar(filters = {}) {
    return apiClient.get('/reportes/envios', filters);
  },

  async filtrarPorCliente(envios, clienteQuery) {
    if (!clienteQuery?.trim()) return envios;
    const q = normalizeText(clienteQuery);
    return envios.filter(
      (e) =>
        normalizeText(e.clienteAsociado?.nombres).includes(q) ||
        normalizeText(e.clienteAsociado?.documento).includes(q)
    );
  },

  async registrarExportacion(formato, modulo = 'Reportes') {
    return apiClient.post('/reportes/exportacion', { formato, modulo });
  },
};
