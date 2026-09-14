import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Route, MapPin } from 'lucide-react';
import { enviosService } from '../../services/enviosService';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { Select } from '../../components/common/Select';
import { DataTable } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDateTime } from '../../utils/formatters';
import { SHIPMENT_STATUSES } from '../../constants/shipmentStatus';
export const EnviosPage = () => {
  const [envios, setEnvios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [codigo, setCodigo] = useState('');
  const [cliente, setCliente] = useState('');
  const [estado, setEstado] = useState('');
  const debCodigo = useDebounce(codigo);
  const debCliente = useDebounce(cliente);
  const { page, totalPages, paginatedItems, goToPage, resetPage } = usePagination(envios);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await enviosService.getEnvios({
        codigo: debCodigo,
        cliente: debCliente,
        estado: estado || undefined,
      });
      setEnvios(data);
      resetPage();
      setLoading(false);
    };
    load();
  }, [debCodigo, debCliente, estado]);

  return (
    <div className="page">
      <PageHeader title="Consulta de envíos" subtitle="Búsqueda y listado de envíos registrados" />
      <div className="filters-bar">
        <SearchInput value={codigo} onChange={setCodigo} placeholder="Buscar por código..." />
        <SearchInput value={cliente} onChange={setCliente} placeholder="Buscar por cliente..." />
        <Select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Todos los estados" options={['Todos', ...SHIPMENT_STATUSES]} />
      </div>
      {loading ? <Loader /> : (
        <>
          <DataTable
            columns={[
              { key: 'codigoEnvio', label: 'Código' },
              { key: 'cliente', label: 'Cliente', render: (r) => r.clienteAsociado?.nombres || r.remitente?.nombres || '—' },
              { key: 'origen', label: 'Origen' },
              { key: 'destino', label: 'Destino' },
              { key: 'fechaRegistro', label: 'Fecha', render: (r) => formatDateTime(r.fechaRegistro) },
              { key: 'estadoActual', label: 'Estado', render: (r) => <Badge status={r.estadoActual} /> },
            ]}
            data={paginatedItems}
            actions={(row) => (
              <div className="table-actions">
                <Link to={`/envios/${row.codigoEnvio}`} className="btn btn-ghost btn-sm" title="Detalle"><Eye size={16} /></Link>
                <Link to={`/envios/${row.codigoEnvio}/trazabilidad`} className="btn btn-ghost btn-sm" title="Trazabilidad"><Route size={16} /></Link>
                <Link to={`/geolocalizacion/${row.codigoEnvio}`} className="btn btn-ghost btn-sm" title="Ubicación"><MapPin size={16} /></Link>
              </div>
            )}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </>
      )}
    </div>
  );
};
