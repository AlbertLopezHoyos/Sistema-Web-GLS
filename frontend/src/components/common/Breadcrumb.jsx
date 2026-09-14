import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const Breadcrumb = ({ items = [] }) => (
  <nav className="breadcrumb" aria-label="Breadcrumb">
    {items.map((item, idx) => (
      <span key={item.label} className="breadcrumb-item">
        {idx > 0 && <ChevronRight size={14} className="breadcrumb-sep" />}
        {item.to && idx < items.length - 1 ? (
          <Link to={item.to}>{item.label}</Link>
        ) : (
          <span className={idx === items.length - 1 ? 'breadcrumb-current' : ''}>{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);
