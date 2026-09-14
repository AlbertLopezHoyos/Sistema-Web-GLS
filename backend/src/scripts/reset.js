import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import env from '../config/env.js';
import { assertResetAllowed, quoteDbName } from '../utils/dbName.js';

export const dropDatabase = async (dbName = env.db.name) => {
  assertResetAllowed(dbName);

  const conn = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    multipleStatements: true,
  });

  try {
    console.log(`Eliminando base de datos ${dbName}...`);
    await conn.query(`DROP DATABASE IF EXISTS ${quoteDbName(dbName)}`);
    console.log(`Base ${dbName} eliminada.`);
  } finally {
    await conn.end();
  }
};

const isDirectRun = process.argv[1]
  && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  dropDatabase()
    .then(() => console.log('Ejecute npm run db:migrate && npm run db:seed'))
    .catch((err) => {
      console.error('Error en reset:', err.message);
      process.exit(1);
    });
}
