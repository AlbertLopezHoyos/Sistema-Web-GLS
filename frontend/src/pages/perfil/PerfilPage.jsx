import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { ROLE_LABELS } from '../../constants/roles';
import { formatDateTime } from '../../utils/formatters';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/appConfig';

export const PerfilPage = () => {
  const { user, refreshUser } = useAuth();
  const [nombres, setNombres] = useState(user?.nombres || '');
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState('');
  const session = storage.get(STORAGE_KEYS.SESSION);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authService.updateProfile(user.id, { nombres: nombres.trim() });
      await refreshUser();
      setAlert('Perfil actualizado correctamente');
    } catch (err) {
      setAlert(err.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <PageHeader title="Mi perfil" subtitle="Información de la sesión actual" />
      {alert && <Alert type={alert.includes('Error') ? 'error' : 'success'} message={alert} onClose={() => setAlert('')} />}
      <div className="detail-grid">
        <Card title="Datos del usuario">
          <dl>
            <dt>Correo</dt><dd>{user?.email}</dd>
            <dt>Rol</dt><dd>{ROLE_LABELS[user?.rol]}</dd>
            <dt>Estado</dt><dd>{user?.activo ? 'Activo' : 'Inactivo'}</dd>
          </dl>
        </Card>
        <Card title="Información de sesión">
          <dl>
            <dt>Inicio de sesión</dt><dd>{session?.loginAt ? formatDateTime(session.loginAt) : '—'}</dd>
            <dt>Recordar sesión</dt><dd>{session?.remember ? 'Sí' : 'No'}</dd>
          </dl>
        </Card>
        <Card title="Editar nombre">
          <Input id="nombres" label="Nombres" value={nombres} onChange={(e) => setNombres(e.target.value)} />
          <Button onClick={handleSave} loading={saving}>Guardar cambios</Button>
        </Card>
      </div>
    </div>
  );
};
