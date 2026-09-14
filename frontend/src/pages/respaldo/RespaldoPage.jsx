import { useEffect, useState } from 'react';
import { Database, Download, Upload } from 'lucide-react';
import { respaldoService } from '../../services/respaldoService';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DataTable } from '../../components/common/DataTable';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { formatDateTime } from '../../utils/formatters';

export const RespaldoPage = () => {
  const { user } = useAuth();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simModal, setSimModal] = useState(null);
  const [processing, setProcessing] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await respaldoService.getInfo();
    setInfo(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleGenerar = async () => {
    setProcessing(true);
    await respaldoService.generarRespaldo(user?.email);
    setProcessing(false);
    setSimModal('generar');
    load();
  };

  const handleRestaurar = async () => {
    setProcessing(true);
    await respaldoService.restaurarRespaldo();
    setProcessing(false);
    setSimModal('restaurar');
  };

  if (loading) return <Loader />;

  return (
    <div className="page">
      <PageHeader title="Respaldo" subtitle="Gestión de respaldos del sistema (simulación)" />
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
          <Button variant="secondary" icon={Upload} onClick={handleRestaurar} loading={processing}>Restaurar respaldo</Button>
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
      <Modal
        isOpen={!!simModal}
        onClose={() => setSimModal(null)}
        title="Operación simulada"
        footer={<Button onClick={() => setSimModal(null)}>Entendido</Button>}
      >
        <div className="sim-notice">
          <Database size={48} />
          <p>
            {simModal === 'generar'
              ? 'El respaldo ha sido simulado correctamente. En la etapa frontend no se generan archivos reales ni se modifica ninguna base de datos.'
              : 'La restauración ha sido simulada. No se realizaron cambios en los datos actuales.'}
          </p>
          <p className="text-muted">La funcionalidad definitiva será implementada en el backend con MySQL.</p>
        </div>
      </Modal>
    </div>
  );
};
