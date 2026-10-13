import { APP_NAME, COMPANY_SHORT } from '../constants/appConfig';

const NOMINATIM_UA = `${APP_NAME} (${COMPANY_SHORT})`;

export const searchAddress = async (query) => {
  const q = query?.trim();
  if (!q || q.length < 3) {
    throw new Error('Escriba al menos 3 caracteres para buscar la dirección.');
  }
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=pe`;
  const res = await fetch(url, {
    headers: { 'User-Agent': NOMINATIM_UA, 'Accept-Language': 'es' },
  });
  if (!res.ok) throw new Error('Búsqueda en mapa no disponible.');
  const arr = await res.json();
  if (!Array.isArray(arr) || !arr.length) {
    throw new Error('No se encontró la ubicación. Pruebe otra dirección.');
  }
  return {
    lat: Number(arr[0].lat),
    lng: Number(arr[0].lon),
    label: String(arr[0].display_name || '').trim(),
  };
};

export const reverseGeocode = async (lat, lng) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&accept-language=es`;
  const res = await fetch(url, {
    headers: { 'User-Agent': NOMINATIM_UA },
  });
  if (!res.ok) return '';
  const data = await res.json();
  return String(data?.display_name || '').trim();
};
