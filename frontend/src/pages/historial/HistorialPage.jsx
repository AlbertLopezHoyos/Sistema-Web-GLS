import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { Eye, MapPin, Package, Route } from 'lucide-react';

import { trazabilidadService } from '../../services/trazabilidadService';

import { PageHeader } from '../../components/common/PageHeader';

import { SearchInput } from '../../components/common/SearchInput';

import { Select } from '../../components/common/Select';

import { Input } from '../../components/common/Input';

import { DataTable } from '../../components/common/DataTable';

import { Pagination } from '../../components/common/Pagination';

import { Badge } from '../../components/common/Badge';

import { MasterDetailLayout } from '../../components/layout/MasterDetailLayout';

import { HistorialConsultaPanel } from '../../components/historial/HistorialConsultaPanel';

import { Loader } from '../../components/common/Loader';

import { usePagination } from '../../hooks/usePagination';

import { useDebounce } from '../../hooks/useDebounce';

import { formatDateTime } from '../../utils/formatters';

import { SHIPMENT_STATUSES } from '../../constants/shipmentStatus';

import { FiltersClearButton } from '../../components/common/FiltersClearButton';
import { FiltersPanel } from '../../components/common/FiltersPanel';

import { ROUTES } from '../../constants/routes';



export const HistorialPage = () => {

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [estado, setEstado] = useState('');

  const [desde, setDesde] = useState('');

  const [hasta, setHasta] = useState('');

  const [selected, setSelected] = useState(null);

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



  const hasFilters = Boolean(search || (estado && estado !== 'Todos') || desde || hasta);

  const clearFilters = () => {

    setSearch('');

    setEstado('');

    setDesde('');

    setHasta('');

  };



  return (

    <div className="page historial-consulta-page">

      <PageHeader title="Historial general" subtitle="Registro completo de eventos de trazabilidad" />

      <FiltersPanel
        title="Buscar en historial"
        actions={<FiltersClearButton visible={hasFilters} onClear={clearFilters} />}
      >
        <SearchInput
          label="Texto"
          value={search}
          onChange={setSearch}
          placeholder="Código, cliente, observación…"
          className="filters-field--search-wide"
        />
        <Select id="estado" label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Todos los estados" options={['Todos', ...SHIPMENT_STATUSES]} />
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

                  { key: 'codigoEnvio', label: 'Código' },

                  { key: 'estado', label: 'Estado', render: (r) => <Badge status={r.estado} /> },

                  { key: 'cliente', label: 'Cliente' },

                  {

                    key: 'ruta',

                    label: 'Ruta',

                    render: (r) => (

                      <span className="cell-ruta" title={`${r.origen} → ${r.destino}`}>

                        {r.origen} → {r.destino}

                      </span>

                    ),

                  },

                  { key: 'fechaActualizacion', label: 'Fecha', render: (r) => formatDateTime(r.fechaActualizacion) },

                ]}

                data={paginatedItems}

                actions={(row) => (

                  <div className="table-actions">

                    <button type="button" className="btn btn-ghost btn-sm" title="Ver detalle" onClick={() => setSelected(row)}>

                      <Eye size={16} />

                    </button>

                    <Link

                      to={`${ROUTES.TRAZABILIDAD}?envio=${encodeURIComponent(row.codigoEnvio)}`}

                      className="btn btn-ghost btn-sm"

                      title="Trazabilidad"

                    >

                      <Route size={16} />

                    </Link>

                    <Link

                      to={`${ROUTES.GEOLOCALIZACION}?envio=${encodeURIComponent(row.codigoEnvio)}`}

                      className="btn btn-ghost btn-sm"

                      title="Ubicación"

                    >

                      <MapPin size={16} />

                    </Link>

                    <Link

                      to={`/envios/${encodeURIComponent(row.codigoEnvio)}`}

                      className="btn btn-ghost btn-sm"

                      title="Envío"

                    >

                      <Package size={16} />

                    </Link>

                  </div>

                )}

              />

              <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />

            </>

          }

          detail={<HistorialConsultaPanel evento={selected} />}

        />

      )}

    </div>

  );

};


