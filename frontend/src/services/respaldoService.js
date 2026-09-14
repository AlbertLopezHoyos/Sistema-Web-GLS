import { STORAGE_KEYS } from '../constants/appConfig';
import { getStore, setStore, generateId } from '../utils/dataStore';
import { delay } from '../utils/storage';
import { logAudit } from '../utils/auditHelper';

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
    logAudit({ accion: 'backup_exportado', modulo: 'Respaldo', descripcion: 'Respaldo simulado generado', usuario });
    return entry;
  },

  async restaurarRespaldo(usuario) {
    await delay(800);
    logAudit({ accion: 'backup_importado', modulo: 'Respaldo', descripcion: 'Restauración simulada', usuario });
    return { success: true, message: 'Operación simulada. No se realizaron cambios en los datos.' };
  },
};
