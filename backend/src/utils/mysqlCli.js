import { spawn } from 'child_process';
import { execFile } from 'child_process';
import { promisify } from 'util';
import env from '../config/env.js';
import { AppError } from './errors.js';

const execFileAsync = promisify(execFile);

const mysqlEnv = () => ({
  ...process.env,
  MYSQL_PWD: env.db.password,
});

const baseArgs = () => [
  '-h', env.db.host,
  '-P', String(env.db.port),
  '-u', env.db.user,
];

export const runMysqldump = async () => {
  try {
    const { stdout } = await execFileAsync(
      env.backup.mysqldumpPath,
      [
        ...baseArgs(),
        '--single-transaction',
        '--routines',
        '--triggers',
        env.db.name,
      ],
      { maxBuffer: 100 * 1024 * 1024, env: mysqlEnv() }
    );
    return stdout;
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new AppError(
        `MySQL CLI no disponible (${env.backup.mysqldumpPath}). Instale MySQL Client y configure MYSQLDUMP_PATH.`,
        503
      );
    }
    throw new AppError(`Error al ejecutar mysqldump: ${err.message}`, 500);
  }
};

export const runMysqlRestore = (sqlContent) => new Promise((resolve, reject) => {
  const child = spawn(
    env.backup.mysqlPath,
    [...baseArgs(), env.db.name],
    { stdio: ['pipe', 'pipe', 'pipe'], env: mysqlEnv() }
  );

  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  child.on('error', (err) => {
    if (err.code === 'ENOENT') {
      reject(new AppError(
        `MySQL CLI no disponible (${env.backup.mysqlPath}). Instale MySQL Client y configure MYSQL_PATH.`,
        503
      ));
      return;
    }
    reject(err);
  });
  child.on('close', (code) => {
    if (code === 0) resolve();
    else reject(new AppError(`Error al restaurar respaldo: ${stderr.trim() || `código ${code}`}`, 500));
  });

  child.stdin.write(sqlContent);
  child.stdin.end();
});
