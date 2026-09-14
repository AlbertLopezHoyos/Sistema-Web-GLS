import { STORAGE_KEYS } from '../constants/appConfig';
import { getStore, setStore, generateId } from '../utils/dataStore';
import { delay } from '../utils/storage';

export const respaldoService = {
  async getInfo() {
    await delay(300);
    return getStore(STORAGE_KEYS.RESPALDO);
  },

  async generarRespaldo(usuario) {
    await delay(800);
    const respaldo = getStore(STORAGE_KEYS.RESPALDO);
    const now = new Date().toISOString();
    const entry = {
      id: generateId('bk'),
      fecha: now,
      estado: 'Completado (simulado)',
      usuario,
      tipo: 'Exportación simulada',
    };
    respaldo.historial.unshift(entry);
    respaldo.ultimo = {
      fecha: now,
      estado: 'Completado (simulado)',
      usuario,
      tamano: '2.4 MB (simulado)',
    };
    setStore(STORAGE_KEYS.RESPALDO, respaldo);
    return entry;
  },

  async restaurarRespaldo() {
    await delay(800);
    return { success: true, message: 'Operación simulada. No se realizaron cambios en los datos.' };
  },
};
