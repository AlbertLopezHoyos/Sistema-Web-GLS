import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { clientesService } from '../../services/clientesService';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Loader } from '../../components/common/Loader';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { RoleGuard } from '../../components/layout/RoleGuard';
import { ROUTES } from '../../constants/routes';

const emptyForm = { nombres: '', documento: '', telefono: '', direccion: '', empresa: '' };

export const ClienteFormPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const wantsEdit = searchParams.get('edit') === '1';
  const editMode = wantsEdit || !isEdit;
  const { canMutate } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [readOnly, setReadOnly] = useState(isEdit && !wantsEdit);

  useEffect(() => {
    if (isEdit) {
      clientesService.getClienteById(id).then((c) => {
        if (c) {
          const datos = { nombres: c.nombres, documento: c.documento, telefono: c.telefono, direccion: c.direccion, empresa: c.empresa || '' };
          setForm(datos);
          setInitialForm(datos);
        }
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  if (!canMutate && editMode) {
    return <Navigate to={isEdit ? `/clientes/${id}` : ROUTES.CLIENTES} replace />;
  }

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleClear = () => {
    setForm(isEdit ? initialForm : emptyForm);
    setErrors({});
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors({});
    try {
      if (isEdit) await clientesService.updateCliente(id, form);
      else await clientesService.createCliente(form);
      setSuccess(isEdit ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente');
      setTimeout(() => navigate(ROUTES.CLIENTES), 1500);
    } catch (err) {
      if (err.errors) setErrors(err.errors);
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page">
      <PageHeader
        title={isEdit ? (readOnly ? 'Detalle de cliente' : 'Editar cliente') : 'Nuevo cliente'}
        actions={readOnly && (
          <RoleGuard mutate>
            <Button onClick={() => setReadOnly(false)}>Editar</Button>
          </RoleGuard>
        )}
      />
      {success && <Alert type="success" message={success} />}
      <form className="form-sections" onSubmit={(e) => { e.preventDefault(); setConfirmOpen(true); }}>
        <section className="form-section">
          <h3>Datos del cliente</h3>
          <div className="form-grid">
            <Input id="nombres" label="Razón social / nombres" required value={form.nombres} onChange={(e) => handleChange('nombres', e.target.value)} error={errors.nombres} disabled={readOnly} />
            <Input id="documento" label="Documento (RUC / DNI)" required value={form.documento} onChange={(e) => handleChange('documento', e.target.value)} error={errors.documento} disabled={readOnly || isEdit} />
            <Input id="telefono" label="Teléfono" required value={form.telefono} onChange={(e) => handleChange('telefono', e.target.value)} error={errors.telefono} disabled={readOnly} />
            <Input id="direccion" label="Dirección fiscal" required value={form.direccion} onChange={(e) => handleChange('direccion', e.target.value)} error={errors.direccion} disabled={readOnly} />
            <Input id="empresa" label="Empresa (opcional)" value={form.empresa} onChange={(e) => handleChange('empresa', e.target.value)} disabled={readOnly} />
          </div>
        </section>
        {!readOnly && (
          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={() => navigate(ROUTES.CLIENTES)}>Cancelar</Button>
            <Button type="button" variant="secondary" onClick={handleClear}>Limpiar</Button>
            <Button type="submit" loading={saving}>Guardar</Button>
          </div>
        )}
      </form>
      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleSave} message={`¿Confirma ${isEdit ? 'actualizar' : 'registrar'} este cliente?`} loading={saving} />
    </div>
  );
};
