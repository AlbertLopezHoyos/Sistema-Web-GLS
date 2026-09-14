import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Input } from '../common/Input';
import { Alert } from '../common/Alert';
import { SHIPMENT_STATUSES } from '../../constants/shipmentStatus';
import { trazabilidadService } from '../../services/trazabilidadService';

export const UpdateStatusModal = ({ isOpen, onClose, codigoEnvio, estadoActual, onSuccess, registradoPor }) => {
  const [form, setForm] = useState({
    estado: estadoActual || '',
    observacion: '',
    evidenciaReferencia: '',
    evidenciaDetalle: '',
    receptorNombre: '',
    receptorDocumento: '',
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: '' }));
    setGeneralError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});
    setGeneralError('');
    try {
      const result = await trazabilidadService.actualizarEstado(codigoEnvio, form, registradoPor);
      onSuccess?.(result);
      onClose();
      setForm({ estado: '', observacion: '', evidenciaReferencia: '', evidenciaDetalle: '', receptorNombre: '', receptorDocumento: '' });
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      else setGeneralError(err.message || 'Error al actualizar estado');
    } finally {
      setLoading(false);
    }
  };

  const isEntregado = form.estado === 'Entregado';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Actualizar estado — ${codigoEnvio}`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={loading}>Actualizar</Button>
        </>
      }
    >
      {generalError && <Alert type="error" message={generalError} onClose={() => setGeneralError('')} />}
      <Select
        id="estado"
        label="Nuevo estado"
        required
        value={form.estado}
        onChange={(e) => handleChange('estado', e.target.value)}
        options={SHIPMENT_STATUSES}
        error={errors.estado}
      />
      <div className="form-group">
        <label htmlFor="observacion" className="form-label">Observación *</label>
        <textarea
          id="observacion"
          className={`form-input ${errors.observacion ? 'is-error' : ''}`}
          rows={3}
          value={form.observacion}
          onChange={(e) => handleChange('observacion', e.target.value)}
        />
        {errors.observacion && <span className="form-error">{errors.observacion}</span>}
      </div>
      {isEntregado && (
        <>
          <Input id="evidenciaReferencia" label="Referencia de evidencia" required value={form.evidenciaReferencia} onChange={(e) => handleChange('evidenciaReferencia', e.target.value)} error={errors.evidenciaReferencia} />
          <Input id="evidenciaDetalle" label="Detalle de evidencia" value={form.evidenciaDetalle} onChange={(e) => handleChange('evidenciaDetalle', e.target.value)} />
          <Input id="receptorNombre" label="Nombre del receptor" required value={form.receptorNombre} onChange={(e) => handleChange('receptorNombre', e.target.value)} error={errors.receptorNombre} />
          <Input id="receptorDocumento" label="Documento del receptor" required value={form.receptorDocumento} onChange={(e) => handleChange('receptorDocumento', e.target.value)} error={errors.receptorDocumento} />
        </>
      )}
    </Modal>
  );
};
