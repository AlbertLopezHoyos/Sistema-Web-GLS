import { STORAGE_KEYS } from '../constants/appConfig';
import { getStore, setStore } from '../utils/dataStore';
import { delay } from '../utils/storage';
import { validateDocumento, validateTelefono, validateRequired } from '../utils/validation';
import { normalizeText } from '../utils/formatters';

const validateCliente = (data) => {
  const errors = {};
  const nombres = validateRequired(data.nombres, 'Razón social / nombres');
  if (nombres) errors.nombres = nombres;
  const doc = validateDocumento(data.documento);
  if (doc) errors.documento = doc;
  const tel = validateTelefono(data.telefono);
  if (tel) errors.telefono = tel;
  const dir = validateRequired(data.direccion, 'Dirección');
  if (dir) errors.direccion = dir;
  return errors;
};

export const clientesService = {
  async getClientes() {
    await delay(300);
    return getStore(STORAGE_KEYS.CLIENTES);
  },

  async getClienteById(id) {
    await delay(200);
    const clientes = getStore(STORAGE_KEYS.CLIENTES);
    return clientes.find((c) => c.id === id) || null;
  },

  async getClienteByDocumento(documento) {
    await delay(200);
    const clientes = getStore(STORAGE_KEYS.CLIENTES);
    return clientes.find((c) => c.documento === documento.trim()) || null;
  },

  async createCliente(data) {
    await delay(400);
    const errors = validateCliente(data);
    if (Object.keys(errors).length) throw { errors };

    const clientes = getStore(STORAGE_KEYS.CLIENTES);
    const doc = data.documento.trim();
    if (clientes.some((c) => c.documento === doc)) {
      throw { errors: { documento: 'Ya existe un cliente con este documento' } };
    }

    const now = new Date().toISOString();
    const cliente = {
      id: `cli_${doc.replace(/[^0-9A-Za-z]/g, '_')}`,
      nombres: data.nombres.trim(),
      documento: doc,
      telefono: data.telefono.trim(),
      direccion: data.direccion.trim(),
      empresa: (data.empresa || '').trim(),
      fechaAlta: now,
      fechaActualizacion: now,
    };
    clientes.push(cliente);
    setStore(STORAGE_KEYS.CLIENTES, clientes);
    return cliente;
  },

  async updateCliente(id, data) {
    await delay(400);
    const errors = validateCliente(data);
    if (Object.keys(errors).length) throw { errors };

    const clientes = getStore(STORAGE_KEYS.CLIENTES);
    const idx = clientes.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Cliente no encontrado');

    const now = new Date().toISOString();
    clientes[idx] = {
      ...clientes[idx],
      nombres: data.nombres.trim(),
      telefono: data.telefono.trim(),
      direccion: data.direccion.trim(),
      empresa: (data.empresa || '').trim(),
      fechaActualizacion: now,
    };
    setStore(STORAGE_KEYS.CLIENTES, clientes);
    return clientes[idx];
  },

  async searchClientes(query) {
    await delay(200);
    const clientes = getStore(STORAGE_KEYS.CLIENTES);
    if (!query?.trim()) return clientes;
    const q = normalizeText(query);
    return clientes.filter(
      (c) =>
        normalizeText(c.nombres).includes(q) ||
        normalizeText(c.documento).includes(q) ||
        normalizeText(c.empresa).includes(q)
    );
  },
};
