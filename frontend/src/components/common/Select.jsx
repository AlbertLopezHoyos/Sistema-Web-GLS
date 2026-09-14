export const Select = ({
  label,
  error,
  id,
  options = [],
  placeholder,
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
    <select id={id} className={`form-input ${error ? 'is-error' : ''}`} {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) =>
        typeof opt === 'string' ? (
          <option key={opt} value={opt}>{opt}</option>
        ) : (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        )
      )}
    </select>
    {error && <span className="form-error" role="alert">{error}</span>}
  </div>
);
