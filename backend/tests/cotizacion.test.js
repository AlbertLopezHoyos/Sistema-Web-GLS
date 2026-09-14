import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularCotizacion } from '../src/utils/cotizacion.js';

test('calcularCotizacion replica fórmula del frontend', () => {
  const result = calcularCotizacion({
    peso: 10,
    largo: 50,
    ancho: 40,
    alto: 30,
    unidadMedida: 'cm',
    distanciaKm: 100,
    tarifaPorKg: 2.5,
    tarifaPorM3: 180,
    tarifaPorKm: 1.2,
    seguroPorcentaje: 5,
    moneda: 'PEN',
  });

  assert.equal(result.moneda, 'PEN');
  assert.ok(result.pesoCobradoKg >= 10);
  assert.ok(result.desglose.totalEstimado > 0);
  assert.ok(result.nota.includes('Cotización generada'));
});
