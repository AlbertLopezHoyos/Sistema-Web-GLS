import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { enviosService } from '../../services/enviosService';
import { ubicacionesService } from '../../services/ubicacionesService';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { EnvioMap } from '../../components/maps/EnvioMap';
import { RoleGuard } from '../../components/layout/RoleGuard';
import { Modal } from '../../components/common/Modal';
import { formatDateTime } from '../../utils/formatters';
import { DEFAULT_MAP_CENTER } from '../../constants/appConfig';

export const GeolocalizacionDetallePage = () => {
  const { id } = useParams();
  const [envio, setEnvio] = useState(null);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ direccion: '', latitud: String(DEFAULT_MAP_CENTER.lat), longitud: String(DEFAULT_MAP_CENTER.lng), observacion: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [e, u] = await Promise.all([
      enviosService.getEnvioById(id),
      ubicacionesService.getUbicacionesByEnvio(id),
    ]);
    setEnvio(e);
    setUbicaciones(u);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleRegister = async () => {
    setSaving(true);
    setErrors({});
    try {
      await ubicacionesService.registrarUbicacion(id, form);
      setModalOpen(false);
      setForm({ direccion: '', latitud: String(DEFAULT_MAP_CENTER.lat), longitud: String(DEFAULT_MAP_CENTER.lng), observacion: '' });
      load();
    } catch (err) {
      if (err.errors) setErrors(err.errors);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (!envio) return <div className="page"><p>Envío no encontrado.</p></div>;

  const ultima = ubicaciones[ubicaciones.length - 1];

  return (
    <div className="page">
      <PageHeader
        title={`Geolocalización — ${envio.codigoEnvio}`}
        actions={
          <RoleGuard mutate>
            <Button onClick={() => setModalOpen(true)}>Registrar ubicación</Button>
          </RoleGuard>
        }
      />
      <p className="geo-notice">
        La geolocalización implementada corresponde a puntos de control registrados y no representa seguimiento GPS en tiempo real.
      </p>
      <div className="detail-header">
        <Badge status={envio.estadoActual} />
        <span>{envio.origen} → {envio.destino}</span>
      </div>
      {ultima && (
        <Card title="Última ubicación">
          <dl>
            <dt>Dirección</dt><dd>{ultima.direccion}</dd>
            <dt>Coordenadas</dt><dd>{ultima.latitud}, {ultima.longitud}</dd>
            <dt>Fecha</dt><dd>{formatDateTime(ultima.fechaRegistro)}</dd>
            {ultima.observacion && <><dt>Observación</dt><dd>{ultima.observacion}</dd></>}
          </dl>
        </Card>
      )}
      <Card title="Mapa de puntos de control">
        <EnvioMap ubicaciones={ubicaciones} height={450} />
      </Card>
      <Card title="Historial de puntos">
        {ubicaciones.length === 0 ? (
          <p className="text-muted">No hay puntos registrados.</p>
        ) : (
          <ul className="ubicaciones-list">
            {ubicaciones.map((u, idx) => (
              <li key={u.id}>
                <strong>Punto {idx + 1}</strong> — {u.direccion}
                <br /><small>{u.latitud}, {u.longitud} · {formatDateTime(u.fechaRegistro)}</small>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Link to="/geolocalizacion" className="btn btn-ghost">← Volver</Link>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Registrar punto de control"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleRegister} loading={saving}>Registrar</Button>
          </>
        }
      >
        <Input id="dir" label="Dirección" required value={form.direccion} onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))} error={errors.direccion} />
        <Input id="lat" label="Latitud" required value={form.latitud} onChange={(e) => setForm((p) => ({ ...p, latitud: e.target.value }))} error={errors.coordenadas} />
        <Input id="lng" label="Longitud" required value={form.longitud} onChange={(e) => setForm((p) => ({ ...p, longitud: e.target.value }))} />
        <div className="form-group">
          <label htmlFor="obs" className="form-label">Observación</label>
          <textarea id="obs" className="form-input" rows={2} value={form.observacion} onChange={(e) => setForm((p) => ({ ...p, observacion: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
};
