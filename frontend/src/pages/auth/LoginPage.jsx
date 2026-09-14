import { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { APP_NAME, APP_TITLE, COMPANY_NAME } from '../../constants/appConfig';
import { ROUTES } from '../../constants/routes';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (authLoading) return null;

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || ROUTES.DASHBOARD;
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, remember);
      const from = location.state?.from?.pathname || ROUTES.DASHBOARD;
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img src="/assets/logo.png" alt="GLS" className="login-logo" />
          <h1>{APP_NAME}</h1>
          <p className="login-subtitle">{APP_TITLE}</p>
          <p className="login-company">{COMPANY_NAME}</p>
        </div>
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Correo electrónico</label>
            <input id="email" type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@demo-gls.local" required autoComplete="email" />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <div className="input-password">
              <input id="password" type={showPass ? 'text' : 'password'} className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
              <button type="button" className="input-password-toggle" onClick={() => setShowPass((s) => !s)} aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <label className="checkbox-label">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Recordar sesión
          </label>
          <Button type="submit" loading={loading} icon={LogIn} className="login-btn">
            Iniciar sesión
          </Button>
        </form>
        <div className="login-demo">
          <p><strong>Usuarios demo:</strong></p>
          <ul>
            <li>admin@demo-gls.local</li>
            <li>operaciones@demo-gls.local</li>
            <li>consulta@demo-gls.local</li>
          </ul>
          <p>Contraseña: <code>demo123</code></p>
        </div>
      </div>
    </div>
  );
};
