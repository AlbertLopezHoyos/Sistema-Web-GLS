import { Badge } from '../common/Badge';
import { STATUS_COLORS } from '../../constants/shipmentStatus';
import { STATUS_ICONS } from '../../constants/statusIcons';
import { formatDateTime } from '../../utils/formatters';
import { ClipboardList } from 'lucide-react';

export const EnvioHistorialTimeline = ({ eventos = [] }) => {
  if (!eventos.length) {
    return <p className="text-muted">No hay eventos registrados.</p>;
  }

  return (
    <div className="envio-historial-timeline">
      {eventos.map((evt, idx) => {
        const Icon = STATUS_ICONS[evt.estado] || ClipboardList;
        const colorClass = STATUS_COLORS[evt.estado] || 'gray';
        const isLast = idx === eventos.length - 1;
        return (
          <div key={evt.id || idx} className="envio-historial-item">
            <div className="envio-historial-rail" aria-hidden>
              <span className={`envio-historial-dot envio-historial-dot--${colorClass}`}>
                <Icon size={18} strokeWidth={2} />
              </span>
              {!isLast && <span className="envio-historial-line" />}
            </div>
            <article className="envio-historial-card">
              <div className="envio-historial-card-head">
                <Badge status={evt.estado} />
                <time className="envio-historial-time" dateTime={evt.fechaActualizacion}>
                  {formatDateTime(evt.fechaActualizacion)}
                </time>
              </div>
              <p className="envio-historial-meta">
                {evt.responsable}
                {evt.registradoPor ? ` · ${evt.registradoPor}` : ''}
              </p>
              <p className="envio-historial-obs">{evt.observacion}</p>
            </article>
          </div>
        );
      })}
    </div>
  );
};
