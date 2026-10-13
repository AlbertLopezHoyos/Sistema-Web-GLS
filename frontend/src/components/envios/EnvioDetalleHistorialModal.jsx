import { Modal } from '../common/Modal';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Loader } from '../common/Loader';
import { EnvioHistorialTimeline } from './EnvioHistorialTimeline';

export const EnvioDetalleHistorialModal = ({ isOpen, onClose, envio, historial, loading }) => {
  const codigo = envio?.codigoEnvio || '—';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle del envío · ${codigo}`}
      size="xl"
    >
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="envio-detalle-modal-grid">
            <Card title="Estado actual" className="envio-detalle-modal-card">
              <Badge status={envio?.estadoActual} />
            </Card>
            <Card title="Ruta" className="envio-detalle-modal-card">
              <p className="envio-detalle-modal-text">
                {envio?.origen} → {envio?.destino}
              </p>
            </Card>
            <Card title="Partes" className="envio-detalle-modal-card">
              <p className="envio-detalle-modal-text">
                <strong>Remitente:</strong> {envio?.remitente?.nombres || '—'}
                {envio?.remitente?.documento ? ` · ${envio.remitente.documento}` : ''}
              </p>
              <p className="envio-detalle-modal-text">
                <strong>Destinatario:</strong> {envio?.destinatario?.nombres || '—'}
                {envio?.destinatario?.documento ? ` · ${envio.destinatario.documento}` : ''}
              </p>
            </Card>
            <Card title="Cliente catálogo" className="envio-detalle-modal-card">
              <p className="envio-detalle-modal-text">
                {envio?.clienteAsociado?.nombres
                  ? `${envio.clienteAsociado.nombres}${envio.clienteAsociado.documento ? ` · ${envio.clienteAsociado.documento}` : ''}`
                  : 'Sin asociación a catálogo.'}
              </p>
            </Card>
          </div>
          <section className="envio-detalle-modal-historial">
            <h4 className="envio-detalle-modal-historial-title">Historial de estados</h4>
            <EnvioHistorialTimeline eventos={historial} />
          </section>
        </>
      )}
    </Modal>
  );
};
