import { useEffect, useState } from 'react';
import { auditoriaService } from '../../services/auditoriaService';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { DataTable } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { Card } from '../../components/common/Card';
import { DataFieldGrid } from '../../components/common/DataFieldGrid';
import { RecordDetailPanel } from '../../components/common/RecordDetailPanel';
import { MasterDetailLayout } from '../../components/layout/MasterDetailLayout';
import { Loader } from '../../components/common/Loader';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDateTime } from '../../utils/formatters';
import { ROLE_LABELS } from '../../constants/roles';
import { FiltersClearButton } from '../../components/common/FiltersClearButton';
import { FiltersPanel } from '../../components/common/FiltersPanel';

export const AuditoriaPage = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [usuario, setUsuario] = useState('');
  const [modulo, setModulo] = useState('');
  const [accion, setAccion] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [selected, setSelected] = useState(null);
  const debSearch = useDebounce(search);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await auditoriaService.getEventos({
        search: debSearch, usuario, modulo: modulo || undefined, accion: accion || undefined, desde, hasta,
      });
      setEventos(data);
      setLoading(false);
    };
    load();
  }, [debSearch, usuario, modulo, accion, desde, hasta]);

  const { page, totalPages, paginatedItems, goToPage } = usePagination(eventos);

  const hasFilters = Boolean(
    search || usuario || (modulo && modulo !== 'Todos') || (accion && accion !== 'Todos') || desde || hasta
  );
  const clearFilters = () => {
    setSearch('');
    setUsuario('');
    setModulo('');
    setAccion('');
    setDesde('');
    setHasta('');
  };

  return (
    <div className="page">
      <PageHeader title="Auditoría" subtitle="Registro de acciones y eventos del sistema" />
      <FiltersPanel
        title="Buscar en auditoría"
        actions={<FiltersClearButton visible={hasFilters} onClear={clearFilters} />}
      >
        <SearchInput label="Texto" value={search} onChange={setSearch} placeholder="Descripción o detalle…" className="filters-field--search-wide" />
        <Input id="usuario" label="Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        <Select id="modulo" label="Módulo" value={modulo} onChange={(e) => setModulo(e.target.value)} placeholder="Todos los módulos" options={['Todos', ...auditoriaService.getModulos()]} />
        <Select id="accion" label="Acción" value={accion} onChange={(e) => setAccion(e.target.value)} placeholder="Todas las acciones" options={['Todos', ...auditoriaService.getAcciones()]} />
        <Input id="desde" label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        <Input id="hasta" label="Hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
      </FiltersPanel>
      {loading ? (
        <Loader />
      ) : (
        <MasterDetailLayout
          list={
            <>
              <DataTable
                compact
                selectedRowKey={selected?.id}
                getRowKey={(row) => row.id}
                onRowClick={setSelected}
                columns={[
                  { key: 'fecha', label: 'Fecha', render: (r) => formatDateTime(r.fecha) },
                  { key: 'usuario', label: 'Usuario' },
                  { key: 'modulo', label: 'Módulo' },
                  { key: 'accion', label: 'Acción' },
                  {
                    key: 'descripcion',
                    label: 'Descripción',
                    render: (r) => (
                      <span className="cell-ruta" style={{ maxWidth: '12rem' }} title={r.descripcion}>
                        {r.descripcion}
                      </span>
                    ),
                  },
                ]}
                data={paginatedItems}
              />
              <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
            </>
          }
          detail={
            <RecordDetailPanel
              label="Evento de auditoría"
              title={selected ? `${selected.modulo} — ${selected.accion}` : null}
            >
              {selected && (
                <Card title="Registro completo">
                  <DataFieldGrid
                    fields={[
                      ['Fecha / hora', formatDateTime(selected.fecha)],
                      ['Usuario', selected.usuario],
                      ['Rol', ROLE_LABELS[selected.rol] || selected.rol],
                      ['Módulo', selected.modulo],
                      ['Acción', selected.accion],
                      ['Descripción', selected.descripcion],
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
