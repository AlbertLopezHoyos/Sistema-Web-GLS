import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';
import { DataFieldGrid } from '../common/DataFieldGrid';
import { EnvioMap } from '../maps/EnvioMap';
import { RoleGuard } from '../layout/RoleGuard';
import { formatDateTime } from '../../utils/formatters';

export const GeolocalizacionSidePanel = ({
  codigo,
  envio,
  ubicaciones = [],
  loading,
  onRegisterClick,
}) => {
  if (!codigo) {
    return (
      <aside className="master-detail-panel master-detail-panel--empty">
        <p>Seleccione un envío de la lista para ver el mapa y los puntos de control.</p>
      </aside>
    );
  }

  if (loading) {
    return (
      <aside className="master-detail-panel">
        <Loader />
      </aside>
    );
  }

  if (!envio) {
    return (
      <aside className="master-detail-panel master-detail-panel--empty">
        <p>No se pudo cargar el envío <strong>{codigo}</strong>.</p>
      </aside>
    );
  }

  const ultima = ubicaciones[ubicaciones.length - 1];

  return (
    <aside className="master-detail-panel geo-side-panel">
      <header className="master-detail-panel-head">
        <div>
          <p className="master-detail-panel-label">Geolocalización</p>
          <h2 className="master-detail-panel-title">{envio.codigoEnvio}</h2>
          <div className="envio-consulta-panel-meta">
            <Badge status={envio.estadoActual} />
            <span>{envio.origen} → {envio.destino}</span>
          </div>
        </div>
        <RoleGuard mutate>
          <Button onClick={onRegisterClick}>Registrar punto</Button>
        </RoleGuard>
      </header>

      <div className="master-detail-panel-body">
        {ultima ? (
          <Card title="Última ubicación">
            <DataFieldGrid
              fields={[
                ['Dirección', ultima.direccion],
                ['Coordenadas', `${ultima.latitud}, ${ultima.longitud}`],
                ['Fecha', formatDateTime(ultima.fechaRegistro)],
                ['Observación', ultima.observacion],
              ]}
            />
          </Card>
        ) : (
          <p className="text-muted">Sin puntos de control registrados aún.</p>
        )}

        <Card title="Mapa de puntos de control">
          <div className="geo-side-map">
            <EnvioMap ubicaciones={ubicaciones} height={240} />
          </div>
        </Card>

        {ubicaciones.length > 0 && (
          <Card title="Historial de puntos">
            <ul className="ubicaciones-list geo-side-historial">
              {ubicaciones.map((u, idx) => (
                <li key={u.id}>
                  <strong>Punto {idx + 1}</strong> — {u.direccion}
                  <br />
                  <small>{u.latitud}, {u.longitud} · {formatDateTime(u.fechaRegistro)}</small>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </aside>
  );
};
