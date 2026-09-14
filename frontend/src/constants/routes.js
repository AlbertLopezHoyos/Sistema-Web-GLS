export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CLIENTES: '/clientes',
  CLIENTE_NUEVO: '/clientes/nuevo',
  CLIENTE_DETALLE: '/clientes/:id',
  ENVIOS: '/envios',
  ENVIO_NUEVO: '/envios/nuevo',
  ENVIO_DETALLE: '/envios/:id',
  ENVIO_TRAZABILIDAD: '/envios/:id/trazabilidad',
  HISTORIAL: '/historial',
  TRAZABILIDAD: '/trazabilidad',
  GEOLOCALIZACION: '/geolocalizacion',
  GEOLOCALIZACION_DETALLE: '/geolocalizacion/:id',
  REPORTES: '/reportes',
  USUARIOS: '/usuarios',
  AUDITORIA: '/auditoria',
  RESPALDO: '/respaldo',
  PERFIL: '/perfil',
};

export const DEFAULT_ROUTE = ROUTES.DASHBOARD;
