import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, CheckCircle, Clock, AlertTriangle, Plus, Search, Route } from 'lucide-react';
import { enviosService } from '../../services/enviosService';
import { trazabilidadService } from '../../services/trazabilidadService';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { DataTable } from '../../components/common/DataTable';
import { StatusChart } from '../../components/charts/StatusChart';
import { TrendChart } from '../../components/charts/TrendChart';
import { formatDateTime } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';

export const DashboardPage = () => {
  const { canMutate } = useAuth();
  const [stats, setStats] = useState(null);
  const [actividad, setActividad] = useState([]);
  const [porMes, setPorMes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, hist, all] = await Promise.all([
        enviosService.getDashboardStats(),
        trazabilidadService.getHistorialGeneral({}),
        enviosService.getEnvios({}),
      ]);
      setStats(s);
      setActividad(hist.slice(0, 8));
      const meses = {};
      all.forEach((e) => {
        const mes = e.fechaRegistro.slice(0, 7);
        meses[mes] = (meses[mes] || 0) + 1;
      });
      setPorMes(meses);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Loader message="Cargando dashboard..." />;

  return (
    <div className="page dashboard-page">
      <PageHeader title="Dashboard" subtitle="Resumen operativo del sistema" />
      <div className="stats-grid">
        <StatCard title="Total envíos" value={stats.total} icon={Package} color="blue" />
        <StatCard title="Entregados" value={stats.entregados} icon={CheckCircle} color="green" />
        <StatCard title="Pendientes / En tránsito" value={stats.pendientes} icon={Clock} color="orange" />
        <StatCard title="Observados" value={stats.observados} icon={AlertTriangle} color="red" />
      </div>

      <div className="dashboard-grid">
        <Card title="Distribución por estado">
          <StatusChart porEstado={stats.porEstado} />
        </Card>
        <Card title="Evolución reciente">
          <TrendChart porMes={porMes} />
        </Card>
      </div>

      <div className="dashboard-grid">
        <Card
          title="Últimos envíos"
          actions={
            <Link to={ROUTES.ENVIOS} className="btn btn-ghost btn-sm">Ver todos</Link>
          }
        >
          <DataTable
            columns={[
              { key: 'codigoEnvio', label: 'Código' },
              { key: 'origen', label: 'Origen' },
              { key: 'destino', label: 'Destino' },
              { key: 'estadoActual', label: 'Estado', render: (r) => <Badge status={r.estadoActual} /> },
              { key: 'fechaRegistro', label: 'Fecha', render: (r) => formatDateTime(r.fechaRegistro) },
            ]}
            data={stats.ultimos}
          />
        </Card>
        <Card title="Actividad reciente">
          <div className="activity-list">
            {actividad.map((a) => (
              <div key={a.id} className="activity-item">
                <Badge status={a.estado} />
                <div>
                  <strong>{a.codigoEnvio}</strong>
                  <p>{a.observacion}</p>
                  <small>{formatDateTime(a.fechaActualizacion)}</small>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {canMutate && (
        <Card title="Accesos rápidos">
          <div className="quick-actions">
            <Link to={ROUTES.ENVIO_NUEVO} className="quick-action"><Plus size={20} /> Registrar envío</Link>
            <Link to={ROUTES.ENVIOS} className="quick-action"><Search size={20} /> Consultar envíos</Link>
            <Link to={ROUTES.TRAZABILIDAD} className="quick-action"><Route size={20} /> Seguimiento</Link>
          </div>
        </Card>
      )}
    </div>
  );
};
