import { useEffect, useState } from 'react';
import { auditoriaService } from '../../services/auditoriaService';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { DataTable } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { Loader } from '../../components/common/Loader';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDateTime } from '../../utils/formatters';
import { ROLE_LABELS } from '../../constants/roles';

export const AuditoriaPage = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [usuario, setUsuario] = useState('');
  const [modulo, setModulo] = useState('');
  const [accion, setAccion] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
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

  return (
    <div className="page">
      <PageHeader title="Auditoría" subtitle="Registro de eventos del sistema (simulación frontend)" />
      <div className="filters-bar">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar..." />
        <Input id="usuario" label="Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        <Select id="modulo" value={modulo} onChange={(e) => setModulo(e.target.value)} placeholder="Todos los módulos" options={['Todos', ...auditoriaService.getModulos()]} />
        <Select id="accion" value={accion} onChange={(e) => setAccion(e.target.value)} placeholder="Todas las acciones" options={['Todos', ...auditoriaService.getAcciones()]} />
        <Input id="desde" label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        <Input id="hasta" label="Hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
      </div>
      {loading ? <Loader /> : (
        <>
          <DataTable
            columns={[
              { key: 'fecha', label: 'Fecha/Hora', render: (r) => formatDateTime(r.fecha) },
              { key: 'usuario', label: 'Usuario' },
              { key: 'rol', label: 'Rol', render: (r) => ROLE_LABELS[r.rol] || r.rol },
              { key: 'modulo', label: 'Módulo' },
              { key: 'accion', label: 'Acción' },
              { key: 'descripcion', label: 'Descripción' },
            ]}
            data={paginatedItems}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </>
      )}
    </div>
  );
};
