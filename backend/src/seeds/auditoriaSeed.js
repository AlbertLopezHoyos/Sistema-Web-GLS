export const auditoriaSeed = [
  { id: 'log_001', usuario: 'jorge.salazar@gls.local', rol: 'admin', accion: 'login', fecha: '2026-11-15T08:00:00.000Z', modulo: 'Autenticación', descripcion: 'Inicio de sesión exitoso' },
  { id: 'log_002', usuario: 'luis.mesia@gls.local', rol: 'operaciones', accion: 'envio_creado', fecha: '2026-07-15T11:30:00.000Z', modulo: 'Envíos', descripcion: 'Envío ENV-2026-0005 registrado' },
  { id: 'log_003', usuario: 'crosbin.salazar@gls.local', rol: 'operaciones', accion: 'estado_actualizado', fecha: '2026-06-15T09:15:00.000Z', modulo: 'Trazabilidad', descripcion: 'Estado de ENV-2026-0002 actualizado a En reparto' },
  { id: 'log_004', usuario: 'jorge.salazar@gls.local', rol: 'admin', accion: 'cliente_creado', fecha: '2026-10-01T10:00:00.000Z', modulo: 'Clientes', descripcion: 'Cliente cli_78901234 creado' },
  { id: 'log_005', usuario: 'luis.mesia@gls.local', rol: 'operaciones', accion: 'exportacion_archivo', fecha: '2026-08-20T16:00:00.000Z', modulo: 'Reportes', descripcion: 'Exportación Excel de reporte de envíos' },
  { id: 'log_006', usuario: 'crosbin.salazar@gls.local', rol: 'operaciones', accion: 'login', fecha: '2026-09-10T09:00:00.000Z', modulo: 'Autenticación', descripcion: 'Inicio de sesión exitoso' },
  { id: 'log_007', usuario: 'jorge.salazar@gls.local', rol: 'admin', accion: 'registro_usuario', fecha: '2026-06-03T14:00:00.000Z', modulo: 'Usuarios', descripcion: 'Usuario crosbin.salazar@gls.local invitado' },
  { id: 'log_009', usuario: 'luis.mesia@gls.local', rol: 'operaciones', accion: 'cliente_modificado', fecha: '2026-07-10T11:00:00.000Z', modulo: 'Clientes', descripcion: 'Cliente cli_20123456789 actualizado' },
  { id: 'log_010', usuario: 'crosbin.salazar@gls.local', rol: 'operaciones', accion: 'login_fallido', fecha: '2026-06-20T08:30:00.000Z', modulo: 'Autenticación', descripcion: 'Intento de inicio de sesión fallido' },
  { id: 'log_011', usuario: 'jorge.salazar@gls.local', rol: 'admin', accion: 'logout', fecha: '2026-11-15T17:00:00.000Z', modulo: 'Autenticación', descripcion: 'Cierre de sesión' },
  { id: 'log_012', usuario: 'luis.mesia@gls.local', rol: 'operaciones', accion: 'estado_actualizado', fecha: '2026-06-08T14:20:00.000Z', modulo: 'Trazabilidad', descripcion: 'Estado de ENV-2026-0001 actualizado a En tránsito' },
];
