import { enviosService } from './enviosService.js';

export const reportesService = {
  async consultar(filters = {}) {
    const envios = await enviosService.getEnvios(filters);

    const porEstado = {};
    const porMes = {};
    let entregados = 0;
    let observados = 0;

    envios.forEach((e) => {
      porEstado[e.estadoActual] = (porEstado[e.estadoActual] || 0) + 1;
      const mes = e.fechaRegistro.slice(0, 7);
      porMes[mes] = (porMes[mes] || 0) + 1;
      if (e.estadoActual === 'Entregado') entregados++;
      if (e.estadoActual === 'Observado') observados++;
    });

    const total = envios.length;
    const clientesCount = {};
    envios.forEach((e) => {
      const c = e.clienteAsociado?.nombres || e.remitente?.nombres || 'Sin cliente';
      clientesCount[c] = (clientesCount[c] || 0) + 1;
    });
    const topClientes = Object.entries(clientesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }));

    const entregadosEnvios = envios.filter((e) => e.estadoActual === 'Entregado');
    let tiempoPromedioEntregaDias = 0;
    if (entregadosEnvios.length) {
      const totalDias = entregadosEnvios.reduce((acc, e) => {
        const diff = new Date(e.fechaUltimaActualizacion) - new Date(e.fechaRegistro);
        return acc + diff / (1000 * 60 * 60 * 24);
      }, 0);
      tiempoPromedioEntregaDias = Number((totalDias / entregadosEnvios.length).toFixed(1));
    }

    return {
      total,
      porEstado,
      porMes,
      entregados,
      observados,
      envios,
      kpis: {
        porcentajeEntregados: total ? Number(((entregados / total) * 100).toFixed(1)) : 0,
        porcentajeObservados: total ? Number(((observados / total) * 100).toFixed(1)) : 0,
        eficienciaOperativa: total ? Number((((entregados + (porEstado['En tránsito'] || 0)) / total) * 100).toFixed(1)) : 0,
        tiempoPromedioEntregaDias,
        topClientes,
        tendenciaSemanal: Object.entries(porMes).slice(-4).map(([mes, cantidad]) => ({ mes, cantidad })),
      },
    };
  },
};
