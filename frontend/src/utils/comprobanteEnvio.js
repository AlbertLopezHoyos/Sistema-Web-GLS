import jsPDF from 'jspdf';
import { COMPANY_NAME } from '../constants/appConfig';
import { formatCurrency, formatDateTime } from './formatters';
import { BRAND, loadLogoDataUrl } from './pdfBrand';

const sectionTitle = (doc, y, text) => {
  doc.setFillColor(...BRAND.secondary);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text(text, 16, y + 5);
  doc.setFont(undefined, 'normal');
  return y + 10;
};

const fieldRow = (doc, y, label, value, x = 16, width = 85) => {
  if (!value) return y;
  doc.setTextColor(80);
  doc.setFontSize(8);
  doc.text(label, x, y);
  doc.setTextColor(30);
  doc.setFontSize(9);
  const lines = doc.splitTextToSize(String(value), width);
  doc.text(lines, x, y + 4);
  return y + 4 + lines.length * 4.5 + 2;
};

const partyBlock = (doc, startY, title, party, x) => {
  let y = startY;
  doc.setTextColor(...BRAND.primary);
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text(title, x, y);
  doc.setFont(undefined, 'normal');
  y += 5;
  y = fieldRow(doc, y, 'Nombres:', party?.nombres, x, 80);
  y = fieldRow(doc, y, 'Documento:', party?.documento, x, 80);
  y = fieldRow(doc, y, 'Teléfono:', party?.telefono, x, 80);
  y = fieldRow(doc, y, 'Dirección:', party?.direccion, x, 80);
  return y;
};

export const downloadComprobanteEnvio = async (envio) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const logo = await loadLogoDataUrl();

  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 0, 210, 32, 'F');
  if (logo) doc.addImage(logo, 'PNG', 14, 6, 18, 18);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text(COMPANY_NAME, 36, 14);
  doc.setFontSize(14);
  doc.text('COMPROBANTE DE ENVÍO', 36, 22);
  doc.setFont(undefined, 'normal');

  doc.setFillColor(...BRAND.accent);
  doc.roundedRect(14, 38, 182, 14, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Código de envío', 18, 44);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(envio.codigoEnvio, 18, 50);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text(`Estado: ${envio.estadoActual}`, 120, 44);
  doc.text(`Registro: ${formatDateTime(envio.fechaRegistro)}`, 120, 50);

  let y = 58;
  y = sectionTitle(doc, y, 'DATOS DEL REMITENTE Y DESTINATARIO');
  const midY = partyBlock(doc, y, 'Remitente', envio.remitente, 16);
  const rightY = partyBlock(doc, y, 'Destinatario', envio.destinatario, 110);
  y = Math.max(midY, rightY) + 2;

  y = sectionTitle(doc, y, 'DATOS DEL ENVÍO');
  y = fieldRow(doc, y, 'Origen:', envio.origen);
  y = fieldRow(doc, y, 'Destino:', envio.destino);
  y = fieldRow(doc, y, 'Tipo de carga:', envio.tipoCarga);
  y = fieldRow(doc, y, 'Descripción:', envio.descripcion);
  y = fieldRow(doc, y, 'Peso:', `${envio.peso} kg`);
  if (envio.dimensiones) {
    y = fieldRow(doc, y, 'Dimensiones:', `${envio.dimensiones.largo} × ${envio.dimensiones.ancho} × ${envio.dimensiones.alto} ${envio.dimensiones.unidadMedida}`);
  }
  y = fieldRow(doc, y, 'Observación:', envio.observacion);

  if (envio.clienteAsociado?.nombres) {
    y = sectionTitle(doc, y + 2, 'CLIENTE ASOCIADO');
    y = fieldRow(doc, y, 'Nombres:', envio.clienteAsociado.nombres);
    y = fieldRow(doc, y, 'Documento:', envio.clienteAsociado.documento);
    y = fieldRow(doc, y, 'Teléfono:', envio.clienteAsociado.telefono);
    y = fieldRow(doc, y, 'Dirección:', envio.clienteAsociado.direccion);
    y = fieldRow(doc, y, 'Empresa:', envio.clienteAsociado.empresa);
  }

  const cot = envio.cotizacionEstimada;
  if (cot?.desglose) {
    y = sectionTitle(doc, y + 2, 'COTIZACIÓN ESTIMADA');
    const d = cot.desglose;
    y = fieldRow(doc, y, 'Moneda:', cot.moneda);
    y = fieldRow(doc, y, 'Volumen:', `${cot.volumenM3} m³`);
    y = fieldRow(doc, y, 'Peso volumétrico:', `${cot.pesoVolumetricoKg} kg`);
    y = fieldRow(doc, y, 'Peso cobrado:', `${cot.pesoCobradoKg} kg`);
    y = fieldRow(doc, y, 'Subtotal:', formatCurrency(d.subtotal, cot.moneda));
    y = fieldRow(doc, y, 'Seguro:', formatCurrency(d.seguroMonto, cot.moneda));
    y = fieldRow(doc, y, 'Total estimado:', formatCurrency(d.totalEstimado, cot.moneda));
    y = fieldRow(doc, y, 'Nota:', cot.nota);
  }

  doc.setDrawColor(...BRAND.primary);
  doc.line(14, 275, 196, 275);
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text('Documento generado por Sistema Web GLS', 105, 282, { align: 'center' });
  doc.text('Constancia de registro — no constituye factura ni comprobante de pago', 105, 287, { align: 'center' });

  doc.save(`comprobante-${envio.codigoEnvio}.pdf`);
};
