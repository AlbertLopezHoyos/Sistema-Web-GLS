import mysql from 'mysql2/promise';
import env from '../../src/config/env.js';
import { assertTestDbIsolation, getTestDbName } from '../../src/utils/dbName.js';
import { dropDatabase } from '../../src/scripts/reset.js';
import { runMigrations } from '../../src/scripts/migrate.js';
import { runSeeds } from '../../src/scripts/seed.js';
import { closePool, recreatePool } from '../../src/config/db.js';
import { seedTestConsultaUser } from './testUsers.js';

export const isMySQLServerAvailable = async () => {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
    });
    await conn.ping();
    return true;
  } catch {
    return false;
  } finally {
    if (conn) await conn.end();
  }
};

export const prepareTestDb = async () => {
  assertTestDbIsolation();
  await closePool();
  await dropDatabase(getTestDbName());
  await runMigrations(getTestDbName());
  recreatePool();
  await runSeeds();
  await seedTestConsultaUser();
};

export const prepareTestDbOnce = async () => {
  if (globalThis.__glsTestDbPrepared) return;
  await prepareTestDb();
  globalThis.__glsTestDbPrepared = true;
};
