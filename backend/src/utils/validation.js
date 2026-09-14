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
  if (Number.isNaN(n) || n <= 0) return `${label} debe ser un número mayor a 0`;
  return null;
};

export const validateReceptorDocumento = (doc) => {
  if (!doc?.trim()) return 'Documento del receptor es obligatorio';
  if (!/^\d{8}$|^\d{11}$/.test(doc.trim())) return 'Documento del receptor inválido (DNI 8 o RUC 11 dígitos)';
  return null;
};

export const validateLatLng = (lat, lng) => {
  const la = Number(lat);
  const lo = Number(lng);
  if (Number.isNaN(la) || la < -90 || la > 90) return 'Latitud inválida';
  if (Number.isNaN(lo) || lo < -180 || lo > 180) return 'Longitud inválida';
  return null;
};
