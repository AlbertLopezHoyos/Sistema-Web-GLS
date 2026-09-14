export const validateEmail = (email) => {
  if (!email?.trim()) return 'El correo es obligatorio';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email.trim().toLowerCase())) return 'Correo inválido';
  return '';
};

export const validatePassword = (password, min = 6) => {
  if (!password) return 'La contraseña es obligatoria';
  if (password.length < min) return `Mínimo ${min} caracteres`;
  return '';
};

export const validateDocumento = (doc) => {
  if (!doc?.trim()) return 'El documento es obligatorio';
  if (!/^[0-9A-Za-z\-]{6,20}$/.test(doc.trim())) {
    return 'Documento inválido (6-20 caracteres alfanuméricos)';
  }
  return '';
};

export const validateTelefono = (tel) => {
  if (!tel?.trim()) return 'El teléfono es obligatorio';
  if (!/^[0-9+\-\s]{6,20}$/.test(tel.trim())) return 'Teléfono inválido';
  return '';
};

export const validateRequired = (value, label = 'Campo') => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${label} es obligatorio`;
  }
  return '';
};

export const validatePositiveNumber = (value, label = 'Valor') => {
  const num = Number(value);
  if (Number.isNaN(num) || num <= 0) return `${label} debe ser mayor a cero`;
  return '';
};

export const validateReceptorDocumento = (doc) => {
  if (!/^\d{8}$|^\d{11}$/.test(String(doc || '').trim())) {
    return 'Documento del receptor: DNI (8) o RUC (11) dígitos';
  }
  return '';
};

export const validateLatLng = (lat, lng) => {
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (Number.isNaN(latNum) || latNum < -90 || latNum > 90) return 'Latitud inválida';
  if (Number.isNaN(lngNum) || lngNum < -180 || lngNum > 180) return 'Longitud inválida';
  return '';
};
