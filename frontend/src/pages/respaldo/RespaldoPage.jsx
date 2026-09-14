import { useEffect, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { respaldoService } from '../../services/respaldoService';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DataTable } from '../../components/common/DataTable';
import { Loader } from '../../components/common/Loader';
import { Alert } from '../../components/common/Alert';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { formatDateTime } from '../../utils/formatters';

export const RespaldoPage = () => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmRestore, setConfirmRestore] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await respaldoService.getInfo();
    setInfo(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleGenerar = async () => {
    setProcessing(true);
    setError('');
    try {
      await respaldoService.generarRespaldo();
      setMessage('Respaldo MySQL generado correctamente.');
      await load();
    } catch (err) {
      setError(err.message || 'Error al generar respaldo');
    } finally {
      setProcessing(false);
    }
  };

  const handleRestaurar = async () => {
    const latest = info?.historial?.[0];
    if (!latest?.id) {
      setError('No hay respaldos disponibles para restaurar.');
      return;
    }
    setProcessing(true);
    setError('');
    try {
      const result = await respaldoService.restaurarRespaldo(latest.id);
      setMessage(result.message || 'Respaldo restaurado correctamente.');
      setConfirmRestore(false);
    } catch (err) {
      setError(err.message || 'Error al restaurar respaldo');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page">
      <PageHeader title="Respaldo" subtitle="Gestión de respaldos MySQL del sistema" />
      {message && <Alert type="success" message={message} onClose={() => setMessage('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <Card title="Último respaldo">
        {info?.ultimo ? (
          <dl>
            <dt>Fecha</dt><dd>{formatDateTime(info.ultimo.fecha)}</dd>
            <dt>Estado</dt><dd>{info.ultimo.estado}</dd>
            <dt>Usuario</dt><dd>{info.ultimo.usuario}</dd>
            <dt>Tamaño</dt><dd>{info.ultimo.tamano}</dd>
          </dl>
        ) : (
          <p className="text-muted">No hay respaldos registrados.</p>
        )}
        <div className="form-actions">
          <Button icon={Download} onClick={handleGenerar} loading={processing}>Generar respaldo</Button>
          <Button variant="secondary" icon={Upload} onClick={() => setConfirmRestore(true)} loading={processing} disabled={!info?.historial?.length}>
            Restaurar último respaldo
          </Button>
        </div>
      </Card>
      <Card title="Historial de respaldos">
        <DataTable
          columns={[
            { key: 'fecha', label: 'Fecha', render: (r) => formatDateTime(r.fecha) },
            { key: 'estado', label: 'Estado' },
            { key: 'usuario', label: 'Usuario' },
            { key: 'tipo', label: 'Tipo' },
          ]}
          data={info?.historial || []}
        />
      </Card>
      <ConfirmModal
        isOpen={confirmRestore}
        onClose={() => setConfirmRestore(false)}
        onConfirm={handleRestaurar}
        title="Confirmar restauración"
        message="Esta operación reemplazará los datos actuales con el último respaldo registrado. ¿Desea continuar?"
        loading={processing}
      />
    </div>
  );
};
