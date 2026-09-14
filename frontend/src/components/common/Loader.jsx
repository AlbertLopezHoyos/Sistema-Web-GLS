export const Loader = ({ message = 'Cargando...' }) => (
  <div className="loader" role="status" aria-live="polite">
    <div className="loader-spinner" />
    <span>{message}</span>
  </div>
);
