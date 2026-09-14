import { apiClient } from './apiClient';

export const auditoriaService = {
  async getEventos(filters = {}) {
    return apiClient.get('/auditoria', filters);
  },

  getModulos() {
    return ['Autenticación', 'Clientes', 'Envíos', 'Trazabilidad', 'Geolocalización', 'Reportes', 'Usuarios'];
  },

  getAcciones() {
    return [
      'login', 'logout', 'login_fallido', 'envio_creado', 'estado_actualizado',
      'cliente_creado', 'cliente_modificado', 'registro_usuario', 'usuario_modificado',
      'ubicacion_registrada', 'exportacion_archivo',
    ];
  },
};
