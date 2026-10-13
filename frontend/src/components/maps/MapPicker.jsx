import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_MAP_CENTER } from '../../constants/appConfig';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapRecenter = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom() || 13);
  }, [lat, lng, map]);
  return null;
};

const MapClickHandler = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const MapPicker = ({ lat, lng, onPick, height = 260 }) => {
  const latitude = Number(lat);
  const longitude = Number(lng);
  const safeLat = Number.isFinite(latitude) ? latitude : DEFAULT_MAP_CENTER.lat;
  const safeLng = Number.isFinite(longitude) ? longitude : DEFAULT_MAP_CENTER.lng;
  const position = [safeLat, safeLng];

  return (
    <div className="map-container map-picker" style={{ height }}>
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter lat={safeLat} lng={safeLng} />
        <MapClickHandler onPick={onPick} />
        <Marker
          draggable
          position={position}
          eventHandlers={{
            dragend: (e) => {
              const ll = e.target.getLatLng();
              onPick(ll.lat, ll.lng);
            },
          }}
        />
      </MapContainer>
    </div>
  );
};
