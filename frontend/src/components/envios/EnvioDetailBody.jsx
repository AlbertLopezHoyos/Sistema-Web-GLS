import { Card } from '../common/Card';

import { DataFieldGrid } from '../common/DataFieldGrid';

import { formatDateTime, formatCurrency } from '../../utils/formatters';



/** Misma distribución en dos columnas que el panel de consulta de envíos */

export const EnvioDetailBody = ({
  envio,
  className = 'envio-consulta-panel-body envio-consulta-panel-body--split envio-detalle-body',
  footer = null,
}) => {


  const cot = envio.cotizacionEstimada;



  return (

    <div className={className}>

      <Card title="Registro" className="envio-consulta-panel-span-full">

        <DataFieldGrid

          columns={2}

          fields={[

            ['Fecha registro', formatDateTime(envio.fechaRegistro)],

            ['Última actualización', formatDateTime(envio.fechaUltimaActualizacion)],

          ]}

        />

      </Card>



      <div className="envio-consulta-panel-col">

        <Card title="Remitente">

          <DataFieldGrid

            fields={[

              ['Nombres', envio.remitente?.nombres],

              ['Documento', envio.remitente?.documento],

              ['Teléfono', envio.remitente?.telefono],

              ['Dirección', envio.remitente?.direccion],

            ]}

          />

        </Card>

        {envio.clienteAsociado?.nombres && (

          <Card title="Cliente asociado">

            <DataFieldGrid

              fields={[

                ['Nombres', envio.clienteAsociado.nombres],

                ['Documento', envio.clienteAsociado.documento],

                ['Empresa', envio.clienteAsociado.empresa],

                ['Teléfono', envio.clienteAsociado.telefono],

              ]}

            />

          </Card>

        )}

        {cot?.desglose && (

          <Card title="Cotización estimada">

            <DataFieldGrid

              fields={[

                ['Total estimado', formatCurrency(cot.desglose.totalEstimado, cot.moneda)],

                ['Nota', cot.nota],

              ]}

            />

          </Card>

        )}

      </div>



      <div className="envio-consulta-panel-col">

        <Card title="Destinatario">

          <DataFieldGrid

            fields={[

              ['Nombres', envio.destinatario?.nombres],

              ['Documento', envio.destinatario?.documento],

              ['Teléfono', envio.destinatario?.telefono],

              ['Dirección', envio.destinatario?.direccion],

            ]}

          />

        </Card>

        <Card title="Datos del envío">

          <DataFieldGrid

            columns={2}

            fields={[

              ['Origen', envio.origen],

              ['Destino', envio.destino],

              ['Tipo de carga', envio.tipoCarga],

              ['Descripción', envio.descripcion],

              ['Peso', envio.peso != null ? `${envio.peso} kg` : null],

              [

                'Dimensiones',

                envio.dimensiones

                  ? `${envio.dimensiones.largo} × ${envio.dimensiones.ancho} × ${envio.dimensiones.alto} ${envio.dimensiones.unidadMedida}`

                  : null,

              ],

              ['Observación', envio.observacion],

            ]}

          />

        </Card>

        {envio.evidenciaEntrega && (

          <Card title="Evidencia de entrega">

            <DataFieldGrid

              fields={[

                ['Referencia', envio.evidenciaEntrega.referencia],

                [

                  'Receptor',

                  `${envio.evidenciaEntrega.receptorNombre} (${envio.evidenciaEntrega.receptorDocumento})`,

                ],

                ['Fecha', formatDateTime(envio.evidenciaEntrega.fecha)],

              ]}

            />

          </Card>

        )}

      </div>

      {footer}

    </div>

  );

};


