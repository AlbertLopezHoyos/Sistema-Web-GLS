import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';

import { formatCurrency, formatDateTime } from './formatters';

import { APP_NAME } from '../constants/appConfig';

import {

  BRAND,

  loadLogoDataUrl,

  drawPdfHeader,

  drawPdfFooterLine,

} from './pdfBrand';



const labelValueRows = (pairs) =>

  pairs.filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '');



export const downloadComprobanteEnvio = async (envio) => {

  if (!envio?.codigoEnvio) {

    throw new Error('Datos del envío incompletos para generar el comprobante.');

  }



  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();

  const logo = await loadLogoDataUrl();



  let y = drawPdfHeader(doc, logo, {

    docTitle: 'COMPROBANTE DE ENVÍO',

    tagline: 'Área de Operaciones · Gestión de información logística',

    codeRight: envio.codigoEnvio,

  });



  doc.setFillColor(...BRAND.paper);

  doc.setDrawColor(...BRAND.line);

  doc.roundedRect(14, y - 2, pageW - 28, 11, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');

  doc.setFontSize(10);

  doc.setTextColor(...BRAND.primary);

  doc.text(`Estado: ${envio.estadoActual || '—'}`, 18, y + 5);

  doc.setFont('helvetica', 'normal');

  doc.setTextColor(100, 116, 139);

  doc.text(`Registro: ${formatDateTime(envio.fechaRegistro)}`, pageW - 18, y + 5, { align: 'right' });

  y += 16;



  const section = (title) => {

    doc.setFont('helvetica', 'bold');

    doc.setFontSize(11);

    doc.setTextColor(...BRAND.primary);

    doc.text(title, 14, y);

    y += 5;

  };



  const table = (body) => {

    autoTable(doc, {

      startY: y,

      margin: { left: 14, right: 14 },

      theme: 'grid',

      styles: {

        fontSize: 10,

        cellPadding: 3,

        textColor: [0, 0, 0],

        lineColor: BRAND.line,

        lineWidth: 0.1,

      },

      columnStyles: {

        0: { cellWidth: 48, fontStyle: 'bold', textColor: [100, 116, 139] },

      },

      body,

    });

    y = doc.lastAutoTable.finalY + 8;

  };



  section('Remitente');

  table(labelValueRows([

    ['Nombres', envio.remitente?.nombres],

    ['Documento', envio.remitente?.documento],

    ['Teléfono', envio.remitente?.telefono],

    ['Dirección', envio.remitente?.direccion],

  ]));



  section('Destinatario');

  table(labelValueRows([

    ['Nombres', envio.destinatario?.nombres],

    ['Documento', envio.destinatario?.documento],

    ['Teléfono', envio.destinatario?.telefono],

    ['Dirección', envio.destinatario?.direccion],

  ]));



  section('Datos del envío');

  const envRows = labelValueRows([

    ['Origen', envio.origen],

    ['Destino', envio.destino],

    ['Tipo de carga', envio.tipoCarga],

    ['Peso', envio.peso != null ? `${envio.peso} kg` : null],

    ['Descripción', envio.descripcion],

    [

      'Dimensiones',

      envio.dimensiones

        ? `${envio.dimensiones.largo} × ${envio.dimensiones.ancho} × ${envio.dimensiones.alto} ${envio.dimensiones.unidadMedida}`

        : null,

    ],

    ['Observación', envio.observacion],

  ]);

  autoTable(doc, {

    startY: y,

    margin: { left: 14, right: 14 },

    head: [['Concepto', 'Detalle']],

    headStyles: {

      fillColor: BRAND.primary,

      textColor: [255, 255, 255],

      fontStyle: 'bold',

      halign: 'center',

    },

    styles: { fontSize: 10, cellPadding: 3, textColor: [0, 0, 0], lineColor: BRAND.line },

    columnStyles: { 0: { cellWidth: 52, fontStyle: 'bold', textColor: [100, 116, 139] } },

    body: envRows,

  });

  y = doc.lastAutoTable.finalY + 8;



  if (envio.clienteAsociado?.nombres) {

    section('Cliente asociado');

    table(labelValueRows([

      ['Nombres', envio.clienteAsociado.nombres],

      ['Documento', envio.clienteAsociado.documento],

      ['Empresa', envio.clienteAsociado.empresa],

      ['Teléfono', envio.clienteAsociado.telefono],

      ['Dirección', envio.clienteAsociado.direccion],

    ]));

  }



  const cot = envio.cotizacionEstimada;

  const d = cot?.desglose;

  if (d) {

    section('Cotización estimada');

    autoTable(doc, {

      startY: y,

      margin: { left: 14, right: 14 },

      head: [['Concepto', 'Valor']],

      headStyles: { fillColor: BRAND.primary, textColor: [255, 255, 255], fontStyle: 'bold' },

      styles: { fontSize: 10, cellPadding: 3, textColor: [0, 0, 0] },

      body: labelValueRows([

        ['Moneda', cot.moneda],

        ['Volumen', cot.volumenM3 != null ? `${cot.volumenM3} m³` : null],

        ['Peso cobrado', cot.pesoCobradoKg != null ? `${cot.pesoCobradoKg} kg` : null],

        ['Subtotal', formatCurrency(d.subtotal ?? 0, cot.moneda)],

        ['Seguro', formatCurrency(d.seguroMonto ?? 0, cot.moneda)],

        ['Total estimado', formatCurrency(d.totalEstimado ?? 0, cot.moneda)],

        ['Nota', cot.nota],

      ]),

    });

    y = doc.lastAutoTable.finalY + 6;



    if (d.totalEstimado != null && y < 260) {

      const boxW = 88;

      const boxX = pageW - 14 - boxW;

      doc.setFillColor(...BRAND.accent);

      doc.roundedRect(boxX, y, boxW, 20, 3, 3, 'F');

      doc.setTextColor(255, 255, 255);

      doc.setFontSize(9);

      doc.text('TOTAL ESTIMADO', boxX + boxW / 2, y + 7, { align: 'center' });

      doc.setFont('helvetica', 'bold');

      doc.setFontSize(14);

      doc.text(formatCurrency(d.totalEstimado, cot.moneda), boxX + boxW / 2, y + 15, { align: 'center' });

    }

  }



  drawPdfFooterLine(

    doc,

    `${APP_NAME} · Constancia de registro — no constituye factura ni comprobante de pago`

  );



  doc.save(`Comprobante-${envio.codigoEnvio}.pdf`);

};


