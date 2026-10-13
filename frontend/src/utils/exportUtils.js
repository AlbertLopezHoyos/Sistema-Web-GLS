import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';

import ExcelJS from 'exceljs';

import { APP_NAME } from '../constants/appConfig';

import { formatDateTime } from './formatters';

import {

  BRAND,

  addPdfFooter,

  drawReportPlainHeader,

  PDF_INK,

} from './pdfBrand';

import { renderReportCharts, CHART_EXPORT_ASPECT } from './chartExport';

import {

  EXCEL,

  excelThinBorder,

  buildFiltersLine,

  REPORT_DOC,

} from './documentExportStyles';



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

  envio.peso ?? '',

];



export const exportCSV = (rows, filename = 'reporte-envios.csv') => {

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



const drawChartsSectionPdf = (doc, y, statusImg, trendImg) => {

  const pageW = doc.internal.pageSize.getWidth();

  const margin = 12;

  const gap = 10;

  const slotW = (pageW - margin * 2 - gap) / 2;

  const chartH = Math.min(78, slotW / CHART_EXPORT_ASPECT);

  const chartW = chartH * CHART_EXPORT_ASPECT;

  let nextY = y;



  doc.setFontSize(10);

  doc.setFont('helvetica', 'bold');

  doc.setTextColor(...PDF_INK);

  doc.text('Gráficos analíticos', margin, nextY);

  nextY += 6;



  if (!statusImg && !trendImg) return nextY;



  const drawFramed = (img, slotX) => {

    if (!img) return;

    const frameW = slotW;

    const imgX = slotX + (frameW - chartW) / 2;

    doc.setDrawColor(...BRAND.line);

    doc.setLineWidth(0.25);

    doc.roundedRect(slotX, nextY, frameW, chartH + 4, 2, 2, 'S');

    doc.addImage(img, 'PNG', imgX, nextY + 2, chartW, chartH);

  };



  drawFramed(statusImg, margin);

  drawFramed(trendImg, margin + slotW + gap);

  return nextY + chartH + 10;

};



const applyTableHeaderStyle = (cell) => {

  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL.brandArgb } };

  cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: EXCEL.font };

  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  cell.border = excelThinBorder;

};



export const exportPDF = async (rows, options = {}) => {

  const { reporte, filters = {}, filename = 'reporte-envios.pdf' } = options;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const generatedAt = formatDateTime(new Date().toISOString());

  const filtersLine = buildFiltersLine(filters);



  let y = drawReportPlainHeader(doc, {

    generatedAt,

    totalRecords: rows.length,

    filtersLine,

  });



  if (reporte) {

    const { statusImg, trendImg } = await renderReportCharts(reporte);

    y = drawChartsSectionPdf(doc, y, statusImg, trendImg);

    if (y > doc.internal.pageSize.getHeight() - 48) {

      doc.addPage();

      y = 16;

    }

  }



  autoTable(doc, {

    startY: y,

    head: [EXPORT_COLUMNS],

    body: rows,

    theme: 'grid',

    styles: {

      fontSize: 7.5,

      cellPadding: 2.5,

      lineColor: BRAND.line,

      lineWidth: 0.1,

      textColor: PDF_INK,

      font: 'helvetica',

      overflow: 'linebreak',

    },

    headStyles: {

      fillColor: BRAND.primary,

      textColor: [255, 255, 255],

      fontStyle: 'bold',

      halign: 'center',

      fontSize: 8,

    },

    alternateRowStyles: { fillColor: [248, 250, 252] },

    margin: { left: 12, right: 12, bottom: 14 },

    didDrawPage: () => {

      const pageCount = doc.internal.getNumberOfPages();

      addPdfFooter(doc, doc.internal.getCurrentPageInfo().pageNumber, pageCount);

    },

  });



  doc.save(filename);

};



export const exportExcel = async (rows, options = {}) => {

  const { reporte, filters = {}, filename = 'reporte-envios.xlsx' } = options;

  const wb = new ExcelJS.Workbook();

  wb.creator = APP_NAME;

  wb.created = new Date();



  const colCount = EXPORT_COLUMNS.length;

  const ws = wb.addWorksheet('Reporte', {

    properties: { defaultRowHeight: 18 },

    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },

  });



  const mergeTitle = (row, value, font) => {

    ws.mergeCells(row, 1, row, colCount);

    const cell = ws.getCell(row, 1);

    cell.value = value;

    cell.font = font;

    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

  };



  mergeTitle(1, REPORT_DOC.company, { bold: true, size: 14, color: { argb: EXCEL.brandArgb }, name: EXCEL.font });

  mergeTitle(2, REPORT_DOC.title, { bold: true, size: 12, color: { argb: EXCEL.accentArgb }, name: EXCEL.font });

  mergeTitle(3, REPORT_DOC.subtitle, { size: 10, color: { argb: EXCEL.mutedArgb }, name: EXCEL.font });



  const generatedAt = formatDateTime(new Date().toISOString());

  mergeTitle(

    4,

    `Generado: ${generatedAt}  ·  Total: ${rows.length} registro(s)`,

    { italic: true, size: 10, color: { argb: EXCEL.mutedArgb }, name: EXCEL.font }

  );

  mergeTitle(5, buildFiltersLine(filters), { size: 10, color: { argb: EXCEL.mutedArgb }, name: EXCEL.font });



  const headerRowNum = 7;

  const headerRow = ws.getRow(headerRowNum);

  EXPORT_COLUMNS.forEach((label, i) => {

    const cell = headerRow.getCell(i + 1);

    cell.value = label;

    applyTableHeaderStyle(cell);

  });

  headerRow.height = 22;



  rows.forEach((row, idx) => {

    const dataRow = ws.getRow(headerRowNum + 1 + idx);

    row.forEach((val, i) => {

      const cell = dataRow.getCell(i + 1);

      cell.value = val ?? '';

      cell.font = { size: 10, name: EXCEL.font, color: { argb: EXCEL.inkArgb } };

      cell.alignment = { vertical: 'middle', wrapText: true, horizontal: 'left' };

      cell.border = excelThinBorder;

      if (idx % 2 === 1) {

        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL.stripeArgb } };

      }

    });

  });



  ws.autoFilter = {

    from: { row: headerRowNum, column: 1 },

    to: { row: headerRowNum + rows.length, column: colCount },

  };

  ws.views = [{ state: 'frozen', ySplit: headerRowNum, activeCell: `A${headerRowNum + 1}` }];



  const widths = [18, 16, 18, 18, 20, 22, 14, 22, 14, 22, 14, 14, 10];

  widths.forEach((w, i) => {

    ws.getColumn(i + 1).width = w;

  });



  if (reporte) {

    const { statusImg, trendImg } = await renderReportCharts(reporte);

    if (statusImg || trendImg) {

      const wsG = wb.addWorksheet('Gráficos');

      wsG.mergeCells(1, 1, 1, 6);

      wsG.getCell(1, 1).value = 'Gráficos analíticos';

      wsG.getCell(1, 1).font = { bold: true, size: 14, color: { argb: EXCEL.brandArgb }, name: EXCEL.font };

      let row = 2;

      if (statusImg) {

        const id = wb.addImage({ base64: statusImg.split(',')[1], extension: 'png' });

        wsG.addImage(id, { tl: { col: 0, row }, ext: { width: 520, height: 320 } });

        row += 18;

      }

      if (trendImg) {

        const id = wb.addImage({ base64: trendImg.split(',')[1], extension: 'png' });

        wsG.addImage(id, { tl: { col: 0, row }, ext: { width: 520, height: 320 } });

      }

    }

  }



  const buffer = await wb.xlsx.writeBuffer();

  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = url;

  link.download = filename;

  link.click();

  URL.revokeObjectURL(url);

};


