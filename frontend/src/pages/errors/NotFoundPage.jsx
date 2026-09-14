import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { Button } from '../../components/common/Button';

export const NotFoundPage = () => (
  <div className="not-found-page">
    <h1>404</h1>
    <p>Página no encontrada</p>
    <p className="text-muted">La ruta solicitada no existe en el sistema.</p>
    <Link to={ROUTES.DASHBOARD}>
      <Button icon={Home}>Ir al Dashboard</Button>
    </Link>
  </div>
);
