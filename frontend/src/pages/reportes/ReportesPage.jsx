import { useCallback, useEffect, useState } from 'react';
import { FileText, FileSpreadsheet, Download } from 'lucide-react';
import { reportesService } from '../../services/reportesService';
import { PageHeader } from '../../components/common/PageHeader';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { SearchInput } from '../../components/common/SearchInput';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { Alert } from '../../components/common/Alert';
import { StatusChart } from '../../components/charts/StatusChart';
import { TrendChart } from '../../components/charts/TrendChart';
import { exportCSV, exportExcel, exportPDF, mapEnvioToRow } from '../../utils/exportUtils';
import { formatDateTime } from '../../utils/formatters';
import { logAudit } from '../../utils/auditHelper';
import { SHIPMENT_STATUSES } from '../../constants/shipmentStatus';

export const ReportesPage = () => {
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [cliente, setCliente] = useState('');
  const [exportMsg, setExportMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    let data = await reportesService.consultar({ estado: estado || undefined, desde, hasta, cliente });
    if (cliente) data.envios = await reportesService.filtrarPorCliente(data.envios, cliente);
    setReporte(data);
    setLoading(false);
  }, [estado, desde, hasta, cliente]);

  useEffect(() => {
    load();
  }, [load]);

  const getRows = () => (reporte?.envios || []).map(mapEnvioToRow);

  const handleExport = (type) => {
    const rows = getRows();
    if (!rows.length) {
      setExportMsg('No hay datos para exportar con los filtros actuales.');
      return;
    }
    const ts = new Date().toISOString().slice(0, 10);
    const formats = { csv: 'CSV', excel: 'Excel', pdf: 'PDF' };
    if (type === 'csv') exportCSV(rows, `reporte-gls-${ts}.csv`);
    else if (type === 'excel') exportExcel(rows, `reporte-gls-${ts}.xlsx`);
    else exportPDF(rows, 'Reporte de Envíos GLS', `reporte-gls-${ts}.pdf`);

    logAudit({
      accion: 'exportacion_archivo',
      modulo: 'Reportes',
      descripcion: `Exportación ${formats[type]} de reporte (${rows.length} registros)`,
    });
    setExportMsg(`Exportación ${formats[type]} generada correctamente.`);
  };

  return (
    <div className="page">
      <PageHeader title="Reportes" subtitle="Análisis y exportación de datos operativos" />
      {exportMsg && <Alert type={exportMsg.includes('No hay') ? 'warning' : 'success'} message={exportMsg} onClose={() => setExportMsg('')} />}
      <div className="filters-bar">
        <Select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Todos los estados" options={['Todos', ...SHIPMENT_STATUSES]} />
        <Input id="desde" label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        <Input id="hasta" label="Hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        <SearchInput value={cliente} onChange={setCliente} placeholder="Filtrar por cliente..." />
        <div className="export-buttons">
          <Button variant="secondary" icon={Download} onClick={() => handleExport('csv')}>Exportar CSV</Button>
          <Button variant="secondary" icon={FileSpreadsheet} onClick={() => handleExport('excel')}>Exportar Excel</Button>
          <Button variant="secondary" icon={FileText} onClick={() => handleExport('pdf')}>Exportar PDF</Button>
        </div>
      </div>
      {loading ? <Loader /> : reporte && (
        <>
          <div className="stats-grid">
            <StatCard title="Total envíos" value={reporte.total} color="blue" />
            <StatCard title="Entregados" value={reporte.entregados} color="green" subtitle={`${reporte.kpis.porcentajeEntregados}%`} />
            <StatCard title="Observados" value={reporte.observados} color="red" subtitle={`${reporte.kpis.porcentajeObservados}%`} />
            <StatCard title="Tiempo prom. entrega" value={`${reporte.kpis.tiempoPromedioEntregaDias} días`} color="orange" />
          </div>
          <div className="dashboard-grid">
            <Card title="Distribución por estado"><StatusChart porEstado={reporte.porEstado} /></Card>
            <Card title="Tendencia mensual"><TrendChart porMes={reporte.porMes} /></Card>
          </div>
          <Card title="Detalle de envíos">
            <DataTable
              columns={[
                { key: 'codigoEnvio', label: 'Código' },
                { key: 'estadoActual', label: 'Estado', render: (r) => <Badge status={r.estadoActual} /> },
                { key: 'origen', label: 'Origen' },
                { key: 'destino', label: 'Destino' },
                { key: 'fechaRegistro', label: 'Fecha', render: (r) => formatDateTime(r.fechaRegistro) },
                { key: 'peso', label: 'Peso (kg)' },
              ]}
              data={reporte.envios}
              emptyMessage="No hay envíos que coincidan con los filtros seleccionados."
            />
          </Card>
        </>
      )}
    </div>
  );
};
