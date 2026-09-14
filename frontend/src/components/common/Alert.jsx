import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

export const Alert = ({ type = 'info', message, onClose }) => {
  const Icon = icons[type];
  return (
    <div className={`alert alert-${type}`} role="alert">
      <Icon size={18} />
      <span>{message}</span>
      {onClose && (
        <button type="button" className="alert-close" onClick={onClose} aria-label="Cerrar">
          <X size={16} />
        </button>
      )}
    </div>
  );
};
