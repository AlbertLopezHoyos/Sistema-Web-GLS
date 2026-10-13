import { Link } from 'react-router-dom';

import { Download, ExternalLink, Route, MapPin } from 'lucide-react';

import { ROUTES } from '../../constants/routes';

import { Badge } from '../common/Badge';

import { Button } from '../common/Button';

import { Loader } from '../common/Loader';

import { downloadComprobanteEnvio } from '../../utils/comprobanteEnvio';

import { EnvioDetailBody } from './EnvioDetailBody';
import { Alert } from '../common/Alert';
import { useState } from 'react';

export const EnvioConsultaPanel = ({ envio, loading, codigo }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');



  if (!codigo) {

    return (

      <aside className="envio-consulta-panel envio-consulta-panel--empty">

        <p>Seleccione un envío de la lista para ver su detalle.</p>

      </aside>

    );

  }



  if (loading) {

    return (

      <aside className="envio-consulta-panel">

        <Loader />

      </aside>

    );

  }



  if (!envio) {

    return (

      <aside className="envio-consulta-panel envio-consulta-panel--empty">

        <p>No se pudo cargar el envío <strong>{codigo}</strong>.</p>

      </aside>

    );

  }



  const trazabilidadUrl = `${ROUTES.TRAZABILIDAD}?envio=${encodeURIComponent(envio.codigoEnvio)}`;

  const geoUrl = `${ROUTES.GEOLOCALIZACION}?envio=${encodeURIComponent(envio.codigoEnvio)}`;



  return (

    <aside className="envio-consulta-panel">

      <header className="envio-consulta-panel-head">

        <div>

          <p className="envio-consulta-panel-label">Detalle del envío</p>

          <h2 className="envio-consulta-panel-code">{envio.codigoEnvio}</h2>

          <div className="envio-consulta-panel-meta">

            <Badge status={envio.estadoActual} />

            <span>{envio.origen} → {envio.destino}</span>

          </div>

        </div>

        <div className="envio-consulta-panel-actions">
          <Button
            variant="secondary"
            icon={Download}
            loading={downloading}
            onClick={async () => {
              setDownloading(true);
              setDownloadError('');
              try {
                await downloadComprobanteEnvio(envio);
              } catch (err) {
                setDownloadError(err?.message || 'No se pudo generar el comprobante PDF.');
              } finally {
                setDownloading(false);
              }
            }}
          >
            Comprobante
          </Button>

          <Link to={trazabilidadUrl} className="btn btn-ghost btn-sm" title="Trazabilidad">

            <Route size={16} />

          </Link>

          <Link to={geoUrl} className="btn btn-ghost btn-sm" title="Ubicación">

            <MapPin size={16} />

          </Link>

        </div>

      </header>

      {downloadError && (
        <Alert type="error" message={downloadError} onClose={() => setDownloadError('')} />
      )}

      <EnvioDetailBody
        envio={envio}
        footer={(
          <Link to={`/envios/${envio.codigoEnvio}`} className="envio-consulta-full-link envio-consulta-panel-span-full">
            <ExternalLink size={16} aria-hidden />
            Abrir vista completa →
          </Link>
        )}
      />

    </aside>

  );

};


