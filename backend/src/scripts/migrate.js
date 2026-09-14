import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import env from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '../../../database/migrations');

const run = async () => {
  const files = (await fs.readdir(migrationsDir))
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const conn = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    multipleStatements: true,
  });

  try {
    for (const file of files) {
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      console.log(`Ejecutando ${file}...`);
      await conn.query(sql);
      console.log(`✓ ${file}`);
    }
    console.log('Migraciones completadas.');
  } finally {
    await conn.end();
  }
};

run().catch((err) => {
  console.error('Error en migraciones:', err.message);
  process.exit(1);
});
