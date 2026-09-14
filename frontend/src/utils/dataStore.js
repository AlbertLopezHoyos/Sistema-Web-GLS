import { STORAGE_KEYS } from '../constants/appConfig';
import { storage } from './storage';
import { usuariosMock } from '../mocks/usuariosMock';
import { clientesMock } from '../mocks/clientesMock';
import { enviosMock, COUNTER_INITIAL } from '../mocks/enviosMock';
import { historialMock } from '../mocks/historialMock';
import { ubicacionesMock } from '../mocks/ubicacionesMock';
import { auditoriaMock, respaldoMock } from '../mocks/auditoriaMock';

const initStore = (key, mockData) => {
  const existing = storage.get(key);
  if (!existing) {
    storage.set(key, mockData);
    return mockData;
  }
  return existing;
};

export const getStore = (key) => {
  switch (key) {
    case STORAGE_KEYS.USUARIOS:
      return initStore(key, usuariosMock);
    case STORAGE_KEYS.CLIENTES:
      return initStore(key, clientesMock);
    case STORAGE_KEYS.ENVIOS:
      return initStore(key, enviosMock);
    case STORAGE_KEYS.HISTORIAL:
      return initStore(key, historialMock);
    case STORAGE_KEYS.UBICACIONES:
      return initStore(key, ubicacionesMock);
    case STORAGE_KEYS.AUDITORIA:
      return initStore(key, auditoriaMock);
    case STORAGE_KEYS.RESPALDO:
      return initStore(key, respaldoMock);
    case STORAGE_KEYS.COUNTER:
      return initStore(key, COUNTER_INITIAL);
    default:
      return storage.get(key, []);
  }
};

export const setStore = (key, data) => {
  storage.set(key, data);
};

export const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
