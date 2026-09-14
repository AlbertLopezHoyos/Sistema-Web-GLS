import { query } from '../config/db.js';
import { mapAuditoria } from '../utils/mappers.js';

const generateId = () => `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const auditService = {
  async registrar({
    accion,
    modulo,
    descripcion,
    usuarioId = null,
    usuarioEmail = '',
    rol = '',
    ip = null,
    userAgent = null,
  }) {
    const id = generateId();
    const fecha = new Date();
    await query(
      `INSERT INTO auditoria (id, usuario_id, usuario_email, rol, accion, modulo, descripcion, ip, user_agent, fecha)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, usuarioId, usuarioEmail, rol, accion, modulo, descripcion, ip, userAgent, fecha]
    );
    return id;
  },

  async list(filters = {}) {
    let sql = `SELECT a.* FROM auditoria a WHERE 1=1`;
    const params = [];

    if (filters.usuario) {
      sql += ' AND a.usuario_email LIKE ?';
      params.push(`%${filters.usuario}%`);
    }
    if (filters.modulo && filters.modulo !== 'Todos') {
      sql += ' AND a.modulo = ?';
      params.push(filters.modulo);
    }
    if (filters.accion && filters.accion !== 'Todos') {
      sql += ' AND a.accion = ?';
      params.push(filters.accion);
    }
    if (filters.desde) {
      sql += ' AND a.fecha >= ?';
      params.push(new Date(filters.desde));
    }
    if (filters.hasta) {
      const hasta = new Date(filters.hasta);
      hasta.setHours(23, 59, 59, 999);
      sql += ' AND a.fecha <= ?';
      params.push(hasta);
    }
    if (filters.search) {
      sql += ' AND (a.descripcion LIKE ? OR a.usuario_email LIKE ? OR a.accion LIKE ?)';
      const q = `%${filters.search}%`;
      params.push(q, q, q);
    }

    sql += ' ORDER BY a.fecha DESC';
    const [rows] = await query(sql, params);
    return rows.map(mapAuditoria);
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
