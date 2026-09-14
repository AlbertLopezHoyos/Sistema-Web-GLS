import { query } from '../config/db.js';
import { mapUbicacion } from '../utils/mappers.js';
import { validateRequired, validateLatLng } from '../utils/validation.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { auditService } from './auditService.js';

const AREA_DEFAULT = 'Área de operaciones';

export const ubicacionesService = {
  async getByEnvio(codigo) {
    const [rows] = await query(
      `SELECT u.*, e.codigo_envio FROM ubicaciones_envio u
       JOIN envios e ON e.id = u.envio_id
       WHERE e.codigo_envio = ?
       ORDER BY u.fecha_registro ASC`,
      [codigo]
    );
    return rows.map(mapUbicacion);
  },

  async getUltima(codigo) {
    const items = await this.getByEnvio(codigo);
    return items.length ? items[items.length - 1] : null;
  },

  async registrar(codigo, data, actor) {
    const errors = {};
    const dir = validateRequired(data.direccion, 'Dirección');
    if (dir) errors.direccion = dir;
    const latLng = validateLatLng(data.latitud, data.longitud);
    if (latLng) errors.coordenadas = latLng;
    if (Object.keys(errors).length) throw new ValidationError(errors);

    const [envioRows] = await query('SELECT id FROM envios WHERE codigo_envio = ? LIMIT 1', [codigo]);
    if (!envioRows[0]) throw new NotFoundError('Envío no encontrado');

    const now = new Date();
    const id = `${codigo}__${now.toISOString()}`;

    await query(
      `INSERT INTO ubicaciones_envio (
        id, envio_id, direccion, latitud, longitud, observacion,
        fecha_registro, responsable, registrado_por, usuario_id
      ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        id, envioRows[0].id, data.direccion.trim(), Number(data.latitud), Number(data.longitud),
        (data.observacion || '').trim(), now, AREA_DEFAULT, actor?.email || 'sistema', actor?.id || null,
      ]
    );

    await auditService.registrar({
      accion: 'ubicacion_registrada',
      modulo: 'Geolocalización',
      descripcion: `Ubicación registrada para ${codigo}`,
      usuarioId: actor?.id,
      usuarioEmail: actor?.email || '',
      rol: actor?.rol || '',
    });

    const [rows] = await query(
      `SELECT u.*, e.codigo_envio FROM ubicaciones_envio u
       JOIN envios e ON e.id = u.envio_id WHERE u.id = ?`,
      [id]
    );
    return mapUbicacion(rows[0]);
  },
};
