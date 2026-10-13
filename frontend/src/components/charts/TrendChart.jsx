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

import { buildTrendChartData } from '../../utils/chartReportConfig';



ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);



export const TrendChart = ({ porMes }) => {

  const chartData = buildTrendChartData(porMes);



  if (!chartData.labels.length) {

    return <div className="chart-empty">Sin datos para mostrar</div>;

  }



  return (

    <div className="chart-container" data-export-chart="trend">

      <Line

        data={chartData}

        options={{

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {

              display: true,

              position: 'bottom',

              labels: { boxWidth: 12, padding: 12, font: { size: 11 } },

            },

          },

          scales: {

            y: { beginAtZero: true, ticks: { stepSize: 1 } },

          },

        }}

      />

    </div>

  );

};


