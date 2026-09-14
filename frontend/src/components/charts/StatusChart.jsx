import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#2563eb', '#ca8a04', '#f57c00', '#ea580c', '#16a34a', '#dc2626', '#64748b'];

export const StatusChart = ({ porEstado }) => {
  const labels = Object.keys(porEstado);
  const data = Object.values(porEstado);

  if (!labels.length) {
    return <div className="chart-empty">Sin datos para mostrar</div>;
  }

  return (
    <div className="chart-container">
      <Doughnut
        data={{
          labels,
          datasets: [{
            data,
            backgroundColor: COLORS.slice(0, labels.length),
            borderWidth: 2,
            borderColor: '#fff',
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } },
          },
        }}
      />
    </div>
  );
};
