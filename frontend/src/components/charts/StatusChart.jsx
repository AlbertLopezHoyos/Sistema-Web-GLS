import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { buildStatusChartData, statusLegendRows } from '../../utils/chartReportConfig';
import { Badge } from '../common/Badge';

ChartJS.register(ArcElement, Tooltip, Legend);

export const StatusChart = ({ porEstado }) => {
  const chartData = buildStatusChartData(porEstado);
  const legendRows = statusLegendRows(porEstado);

  if (!chartData.labels.length) {
    return <div className="chart-empty">Sin datos para mostrar</div>;
  }

  return (
    <div className="chart-container chart-container--status" data-export-chart="status">
      <Doughnut
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
          },
        }}
      />
      <ul className="status-chart-legend" aria-label="Leyenda por estado">
        {legendRows.map(({ estado, cantidad, color }) => (
          <li key={estado} className="status-chart-legend-item">
            <span className="status-chart-legend-swatch" style={{ backgroundColor: color }} aria-hidden />
            <Badge status={estado} />
            <span className="status-chart-legend-count">{cantidad}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
