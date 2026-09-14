import { apiClient, ApiError } from './apiClient';
import { validateDocumento, validateTelefono, validateRequired, validatePositiveNumber } from '../utils/validation';

const handleError = (err) => {
  if (err instanceof ApiError && err.errors) throw { errors: err.errors };
  throw err;
};

const validateEnvio = (data) => {
  const errors = {};
  ['origen', 'destino', 'tipoCarga', 'descripcion'].forEach((f) => {
    const err = validateRequired(data[f], f);
    if (err) errors[f] = err;
  });
  const peso = validatePositiveNumber(data.peso, 'Peso');
  if (peso) errors.peso = peso;
  ['largo', 'ancho', 'alto'].forEach((d) => {
    const err = validatePositiveNumber(data.dimensiones?.[d], d);
    if (err) errors[d] = err;
  });
  const validateParty = (party, prefix) => {
    if (!party) return;
    const n = validateRequired(party.nombres, `${prefix} nombres`);
    if (n) errors[`${prefix}_nombres`] = n;
    const doc = validateDocumento(party.documento);
    if (doc) errors[`${prefix}_documento`] = doc;
    const tel = validateTelefono(party.telefono);
    if (tel) errors[`${prefix}_telefono`] = tel;
    const dir = validateRequired(party.direccion, `${prefix} dirección`);
    if (dir) errors[`${prefix}_direccion`] = dir;
  };
  validateParty(data.remitente, 'remitente');
  validateParty(data.destinatario, 'destinatario');
  return errors;
};

export const validateEnvioForm = validateEnvio;

export const enviosService = {
  async getEnvios(filters = {}) {
    return apiClient.get('/envios', filters);
  },

  async getEnvioById(codigo) {
    try {
      return await apiClient.get(`/envios/${codigo}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  async getEnviosActivos() {
    return apiClient.get('/envios/activos');
  },

  async createEnvio(data) {
    try {
      return await apiClient.post('/envios', data);
    } catch (err) {
      handleError(err);
    }
  },

  async getDashboardStats() {
    return apiClient.get('/envios/dashboard');
  },
};
