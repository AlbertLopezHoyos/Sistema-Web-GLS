import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit } from 'lucide-react';
import { clientesService } from '../../services/clientesService';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { DataTable } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { RoleGuard } from '../../components/layout/RoleGuard';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

export const ClientesPage = () => {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search);
  const { page, totalPages, paginatedItems, goToPage, resetPage } = usePagination(clientes);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await clientesService.searchClientes(debouncedSearch);
      setClientes(data);
      resetPage();
      setLoading(false);
    };
    load();
  }, [debouncedSearch]);

  return (
    <div className="page">
      <PageHeader
        title="Gestión de clientes"
        subtitle="Catálogo de clientes registrados"
        actions={
          <RoleGuard mutate>
            <Link to={ROUTES.CLIENTE_NUEVO}>
              <Button icon={Plus}>Nuevo cliente</Button>
            </Link>
          </RoleGuard>
        }
      />
      <div className="filters-bar">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, documento o empresa..." />
      </div>
      {loading ? <Loader /> : (
        <>
          <DataTable
            columns={[
              { key: 'documento', label: 'Documento' },
              { key: 'nombres', label: 'Razón social / Nombres' },
              { key: 'telefono', label: 'Teléfono' },
              { key: 'empresa', label: 'Empresa', render: (r) => r.empresa || '—' },
              { key: 'fechaAlta', label: 'Fecha alta', render: (r) => formatDate(r.fechaAlta) },
            ]}
            data={paginatedItems}
            actions={(row) => (
              <div className="table-actions">
                <Link to={`/clientes/${row.id}`} className="btn btn-ghost btn-sm" title="Ver detalle"><Eye size={16} /></Link>
                <RoleGuard mutate>
                  <Link to={`/clientes/${row.id}?edit=1`} className="btn btn-ghost btn-sm" title="Editar"><Edit size={16} /></Link>
                </RoleGuard>
              </div>
            )}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </>
      )}
    </div>
  );
};
