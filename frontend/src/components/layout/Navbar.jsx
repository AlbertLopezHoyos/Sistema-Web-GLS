import { useState, useRef, useEffect, useMemo } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { Menu, LogOut, ChevronDown, UserCog, Shield } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

import { ROLE_LABELS } from '../../constants/roles';

import { ROUTES } from '../../constants/routes';

import { SYSTEM_HEADER_SUBTITLE, SYSTEM_HEADER_TITLE } from '../../constants/appConfig';



const userInitials = (nombres) => {

  if (!nombres?.trim()) return 'U';

  return nombres

    .trim()

    .split(/\s+/)

    .slice(0, 2)

    .map((p) => p[0])

    .join('')

    .toUpperCase();

};



export const Navbar = ({ onMenuToggle, sidebarCollapsed }) => {

  const { user, logout, isAdmin } = useAuth();

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  const initials = useMemo(() => userInitials(user?.nombres), [user?.nombres]);



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

        <button

          type="button"

          className="navbar-menu-btn"

          onClick={onMenuToggle}

          aria-label={sidebarCollapsed ? 'Mostrar menú lateral' : 'Ocultar menú lateral'}

          aria-expanded={!sidebarCollapsed}

        >

          <Menu size={22} strokeWidth={2} />

        </button>

        <div className="navbar-brand-block">

          <h1 className="navbar-system-title">{SYSTEM_HEADER_TITLE}</h1>

          <p className="navbar-system-subtitle">{SYSTEM_HEADER_SUBTITLE}</p>

        </div>

      </div>

      <div className="navbar-right" ref={menuRef}>

        <span className="navbar-area-badge">{ROLE_LABELS[user?.rol] || 'Operaciones'}</span>

        <button

          type="button"

          className="navbar-user-btn"

          onClick={() => setMenuOpen((o) => !o)}

          aria-expanded={menuOpen}

          aria-haspopup="true"

        >

          <div className="navbar-avatar navbar-avatar-initials" aria-hidden>

            {initials}

          </div>

          <div className="navbar-user-info">

            <span className="navbar-user-name">{user?.nombres}</span>

            <span className="navbar-user-role">{isAdmin ? 'Admin' : ROLE_LABELS[user?.rol]}</span>

          </div>

          <ChevronDown size={16} />

        </button>

        {menuOpen && (

          <div className="navbar-dropdown">

            <Link to={ROUTES.PERFIL} className="navbar-dropdown-item" onClick={() => setMenuOpen(false)}>

              Mi perfil

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


