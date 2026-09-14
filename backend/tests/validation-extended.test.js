import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateParty,
  validateDimensiones,
  validateUnidadMedida,
  validateCotizacionInput,
} from '../src/utils/validation.js';

test('validateParty remitente faltante', () => {
  const errors = validateParty(null, 'remitente');
  assert.equal(errors.remitente, 'Los datos del remitente son obligatorios');
});

test('validateParty destinatario faltante', () => {
  const errors = validateParty(undefined, 'destinatario');
  assert.equal(errors.destinatario, 'Los datos del destinatario son obligatorios');
});

test('validateDimensiones undefined', () => {
  const errors = validateDimensiones(undefined);
  assert.equal(errors.dimensiones, 'Las dimensiones son obligatorias');
});

test('validateUnidadMedida solo unidades permitidas', () => {
  assert.equal(validateUnidadMedida('cm'), null);
  assert.equal(validateUnidadMedida('m'), null);
  assert.equal(validateUnidadMedida('pulgadas'), null);
  assert.ok(validateUnidadMedida('pies'));
});

test('validateCotizacionInput rechaza NaN e infinito', () => {
  const errors = validateCotizacionInput({
    distanciaKm: NaN,
    tarifaPorKg: Infinity,
    seguroPorcentaje: 150,
    moneda: 'EUR',
  });
  assert.ok(errors.distanciaKm);
  assert.ok(errors.tarifaPorKg);
  assert.ok(errors.seguroPorcentaje);
  assert.ok(errors.moneda);
});
