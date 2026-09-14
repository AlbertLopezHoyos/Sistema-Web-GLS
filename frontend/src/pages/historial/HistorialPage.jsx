import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Route } from 'lucide-react';
import { trazabilidadService } from '../../services/trazabilidadService';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { DataTable } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDateTime } from '../../utils/formatters';
import { SHIPMENT_STATUSES } from '../../constants/shipmentStatus';

export const HistorialPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const debSearch = useDebounce(search);
  const { page, totalPages, paginatedItems, goToPage, resetPage } = usePagination(items);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await trazabilidadService.getHistorialGeneral({
        search: debSearch,
        estado: estado || undefined,
        desde: desde || undefined,
        hasta: hasta || undefined,
      });
      setItems(data);
      resetPage();
      setLoading(false);
    };
    load();
  }, [debSearch, estado, desde, hasta]);

  return (
    <div className="page">
      <PageHeader title="Historial general" subtitle="Registro completo de eventos de trazabilidad" />
      <div className="filters-bar">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar..." />
        <Select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Todos los estados" options={['Todos', ...SHIPMENT_STATUSES]} />
        <Input id="desde" label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        <Input id="hasta" label="Hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
      </div>
      {loading ? <Loader /> : (
        <>
          <DataTable
            columns={[
              { key: 'codigoEnvio', label: 'Código' },
              { key: 'estado', label: 'Estado', render: (r) => <Badge status={r.estado} /> },
              { key: 'cliente', label: 'Cliente' },
              { key: 'origen', label: 'Origen' },
              { key: 'destino', label: 'Destino' },
              { key: 'fechaActualizacion', label: 'Fecha', render: (r) => formatDateTime(r.fechaActualizacion) },
            ]}
            data={paginatedItems}
            actions={(row) => (
              <div className="table-actions">
                <Link to={`/envios/${row.codigoEnvio}`} className="btn btn-ghost btn-sm" title="Detalle"><Eye size={16} /></Link>
                <Link to={`/envios/${row.codigoEnvio}/trazabilidad`} className="btn btn-ghost btn-sm" title="Trazabilidad"><Route size={16} /></Link>
              </div>
            )}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </>
      )}
    </div>
  );
};
