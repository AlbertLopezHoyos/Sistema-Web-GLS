import { useEffect, useState } from 'react';
import { Plus, Edit, UserCheck, UserX } from 'lucide-react';
import { usuariosService } from '../../services/usuariosService';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { DataTable } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Loader } from '../../components/common/Loader';
import { Alert } from '../../components/common/Alert';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { ROLE_LABELS, ROLES, ALL_ROLES } from '../../constants/roles';

export const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ nombres: '', email: '', password: '', rol: ROLES.OPERACIONES });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const debSearch = useDebounce(search);

  const load = async () => {
    setLoading(true);
    const data = await usuariosService.getUsuarios();
    setUsuarios(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = usuarios.filter((u) =>
    !debSearch || u.nombres.toLowerCase().includes(debSearch.toLowerCase()) || u.email.toLowerCase().includes(debSearch.toLowerCase())
  );
  const { page, totalPages, paginatedItems, goToPage } = usePagination(filtered);

  const openCreate = () => {
    setEditUser(null);
    setForm({ nombres: '', email: '', password: '', rol: ROLES.OPERACIONES });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ nombres: user.nombres, email: user.email, password: '', rol: user.rol });
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors({});
    try {
      if (editUser) await usuariosService.updateUsuario(editUser.id, form);
      else await usuariosService.createUsuario(form);
      setAlert({ type: 'success', message: editUser ? 'Usuario actualizado' : 'Usuario creado' });
      setModalOpen(false);
      load();
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      else if (err.message) setAlert({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (user) => {
    try {
      await usuariosService.toggleActivo(user.id);
      setAlert({
        type: 'success',
        message: user.activo ? 'Usuario desactivado correctamente' : 'Usuario activado correctamente',
      });
      load();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Error al cambiar el estado del usuario' });
    }
  };

  return (
    <div className="page">
      <PageHeader title="Administración de usuarios" subtitle="Gestión de cuentas del sistema" actions={<Button icon={Plus} onClick={openCreate}>Nuevo usuario</Button>} />
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o correo..." />
      {loading ? <Loader /> : (
        <>
          <DataTable
            columns={[
              { key: 'nombres', label: 'Nombre' },
              { key: 'email', label: 'Correo' },
              { key: 'rol', label: 'Rol', render: (r) => ROLE_LABELS[r.rol] },
              { key: 'activo', label: 'Estado', render: (r) => r.activo ? <span className="badge badge-green">Activo</span> : <span className="badge badge-gray">Inactivo</span> },
            ]}
            data={paginatedItems}
            actions={(row) => (
              <div className="table-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(row)} title="Editar"><Edit size={16} /></button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleToggle(row)} title={row.activo ? 'Desactivar' : 'Activar'}>
                  {row.activo ? <UserX size={16} /> : <UserCheck size={16} />}
                </button>
              </div>
            )}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </>
      )}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editUser ? 'Editar usuario' : 'Nuevo usuario'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Guardar</Button>
          </>
        }
      >
        <Input id="nombres" label="Nombres" required value={form.nombres} onChange={(e) => setForm((p) => ({ ...p, nombres: e.target.value }))} error={errors.nombres} />
        <Input id="email" label="Correo" required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} error={errors.email} disabled={!!editUser} />
        {!editUser && <Input id="password" label="Contraseña inicial" required type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} error={errors.password} />}
        <Select id="rol" label="Rol" required value={form.rol} onChange={(e) => setForm((p) => ({ ...p, rol: e.target.value }))} options={ALL_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))} error={errors.rol} />
        {editUser && (
          <label className="checkbox-label">
            <input type="checkbox" checked={form.activo !== false} onChange={(e) => setForm((p) => ({ ...p, activo: e.target.checked }))} />
            Usuario activo
          </label>
        )}
      </Modal>
    </div>
  );
};
