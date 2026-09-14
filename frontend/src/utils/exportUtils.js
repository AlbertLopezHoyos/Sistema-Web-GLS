import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { formatDateTime } from './formatters';

export const EXPORT_COLUMNS = [
  'Código envío',
  'Estado',
  'Origen',
  'Destino',
  'Fecha registro',
  'Remitente',
  'Doc. remitente',
  'Destinatario',
  'Doc. destinatario',
  'Cliente',
  'Doc. cliente',
  'Tipo carga',
  'Peso (kg)',
];

export const mapEnvioToRow = (envio) => [
  envio.codigoEnvio,
  envio.estadoActual,
  envio.origen,
  envio.destino,
  formatDateTime(envio.fechaRegistro),
  envio.remitente?.nombres || '',
  envio.remitente?.documento || '',
  envio.destinatario?.nombres || '',
  envio.destinatario?.documento || '',
  envio.clienteAsociado?.nombres || '',
  envio.clienteAsociado?.documento || '',
  envio.tipoCarga,
  envio.peso,
];

export const exportCSV = (rows, filename = 'reporte-gls.csv') => {
  const header = EXPORT_COLUMNS.join(',');
  const body = rows.map((row) =>
    row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
  );
  const csv = [header, ...body].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportExcel = (rows, filename = 'reporte-gls.xlsx') => {
  const data = [EXPORT_COLUMNS, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
  XLSX.writeFile(wb, filename);
};

export const exportPDF = (rows, title = 'Reporte GLS', filename = 'reporte-gls.pdf') => {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(14);
  doc.text(title, 14, 15);
  doc.setFontSize(8);
  let y = 25;
  const lineHeight = 5;
  const headers = EXPORT_COLUMNS.slice(0, 8).join(' | ');
  doc.text(headers, 14, y);
  y += lineHeight;
  rows.forEach((row) => {
    if (y > 190) {
      doc.addPage();
      y = 20;
    }
    const line = row.slice(0, 8).map((c) => String(c ?? '')).join(' | ');
    doc.text(line.substring(0, 120), 14, y);
    y += lineHeight;
  });
  doc.save(filename);
};
