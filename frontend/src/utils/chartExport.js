import Chart from 'chart.js/auto';

import { buildStatusChartData, buildTrendChartData } from './chartReportConfig';



/** Misma relación de aspecto para ambos gráficos en PDF/Excel */

export const CHART_EXPORT_SIZE = { width: 640, height: 400 };

export const CHART_EXPORT_ASPECT = CHART_EXPORT_SIZE.width / CHART_EXPORT_SIZE.height;



const LEGEND_BOTTOM = {

  position: 'bottom',

  align: 'start',

  labels: {

    boxWidth: 12,

    boxHeight: 12,

    padding: 10,

    font: { size: 12, family: 'Helvetica, Arial, sans-serif' },

    color: '#000000',

  },

};



const renderOnCanvas = (config, width, height) =>

  new Promise((resolve, reject) => {

    const canvas = document.createElement('canvas');

    canvas.width = width;

    canvas.height = height;

    const ctx = canvas.getContext('2d');

    if (!ctx) {

      reject(new Error('Canvas no disponible'));

      return;

    }

    ctx.fillStyle = '#ffffff';

    ctx.fillRect(0, 0, width, height);



    const chart = new Chart(ctx, {

      ...config,

      options: {

        ...config.options,

        responsive: false,

        animation: false,

        maintainAspectRatio: false,

      },

    });



    requestAnimationFrame(() => {

      try {

        const dataUrl = canvas.toDataURL('image/png', 1);

        chart.destroy();

        resolve(dataUrl);

      } catch (err) {

        chart.destroy();

        reject(err);

      }

    });

  });



export const renderStatusChartImage = async (porEstado) => {

  const data = buildStatusChartData(porEstado);

  if (!data.labels.length) return null;

  const { width, height } = CHART_EXPORT_SIZE;

  return renderOnCanvas(

    {

      type: 'doughnut',

      data,

      options: {

        layout: { padding: { top: 12, bottom: 6, left: 10, right: 10 } },

        plugins: {

          legend: LEGEND_BOTTOM,

          title: {

            display: true,

            text: 'Distribución por estado',

            font: { size: 14, weight: 'bold' },

            color: '#000000',

            padding: { bottom: 10 },

          },

        },

        cutout: '52%',

      },

    },

    width,

    height

  );

};



export const renderTrendChartImage = async (porMes) => {

  const data = buildTrendChartData(porMes);

  if (!data.labels.length) return null;

  const { width, height } = CHART_EXPORT_SIZE;

  return renderOnCanvas(

    {

      type: 'line',

      data: {

        ...data,

        datasets: data.datasets.map((ds) => ({

          ...ds,

          backgroundColor: 'rgba(122, 40, 40, 0.06)',

          borderWidth: 2.5,

          pointRadius: 3,

        })),

      },

      options: {

        layout: { padding: { top: 12, bottom: 6, left: 8, right: 14 } },

        plugins: {

          legend: LEGEND_BOTTOM,

          title: {

            display: true,

            text: 'Tendencia mensual',

            font: { size: 14, weight: 'bold' },

            color: '#000000',

            padding: { bottom: 10 },

          },

        },

        scales: {

          x: {

            grid: { color: '#e8e8e8', drawBorder: false },

            ticks: { font: { size: 11 }, color: '#000000', maxRotation: 35, minRotation: 0 },

          },

          y: {

            beginAtZero: true,

            grid: { color: '#e8e8e8', drawBorder: false },

            ticks: { stepSize: 1, font: { size: 11 }, color: '#000000' },

          },

        },

      },

    },

    width,

    height

  );

};



export const renderReportCharts = async (reporte) => {

  if (!reporte) return { statusImg: null, trendImg: null };

  const [statusImg, trendImg] = await Promise.all([

    renderStatusChartImage(reporte.porEstado),

    renderTrendChartImage(reporte.porMes),

  ]);

  return { statusImg, trendImg };

};


