import { STATUS_COLORS } from '../../constants/shipmentStatus';

export const Badge = ({ status, children, variant }) => {
  const colorClass = variant || (status ? STATUS_COLORS[status] || 'gray' : 'gray');
  return (
    <span className={`badge badge-${colorClass}`}>
      {children || status}
    </span>
  );
};
