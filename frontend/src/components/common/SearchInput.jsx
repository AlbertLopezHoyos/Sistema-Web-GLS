import { useId } from 'react';
import { X } from 'lucide-react';

export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  label = 'Buscar',
  className = '',
  id: idProp,
}) => {
  const autoId = useId();
  const inputId = idProp || autoId;
  return (
    <div className={`form-group filters-field filters-field--search ${className}`.trim()}>
      <label className="form-label" htmlFor={inputId}>
        {label}
      </label>
      <div className="search-input search-input--plain">
        <input
          id={inputId}
          type="search"
          className="form-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label || placeholder}
        />
        {value ? (
          <button
            type="button"
            className="search-clear"
            onClick={() => onChange('')}
            aria-label="Limpiar búsqueda"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );
};
