export const CODIGO_REGEX = /^ENV-\d{4}-\d{4,}$/i;

export const formatCodigoEnvio = (year, consecutive) => {
  const padded = String(consecutive).padStart(4, '0');
  return `ENV-${year}-${padded}`.toUpperCase();
};

export const isValidCodigoEnvio = (codigo) => CODIGO_REGEX.test(String(codigo || '').trim());
