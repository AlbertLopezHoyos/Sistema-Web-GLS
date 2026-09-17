import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, ChevronDown, UserCog, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../constants/roles';
import { ROUTES } from '../../constants/routes';
import { Breadcrumb } from '../common/Breadcrumb';

export const Navbar = ({ onMenuToggle, breadcrumbs = [], title }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button type="button" className="navbar-menu-btn" onClick={onMenuToggle} aria-label="Abrir menú">
          <Menu size={22} />
        </button>
        <div className="navbar-title-area">
          {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}
          {title && <h2 className="navbar-title">{title}</h2>}
        </div>
      </div>
      <div className="navbar-right" ref={menuRef}>
        <button
          type="button"
          className="navbar-user-btn"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          <div className="navbar-avatar">
            <User size={18} />
          </div>
          <div className="navbar-user-info">
            <span className="navbar-user-name">{user?.nombres}</span>
            <span className="navbar-user-role">{ROLE_LABELS[user?.rol]}</span>
          </div>
          <ChevronDown size={16} />
        </button>
        {menuOpen && (
          <div className="navbar-dropdown">
            <Link to={ROUTES.PERFIL} className="navbar-dropdown-item" onClick={() => setMenuOpen(false)}>
              <User size={16} /> Mi perfil
            </Link>
            {isAdmin && (
              <>
                <div className="navbar-dropdown-divider" />
                <div className="navbar-dropdown-heading">Administración</div>
                <Link to={ROUTES.USUARIOS} className="navbar-dropdown-item" onClick={() => setMenuOpen(false)}>
                  <UserCog size={16} /> Usuarios
                </Link>
                <Link to={ROUTES.AUDITORIA} className="navbar-dropdown-item" onClick={() => setMenuOpen(false)}>
                  <Shield size={16} /> Auditoría
                </Link>
              </>
            )}
            <div className="navbar-dropdown-divider" />
            <button type="button" className="navbar-dropdown-item" onClick={handleLogout}>
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
