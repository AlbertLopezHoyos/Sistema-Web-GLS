export const Input = ({
  label,
  error,
  id,
  required,
  className = '',
  ...props
}) => (
  <div className={`form-group ${className}`}>
    {label && (
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="required"> *</span>}
      </label>
    )}
    <input id={id} className={`form-input ${error ? 'is-error' : ''}`} {...props} />
    {error && <span className="form-error" role="alert">{error}</span>}
  </div>
);
