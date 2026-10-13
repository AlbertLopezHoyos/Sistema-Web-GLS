import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit } from 'lucide-react';
import { clientesService } from '../../services/clientesService';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { FiltersPanel } from '../../components/common/FiltersPanel';
import { FiltersClearButton } from '../../components/common/FiltersClearButton';
import { DataTable } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { DataFieldGrid } from '../../components/common/DataFieldGrid';
import { RecordDetailPanel } from '../../components/common/RecordDetailPanel';
import { MasterDetailLayout } from '../../components/layout/MasterDetailLayout';
import { RoleGuard } from '../../components/layout/RoleGuard';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

export const ClientesPage = () => {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
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

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    clientesService.getClienteById(selectedId).then((c) => {
      if (!cancelled) {
        setSelected(c);
        setDetailLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [selectedId]);

  const selectCliente = (row) => setSelectedId(row.id);
  const hasFilters = Boolean(search.trim());

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
      <FiltersPanel
        title="Buscar clientes"
        actions={<FiltersClearButton visible={hasFilters} onClear={() => setSearch('')} />}
      >
        <SearchInput
          label="Cliente"
          value={search}
          onChange={setSearch}
          placeholder="Nombre, documento o empresa…"
          className="filters-field--search-wide"
        />
      </FiltersPanel>
      {loading ? (
        <Loader />
      ) : (
        <MasterDetailLayout
          list={
            <>
              <DataTable
                compact
                selectedRowKey={selectedId}
                getRowKey={(row) => row.id}
                onRowClick={selectCliente}
                columns={[
                  { key: 'documento', label: 'Documento' },
                  { key: 'nombres', label: 'Nombres' },
                  { key: 'telefono', label: 'Teléfono' },
                  { key: 'empresa', label: 'Empresa', render: (r) => r.empresa || '—' },
                  { key: 'fechaAlta', label: 'Alta', render: (r) => formatDate(r.fechaAlta) },
                ]}
                data={paginatedItems}
                actions={(row) => (
                  <div className="table-actions">
                    <button type="button" className="btn btn-ghost btn-sm" title="Ver detalle" onClick={() => selectCliente(row)}>
                      <Eye size={16} />
                    </button>
                    <RoleGuard mutate>
                      <Link to={`/clientes/${row.id}?edit=1`} className="btn btn-ghost btn-sm" title="Editar"><Edit size={16} /></Link>
                    </RoleGuard>
                  </div>
                )}
              />
              <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
            </>
          }
          detail={
            <RecordDetailPanel
              label="Cliente"
              title={selected ? selected.nombres : null}
              loading={detailLoading}
              actions={
                selected && (
                  <Link to={`/clientes/${selected.id}`} className="btn btn-secondary btn-sm">Abrir ficha</Link>
                )
              }
            >
              {selected && (
                <Card title="Datos del cliente">
                  <DataFieldGrid
                    fields={[
                      ['Documento', selected.documento],
                      ['Nombres', selected.nombres],
                      ['Teléfono', selected.telefono],
                      ['Dirección', selected.direccion],
                      ['Empresa', selected.empresa],
                      ['Fecha alta', formatDate(selected.fechaAlta)],
                      ['Última actualización', formatDate(selected.fechaActualizacion)],
                    ]}
                  />
                </Card>
              )}
            </RecordDetailPanel>
          }
        />
      )}
    </div>
  );
};
