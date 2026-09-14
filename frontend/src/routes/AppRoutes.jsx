import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ClientesPage } from '../pages/clientes/ClientesPage';
import { ClienteFormPage } from '../pages/clientes/ClienteFormPage';
import { EnviosPage } from '../pages/envios/EnviosPage';
import { EnvioFormPage } from '../pages/envios/EnvioFormPage';
import { EnvioDetallePage } from '../pages/envios/EnvioDetallePage';
import { TrazabilidadPage } from '../pages/trazabilidad/TrazabilidadPage';
import { EnvioTrazabilidadPage } from '../pages/trazabilidad/EnvioTrazabilidadPage';
import { HistorialPage } from '../pages/historial/HistorialPage';
import { GeolocalizacionPage } from '../pages/geolocalizacion/GeolocalizacionPage';
import { GeolocalizacionDetallePage } from '../pages/geolocalizacion/GeolocalizacionDetallePage';
import { ReportesPage } from '../pages/reportes/ReportesPage';
import { UsuariosPage } from '../pages/usuarios/UsuariosPage';
import { AuditoriaPage } from '../pages/auditoria/AuditoriaPage';
import { RespaldoPage } from '../pages/respaldo/RespaldoPage';
import { PerfilPage } from '../pages/perfil/PerfilPage';
import { NotFoundPage } from '../pages/errors/NotFoundPage';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';

export const AppRoutes = () => (
  <Routes>
    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
    <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
      <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
      <Route path={ROUTES.CLIENTES} element={<ClientesPage />} />
      <Route path={ROUTES.CLIENTE_NUEVO} element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.OPERACIONES]}><ClienteFormPage /></ProtectedRoute>} />
      <Route path={ROUTES.CLIENTE_DETALLE} element={<ClienteFormPage />} />
      <Route path={ROUTES.ENVIOS} element={<EnviosPage />} />
      <Route path={ROUTES.ENVIO_NUEVO} element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.OPERACIONES]}><EnvioFormPage /></ProtectedRoute>} />
      <Route path={ROUTES.ENVIO_DETALLE} element={<EnvioDetallePage />} />
      <Route path={ROUTES.ENVIO_TRAZABILIDAD} element={<EnvioTrazabilidadPage />} />
      <Route path={ROUTES.HISTORIAL} element={<HistorialPage />} />
      <Route path={ROUTES.TRAZABILIDAD} element={<TrazabilidadPage />} />
      <Route path={ROUTES.GEOLOCALIZACION} element={<GeolocalizacionPage />} />
      <Route path={ROUTES.GEOLOCALIZACION_DETALLE} element={<GeolocalizacionDetallePage />} />
      <Route path={ROUTES.REPORTES} element={<ReportesPage />} />
      <Route path={ROUTES.USUARIOS} element={<ProtectedRoute roles={[ROLES.ADMIN]}><UsuariosPage /></ProtectedRoute>} />
      <Route path={ROUTES.AUDITORIA} element={<ProtectedRoute roles={[ROLES.ADMIN]}><AuditoriaPage /></ProtectedRoute>} />
      <Route path={ROUTES.RESPALDO} element={<ProtectedRoute roles={[ROLES.ADMIN]}><RespaldoPage /></ProtectedRoute>} />
      <Route path={ROUTES.PERFIL} element={<PerfilPage />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
