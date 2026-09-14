const DB_NAME_PATTERN = /^[A-Za-z0-9_]+$/;

export const getDevDbName = () => process.env.DB_NAME || 'sistema_web_gls';

export const getTestDbName = () => process.env.DB_NAME_TEST || 'sistema_web_gls_test';

export const assertValidDbName = (name) => {
  if (!DB_NAME_PATTERN.test(name)) {
    throw new Error(`Nombre de base de datos inválido: ${name}`);
  }
};

export const quoteDbName = (name) => {
  assertValidDbName(name);
  return `\`${name}\``;
};

export const assertTestDbIsolation = () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Esta operación solo está permitida con NODE_ENV=test');
  }
  const devDb = getDevDbName();
  const testDb = getTestDbName();
  if (testDb === devDb) {
    throw new Error('Las pruebas requieren una base MySQL aislada.');
  }
  if (!testDb.endsWith('_test')) {
    throw new Error('La base de pruebas debe terminar en _test.');
  }
};

export const assertResetAllowed = (dbName) => {
  assertValidDbName(dbName);
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (!['development', 'test'].includes(nodeEnv)) {
    throw new Error(`db:reset no está permitido en NODE_ENV=${nodeEnv}`);
  }
  if (nodeEnv === 'test') {
    assertTestDbIsolation();
    if (dbName !== getTestDbName()) {
      throw new Error('En test solo se puede eliminar la base DB_NAME_TEST');
    }
  } else if (dbName !== getDevDbName()) {
    throw new Error('En development solo se puede eliminar la base DB_NAME');
  }
};
