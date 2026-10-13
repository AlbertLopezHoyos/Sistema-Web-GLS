import { useCallback, useEffect, useState } from 'react';

import { Link, useSearchParams } from 'react-router-dom';

import { RefreshCw } from 'lucide-react';

import { enviosService } from '../../services/enviosService';

import { trazabilidadService } from '../../services/trazabilidadService';

import { ubicacionesService } from '../../services/ubicacionesService';

import { useAuth } from '../../context/AuthContext';

import { PageHeader } from '../../components/common/PageHeader';

import { SearchInput } from '../../components/common/SearchInput';

import { Select } from '../../components/common/Select';

import { Card } from '../../components/common/Card';

import { Badge } from '../../components/common/Badge';

import { Loader } from '../../components/common/Loader';

import { Button } from '../../components/common/Button';

import { FiltersClearButton } from '../../components/common/FiltersClearButton';
import { FiltersPanel } from '../../components/common/FiltersPanel';

import { DataFieldGrid } from '../../components/common/DataFieldGrid';

import { Timeline } from '../../components/forms/Timeline';

import { UpdateStatusModal } from '../../components/forms/UpdateStatusModal';

import { EnvioMap } from '../../components/maps/EnvioMap';

import { ACTIVE_STATUSES } from '../../constants/shipmentStatus';

import { formatDateTime } from '../../utils/formatters';

import { ROUTES } from '../../constants/routes';



export const TrazabilidadPage = () => {

  const { user, canMutate } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  const codigoFromUrl = searchParams.get('envio')?.trim() || '';



  const [activos, setActivos] = useState([]);

  const [selected, setSelected] = useState(null);

  const [historial, setHistorial] = useState([]);

  const [ubicaciones, setUbicaciones] = useState([]);

  const [loading, setLoading] = useState(true);

  const [detailLoading, setDetailLoading] = useState(false);

  const [search, setSearch] = useState('');

  const [estadoFilter, setEstadoFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);



  const loadActivos = useCallback(async () => {

    setLoading(true);

    let data = await enviosService.getEnviosActivos();

    if (search) {

      data = data.filter(

        (e) =>

          e.codigoEnvio.includes(search.toUpperCase())

          || e.remitente?.nombres?.toLowerCase().includes(search.toLowerCase())

      );

    }

    if (estadoFilter && estadoFilter !== 'Todos') {

      data = data.filter((e) => e.estadoActual === estadoFilter);

    }

    setActivos(data);

    setLoading(false);

  }, [search, estadoFilter]);



  const reloadDetalle = useCallback(async (codigo) => {

    if (!codigo) {

      setSelected(null);

      setHistorial([]);

      setUbicaciones([]);

      return;

    }

    setDetailLoading(true);

    try {

      const full = await enviosService.getEnvioById(codigo);

      if (!full) {

        setSelected(null);

        setHistorial([]);

        setUbicaciones([]);

        return;

      }

      setSelected(full);

      const [hist, ub] = await Promise.all([

        trazabilidadService.getHistorialByEnvio(full.codigoEnvio),

        ubicacionesService.getUbicacionesByEnvio(full.codigoEnvio),

      ]);

      setHistorial(hist);

      setUbicaciones(ub);

    } finally {

      setDetailLoading(false);

    }

  }, []);



  useEffect(() => {

    loadActivos();

  }, [loadActivos]);



  useEffect(() => {

    let cancelled = false;

    if (!codigoFromUrl) {

      setSelected(null);

      setHistorial([]);

      setUbicaciones([]);

      return undefined;

    }



    setDetailLoading(true);

    (async () => {

      try {

        const full = await enviosService.getEnvioById(codigoFromUrl);

        if (cancelled) return;

        if (!full) {

          setSelected(null);

          setHistorial([]);

          setUbicaciones([]);

          return;

        }

        setSelected(full);

        const [hist, ub] = await Promise.all([

          trazabilidadService.getHistorialByEnvio(full.codigoEnvio),

          ubicacionesService.getUbicacionesByEnvio(full.codigoEnvio),

        ]);

        if (cancelled) return;

        setHistorial(hist);

        setUbicaciones(ub);

      } finally {

        if (!cancelled) setDetailLoading(false);

      }

    })();



    return () => {

      cancelled = true;

    };

  }, [codigoFromUrl]);



  const selectEnvio = (codigoEnvio) => {

    setSearchParams({ envio: codigoEnvio }, { replace: true });

  };



  const handleStatusUpdate = async (result) => {

    await loadActivos();

    const codigo = result?.envio?.codigoEnvio || codigoFromUrl;

    if (codigo) await reloadDetalle(codigo);

  };



  const clearFilters = () => {

    setSearch('');

    setEstadoFilter('');

  };



  const hasFilters = Boolean(search || (estadoFilter && estadoFilter !== 'Todos'));

  const ultimaUbicacion = ubicaciones.length ? ubicaciones[ubicaciones.length - 1] : null;



  return (

    <div className="page">

      <PageHeader title="Seguimiento y trazabilidad" subtitle="Envíos activos y línea de tiempo" />

      <FiltersPanel
        title="Buscar envíos activos"
        actions={(
          <>
            <Button type="button" onClick={loadActivos}>Buscar</Button>
            <FiltersClearButton visible={hasFilters} onClear={clearFilters} />
            <Button type="button" variant="ghost" icon={RefreshCw} onClick={loadActivos}>Actualizar</Button>
          </>
        )}
      >
        <SearchInput
          label="Envío o cliente"
          value={search}
          onChange={setSearch}
          placeholder="Código o nombre…"
          className="filters-field--search-wide"
        />
        <Select
          id="estado"
          label="Estado"
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
          placeholder="Todos"
          options={['Todos', ...ACTIVE_STATUSES]}
        />
      </FiltersPanel>

      <div className="trazabilidad-layout">

        <Card title="Envíos activos" className="trazabilidad-list">

          {loading ? <Loader /> : activos.length === 0 ? (

            <p className="text-muted">No hay envíos activos con los filtros actuales.</p>

          ) : (

            <ul className="envio-list">

              {activos.map((e) => (

                <li key={e.codigoEnvio}>

                  <button

                    type="button"

                    className={`envio-list-item ${selected?.codigoEnvio === e.codigoEnvio ? 'active' : ''}`}

                    onClick={() => selectEnvio(e.codigoEnvio)}

                  >

                    <strong>{e.codigoEnvio}</strong>

                    <Badge status={e.estadoActual} />

                    <small>{e.origen} → {e.destino}</small>

                  </button>

                </li>

              ))}

            </ul>

          )}

          {codigoFromUrl && !activos.some((e) => e.codigoEnvio === codigoFromUrl) && selected?.codigoEnvio === codigoFromUrl && (

            <p className="text-muted envio-list-extra">Mostrando envío seleccionado (puede no estar activo).</p>

          )}

        </Card>

        <Card

          title={selected ? `Trazabilidad — ${selected.codigoEnvio}` : 'Seleccione un envío'}

          actions={selected && canMutate && (

            <Button onClick={() => setModalOpen(true)}>Actualizar estado</Button>

          )}

        >

          {detailLoading ? (

            <Loader />

          ) : selected ? (

            <>

              <div className="detail-header">

                <Badge status={selected.estadoActual} />

                <span>{selected.origen} → {selected.destino}</span>

                <span>{formatDateTime(selected.fechaUltimaActualizacion)}</span>

              </div>

              <Card title="Datos del envío" className="card-nested">

                <DataFieldGrid

                  fields={[

                    ['Remitente', selected.remitente?.nombres],

                    ['Destinatario', selected.destinatario?.nombres],

                    ['Cliente', selected.clienteAsociado?.nombres || '—'],

                    ['Tipo de carga', selected.tipoCarga],

                    ['Peso', selected.peso != null ? `${selected.peso} kg` : null],

                  ]}

                />

              </Card>

              <Card title="Geolocalización" className="card-nested">

                {ultimaUbicacion ? (

                  <>

                    <DataFieldGrid

                      fields={[

                        ['Dirección', ultimaUbicacion.direccion],

                        ['Coordenadas', `${ultimaUbicacion.latitud}, ${ultimaUbicacion.longitud}`],

                        ['Último registro', formatDateTime(ultimaUbicacion.fechaRegistro)],

                        ['Observación', ultimaUbicacion.observacion],

                      ]}

                    />

                    <div className="geo-side-map trazabilidad-geo-map">

                      <EnvioMap ubicaciones={ubicaciones} height={200} />

                    </div>

                    <Link

                      to={`${ROUTES.GEOLOCALIZACION}?envio=${encodeURIComponent(selected.codigoEnvio)}`}

                      className="btn btn-ghost btn-sm"

                    >

                      Ver módulo de geolocalización

                    </Link>

                  </>

                ) : (

                  <p className="text-muted">Sin puntos de control. Al actualizar el estado se registrará la ubicación.</p>

                )}

              </Card>

              <Card title="Historial de estados" className="card-nested">

                <Timeline eventos={historial} />

              </Card>

              <Link to={`/envios/${selected.codigoEnvio}`} className="btn btn-ghost btn-sm">Ver detalle completo</Link>

            </>

          ) : (

            <p className="text-muted">Seleccione un envío de la lista o desde consulta de envíos.</p>

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


