import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Eye } from 'lucide-react';
import { enviosService } from '../../services/enviosService';
import { ubicacionesService } from '../../services/ubicacionesService';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { FiltersPanel } from '../../components/common/FiltersPanel';
import { FiltersClearButton } from '../../components/common/FiltersClearButton';
import { DataTable } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { GeolocalizacionSidePanel } from '../../components/geolocalizacion/GeolocalizacionSidePanel';
import { RegistrarUbicacionModal } from '../../components/geolocalizacion/RegistrarUbicacionModal';
import { MasterDetailLayout } from '../../components/layout/MasterDetailLayout';
import { usePagination } from '../../hooks/usePagination';

export const GeolocalizacionPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const envioFromUrl = searchParams.get('envio')?.trim() || '';

  const [envios, setEnvios] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCodigo, setSelectedCodigo] = useState(null);
  const [selectedEnvio, setSelectedEnvio] = useState(null);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    enviosService.getEnvios({}).then((data) => {
      setEnvios(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (envioFromUrl && envioFromUrl !== selectedCodigo) {
      setSelectedCodigo(envioFromUrl);
    }
  }, [envioFromUrl, selectedCodigo]);

  const filtered = useMemo(
    () =>
      envios.filter(
        (e) =>
          !search
          || e.codigoEnvio.includes(search.toUpperCase())
          || e.origen?.toLowerCase().includes(search.toLowerCase())
          || e.destino?.toLowerCase().includes(search.toLowerCase())
      ),
    [envios, search]
  );

  const { page, totalPages, paginatedItems, goToPage, resetPage } = usePagination(filtered);

  useEffect(() => {
    resetPage();
  }, [search, resetPage]);

  const loadDetail = useCallback(async (codigo) => {
    if (!codigo) {
      setSelectedEnvio(null);
      setUbicaciones([]);
      return;
    }
    setDetailLoading(true);
    try {
      const [e, u] = await Promise.all([
        enviosService.getEnvioById(codigo),
        ubicacionesService.getUbicacionesByEnvio(codigo),
      ]);
      setSelectedEnvio(e);
      setUbicaciones(u);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDetail(selectedCodigo);
  }, [selectedCodigo, loadDetail]);

  const selectEnvio = (row) => {
    const codigo = row.codigoEnvio;
    setSelectedCodigo(codigo);
    setSearchParams(codigo ? { envio: codigo } : {}, { replace: true });
  };

  const refreshDetail = () => {
    if (selectedCodigo) loadDetail(selectedCodigo);
  };

  return (
    <div className="page">
      <PageHeader
        title="Geolocalización"
        subtitle="Puntos de control registrados por envío (no seguimiento GPS en tiempo real)"
      />
      <p className="geo-notice">
        La geolocalización implementada corresponde a puntos de control registrados y no representa seguimiento GPS en tiempo real.
      </p>
      <FiltersPanel
        title="Buscar envío"
        actions={<FiltersClearButton visible={Boolean(search.trim())} onClear={() => setSearch('')} />}
      >
        <SearchInput
          label="Código de envío"
          value={search}
          onChange={setSearch}
          placeholder="ENV-2026-0001"
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
                selectedRowKey={selectedCodigo}
                getRowKey={(row) => row.codigoEnvio}
                onRowClick={selectEnvio}
                columns={[
                  { key: 'codigoEnvio', label: 'Código' },
                  { key: 'estadoActual', label: 'Estado', render: (r) => <Badge status={r.estadoActual} /> },
                  { key: 'origen', label: 'Origen' },
                  { key: 'destino', label: 'Destino' },
                ]}
                data={paginatedItems}
                actions={(row) => (
                  <div className="table-actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => selectEnvio(row)} title="Ver detalle">
                      <Eye size={16} />
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => selectEnvio(row)} title="Ver mapa">
                      <MapPin size={16} />
                    </button>
                  </div>
                )}
              />
              <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
            </>
          }
          detail={
            <GeolocalizacionSidePanel
              codigo={selectedCodigo}
              envio={selectedEnvio}
              ubicaciones={ubicaciones}
              loading={detailLoading}
              onRegisterClick={() => setModalOpen(true)}
            />
          }
        />
      )}
      <RegistrarUbicacionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        codigoEnvio={selectedCodigo}
        onSuccess={refreshDetail}
      />
    </div>
  );
};
