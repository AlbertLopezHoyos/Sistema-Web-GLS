import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import env from '../src/config/env.js';
import { query, closePool } from '../src/config/db.js';
import { getDevDbName, getTestDbName } from '../src/utils/dbName.js';
import { isMySQLServerAvailable, prepareTestDbOnce } from './helpers/prepareTestDb.js';

const EXPECTED_TABLES = [
  'roles', 'usuarios', 'clientes', 'estados_envio', 'envios',
  'cotizaciones_envio', 'historial_envios', 'ubicaciones_envio',
  'auditoria', 'secuencias_envio',
];

const EXPECTED_ROLES = ['admin', 'operaciones', 'consulta'];
const EXPECTED_ESTADOS = [
  'Registrado', 'En almacén', 'En tránsito', 'En reparto',
  'Entregado', 'Observado', 'Cancelado',
];

let dbReady = false;

before(async () => {
  if (!(await isMySQLServerAvailable())) return;
  await prepareTestDbOnce();
  dbReady = true;
});

after(async () => {
  await closePool();
});

test('test DB aislada de development', () => {
  assert.equal(process.env.NODE_ENV, 'test');
  assert.equal(env.db.name, getTestDbName());
  assert.notEqual(env.db.name, getDevDbName());
  assert.ok(env.db.name.endsWith('_test'));
});

test('migraciones crean tablas esperadas sin respaldos', async (t) => {
  if (!dbReady) { t.skip('MySQL no disponible'); return; }
  const [rows] = await query('SHOW TABLES');
  const tables = rows.map((r) => Object.values(r)[0]);
  for (const table of EXPECTED_TABLES) {
    assert.ok(tables.includes(table), `Falta tabla ${table}`);
  }
  assert.ok(!tables.includes('respaldos'), 'La tabla respaldos no debe existir');
});

test('seed carga roles y estados demo', async (t) => {
  if (!dbReady) { t.skip('MySQL no disponible'); return; }
  const [roles] = await query('SELECT codigo FROM roles ORDER BY codigo');
  assert.deepEqual(roles.map((r) => r.codigo).sort(), [...EXPECTED_ROLES].sort());

  const [estados] = await query('SELECT nombre FROM estados_envio ORDER BY nombre');
  assert.deepEqual(estados.map((e) => e.nombre).sort(), [...EXPECTED_ESTADOS].sort());
});

test('seed carga usuarios demo con bcrypt', async (t) => {
  if (!dbReady) { t.skip('MySQL no disponible'); return; }
  const [rows] = await query(`SELECT email, password_hash FROM usuarios WHERE email = 'jorge.salazar@gls.local'`);
  assert.equal(rows.length, 1);
  assert.ok(rows[0].password_hash.startsWith('$2'));
  assert.ok(await bcrypt.compare('Gls2026!', rows[0].password_hash));
});

test('SQL injection en email no altera consulta de login', async (t) => {
  if (!dbReady) { t.skip('MySQL no disponible'); return; }
  const { usuariosRepository } = await import('../src/repositories/usuariosRepository.js');
  const row = await usuariosRepository.findByEmail("' OR 1=1 --");
  assert.equal(row, null);
});
