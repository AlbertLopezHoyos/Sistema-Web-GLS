import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import env from '../config/env.js';

const ALLOWED_ENVS = ['development', 'test'];

if (!ALLOWED_ENVS.includes(env.nodeEnv)) {
  console.error(`db:reset no está permitido en NODE_ENV=${env.nodeEnv}. Solo: ${ALLOWED_ENVS.join(', ')}`);
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resetSql = path.resolve(__dirname, '../../../database/reset.sql');

const run = async () => {
  const sql = await fs.readFile(resetSql, 'utf8');
  const conn = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    multipleStatements: true,
  });
  try {
    console.log('Eliminando base de datos...');
    await conn.query(sql);
    console.log('Base eliminada. Ejecute npm run db:migrate && npm run db:seed');
  } finally {
    await conn.end();
  }
};

run().catch((err) => {
  console.error('Error en reset:', err.message);
  process.exit(1);
});
