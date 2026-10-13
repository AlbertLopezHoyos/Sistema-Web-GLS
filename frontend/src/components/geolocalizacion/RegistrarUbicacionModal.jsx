import { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { MapPicker } from '../maps/MapPicker';
import { ubicacionesService } from '../../services/ubicacionesService';
import { DEFAULT_MAP_CENTER } from '../../constants/appConfig';
import { reverseGeocode, searchAddress } from '../../utils/geocoding';

const emptyForm = () => ({
  direccion: '',
  latitud: String(DEFAULT_MAP_CENTER.lat),
  longitud: String(DEFAULT_MAP_CENTER.lng),
  observacion: '',
});

export const RegistrarUbicacionModal = ({ isOpen, onClose, codigoEnvio, onSuccess }) => {
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [geoMsg, setGeoMsg] = useState('');
  const [geoBusy, setGeoBusy] = useState(false);

  const handleClose = () => {
    setForm(emptyForm());
    setErrors({});
    setGeoMsg('');
    onClose();
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
      /* manual */
    }
  };

  const handleLocateAddress = async () => {
    setGeoMsg('');
    setGeoBusy(true);
    try {
      const hit = await searchAddress(form.direccion);
      await applyCoords(hit.lat, hit.lng, true);
      setForm((p) => ({ ...p, direccion: hit.label.slice(0, 500) }));
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

  const handleRegister = async () => {
    if (!codigoEnvio) return;
    setSaving(true);
    setErrors({});
    try {
      await ubicacionesService.registrarUbicacion(codigoEnvio, form);
      handleClose();
      onSuccess?.();
    } catch (err) {
      if (err.errors) setErrors(err.errors);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar punto de control"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleRegister} loading={saving}>Registrar</Button>
        </>
      }
    >
      <p className="geo-modal-intro">
        Escriba la dirección y pulse <strong>Ubicar en mapa</strong>, o haga clic en el mapa para fijar el punto.
      </p>
      {geoMsg && (
        <Alert type={geoMsg.includes('No se') ? 'warning' : 'info'} message={geoMsg} onClose={() => setGeoMsg('')} />
      )}
      <div className="geo-address-row">
        <Input
          id="geo_dir"
          label="Dirección"
          required
          value={form.direccion}
          onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))}
          error={errors.direccion}
        />
        <Button type="button" variant="secondary" icon={MapPin} loading={geoBusy} onClick={handleLocateAddress}>
          Ubicar en mapa
        </Button>
        <Button type="button" variant="ghost" icon={Navigation} disabled={geoBusy} onClick={handleUseGps}>
          Mi ubicación
        </Button>
      </div>
      <p className="geo-map-hint">Clic en el mapa o arrastre el marcador para ajustar el punto.</p>
      <MapPicker lat={form.latitud} lng={form.longitud} height={280} onPick={(lat, lng) => { void applyCoords(lat, lng); }} />
      <div className="geo-coords-grid">
        <Input id="geo_lat" label="Latitud" required value={form.latitud} onChange={(e) => setForm((p) => ({ ...p, latitud: e.target.value }))} error={errors.coordenadas} />
        <Input id="geo_lng" label="Longitud" required value={form.longitud} onChange={(e) => setForm((p) => ({ ...p, longitud: e.target.value }))} />
      </div>
      <div className="form-group">
        <label htmlFor="geo_obs" className="form-label">Observación</label>
        <textarea id="geo_obs" className="form-input" rows={2} value={form.observacion} onChange={(e) => setForm((p) => ({ ...p, observacion: e.target.value }))} />
      </div>
    </Modal>
  );
};
