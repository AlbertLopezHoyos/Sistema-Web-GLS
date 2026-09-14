export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  ...props
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={`btn btn-${variant} btn-${size} ${className}`}
    {...props}
  >
    {loading ? <span className="btn-spinner" aria-hidden="true" /> : Icon && <Icon size={16} />}
    {children}
  </button>
);
