import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEmail,
  validatePassword,
  validateReceptorDocumento,
  validateLatLng,
} from '../src/utils/validation.js';

test('validateEmail acepta correo válido', () => {
  assert.equal(validateEmail('jorge.salazar@gls.local'), null);
});

test('validateEmail rechaza correo inválido', () => {
  assert.ok(validateEmail('invalido'));
});

test('validatePassword exige mínimo 6 caracteres', () => {
  assert.ok(validatePassword('123'));
  assert.equal(validatePassword('Gls2026!'), null);
});

test('validateReceptorDocumento DNI y RUC', () => {
  assert.equal(validateReceptorDocumento('12345678'), null);
  assert.equal(validateReceptorDocumento('20123456789'), null);
  assert.ok(validateReceptorDocumento('123'));
});

test('validateLatLng rangos válidos', () => {
  assert.equal(validateLatLng('-12.0464', '-77.0428'), null);
  assert.ok(validateLatLng('999', '0'));
});

test('SQL injection en email no pasa como válido estructural', () => {
  const malicious = "' OR 1=1 --";
  assert.ok(validateEmail(malicious));
});
