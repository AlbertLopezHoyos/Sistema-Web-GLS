import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { enviosService } from '../../services/enviosService';
import { trazabilidadService } from '../../services/trazabilidadService';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { Select } from '../../components/common/Select';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { Timeline } from '../../components/forms/Timeline';
import { UpdateStatusModal } from '../../components/forms/UpdateStatusModal';
import { ACTIVE_STATUSES } from '../../constants/shipmentStatus';
import { formatDateTime } from '../../utils/formatters';

export const TrazabilidadPage = () => {
  const { user, canMutate } = useAuth();
  const [activos, setActivos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const loadActivos = async () => {
    setLoading(true);
    let data = await enviosService.getEnviosActivos();
    if (search) data = data.filter((e) => e.codigoEnvio.includes(search.toUpperCase()) || e.remitente?.nombres?.toLowerCase().includes(search.toLowerCase()));
    if (estadoFilter && estadoFilter !== 'Todos') data = data.filter((e) => e.estadoActual === estadoFilter);
    setActivos(data);
    setLoading(false);
  };

  useEffect(() => { loadActivos(); }, [search, estadoFilter]);

  const selectEnvio = async (envio) => {
    setSelected(envio);
    const hist = await trazabilidadService.getHistorialByEnvio(envio.codigoEnvio);
    setHistorial(hist);
  };

  const handleStatusUpdate = async (result) => {
    setSelected(result.envio);
    const hist = await trazabilidadService.getHistorialByEnvio(result.envio.codigoEnvio);
    setHistorial(hist);
    loadActivos();
  };

  return (
    <div className="page">
      <PageHeader title="Seguimiento y trazabilidad" subtitle="Envíos activos y línea de tiempo" />
      <div className="filters-bar">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por código o cliente..." />
        <Select id="estado" value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)} placeholder="Todos" options={['Todos', ...ACTIVE_STATUSES]} />
        <Button variant="ghost" icon={RefreshCw} onClick={loadActivos}>Actualizar</Button>
      </div>
      <div className="trazabilidad-layout">
        <Card title="Envíos activos" className="trazabilidad-list">
          {loading ? <Loader /> : activos.length === 0 ? (
            <p className="text-muted">No hay envíos activos.</p>
          ) : (
            <ul className="envio-list">
              {activos.map((e) => (
                <li key={e.codigoEnvio}>
                  <button type="button" className={`envio-list-item ${selected?.codigoEnvio === e.codigoEnvio ? 'active' : ''}`} onClick={() => selectEnvio(e)}>
                    <strong>{e.codigoEnvio}</strong>
                    <Badge status={e.estadoActual} />
                    <small>{e.origen} → {e.destino}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card
          title={selected ? `Trazabilidad — ${selected.codigoEnvio}` : 'Seleccione un envío'}
          actions={selected && canMutate && (
            <Button onClick={() => setModalOpen(true)}>Actualizar estado</Button>
          )}
        >
          {selected ? (
            <>
              <div className="detail-header">
                <Badge status={selected.estadoActual} />
                <span>{selected.remitente?.nombres} → {selected.destinatario?.nombres}</span>
                <span>{formatDateTime(selected.fechaUltimaActualizacion)}</span>
              </div>
              <Timeline eventos={historial} />
              <Link to={`/envios/${selected.codigoEnvio}`} className="btn btn-ghost btn-sm">Ver detalle completo</Link>
            </>
          ) : (
            <p className="text-muted">Seleccione un envío de la lista para ver su trazabilidad.</p>
          )}
        </Card>
      </div>
      {selected && (
        <UpdateStatusModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          codigoEnvio={selected.codigoEnvio}
          estadoActual={selected.estadoActual}
          onSuccess={handleStatusUpdate}
          registradoPor={user?.email}
        />
      )}
    </div>
  );
};
