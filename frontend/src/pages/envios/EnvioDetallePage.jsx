import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Route, MapPin } from 'lucide-react';
import { enviosService } from '../../services/enviosService';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

const PartyBlock = ({ party }) => (
  <dl>
    <dt>Nombres</dt><dd>{party.nombres}</dd>
    <dt>Documento</dt><dd>{party.documento}</dd>
    <dt>Teléfono</dt><dd>{party.telefono}</dd>
    <dt>Dirección</dt><dd>{party.direccion}</dd>
  </dl>
);

export const EnvioDetallePage = () => {
  const { id } = useParams();
  const [envio, setEnvio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enviosService.getEnvioById(id).then((e) => { setEnvio(e); setLoading(false); });
  }, [id]);

  if (loading) return <Loader />;
  if (!envio) return <div className="page"><p>Envío no encontrado.</p></div>;

  return (
    <div className="page">
      <PageHeader
        title={`Envío ${envio.codigoEnvio}`}
        actions={
          <>
            <Link to={`/envios/${id}/trazabilidad`}><Button variant="secondary" icon={Route}>Trazabilidad</Button></Link>
            <Link to={`/geolocalizacion/${id}`}><Button variant="secondary" icon={MapPin}>Ubicación</Button></Link>
          </>
        }
      />
      <div className="detail-header">
        <Badge status={envio.estadoActual} />
        <span>Registrado: {formatDateTime(envio.fechaRegistro)}</span>
        <span>Última actualización: {formatDateTime(envio.fechaUltimaActualizacion)}</span>
      </div>
      <div className="detail-grid">
        <Card title="Remitente"><PartyBlock party={envio.remitente} /></Card>
        <Card title="Destinatario"><PartyBlock party={envio.destinatario} /></Card>
        <Card title="Datos del envío">
          <dl>
            <dt>Origen</dt><dd>{envio.origen}</dd>
            <dt>Destino</dt><dd>{envio.destino}</dd>
            <dt>Tipo de carga</dt><dd>{envio.tipoCarga}</dd>
            <dt>Descripción</dt><dd>{envio.descripcion}</dd>
            <dt>Peso</dt><dd>{envio.peso} kg</dd>
            <dt>Dimensiones</dt><dd>{envio.dimensiones.largo} × {envio.dimensiones.ancho} × {envio.dimensiones.alto} {envio.dimensiones.unidadMedida}</dd>
            <dt>Observación</dt><dd>{envio.observacion}</dd>
          </dl>
        </Card>
        {envio.clienteAsociado && (
          <Card title="Cliente asociado">
            <dl>
              <dt>Nombres</dt><dd>{envio.clienteAsociado.nombres}</dd>
              <dt>Documento</dt><dd>{envio.clienteAsociado.documento}</dd>
            </dl>
          </Card>
        )}
        {envio.cotizacionEstimada && (
          <Card title="Cotización estimada">
            <p>Total: {formatCurrency(envio.cotizacionEstimada.desglose.totalEstimado, envio.cotizacionEstimada.moneda)}</p>
            <p className="text-muted">{envio.cotizacionEstimada.nota}</p>
          </Card>
        )}
        {envio.evidenciaEntrega && (
          <Card title="Evidencia de entrega">
            <dl>
              <dt>Referencia</dt><dd>{envio.evidenciaEntrega.referencia}</dd>
              <dt>Receptor</dt><dd>{envio.evidenciaEntrega.receptorNombre} ({envio.evidenciaEntrega.receptorDocumento})</dd>
              <dt>Fecha</dt><dd>{formatDateTime(envio.evidenciaEntrega.fecha)}</dd>
            </dl>
          </Card>
        )}
      </div>
      <Link to={ROUTES.ENVIOS} className="btn btn-ghost">← Volver a consulta</Link>
    </div>
  );
};
