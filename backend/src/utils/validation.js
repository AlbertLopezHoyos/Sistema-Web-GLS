import { CURRENCIES, DIMENSION_UNITS } from './constants.js';

export const validateEmail = (email) => {
  if (!email?.trim()) return 'El correo es obligatorio';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Correo inválido';
  return null;
};

export const validatePassword = (password, min = 6) => {
  if (!password) return 'La contraseña es obligatoria';
  if (password.length < min) return `Mínimo ${min} caracteres`;
  return null;
};

export const validateDocumento = (doc) => {
  if (!doc?.trim()) return 'El documento es obligatorio';
  if (!/^[0-9A-Za-z-]{6,20}$/.test(doc.trim())) return 'Documento inválido (6-20 caracteres alfanuméricos)';
  return null;
};

export const validateTelefono = (tel) => {
  if (!tel?.trim()) return 'El teléfono es obligatorio';
  if (!/^[0-9+\-\s]{6,20}$/.test(tel.trim())) return 'Teléfono inválido';
  return null;
};

export const validateRequired = (value, label) => {
  if (value === undefined || value === null || String(value).trim() === '') return `${label} es obligatorio`;
  return null;
};

export const validatePositiveNumber = (value, label) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return `${label} debe ser un número mayor a 0`;
  return null;
};

export const validateNonNegativeNumber = (value, label) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return `${label} debe ser un número mayor o igual a 0`;
  return null;
};

export const validateDimensiones = (dimensiones) => {
  const errors = {};
  if (!dimensiones || typeof dimensiones !== 'object') {
    errors.dimensiones = 'Las dimensiones son obligatorias';
    return errors;
  }
  ['largo', 'ancho', 'alto'].forEach((d) => {
    const err = validatePositiveNumber(dimensiones[d], d);
    if (err) errors[d] = err;
  });
  const unidad = validateUnidadMedida(dimensiones.unidadMedida);
  if (unidad) errors.unidadMedida = unidad;
  return errors;
};

export const validateUnidadMedida = (unidad) => {
  if (!unidad?.trim()) return 'La unidad de medida es obligatoria';
  if (!DIMENSION_UNITS.includes(unidad.trim())) {
    return `Unidad de medida inválida. Permitidas: ${DIMENSION_UNITS.join(', ')}`;
  }
  return null;
};

export const validateParty = (party, prefix) => {
  const errors = {};
  if (!party || typeof party !== 'object') {
    errors[`${prefix}`] = prefix === 'remitente'
      ? 'Los datos del remitente son obligatorios'
      : 'Los datos del destinatario son obligatorios';
    return errors;
  }
  const n = validateRequired(party.nombres, `${prefix} nombres`);
  if (n) errors[`${prefix}_nombres`] = n;
  const doc = validateDocumento(party.documento);
  if (doc) errors[`${prefix}_documento`] = doc;
  const tel = validateTelefono(party.telefono);
  if (tel) errors[`${prefix}_telefono`] = tel;
  const dir = validateRequired(party.direccion, `${prefix} dirección`);
  if (dir) errors[`${prefix}_direccion`] = dir;
  return errors;
};

export const validateCotizacionInput = (cotizacion) => {
  const errors = {};
  if (!cotizacion) return errors;

  const dist = validateNonNegativeNumber(cotizacion.distanciaKm ?? 0, 'Distancia');
  if (dist) errors.distanciaKm = dist;

  const tKg = validatePositiveNumber(cotizacion.tarifaPorKg, 'Tarifa por kg');
  if (tKg) errors.tarifaPorKg = tKg;

  const tM3 = validateNonNegativeNumber(cotizacion.tarifaPorM3 ?? 0, 'Tarifa por m³');
  if (tM3) errors.tarifaPorM3 = tM3;

  const tKm = validateNonNegativeNumber(cotizacion.tarifaPorKm ?? 0, 'Tarifa por km');
  if (tKm) errors.tarifaPorKm = tKm;

  const seg = Number(cotizacion.seguroPorcentaje ?? 0);
  if (!Number.isFinite(seg) || seg < 0 || seg > 100) {
    errors.seguroPorcentaje = 'El seguro debe estar entre 0 y 100';
  }

  const moneda = cotizacion.moneda || 'PEN';
  if (!CURRENCIES.includes(moneda)) {
    errors.moneda = `Moneda inválida. Permitidas: ${CURRENCIES.join(', ')}`;
  }

  return errors;
};

export const validateReceptorDocumento = (doc) => {
  if (!doc?.trim()) return 'Documento del receptor es obligatorio';
  if (!/^\d{8}$|^\d{11}$/.test(doc.trim())) return 'Documento del receptor inválido (DNI 8 o RUC 11 dígitos)';
  return null;
};

export const validateLatLng = (lat, lng) => {
  const la = Number(lat);
  const lo = Number(lng);
  if (!Number.isFinite(la) || la < -90 || la > 90) return 'Latitud inválida';
  if (!Number.isFinite(lo) || lo < -180 || lo > 180) return 'Longitud inválida';
  return null;
};
