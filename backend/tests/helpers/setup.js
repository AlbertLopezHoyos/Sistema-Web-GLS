import mysql from 'mysql2/promise';

export const isDbAvailable = async () => {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD ?? '';
  const dbName = process.env.DB_NAME_TEST || 'sistema_web_gls_test';

  let conn;
  try {
    conn = await mysql.createConnection({ host, port, user, password });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    return true;
  } catch {
    return false;
  } finally {
    if (conn) await conn.end();
  }
};
