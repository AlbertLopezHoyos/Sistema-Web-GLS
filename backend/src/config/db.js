import mysql from 'mysql2/promise';
import env from './env.js';

let pool = null;

const createPoolInstance = () => mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z',
  dateStrings: false,
});

export const initPool = () => {
  if (!pool) pool = createPoolInstance();
  return pool;
};

export const query = (sql, params = []) => initPool().execute(sql, params);

export const getConnection = () => initPool().getConnection();

export const ping = async () => {
  const conn = await getConnection();
  try {
    await conn.ping();
    return true;
  } finally {
    conn.release();
  }
};

export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

export const recreatePool = () => {
  pool = createPoolInstance();
  return pool;
};

export default initPool();
