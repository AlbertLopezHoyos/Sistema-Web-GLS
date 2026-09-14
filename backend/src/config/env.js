import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || 'sistema_web_gls',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    sessionExpires: process.env.JWT_SESSION_EXPIRES || '8h',
    rememberExpires: process.env.JWT_REMEMBER_EXPIRES || '7d',
  },
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),
  cookie: {
    name: process.env.COOKIE_NAME || 'gls_token',
    secure: process.env.COOKIE_SECURE === 'true',
  },
  backup: {
    dir: process.env.BACKUP_DIR || './backups',
    mysqldumpPath: process.env.MYSQLDUMP_PATH || 'mysqldump',
    mysqlPath: process.env.MYSQL_PATH || 'mysql',
  },
};

export default env;
