import { Link } from 'react-router-dom';
import { FileDown, Printer, Route } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { ROUTES } from '../../constants/routes';
import { formatDateTime } from '../../utils/formatters';
import { downloadComprobanteEnvio } from '../../utils/comprobanteEnvio';
import { useState } from 'react';

export const EnvioConsultaResultCard = ({
  envio,
  ultimoEvento,
  ultimaUbicacion,
  onVerDetalleHistorial,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  if (!envio) return null;

  const trazabilidadUrl = `${ROUTES.TRAZABILIDAD}?envio=${encodeURIComponent(envio.codigoEnvio)}`;

  const handleComprobante = async () => {
    setDownloading(true);
    setDownloadError('');
    try {
      await downloadComprobanteEnvio(envio);
    } catch (err) {
      setDownloadError(err?.message || 'No se pudo generar el comprobante PDF.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="envio-consulta-result-card">
      <header className="envio-consulta-result-head">
        <div>
          <h2 className="envio-consulta-result-title">Envío {envio.codigoEnvio}</h2>
          <Badge status={envio.estadoActual} />
        </div>
      </header>

      {downloadError && (
        <Alert type="error" message={downloadError} onClose={() => setDownloadError('')} />
      )}

      <div className="envio-consulta-result-grid">
        <div className="envio-consulta-result-block">
          <span className="envio-consulta-result-label">Último evento</span>
          <div className="envio-consulta-result-event">
            <Badge status={ultimoEvento?.estado || envio.estadoActual} />
            <span className="text-muted envio-consulta-result-ts">
              {ultimoEvento?.fechaActualizacion || envio.fechaUltimaActualizacion || envio.fechaRegistro}
            </span>
          </div>
        </div>
        <div className="envio-consulta-result-block">
          <span className="envio-consulta-result-label">Última ubicación</span>
          <p className="envio-consulta-result-value">
            {ultimaUbicacion?.direccion || 'Sin ubicación registrada.'}
          </p>
        </div>
      </div>

      <dl className="envio-consulta-result-rows">
        <div className="envio-consulta-result-row">
          <dt>Ruta</dt>
          <dd>{envio.origen} → {envio.destino}</dd>
        </div>
        <div className="envio-consulta-result-row">
          <dt>Remitente</dt>
          <dd>{envio.remitente?.nombres || '—'}</dd>
        </div>
        <div className="envio-consulta-result-row">
          <dt>Destinatario</dt>
          <dd>{envio.destinatario?.nombres || '—'}</dd>
        </div>
        <div className="envio-consulta-result-row">
          <dt>Cliente catálogo</dt>
          <dd>{envio.clienteAsociado?.nombres || 'Sin asociación'}</dd>
        </div>
        <div className="envio-consulta-result-row">
          <dt>Registro</dt>
          <dd>{formatDateTime(envio.fechaRegistro)}</dd>
        </div>
      </dl>

      <div className="envio-consulta-result-actions">
        <Button variant="secondary" icon={Printer} loading={downloading} onClick={handleComprobante}>
          Imprimir comprobante
        </Button>
        <Button variant="secondary" icon={FileDown} loading={downloading} onClick={handleComprobante}>
          Exportar PDF
        </Button>
        <Button variant="primary" onClick={onVerDetalleHistorial}>
          Ver detalle e historial
        </Button>
        <Link to={trazabilidadUrl} className="btn btn-ghost">
          <Route size={16} /> Abrir trazabilidad
        </Link>
      </div>
    </div>
  );
};
