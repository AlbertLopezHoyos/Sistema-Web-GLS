import { STATUS_COLORS } from '../../constants/shipmentStatus';
import { STATUS_ICONS } from '../../constants/statusIcons';

export const Badge = ({ status, children, variant, showIcon = true }) => {
  const label = children ?? status;
  const colorClass = variant || (status ? STATUS_COLORS[status] || 'gray' : 'gray');
  const Icon = showIcon && status ? STATUS_ICONS[status] : null;

  return (
    <span className={`badge badge-${colorClass}${Icon ? ' badge-with-icon' : ''}`}>
      {Icon && (
        <span className="badge-icon" aria-hidden>
          <Icon size={14} strokeWidth={2.25} />
        </span>
      )}
      <span className="badge-label">{label}</span>
    </span>
  );
};
