import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileUp } from 'lucide-react';
import { enviosService } from '../../services/enviosService';
import { trazabilidadService } from '../../services/trazabilidadService';
import { ubicacionesService } from '../../services/ubicacionesService';
import { PageHeader } from '../../components/common/PageHeader';
import { Input } from '../../components/common/Input';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { Alert } from '../../components/common/Alert';
import { FiltersPanel } from '../../components/common/FiltersPanel';
import { EnvioConsultaResultCard } from '../../components/envios/EnvioConsultaResultCard';
import { EnvioDetalleHistorialModal } from '../../components/envios/EnvioDetalleHistorialModal';
import { EnvioMapaModal } from '../../components/envios/EnvioMapaModal';
import { formatDateTime } from '../../utils/formatters';
import { extractCodigoFromPdfFile, normalizeEnvioCodigo } from '../../utils/envioCodigo';
import { ROUTES } from '../../constants/routes';

const RECENT_LIMIT = 13;

async function loadEnvioConsulta(codigo) {
  const normalized = normalizeEnvioCodigo(codigo);
  const envio = await enviosService.getEnvioById(normalized);
  if (!envio) return null;

  const [historial, ultimaUbicacion, ubicaciones] = await Promise.all([
    trazabilidadService.getHistorialByEnvio(normalized),
    ubicacionesService.getUltimaUbicacion(normalized).catch(() => null),
    ubicacionesService.getUbicacionesByEnvio(normalized).catch(() => []),
  ]);

  const ultimoEvento = historial.length ? historial[historial.length - 1] : null;

  return { envio, historial, ultimoEvento, ultimaUbicacion, ubicaciones };
}

export const EnviosPage = () => {
  const [codigoInput, setCodigoInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [foundMessage, setFoundMessage] = useState('');

  const [envio, setEnvio] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [ultimoEvento, setUltimoEvento] = useState(null);
  const [ultimaUbicacion, setUltimaUbicacion] = useState(null);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [selectedCodigo, setSelectedCodigo] = useState(null);

  const [recentEnvios, setRecentEnvios] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  const fileInputRef = useRef(null);

  const applyConsultaResult = useCallback((result) => {
    if (!result) return;
    setEnvio(result.envio);
    setHistorial(result.historial);
    setUltimoEvento(result.ultimoEvento);
    setUltimaUbicacion(result.ultimaUbicacion);
    setUbicaciones(result.ubicaciones);
    setSelectedCodigo(result.envio.codigoEnvio);
    setCodigoInput(result.envio.codigoEnvio);
    setFoundMessage(`Envío ${result.envio.codigoEnvio} encontrado.`);
    setSearchError('');
  }, []);

  const loadRecent = useCallback(async () => {
    setRecentLoading(true);
    try {
      const data = await enviosService.getEnvios({});
      const sorted = [...data].sort(
        (a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro)
      );
      setRecentEnvios(sorted.slice(0, RECENT_LIMIT));
    } finally {
      setRecentLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  const runSearch = async (codigoRaw) => {
    const codigo = normalizeEnvioCodigo(codigoRaw);
    if (!codigo || !/^ENV-\d{4}-\d{3,}$/.test(codigo)) {
      setSearchError('Ingrese un código de envío válido (ej. ENV-2026-0001).');
      setFoundMessage('');
      return;
    }

    setSearching(true);
    setSearchError('');
    setFoundMessage('');
    try {
      const result = await loadEnvioConsulta(codigo);
      if (!result) {
        setEnvio(null);
        setHistorial([]);
        setUltimoEvento(null);
        setUltimaUbicacion(null);
        setUbicaciones([]);
        setSelectedCodigo(null);
        setSearchError(`No se encontró el envío ${codigo}.`);
        return;
      }
      applyConsultaResult(result);
    } catch {
      setSearchError('No se pudo completar la consulta. Intente de nuevo.');
    } finally {
      setSearching(false);
    }
  };

  const handleBuscar = (e) => {
    e?.preventDefault?.();
    runSearch(codigoInput);
  };

  const handleClear = () => {
    setCodigoInput('');
    setSearchError('');
    setFoundMessage('');
    setEnvio(null);
    setHistorial([]);
    setUltimoEvento(null);
    setUltimaUbicacion(null);
    setUbicaciones([]);
    setSelectedCodigo(null);
  };

  const handleRowClick = (row) => {
    runSearch(row.codigoEnvio);
  };

  const handlePdfPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setSearching(true);
    setSearchError('');
    setFoundMessage('');
    try {
      const extracted = await extractCodigoFromPdfFile(file);
      if (!extracted) {
        setSearchError('No se detectó un código ENV- en el PDF. Use el comprobante exportado desde el sistema.');
        return;
      }
      setCodigoInput(extracted);
      await runSearch(extracted);
    } catch {
      setSearchError('No se pudo leer el comprobante PDF.');
    } finally {
      setSearching(false);
    }
  };

  const openMapaModal = () => {
    if (!envio) {
      setSearchError('Busque un envío antes de ver el mapa.');
      return;
    }
    setMapModalOpen(true);
  };

  return (
    <div className="page envios-consulta-page envios-consulta-page--v2">
      <PageHeader
        title="Consulta de envío"
        subtitle="Por código de envío o comprobante PDF exportado desde el sistema."
      />

      <section className="envio-consulta-intro">
        <h2 className="envio-consulta-intro-title">Consulta por código</h2>
        <p className="text-muted envio-consulta-intro-text">
          Ingrese el código del envío o cargue el PDF del comprobante y pulse Buscar.
        </p>
      </section>

      {foundMessage && <Alert type="success" message={foundMessage} onClose={() => setFoundMessage('')} />}
      {searchError && <Alert type="error" message={searchError} onClose={() => setSearchError('')} />}

      <FiltersPanel
        title="Buscar envío"
        onSubmit={handleBuscar}
        actions={(
          <>
            <Button type="submit" loading={searching}>
              Buscar
            </Button>
            <Button type="button" variant="ghost" onClick={handleClear} disabled={searching}>
              Limpiar
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="envio-consulta-file-input"
              onChange={handlePdfPick}
            />
            <Button
              type="button"
              variant="ghost"
              icon={FileUp}
              title="Cargar comprobante PDF"
              onClick={() => fileInputRef.current?.click()}
              disabled={searching}
            />
          </>
        )}
        footer={
          envio ? (
            <div className="filters-panel-footer">
              <button type="button" className="btn btn-link envio-consulta-mapa-link" onClick={openMapaModal}>
                Ver mapa de ubicaciones
              </button>
            </div>
          ) : null
        }
      >
        <Input
          id="consulta-codigo"
          label="Código de envío"
          placeholder="ENV-2026-0001"
          value={codigoInput}
          onChange={(e) => setCodigoInput(e.target.value)}
          className="filters-field--search-wide"
        />
      </FiltersPanel>

      {searching && !envio && <Loader />}

      {envio && !searching && (
        <EnvioConsultaResultCard
          envio={envio}
          ultimoEvento={ultimoEvento}
          ultimaUbicacion={ultimaUbicacion}
          onVerDetalleHistorial={() => setDetailModalOpen(true)}
        />
      )}

      <section className="envio-consulta-recent">
        <div className="envio-consulta-recent-head">
          <p className="envio-consulta-recent-kicker">Otros registros</p>
          <h3 className="envio-consulta-recent-title">
            Registros recientes ({recentEnvios.length}) — pulse una fila
          </h3>
        </div>
        {recentLoading ? (
          <Loader />
        ) : (
          <div className="envios-consulta-list envio-consulta-recent-table">
            <DataTable
              compact
              selectedRowKey={selectedCodigo}
              getRowKey={(row) => row.codigoEnvio}
              onRowClick={handleRowClick}
              columns={[
                { key: 'codigoEnvio', label: 'Código' },
                { key: 'estadoActual', label: 'Estado', render: (r) => <Badge status={r.estadoActual} /> },
                {
                  key: 'ruta',
                  label: 'Ruta',
                  render: (r) => (
                    <span className="cell-ruta" title={`${r.origen} → ${r.destino}`}>
                      {r.origen} → {r.destino}
                    </span>
                  ),
                },
                {
                  key: 'fechaRegistro',
                  label: 'Registro',
                  render: (r) => formatDateTime(r.fechaRegistro),
                },
                {
                  key: 'partes',
                  label: 'Remitente / Destinatario',
                  render: (r) => (
                    <span className="cell-partes">
                      <span>Rem: {r.remitente?.nombres || '—'}</span>
                      <span>Dest: {r.destinatario?.nombres || '—'}</span>
                    </span>
                  ),
                },
              ]}
              data={recentEnvios}
            />
          </div>
        )}
      </section>

      <EnvioDetalleHistorialModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        envio={envio}
        historial={historial}
        loading={false}
      />

      <EnvioMapaModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        envio={envio}
        ubicaciones={ubicaciones}
        loading={false}
      />

      <p className="envio-consulta-footnote text-muted">
        ¿Necesita actualizar estados?{' '}
        <Link to={ROUTES.TRAZABILIDAD}>Abrir seguimiento y trazabilidad</Link>
      </p>
    </div>
  );
};
