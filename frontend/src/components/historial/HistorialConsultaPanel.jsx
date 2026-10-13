import { Link } from 'react-router-dom';

import { ExternalLink, MapPin, Package, Route } from 'lucide-react';

import { Card } from '../common/Card';

import { Badge } from '../common/Badge';

import { DataFieldGrid } from '../common/DataFieldGrid';

import { formatDateTime } from '../../utils/formatters';

import { ROUTES } from '../../constants/routes';



export const HistorialConsultaPanel = ({ evento }) => {

  if (!evento) {

    return (

      <aside className="envio-consulta-panel envio-consulta-panel--empty">

        <p>Seleccione un evento de la lista para ver su detalle.</p>

      </aside>

    );

  }



  const trazabilidadUrl = `${ROUTES.TRAZABILIDAD}?envio=${encodeURIComponent(evento.codigoEnvio)}`;

  const envioUrl = `/envios/${encodeURIComponent(evento.codigoEnvio)}`;

  const geoUrl = `${ROUTES.GEOLOCALIZACION}?envio=${encodeURIComponent(evento.codigoEnvio)}`;

  const hasEvidencia = evento.evidenciaReferencia || evento.evidenciaDetalle || evento.receptorNombre;



  return (

    <aside className="envio-consulta-panel historial-consulta-panel">

      <header className="envio-consulta-panel-head">

        <div>

          <p className="envio-consulta-panel-label">Evento de trazabilidad</p>

          <h2 className="envio-consulta-panel-code">{evento.codigoEnvio}</h2>

          <div className="envio-consulta-panel-meta">

            <Badge status={evento.estado} />

            <span>{evento.origen} → {evento.destino}</span>

          </div>

        </div>

        <div className="envio-consulta-panel-actions">

          <Link to={envioUrl} className="btn btn-secondary btn-sm" title="Ver envío">

            <Package size={16} />

            <span className="btn-label-inline">Envío</span>

          </Link>

          <Link to={trazabilidadUrl} className="btn btn-ghost btn-sm" title="Trazabilidad">

            <Route size={16} />

          </Link>

          <Link to={geoUrl} className="btn btn-ghost btn-sm" title="Ubicación">

            <MapPin size={16} />

          </Link>

        </div>

      </header>



      <div className="envio-consulta-panel-body envio-consulta-panel-body--split">

        <div className="envio-consulta-panel-col">

          <Card title="Detalle del evento">

            <DataFieldGrid

              fields={[

                ['Estado', <Badge key="estado-badge" status={evento.estado} />],

                ['Fecha', formatDateTime(evento.fechaActualizacion)],

                ['Cliente', evento.cliente],

                ['Observación', evento.observacion],

              ]}

            />

          </Card>

        </div>

        <div className="envio-consulta-panel-col">

          {hasEvidencia ? (

            <Card title="Evidencia de entrega">

              <DataFieldGrid

                fields={[

                  ['Evidencia', evento.evidenciaReferencia],

                  ['Detalle evidencia', evento.evidenciaDetalle],

                  ['Receptor', evento.receptorNombre],

                  ['Doc. receptor', evento.receptorDocumento],

                ]}

              />

            </Card>

          ) : (

            <Card title="Responsables">

              <DataFieldGrid

                fields={[

                  ['Responsable', evento.responsable],

                  ['Registrado por', evento.registradoPor],

                ]}

              />

            </Card>

          )}

        </div>

        {hasEvidencia && (

          <Card title="Responsables" className="envio-consulta-panel-span-full">

            <DataFieldGrid

              columns={2}

              fields={[

                ['Responsable', evento.responsable],

                ['Registrado por', evento.registradoPor],

              ]}

            />

          </Card>

        )}



        <Link to={envioUrl} className="envio-consulta-full-link envio-consulta-panel-span-full">

          <ExternalLink size={16} aria-hidden />

          Abrir vista completa del envío →

        </Link>

      </div>

    </aside>

  );

};


