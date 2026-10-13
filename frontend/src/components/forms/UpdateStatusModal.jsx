import { useEffect, useState } from 'react';
import { Navigation, Search } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Alert } from '../common/Alert';
import { MapPicker } from '../maps/MapPicker';
import { SHIPMENT_STATUSES, STATUS_COLORS } from '../../constants/shipmentStatus';
import { STATUS_ICONS } from '../../constants/statusIcons';
import { trazabilidadService } from '../../services/trazabilidadService';
import { DEFAULT_MAP_CENTER } from '../../constants/appConfig';
import { reverseGeocode, searchAddress } from '../../utils/geocoding';

const emptyForm = (estadoActual) => ({
  estado: estadoActual || '',
  observacion: '',
  evidenciaReferencia: '',
  evidenciaDetalle: '',
  receptorNombre: '',
  receptorDocumento: '',
  direccion: '',
  latitud: String(DEFAULT_MAP_CENTER.lat),
  longitud: String(DEFAULT_MAP_CENTER.lng),
  ubicacionObservacion: '',
});

export const UpdateStatusModal = ({ isOpen, onClose, codigoEnvio, estadoActual, onSuccess }) => {
  const [form, setForm] = useState(emptyForm(estadoActual));
  const [addressQuery, setAddressQuery] = useState('');
  const [registrarUbicacion, setRegistrarUbicacion] = useState(true);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [geoMsg, setGeoMsg] = useState('');
  const [geoBusy, setGeoBusy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm(estadoActual));
      setAddressQuery('');
      setRegistrarUbicacion(true);
      setErrors({});
      setGeneralError('');
      setGeoMsg('');
    }
  }, [isOpen, estadoActual]);

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: '' }));
    setGeneralError('');
  };

  const applyCoords = async (lat, lng, keepAddress = false) => {
    setForm((p) => ({
      ...p,
      latitud: String(Number(lat).toFixed(6)),
      longitud: String(Number(lng).toFixed(6)),
    }));
    if (keepAddress) return;
    try {
      const label = await reverseGeocode(lat, lng);
      if (label) setForm((p) => ({ ...p, direccion: label.slice(0, 500) }));
    } catch {
      /* dirección manual */
    }
  };

  const handleLocateAddress = async () => {
    const q = (addressQuery || form.direccion).trim();
    if (!q) {
      setGeoMsg('Escriba una dirección para buscar.');
      return;
    }
    setGeoMsg('');
    setGeoBusy(true);
    try {
      const hit = await searchAddress(q);
      await applyCoords(hit.lat, hit.lng, true);
      setForm((p) => ({ ...p, direccion: hit.label.slice(0, 500) }));
      setAddressQuery(hit.label.slice(0, 500));
      setGeoMsg('Dirección ubicada en el mapa.');
    } catch (err) {
      setGeoMsg(err.message || 'No se pudo ubicar la dirección.');
    } finally {
      setGeoBusy(false);
    }
  };

  const handleUseGps = () => {
    setGeoMsg('');
    if (!navigator.geolocation) {
      setGeoMsg('Geolocalización no disponible en este navegador.');
      return;
    }
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await applyCoords(pos.coords.latitude, pos.coords.longitude);
        setGeoBusy(false);
        setGeoMsg('Ubicación actual aplicada.');
      },
      () => {
        setGeoBusy(false);
        setGeoMsg('No se pudo obtener la ubicación actual.');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const handleSubmit = async () => {
    if (!registrarUbicacion) {
      setGeneralError('Debe registrar la ubicación referencial para actualizar el estado.');
      return;
    }
    setLoading(true);
    setErrors({});
    setGeneralError('');
    try {
      const result = await trazabilidadService.actualizarEstado(codigoEnvio, form);
      onSuccess?.(result);
      onClose();
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      else setGeneralError(err.message || 'Error al actualizar estado');
    } finally {
      setLoading(false);
    }
  };

  const isEntregado = form.estado === 'Entregado';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Actualizar estado · ${codigoEnvio}`}
      size="xl"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={loading} disabled={!registrarUbicacion}>
            Actualizar
          </Button>
        </>
      )}
    >
      <div className="update-status-modal">
        {generalError && <Alert type="error" message={generalError} onClose={() => setGeneralError('')} />}

        <section className="update-status-section">
          <h4 className="update-status-section-title">Nuevo estado</h4>
          <div className="status-pill-grid" role="radiogroup" aria-label="Nuevo estado">
            {SHIPMENT_STATUSES.map((st) => {
              const Icon = STATUS_ICONS[st];
              const color = STATUS_COLORS[st] || 'gray';
              const selected = form.estado === st;
              return (
                <button
                  key={st}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`status-pill status-pill--${color}${selected ? ' is-selected' : ''}`}
                  onClick={() => handleChange('estado', st)}
                >
                  {Icon && <Icon size={17} strokeWidth={2} aria-hidden />}
                  <span>{st}</span>
                </button>
              );
            })}
          </div>
          {errors.estado && <span className="form-error">{errors.estado}</span>}
        </section>

        <section className="update-status-section">
          <label htmlFor="observacion" className="update-status-section-title form-label">
            Observación
          </label>
          <textarea
            id="observacion"
            className={`form-input update-status-textarea ${errors.observacion ? 'is-error' : ''}`}
            rows={4}
            placeholder="Obligatoria (mín. 3 caracteres)…"
            value={form.observacion}
            onChange={(e) => handleChange('observacion', e.target.value)}
          />
          {errors.observacion && <span className="form-error">{errors.observacion}</span>}
        </section>

        {isEntregado && (
          <section className="update-status-section update-status-entrega">
            <h4 className="update-status-section-title">Datos de entrega</h4>
            <Input
              id="evidenciaReferencia"
              label="Referencia de evidencia"
              required
              value={form.evidenciaReferencia}
              onChange={(e) => handleChange('evidenciaReferencia', e.target.value)}
              error={errors.evidenciaReferencia}
            />
            <Input
              id="evidenciaDetalle"
              label="Detalle de evidencia"
              value={form.evidenciaDetalle}
              onChange={(e) => handleChange('evidenciaDetalle', e.target.value)}
            />
            <Input
              id="receptorNombre"
              label="Nombre del receptor"
              required
              value={form.receptorNombre}
              onChange={(e) => handleChange('receptorNombre', e.target.value)}
              error={errors.receptorNombre}
            />
            <Input
              id="receptorDocumento"
              label="Documento del receptor"
              required
              value={form.receptorDocumento}
              onChange={(e) => handleChange('receptorDocumento', e.target.value)}
              error={errors.receptorDocumento}
            />
          </section>
        )}

        <section className="update-status-section update-status-geo">
          <label className="update-status-geo-toggle">
            <input
              type="checkbox"
              checked={registrarUbicacion}
              onChange={(e) => setRegistrarUbicacion(e.target.checked)}
            />
            <span>Registrar ubicación referencial</span>
          </label>

          {registrarUbicacion && (
            <>
              {geoMsg && (
                <Alert
                  type={geoMsg.includes('No se') || geoMsg.includes('Escriba') ? 'warning' : 'info'}
                  message={geoMsg}
                  onClose={() => setGeoMsg('')}
                />
              )}

              <div className="update-status-address-search">
                <Input
                  id="estado_geo_buscar"
                  label="Buscar dirección"
                  placeholder="Ej. Los Olivos, Lima"
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLocateAddress();
                    }
                  }}
                />
                <Button type="button" variant="secondary" icon={Search} loading={geoBusy} onClick={handleLocateAddress}>
                  Buscar
                </Button>
                <Button type="button" variant="ghost" icon={Navigation} disabled={geoBusy} onClick={handleUseGps}>
                  Mi ubicación
                </Button>
              </div>

              <Input
                id="estado_geo_dir"
                label="Dirección completa"
                required
                value={form.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                error={errors.direccion}
              />

              <div className="geo-coords-grid">
                <Input
                  id="estado_geo_lat"
                  label="Latitud"
                  required
                  value={form.latitud}
                  onChange={(e) => handleChange('latitud', e.target.value)}
                />
                <Input
                  id="estado_geo_lng"
                  label="Longitud"
                  required
                  value={form.longitud}
                  onChange={(e) => handleChange('longitud', e.target.value)}
                />
              </div>
              {errors.coordenadas && <span className="form-error">{errors.coordenadas}</span>}

              <MapPicker
                lat={form.latitud}
                lng={form.longitud}
                height={240}
                onPick={(lat, lng) => { void applyCoords(lat, lng); }}
              />
              <p className="geo-map-hint">Clic en el mapa o arrastre el marcador para ajustar el punto.</p>

              <div className="form-group">
                <label htmlFor="ubicacionObservacion" className="form-label">
                  Nota de ubicación (opcional)
                </label>
                <textarea
                  id="ubicacionObservacion"
                  className="form-input"
                  rows={2}
                  value={form.ubicacionObservacion}
                  onChange={(e) => handleChange('ubicacionObservacion', e.target.value)}
                  placeholder="Ej. Terminal, almacén, punto de entrega…"
                />
              </div>
            </>
          )}
        </section>
      </div>
    </Modal>
  );
};
