import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_MAP_CENTER } from '../../constants/appConfig';

/**
 * La geolocalización implementada corresponde a puntos de control registrados
 * y no representa seguimiento GPS en tiempo real.
 */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export const EnvioMap = ({ ubicaciones = [], height = 400 }) => {
  const points = ubicaciones.map((u) => [Number(u.latitud), Number(u.longitud)]);
  const center = points.length
    ? points[points.length - 1]
    : [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng];

  return (
    <div className="map-container" style={{ height }}>
      <MapContainer center={center} zoom={points.length > 1 ? 7 : 12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.length > 1 && (
          <Polyline positions={points} color="#7a2828" weight={3} opacity={0.7} />
        )}
        {ubicaciones.map((u, idx) => (
          <Marker key={u.id} position={[Number(u.latitud), Number(u.longitud)]}>
            <Popup>
              <strong>Punto {idx + 1}</strong><br />
              {u.direccion}<br />
              <small>{new Date(u.fechaRegistro).toLocaleString('es-PE')}</small>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
