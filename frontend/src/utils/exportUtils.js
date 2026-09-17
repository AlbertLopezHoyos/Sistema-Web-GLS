import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { COMPANY_NAME, APP_NAME } from '../constants/appConfig';
import { formatDateTime } from './formatters';
import { BRAND, loadLogoDataUrl, addPdfFooter } from './pdfBrand';

export const EXPORT_COLUMNS = [
  'Código envío',
  'Estado',
  'Fecha registro',
  'Origen',
  'Destino',
  'Remitente',
  'Doc. remitente',
  'Destinatario',
  'Doc. destinatario',
  'Cliente',
  'Tipo carga',
  'Peso (kg)',
];

export const mapEnvioToRow = (envio) => [
  envio.codigoEnvio,
  envio.estadoActual,
  formatDateTime(envio.fechaRegistro),
  envio.origen,
  envio.destino,
  envio.remitente?.nombres || '',
  envio.remitente?.documento || '',
  envio.destinatario?.nombres || '',
  envio.destinatario?.documento || '',
  envio.clienteAsociado?.nombres || '',
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

const buildFilterLines = (filters = {}) => {
  const lines = [];
  if (filters.estado) lines.push(`Estado: ${filters.estado}`);
  if (filters.desde) lines.push(`Desde: ${filters.desde}`);
  if (filters.hasta) lines.push(`Hasta: ${filters.hasta}`);
  if (filters.cliente) lines.push(`Cliente: ${filters.cliente}`);
  return lines;
};

export const exportPDF = async (rows, options = {}) => {
  const { reporte, filters = {}, filename = 'reporte-gls.pdf' } = options;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const logo = await loadLogoDataUrl();
  const generatedAt = formatDateTime(new Date().toISOString());
  const filterLines = buildFilterLines(filters);

  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, 297, 24, 'F');
  if (logo) doc.addImage(logo, 'PNG', 10, 4, 14, 14);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(COMPANY_NAME, 28, 10);
  doc.setFontSize(10);
  doc.text(APP_NAME, 28, 16);
  doc.setFontSize(14);
  doc.text('REPORTE DE ENVÍOS', 200, 12, { align: 'right' });
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  doc.text(`Generado: ${generatedAt}`, 200, 18, { align: 'right' });

  let y = 30;
  filterLines.forEach((line) => {
    doc.setTextColor(60);
    doc.text(line, 10, y);
    y += 5;
  });

  if (reporte) {
    y += 2;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(10, y, 277, 14, 2, 2, 'F');
    doc.setTextColor(30);
    doc.setFontSize(9);
    const kpis = [
      `Total envíos: ${reporte.total}`,
      `Entregados: ${reporte.entregados} (${reporte.kpis?.porcentajeEntregados ?? 0}%)`,
      `Observados: ${reporte.observados} (${reporte.kpis?.porcentajeObservados ?? 0}%)`,
      `Tiempo prom. entrega: ${reporte.kpis?.tiempoPromedioEntregaDias ?? 0} días`,
    ];
    doc.text(kpis.join('   |   '), 14, y + 9);
    y += 20;
  }

  autoTable(doc, {
    startY: y,
    head: [EXPORT_COLUMNS],
    body: rows,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: {
      fillColor: BRAND.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: 10, right: 10 },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      addPdfFooter(doc, data.pageNumber, pageCount);
    },
  });

  doc.save(filename);
};

const applyHeaderStyle = (cell) => {
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF7A2828' },
  };
  cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
};

export const exportExcel = async (rows, options = {}) => {
  const { reporte, filters = {}, filename = 'reporte-gls.xlsx' } = options;
  const wb = new ExcelJS.Workbook();
  wb.creator = APP_NAME;
  wb.created = new Date();

  const wsResumen = wb.addWorksheet('RESUMEN');
  wsResumen.mergeCells('A1:F1');
  wsResumen.getCell('A1').value = COMPANY_NAME;
  wsResumen.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF7A2828' } };
  wsResumen.mergeCells('A2:F2');
  wsResumen.getCell('A2').value = 'Reporte de envíos';
  wsResumen.getCell('A2').font = { bold: true, size: 12 };
  wsResumen.getCell('A4').value = 'Fecha de generación';
  wsResumen.getCell('B4').value = new Date();
  wsResumen.getCell('B4').numFmt = 'dd/mm/yyyy hh:mm';

  let filterRow = 5;
  buildFilterLines(filters).forEach((line) => {
    wsResumen.getCell(`A${filterRow}`).value = line;
    filterRow += 1;
  });

  if (reporte) {
    filterRow += 1;
    const kpiStart = filterRow;
    const kpiData = [
      ['Total envíos', reporte.total],
      ['Entregados', reporte.entregados],
      ['Observados', reporte.observados],
      ['% entregados', `${reporte.kpis?.porcentajeEntregados ?? 0}%`],
      ['% observados', `${reporte.kpis?.porcentajeObservados ?? 0}%`],
      ['Tiempo prom. entrega (días)', reporte.kpis?.tiempoPromedioEntregaDias ?? 0],
    ];
    kpiData.forEach(([label, value], i) => {
      const row = wsResumen.getRow(kpiStart + i);
      row.getCell(1).value = label;
      row.getCell(1).font = { bold: true };
      row.getCell(2).value = value;
    });
  }

  try {
    const logo = await loadLogoDataUrl();
    if (logo) {
      const base64 = logo.split(',')[1];
      const imageId = wb.addImage({ base64, extension: 'png' });
      wsResumen.addImage(imageId, { tl: { col: 4.5, row: 0 }, ext: { width: 80, height: 50 } });
    }
  } catch {
    // Logo opcional
  }

  wsResumen.columns = [{ width: 28 }, { width: 22 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }];

  const wsDetalle = wb.addWorksheet('DETALLE DE ENVÍOS');
  wsDetalle.addRow(EXPORT_COLUMNS);
  wsDetalle.getRow(1).eachCell(applyHeaderStyle);
  rows.forEach((row) => wsDetalle.addRow(row));
  wsDetalle.views = [{ state: 'frozen', ySplit: 1 }];
  wsDetalle.autoFilter = { from: 'A1', to: { row: 1, column: EXPORT_COLUMNS.length } };
  wsDetalle.columns = EXPORT_COLUMNS.map(() => ({ width: 18 }));

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
