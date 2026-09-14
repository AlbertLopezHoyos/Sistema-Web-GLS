import { STORAGE_KEYS, AREA_DEFAULT } from '../constants/appConfig';
import { getStore, setStore } from '../utils/dataStore';
import { delay } from '../utils/storage';
import { validateRequired, validateLatLng } from '../utils/validation';

/**
 * La geolocalización implementada corresponde a puntos de control registrados
 * y no representa seguimiento GPS en tiempo real.
 */
export const ubicacionesService = {
  async getUbicacionesByEnvio(codigo) {
    await delay(300);
    const ubicaciones = getStore(STORAGE_KEYS.UBICACIONES);
    return ubicaciones
      .filter((u) => u.codigoEnvio === codigo)
      .sort((a, b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro));
  },

  async getUltimaUbicacion(codigo) {
    const ubicaciones = await this.getUbicacionesByEnvio(codigo);
    return ubicaciones.length ? ubicaciones[ubicaciones.length - 1] : null;
  },

  async registrarUbicacion(codigo, data, registradoPor) {
    await delay(400);
    const errors = {};
    const dir = validateRequired(data.direccion, 'Dirección');
    if (dir) errors.direccion = dir;
    const latLng = validateLatLng(data.latitud, data.longitud);
    if (latLng) errors.coordenadas = latLng;

    if (Object.keys(errors).length) throw { errors };

    const now = new Date().toISOString();
    const ubicacion = {
      id: `${codigo}__${now}`,
      codigoEnvio: codigo,
      direccion: data.direccion.trim(),
      latitud: String(data.latitud),
      longitud: String(data.longitud),
      observacion: (data.observacion || '').trim(),
      fechaRegistro: now,
      responsable: AREA_DEFAULT,
      registradoPor: registradoPor || 'sistema',
    };

    const ubicaciones = getStore(STORAGE_KEYS.UBICACIONES);
    ubicaciones.push(ubicacion);
    setStore(STORAGE_KEYS.UBICACIONES, ubicaciones);
    return ubicacion;
  },
};
