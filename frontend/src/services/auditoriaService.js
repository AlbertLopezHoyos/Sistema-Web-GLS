import { STORAGE_KEYS } from '../constants/appConfig';
import { getStore, setStore, generateId } from '../utils/dataStore';
import { delay } from '../utils/storage';

export const auditoriaService = {
  async getEventos(filters = {}) {
    await delay(300);
    let eventos = getStore(STORAGE_KEYS.AUDITORIA);

    if (filters.usuario) {
      const q = filters.usuario.toLowerCase();
      eventos = eventos.filter((e) => e.usuario.toLowerCase().includes(q));
    }
    if (filters.modulo && filters.modulo !== 'Todos') {
      eventos = eventos.filter((e) => e.modulo === filters.modulo);
    }
    if (filters.accion && filters.accion !== 'Todos') {
      eventos = eventos.filter((e) => e.accion === filters.accion);
    }
    if (filters.desde) {
      eventos = eventos.filter((e) => new Date(e.fecha) >= new Date(filters.desde));
    }
    if (filters.hasta) {
      const hasta = new Date(filters.hasta);
      hasta.setHours(23, 59, 59, 999);
      eventos = eventos.filter((e) => new Date(e.fecha) <= hasta);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      eventos = eventos.filter(
        (e) =>
          e.descripcion.toLowerCase().includes(q) ||
          e.usuario.toLowerCase().includes(q) ||
          e.accion.toLowerCase().includes(q)
      );
    }

    return eventos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  },

  async registrarEvento(data) {
    const eventos = getStore(STORAGE_KEYS.AUDITORIA);
    eventos.unshift({
      id: generateId('log'),
      fecha: new Date().toISOString(),
      ...data,
    });
    setStore(STORAGE_KEYS.AUDITORIA, eventos);
  },

  getModulos() {
    return ['Autenticación', 'Clientes', 'Envíos', 'Trazabilidad', 'Geolocalización', 'Reportes', 'Usuarios', 'Respaldo'];
  },

  getAcciones() {
    return [
      'login', 'logout', 'login_fallido', 'envio_creado', 'estado_actualizado',
      'cliente_creado', 'cliente_modificado', 'registro_usuario', 'usuario_modificado',
      'ubicacion_registrada', 'exportacion_archivo', 'backup_exportado', 'backup_importado',
    ];
  },
};
