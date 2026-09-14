import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { enviosService } from '../../services/enviosService';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';

export const GeolocalizacionPage = () => {
  const [envios, setEnvios] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enviosService.getEnvios({}).then((data) => {
      setEnvios(data);
      setLoading(false);
    });
  }, []);

  const filtered = envios.filter((e) =>
    !search || e.codigoEnvio.includes(search.toUpperCase()) || e.origen?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <PageHeader
        title="Geolocalización"
        subtitle="Puntos de control registrados por envío (no seguimiento GPS en tiempo real)"
      />
      <p className="geo-notice">
        La geolocalización implementada corresponde a puntos de control registrados y no representa seguimiento GPS en tiempo real.
      </p>
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar envío..." />
      {loading ? <Loader /> : (
        <DataTable
          columns={[
            { key: 'codigoEnvio', label: 'Código' },
            { key: 'estadoActual', label: 'Estado', render: (r) => <Badge status={r.estadoActual} /> },
            { key: 'origen', label: 'Origen' },
            { key: 'destino', label: 'Destino' },
          ]}
          data={filtered}
          actions={(row) => (
            <Link to={`/geolocalizacion/${row.codigoEnvio}`} className="btn btn-ghost btn-sm">
              <MapPin size={16} /> Ver mapa
            </Link>
          )}
        />
      )}
    </div>
  );
};
