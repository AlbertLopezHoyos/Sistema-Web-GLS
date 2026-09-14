import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDevDbName, getTestDbName } from '../utils/dbName.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isTest = nodeEnv === 'test';

const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';
if (isProduction && (!process.env.JWT_SECRET || jwtSecret === 'dev-secret-change-me')) {
  console.error('JWT_SECRET debe configurarse con un valor seguro en producción.');
  process.exit(1);
}

const dbPassword = process.env.DB_PASSWORD ?? '';
if (isProduction && !dbPassword) {
  console.error('DB_PASSWORD debe configurarse en producción.');
  process.exit(1);
}

const devDbName = getDevDbName();
const testDbName = getTestDbName();

if (isTest) {
  if (testDbName === devDbName) {
    console.error('Las pruebas requieren una base MySQL aislada.');
    process.exit(1);
  }
  if (!testDbName.endsWith('_test')) {
    console.error('La base de pruebas debe terminar en _test.');
    process.exit(1);
  }
}

const env = {
  nodeEnv,
  isProduction,
  isTest,
  port: Number(process.env.PORT || 3000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    name: isTest ? testDbName : devDbName,
    devName: devDbName,
    testName: testDbName,
    user: process.env.DB_USER || 'root',
    password: dbPassword,
  },
  jwt: {
    secret: jwtSecret,
    sessionExpires: process.env.JWT_SESSION_EXPIRES || '8h',
    rememberExpires: process.env.JWT_REMEMBER_EXPIRES || '7d',
  },
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),
  cookie: {
    name: process.env.COOKIE_NAME || 'gls_token',
    secure: isProduction ? true : process.env.COOKIE_SECURE === 'true',
  },
};

export default env;
