export const auditoriaMock = [
  { id: 'log_001', usuario: 'admin@demo-gls.local', rol: 'admin', accion: 'login', fecha: '2026-01-09T08:00:00.000Z', modulo: 'Autenticación', descripcion: 'Inicio de sesión exitoso' },
  { id: 'log_002', usuario: 'operaciones@demo-gls.local', rol: 'operaciones', accion: 'envio_creado', fecha: '2026-01-09T11:30:00.000Z', modulo: 'Envíos', descripcion: 'Envío ENV-2026-0005 registrado' },
  { id: 'log_003', usuario: 'operaciones@demo-gls.local', rol: 'operaciones', accion: 'estado_actualizado', fecha: '2026-01-09T09:15:00.000Z', modulo: 'Trazabilidad', descripcion: 'Estado de ENV-2026-0002 actualizado a En reparto' },
  { id: 'log_004', usuario: 'admin@demo-gls.local', rol: 'admin', accion: 'cliente_creado', fecha: '2026-01-08T10:00:00.000Z', modulo: 'Clientes', descripcion: 'Cliente cli_78901234 creado' },
  { id: 'log_005', usuario: 'operaciones@demo-gls.local', rol: 'operaciones', accion: 'exportacion_archivo', fecha: '2026-01-08T16:00:00.000Z', modulo: 'Reportes', descripcion: 'Exportación Excel de reporte de envíos' },
  { id: 'log_006', usuario: 'consulta@demo-gls.local', rol: 'consulta', accion: 'login', fecha: '2026-01-09T09:00:00.000Z', modulo: 'Autenticación', descripcion: 'Inicio de sesión exitoso' },
  { id: 'log_007', usuario: 'admin@demo-gls.local', rol: 'admin', accion: 'registro_usuario', fecha: '2026-01-07T14:00:00.000Z', modulo: 'Usuarios', descripcion: 'Usuario operaciones2@demo-gls.local invitado' },
  { id: 'log_008', usuario: 'admin@demo-gls.local', rol: 'admin', accion: 'backup_exportado', fecha: '2026-01-06T18:00:00.000Z', modulo: 'Respaldo', descripcion: 'Respaldo simulado generado' },
  { id: 'log_009', usuario: 'operaciones@demo-gls.local', rol: 'operaciones', accion: 'cliente_modificado', fecha: '2026-01-05T11:00:00.000Z', modulo: 'Clientes', descripcion: 'Cliente cli_20123456789 actualizado' },
  { id: 'log_010', usuario: 'operaciones@demo-gls.local', rol: 'operaciones', accion: 'login_fallido', fecha: '2026-01-04T08:30:00.000Z', modulo: 'Autenticación', descripcion: 'Intento de inicio de sesión fallido' },
  { id: 'log_011', usuario: 'admin@demo-gls.local', rol: 'admin', accion: 'logout', fecha: '2026-01-09T17:00:00.000Z', modulo: 'Autenticación', descripcion: 'Cierre de sesión' },
  { id: 'log_012', usuario: 'operaciones@demo-gls.local', rol: 'operaciones', accion: 'estado_actualizado', fecha: '2026-01-08T14:20:00.000Z', modulo: 'Trazabilidad', descripcion: 'Estado de ENV-2026-0001 actualizado a En tránsito' },
];

export const respaldoMock = {
  ultimo: {
    fecha: '2026-01-06T18:00:00.000Z',
    estado: 'Completado',
    usuario: 'admin@demo-gls.local',
    tamano: '2.4 MB (simulado)',
  },
  historial: [
    { id: 'bk_001', fecha: '2026-01-06T18:00:00.000Z', estado: 'Completado', usuario: 'admin@demo-gls.local', tipo: 'Exportación' },
    { id: 'bk_002', fecha: '2025-12-20T10:00:00.000Z', estado: 'Completado', usuario: 'admin@demo-gls.local', tipo: 'Exportación' },
    { id: 'bk_003', fecha: '2025-11-15T14:00:00.000Z', estado: 'Completado', usuario: 'admin@demo-gls.local', tipo: 'Exportación' },
  ],
};
