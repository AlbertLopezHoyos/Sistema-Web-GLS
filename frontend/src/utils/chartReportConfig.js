/** Paleta compartida: pantalla Reportes y exportaciones PDF/Excel */

export const STATUS_CHART_COLORS = [

  '#2563eb',

  '#ca8a04',

  '#f57c00',

  '#ea580c',

  '#16a34a',

  '#dc2626',

  '#64748b',

];



export const buildStatusChartData = (porEstado = {}) => {

  const labels = Object.keys(porEstado);

  const values = Object.values(porEstado);

  return {

    labels,

    datasets: [

      {

        data: values,

        backgroundColor: STATUS_CHART_COLORS.slice(0, labels.length),

        borderWidth: 2,

        borderColor: '#ffffff',

      },

    ],

  };

};



export const buildTrendChartData = (porMes = {}) => {

  const labels = Object.keys(porMes).sort();

  const values = labels.map((k) => porMes[k]);

  return {

    labels,

    datasets: [

      {

        label: 'Envíos registrados',

        data: values,

        borderColor: '#7a2828',

        backgroundColor: 'rgba(122, 40, 40, 0.12)',

        fill: true,

        tension: 0.3,

        pointRadius: 4,

        pointBackgroundColor: '#7a2828',

      },

    ],

  };

};



export const statusLegendRows = (porEstado = {}) =>

  Object.entries(porEstado).map(([estado, cantidad], i) => ({

    estado,

    cantidad,

    color: STATUS_CHART_COLORS[i % STATUS_CHART_COLORS.length],

  }));



export const trendLegendRows = () => [

  { serie: 'Envíos registrados', descripcion: 'Cantidad de envíos registrados por mes' },

];


