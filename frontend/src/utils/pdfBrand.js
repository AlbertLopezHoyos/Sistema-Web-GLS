import { COMPANY_NAME, APP_NAME, SYSTEM_HEADER_TITLE } from '../constants/appConfig';

export const BRAND = {
  primary: [122, 40, 40],
  secondary: [95, 31, 31],
  dark: [58, 16, 16],
  accent: [245, 124, 0],
  paper: [252, 249, 247],
  muted: [100, 100, 100],
  line: [230, 220, 220],
};

let cachedLogo = null;

export const loadLogoDataUrl = async () => {
  if (cachedLogo) return cachedLogo;
  const res = await fetch('/assets/logo.png');
  const blob = await res.blob();
  cachedLogo = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  return cachedLogo;
};

export const addPdfFooter = (doc, pageNum, totalPages, extra = '') => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.2);
  doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text(COMPANY_NAME, 14, pageHeight - 8);
  doc.text(extra || APP_NAME, pageWidth / 2, pageHeight - 8, { align: 'center' });
  doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
};

/** Cabecera corporativa A4 vertical */
export const drawComprobanteHeader = (doc, logo) => {
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 0, 210, 36, 'F');
  doc.setFillColor(...BRAND.accent);
  doc.rect(0, 36, 210, 2.5, 'F');
  if (logo) doc.addImage(logo, 'PNG', 14, 8, 20, 20);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_NAME, 38, 16);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPROBANTE DE ENVÍO', 38, 26);
  doc.setFont('helvetica', 'normal');
};

/** Encabezado institucional PDF (comprobante y documentos A4) */
export const drawPdfHeader = (doc, logo, { docTitle, docSubtitle, tagline, codeRight }) => {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 0, pageW, 42, 'F');
  doc.setFillColor(...BRAND.accent);
  doc.rect(0, 42, pageW, 2, 'F');
  if (logo) doc.addImage(logo, 'PNG', 14, 8, 26, 26);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(COMPANY_NAME, logo ? 44 : 14, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(tagline || SYSTEM_HEADER_TITLE, logo ? 44 : 14, 22, { maxWidth: pageW - 100 });
  if (docTitle) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(docTitle, pageW - 14, 16, { align: 'right' });
  }
  if (codeRight) {
    doc.setFontSize(18);
    doc.text(codeRight, pageW - 14, 28, { align: 'right' });
  } else if (docSubtitle) {
    doc.setFontSize(10);
    doc.text(docSubtitle, pageW - 14, 28, { align: 'right' });
  }
  return 50;
};

export const drawPdfFooterLine = (doc, text) => {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...BRAND.line);
  doc.line(14, pageH - 16, pageW - 14, pageH - 16);
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text(text, pageW / 2, pageH - 10, { align: 'center' });
};

/** Encabezado tipo plantilla Excel (reporte landscape) */
export const drawReportPlainHeader = (doc, { generatedAt, totalRecords, filtersLine }) => {
  const margin = 12;
  const maxW = doc.internal.pageSize.getWidth() - margin * 2;
  let y = 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.primary);
  doc.text(COMPANY_NAME, margin, y);
  y += 7;
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.accent);
  doc.text('Reporte de envíos', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const sub = doc.splitTextToSize(SYSTEM_HEADER_TITLE, maxW);
  doc.text(sub, margin, y);
  y += sub.length * 3.8 + 2;
  doc.setFont('helvetica', 'italic');
  doc.text(`Generado: ${generatedAt}  ·  Total: ${totalRecords} registro(s)`, margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(filtersLine, margin, y);
  return y + 9;
};

/** Cabecera reporte landscape (legacy) */
export const drawReportHeader = (doc, logo, generatedAt) => {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 0, w, 28, 'F');
  doc.setFillColor(...BRAND.accent);
  doc.rect(0, 28, w, 2, 'F');
  if (logo) doc.addImage(logo, 'PNG', 12, 5, 18, 18);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(COMPANY_NAME, 34, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(APP_NAME, 34, 18);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE DE ENVÍOS', w - 14, 12, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(240, 240, 240);
  doc.text(`Generado: ${generatedAt}`, w - 14, 20, { align: 'right' });
};

export const drawSectionBar = (doc, y, text, width = 182, x = 14) => {
  doc.setFillColor(...BRAND.primary);
  doc.roundedRect(x, y, width, 8, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(text, x + 4, y + 5.5);
  doc.setFont('helvetica', 'normal');
  return y + 11;
};

export const drawInfoBox = (doc, x, y, w, h) => {
  doc.setFillColor(...BRAND.paper);
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.35);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');
};

export const drawHighlightCode = (doc, y, codigo, estado, fecha) => {
  drawInfoBox(doc, 14, y, 182, 22);
  doc.setTextColor(...BRAND.muted);
  doc.setFontSize(8);
  doc.text('Código de envío', 18, y + 7);
  doc.setTextColor(...BRAND.primary);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(codigo, 18, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40);
  doc.text(`Estado: ${estado}`, 120, y + 10);
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text(`Registro: ${fecha}`, 120, y + 16);
  return y + 28;
};

export const PDF_INK = [0, 0, 0];
export const PDF_INK_SOFT = [30, 30, 30];

export const drawKpiRow = (doc, y, items, pageWidth = 297) => {
  const gap = 6;
  const margin = 12;
  const count = items.length;
  const boxW = (pageWidth - margin * 2 - gap * (count - 1)) / count;
  items.forEach((item, i) => {
    const x = margin + i * (boxW + gap);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BRAND.line);
    doc.setLineWidth(0.35);
    doc.roundedRect(x, y, boxW, 17, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF_INK_SOFT);
    doc.text(item.label, x + 4, y + 6.5);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_INK);
    doc.text(String(item.value), x + 4, y + 14);
    doc.setFont('helvetica', 'normal');
  });
  return y + 23;
};
