import { Badge } from '../common/Badge';
import { formatDateTime } from '../../utils/formatters';

export const Timeline = ({ eventos = [] }) => {
  if (!eventos.length) {
    return <p className="text-muted">No hay eventos registrados.</p>;
  }

  return (
    <div className="timeline">
      {eventos.map((evt, idx) => (
        <div key={evt.id || idx} className="timeline-item">
          <div className="timeline-marker" />
          <div className="timeline-content">
            <div className="timeline-header">
              <Badge status={evt.estado} />
              <span className="timeline-date">{formatDateTime(evt.fechaActualizacion)}</span>
            </div>
            <p className="timeline-obs">{evt.observacion}</p>
            <div className="timeline-meta">
              <span>Responsable: {evt.responsable}</span>
              {evt.registradoPor && <span>Registrado por: {evt.registradoPor}</span>}
            </div>
            {evt.evidenciaReferencia && (
              <div className="timeline-evidence">
                Ref: {evt.evidenciaReferencia}
                {evt.receptorNombre && ` · Receptor: ${evt.receptorNombre} (${evt.receptorDocumento})`}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
