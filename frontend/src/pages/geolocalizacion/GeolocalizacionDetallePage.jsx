import { Navigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

/** Rutas antiguas /geolocalizacion/:id → listado con panel lateral */
export const GeolocalizacionDetallePage = () => {
  const { id } = useParams();
  return <Navigate to={`${ROUTES.GEOLOCALIZACION}?envio=${encodeURIComponent(id)}`} replace />;
};
