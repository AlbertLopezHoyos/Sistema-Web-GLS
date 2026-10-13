import { Link } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Loader } from '../common/Loader';
import { EnvioMap } from '../maps/EnvioMap';
import { ROUTES } from '../../constants/routes';

export const EnvioMapaModal = ({ isOpen, onClose, envio, ubicaciones, loading }) => {
  const codigo = envio?.codigoEnvio;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={codigo ? `Ubicaciones · ${codigo}` : 'Mapa del envío'}
      size="lg"
    >
      {loading ? (
        <Loader />
      ) : !envio ? (
        <p className="text-muted">Busque un envío para ver sus ubicaciones en el mapa.</p>
      ) : (
        <div className="envio-mapa-modal">
          {ubicaciones?.length ? (
            <EnvioMap ubicaciones={ubicaciones} height={320} />
          ) : (
            <p className="text-muted envio-mapa-modal-empty">Sin puntos de ubicación registrados para este envío.</p>
          )}
          <p className="envio-mapa-modal-foot text-muted">
            <Link to={`${ROUTES.GEOLOCALIZACION}?envio=${encodeURIComponent(codigo)}`} onClick={onClose}>
              Abrir módulo de geolocalización
            </Link>
          </p>
        </div>
      )}
    </Modal>
  );
};
