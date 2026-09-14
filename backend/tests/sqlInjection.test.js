import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { usuariosRepository } from '../src/repositories/usuariosRepository.js';
import { closePool } from '../src/config/db.js';
import { isDbAvailable } from './helpers/setup.js';

test('SQL injection en email no altera consulta de login', async (t) => {
  const dbReady = await isDbAvailable();
  if (!dbReady) { t.skip('MySQL no disponible'); return; }

  const malicious = "' OR 1=1 --";
  const row = await usuariosRepository.findByEmail(malicious);
  assert.equal(row, null);
});

after(async () => {
  await closePool();
});
