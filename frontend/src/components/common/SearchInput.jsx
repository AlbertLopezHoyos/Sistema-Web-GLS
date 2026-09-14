import { Search } from 'lucide-react';

export const SearchInput = ({ value, onChange, placeholder = 'Buscar...', className = '' }) => (
  <div className={`search-input ${className}`}>
    <Search size={18} className="search-icon" />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  </div>
);
