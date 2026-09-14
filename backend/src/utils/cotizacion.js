const DEFAULT_TARIFF = {
  tarifaPorKg: 2.5,
  tarifaPorM3: 180,
  tarifaPorKm: 1.2,
  seguroPorcentaje: 0,
};

const toM3 = (largo, ancho, alto, unidad) => {
  let l = Number(largo);
  let a = Number(ancho);
  let h = Number(alto);
  if (unidad === 'cm') {
    l /= 100;
    a /= 100;
    h /= 100;
  } else if (unidad === 'pulgadas') {
    l *= 0.0254;
    a *= 0.0254;
    h *= 0.0254;
  }
  return l * a * h;
};

export const calcularCotizacion = (params) => {
  const {
    peso,
    largo,
    ancho,
    alto,
    unidadMedida = 'cm',
    distanciaKm = 0,
    tarifaPorKg = DEFAULT_TARIFF.tarifaPorKg,
    tarifaPorM3 = DEFAULT_TARIFF.tarifaPorM3,
    tarifaPorKm = DEFAULT_TARIFF.tarifaPorKm,
    seguroPorcentaje = 0,
    moneda = 'PEN',
  } = params;

  const volumenM3 = toM3(largo, ancho, alto, unidadMedida);
  const pesoVolumetricoKg = volumenM3 * 250;
  const pesoCobradoKg = Math.max(Number(peso), pesoVolumetricoKg);
  const costoPorPeso = pesoCobradoKg * Number(tarifaPorKg);
  const costoPorVolumen = volumenM3 * Number(tarifaPorM3);
  const costoPorDistancia = Number(distanciaKm) * Number(tarifaPorKm);
  const subtotal = costoPorPeso + costoPorVolumen + costoPorDistancia;
  const seguroMonto = subtotal * (Number(seguroPorcentaje) / 100);
  const totalEstimado = subtotal + seguroMonto;

  return {
    moneda,
    volumenM3: Number(volumenM3.toFixed(4)),
    pesoVolumetricoKg: Number(pesoVolumetricoKg.toFixed(2)),
    pesoCobradoKg: Number(pesoCobradoKg.toFixed(2)),
    desglose: {
      costoPorPeso: Number(costoPorPeso.toFixed(2)),
      costoPorVolumen: Number(costoPorVolumen.toFixed(2)),
      costoPorDistancia: Number(costoPorDistancia.toFixed(2)),
      subtotal: Number(subtotal.toFixed(2)),
      seguroPorcentaje: Number(seguroPorcentaje),
      seguroMonto: Number(seguroMonto.toFixed(2)),
      totalEstimado: Number(totalEstimado.toFixed(2)),
    },
    nota: 'Cotización generada según parámetros y tarifas configuradas.',
  };
};
