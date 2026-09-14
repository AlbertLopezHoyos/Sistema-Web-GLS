import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export const TrendChart = ({ porMes }) => {
  const labels = Object.keys(porMes).sort();
  const data = labels.map((k) => porMes[k]);

  if (!labels.length) {
    return <div className="chart-empty">Sin datos para mostrar</div>;
  }

  return (
    <div className="chart-container">
      <Line
        data={{
          labels,
          datasets: [{
            label: 'Envíos registrados',
            data,
            borderColor: '#7a2828',
            backgroundColor: 'rgba(122, 40, 40, 0.1)',
            fill: true,
            tension: 0.3,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
          },
        }}
      />
    </div>
  );
};
