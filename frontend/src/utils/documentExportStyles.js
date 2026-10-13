import { COMPANY_NAME, SYSTEM_HEADER_TITLE } from '../constants/appConfig';



export const EXCEL = {

  brandArgb: 'FF7A2828',

  accentArgb: 'FFF57C00',

  mutedArgb: 'FF64748B',

  inkArgb: 'FF000000',

  stripeArgb: 'FFF8FAFC',

  borderArgb: 'FFE2E8F0',

  font: 'Segoe UI',

};



export const excelThinBorder = {

  top: { style: 'thin', color: { argb: EXCEL.borderArgb } },

  left: { style: 'thin', color: { argb: EXCEL.borderArgb } },

  bottom: { style: 'thin', color: { argb: EXCEL.borderArgb } },

  right: { style: 'thin', color: { argb: EXCEL.borderArgb } },

};



export const buildFiltersLine = (filters = {}) => {

  const parts = [];

  parts.push(`Estado: ${filters.estado || 'Todos'}`);

  if (filters.desde) parts.push(`Desde: ${filters.desde}`);

  if (filters.hasta) parts.push(`Hasta: ${filters.hasta}`);

  if (filters.cliente) parts.push(`Cliente: ${filters.cliente}`);

  return `Filtros: ${parts.join(' · ')}`;

};



export const REPORT_DOC = {

  company: COMPANY_NAME,

  title: 'Reporte de envíos',

  subtitle: SYSTEM_HEADER_TITLE,

};


