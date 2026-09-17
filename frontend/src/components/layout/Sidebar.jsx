import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { MENU_ITEMS } from '../../constants/menuItems';
import { useAuth } from '../../context/AuthContext';
import { COMPANY_SHORT } from '../../constants/appConfig';
import { STORAGE_KEYS } from '../../constants/appConfig';
import { storage } from '../../utils/storage';

const isEnvioDetailPath = (path) => /^\/envios\/ENV-/.test(path);

const isChildActive = (child, pathname) => {
  if (child.id === 'envio-nuevo') return pathname === '/envios/nuevo';
  if (child.id === 'envio-consulta') return pathname === '/envios' || isEnvioDetailPath(pathname);
  if (child.id === 'historial') return pathname === '/historial';
  return pathname === child.to || pathname.startsWith(`${child.to}/`);
};

export const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => storage.get(STORAGE_KEYS.SIDEBAR, false));
  const [expanded, setExpanded] = useState({ envios: true });

  useEffect(() => {
    storage.set(STORAGE_KEYS.SIDEBAR, collapsed);
  }, [collapsed]);

  useEffect(() => {
    if (location.pathname.startsWith('/envios') || location.pathname === '/historial') {
      setExpanded((p) => ({ ...p, envios: true }));
    }
  }, [location.pathname]);

  const filterByRole = (items) =>
    items.filter((item) => item.roles.includes(user?.rol));

  const renderItem = (item) => {
    if (item.children) {
      const visibleChildren = filterByRole(item.children);
      if (!visibleChildren.length) return null;
      const open = expanded[item.id];
      const hasActiveChild = visibleChildren.some((c) => isChildActive(c, location.pathname));
      return (
        <div key={item.id} className="sidebar-group">
          <button
            type="button"
            className={`sidebar-link sidebar-group-toggle ${hasActiveChild ? 'sidebar-group-open' : ''}`}
            onClick={() => setExpanded((p) => ({ ...p, [item.id]: !p[item.id] }))}
          >
            <item.icon size={20} />
            {!collapsed && (
              <>
                <span>{item.label}</span>
                <ChevronDown size={16} className={`sidebar-chevron ${open ? 'open' : ''}`} />
              </>
            )}
          </button>
          {open && !collapsed && (
            <div className="sidebar-sub">
              {visibleChildren.map((child) => (
                <NavLink
                  key={child.id}
                  to={child.to}
                  end={child.id === 'envio-consulta'}
                  className={() =>
                    `sidebar-link sidebar-sub-link ${isChildActive(child, location.pathname) ? 'active' : ''}`
                  }
                  onClick={onMobileClose}
                >
                  <child.icon size={16} />
                  <span>{child.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.id}
        to={item.to}
        className={({ isActive: active }) => `sidebar-link ${active ? 'active' : ''}`}
        onClick={onMobileClose}
        title={collapsed ? item.label : undefined}
      >
        <item.icon size={20} />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    );
  };

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onMobileClose} />}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/assets/logo.png" alt="GLS" className="sidebar-logo" />
          {!collapsed && (
            <div className="sidebar-brand-text">
              <strong>{COMPANY_SHORT}</strong>
              <small>Operaciones · Trazabilidad</small>
            </div>
          )}
          <button type="button" className="sidebar-mobile-close" onClick={onMobileClose} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {filterByRole(MENU_ITEMS).map(renderItem)}
        </nav>
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>
    </>
  );
};
