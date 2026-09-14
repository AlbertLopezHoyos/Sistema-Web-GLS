import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import env from '../config/env.js';
import { assertValidDbName, quoteDbName } from '../utils/dbName.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '../../../database/migrations');

export const runMigrations = async (dbName = env.db.name) => {
  assertValidDbName(dbName);

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
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS ${quoteDbName(dbName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await conn.changeUser({ database: dbName });

    for (const file of files) {
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      console.log(`Ejecutando ${file}...`);
      await conn.query(sql);
      console.log(`✓ ${file}`);
    }
    console.log(`Migraciones completadas en ${dbName}.`);
  } finally {
    await conn.end();
  }
};

const isDirectRun = process.argv[1]
  && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  runMigrations().catch((err) => {
    console.error('Error en migraciones:', err.message);
    process.exit(1);
  });
}
