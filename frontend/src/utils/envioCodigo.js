const ENVIO_CODE_RE = /ENV-\d{4}-\d{3,}/i;

export const normalizeEnvioCodigo = (value) => {
  const m = String(value || '').trim().match(ENVIO_CODE_RE);
  return m ? m[0].toUpperCase() : String(value || '').trim().toUpperCase();
};

export const extractCodigoFromPdfFile = async (file) => {
  if (!file) return null;
  const nameMatch = file.name.match(ENVIO_CODE_RE);
  if (nameMatch) return nameMatch[0].toUpperCase();

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunkSize = 65536;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    const text = new TextDecoder('latin1', { fatal: false }).decode(slice);
    const m = text.match(ENVIO_CODE_RE);
    if (m) return m[0].toUpperCase();
  }
  return null;
};
