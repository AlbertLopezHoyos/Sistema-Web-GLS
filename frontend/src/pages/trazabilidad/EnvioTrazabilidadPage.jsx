import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { enviosService } from '../../services/enviosService';
import { trazabilidadService } from '../../services/trazabilidadService';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { Timeline } from '../../components/forms/Timeline';
import { UpdateStatusModal } from '../../components/forms/UpdateStatusModal';
import { RoleGuard } from '../../components/layout/RoleGuard';
import { formatDateTime } from '../../utils/formatters';
export const EnvioTrazabilidadPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [envio, setEnvio] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    const [e, h] = await Promise.all([
      enviosService.getEnvioById(id),
      trazabilidadService.getHistorialByEnvio(id),
    ]);
    setEnvio(e);
    setHistorial(h);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <Loader />;
  if (!envio) return <div className="page"><p>Envío no encontrado.</p></div>;

  return (
    <div className="page">
      <PageHeader
        title={`Trazabilidad — ${envio.codigoEnvio}`}
        actions={
          <RoleGuard mutate>
            <Button onClick={() => setModalOpen(true)}>Actualizar estado</Button>
          </RoleGuard>
        }
      />
      <div className="detail-header">
        <Badge status={envio.estadoActual} />
        <span>{envio.origen} → {envio.destino}</span>
        <span>Última actualización: {formatDateTime(envio.fechaUltimaActualizacion)}</span>
      </div>
      <Card title="Información del envío">
        <dl className="detail-inline">
          <dt>Remitente</dt><dd>{envio.remitente?.nombres}</dd>
          <dt>Destinatario</dt><dd>{envio.destinatario?.nombres}</dd>
          <dt>Cliente</dt><dd>{envio.clienteAsociado?.nombres || '—'}</dd>
        </dl>
      </Card>
      <Card title="Historial de trazabilidad">
        <Timeline eventos={historial} />
      </Card>
      <Link to={`/envios/${id}`} className="btn btn-ghost">← Volver al detalle</Link>
      <UpdateStatusModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        codigoEnvio={envio.codigoEnvio}
        estadoActual={envio.estadoActual}
        onSuccess={() => load()}
        registradoPor={user?.email}
      />
    </div>
  );
};
