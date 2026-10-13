import { Navigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

/** Redirige al módulo de trazabilidad con el envío preseleccionado */
export const EnvioTrazabilidadPage = () => {
  const { id } = useParams();
  return <Navigate to={`${ROUTES.TRAZABILIDAD}?envio=${encodeURIComponent(id)}`} replace />;
};
