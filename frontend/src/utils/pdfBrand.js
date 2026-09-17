import { COMPANY_NAME } from '../constants/appConfig';

export const BRAND = {
  primary: [122, 40, 40],
  secondary: [95, 31, 31],
  dark: [58, 16, 16],
  accent: [245, 124, 0],
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

export const addPdfFooter = (doc, pageNum, totalPages) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(COMPANY_NAME, 14, pageHeight - 8);
  doc.text('Sistema Web GLS', pageWidth / 2, pageHeight - 8, { align: 'center' });
  doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
};

export const drawPdfHeaderBand = (doc, title, subtitle = '') => {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(title, 14, 12);
  if (subtitle) {
    doc.setFontSize(9);
    doc.text(subtitle, 14, 20);
  }
};
