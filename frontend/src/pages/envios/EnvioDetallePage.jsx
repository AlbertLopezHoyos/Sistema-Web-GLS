import { useEffect, useState } from 'react';

import { Link, useParams } from 'react-router-dom';

import { Route, MapPin, Download } from 'lucide-react';

import { downloadComprobanteEnvio } from '../../utils/comprobanteEnvio';

import { enviosService } from '../../services/enviosService';

import { PageHeader } from '../../components/common/PageHeader';

import { Badge } from '../../components/common/Badge';

import { Loader } from '../../components/common/Loader';

import { Button } from '../../components/common/Button';

import { EnvioDetailBody } from '../../components/envios/EnvioDetailBody';

import { ROUTES } from '../../constants/routes';



export const EnvioDetallePage = () => {

  const { id } = useParams();

  const [envio, setEnvio] = useState(null);

  const [loading, setLoading] = useState(true);

  const [downloading, setDownloading] = useState(false);



  useEffect(() => {

    enviosService.getEnvioById(id).then((e) => { setEnvio(e); setLoading(false); });

  }, [id]);



  if (loading) return <Loader />;

  if (!envio) return <div className="page"><p>Envío no encontrado.</p></div>;



  const trazabilidadUrl = `${ROUTES.TRAZABILIDAD}?envio=${encodeURIComponent(envio.codigoEnvio)}`;

  const geoUrl = `${ROUTES.GEOLOCALIZACION}?envio=${encodeURIComponent(envio.codigoEnvio)}`;



  return (

    <div className="page envio-detalle-page">

      <PageHeader

        title={`Envío ${envio.codigoEnvio}`}

        actions={

          <>

            <Button

              variant="secondary"

              icon={Download}

              loading={downloading}

              onClick={async () => {

                setDownloading(true);

                try { await downloadComprobanteEnvio(envio); } finally { setDownloading(false); }

              }}

            >

              Descargar comprobante

            </Button>

            <Link to={trazabilidadUrl}><Button variant="secondary" icon={Route}>Trazabilidad</Button></Link>

            <Link to={geoUrl}><Button variant="secondary" icon={MapPin}>Ubicación</Button></Link>

          </>

        }

      />

      <div className="envio-detalle-summary">

        <Badge status={envio.estadoActual} />

        <span>{envio.origen} → {envio.destino}</span>

      </div>



      <EnvioDetailBody envio={envio} className="envio-consulta-panel-body envio-consulta-panel-body--split envio-detalle-body" />



      <Link to={ROUTES.ENVIOS} className="btn btn-ghost">← Volver a consulta</Link>

    </div>

  );

};


