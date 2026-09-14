import { mapUbicacion } from '../utils/mappers.js';
import { validateRequired, validateLatLng } from '../utils/validation.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { auditService } from './auditService.js';
import { ubicacionesRepository } from '../repositories/ubicacionesRepository.js';

const AREA_DEFAULT = 'Área de operaciones';

export const ubicacionesService = {
  async getByEnvio(codigo) {
    const rows = await ubicacionesRepository.findByEnvio(codigo);
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

    const envioId = await ubicacionesRepository.findEnvioId(codigo);
    if (!envioId) throw new NotFoundError('Envío no encontrado');

    const now = new Date();
    const id = `${codigo}__${now.toISOString()}`;

    await ubicacionesRepository.insert([
      id, envioId, data.direccion.trim(), Number(data.latitud), Number(data.longitud),
      (data.observacion || '').trim(), now, AREA_DEFAULT, actor?.email || 'sistema', actor?.id || null,
    ]);

    await auditService.registrar({
      accion: 'ubicacion_registrada',
      modulo: 'Geolocalización',
      descripcion: `Ubicación registrada para ${codigo}`,
      usuarioId: actor?.id,
      usuarioEmail: actor?.email || '',
      rol: actor?.rol || '',
    });

    const row = await ubicacionesRepository.findById(id);
    return mapUbicacion(row);
  },
};
