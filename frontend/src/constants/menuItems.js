import {
  LayoutDashboard,
  Users,
  Package,
  PackagePlus,
  Search,
  History,
  Route,
  MapPin,
  BarChart3,
} from 'lucide-react';
import { ROUTES } from './routes';
import { ROLES } from './roles';

export const MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: ROUTES.DASHBOARD,
    roles: [ROLES.ADMIN, ROLES.OPERACIONES, ROLES.CONSULTA],
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: Users,
    to: ROUTES.CLIENTES,
    roles: [ROLES.ADMIN, ROLES.OPERACIONES, ROLES.CONSULTA],
  },
  {
    id: 'envios',
    label: 'Envíos',
    icon: Package,
    roles: [ROLES.ADMIN, ROLES.OPERACIONES, ROLES.CONSULTA],
    children: [
      { id: 'envio-nuevo', label: 'Registrar envío', icon: PackagePlus, to: ROUTES.ENVIO_NUEVO, roles: [ROLES.ADMIN, ROLES.OPERACIONES] },
      { id: 'envio-consulta', label: 'Consultar envíos', icon: Search, to: ROUTES.ENVIOS, roles: [ROLES.ADMIN, ROLES.OPERACIONES, ROLES.CONSULTA] },
      { id: 'historial', label: 'Historial general', icon: History, to: ROUTES.HISTORIAL, roles: [ROLES.ADMIN, ROLES.OPERACIONES, ROLES.CONSULTA] },
    ],
  },
  {
    id: 'trazabilidad',
    label: 'Seguimiento y trazabilidad',
    icon: Route,
    to: ROUTES.TRAZABILIDAD,
    roles: [ROLES.ADMIN, ROLES.OPERACIONES, ROLES.CONSULTA],
  },
  {
    id: 'geo',
    label: 'Geolocalización',
    icon: MapPin,
    to: ROUTES.GEOLOCALIZACION,
    roles: [ROLES.ADMIN, ROLES.OPERACIONES, ROLES.CONSULTA],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: BarChart3,
    to: ROUTES.REPORTES,
    roles: [ROLES.ADMIN, ROLES.OPERACIONES, ROLES.CONSULTA],
  },
];
