import bcrypt from 'bcryptjs';
import env from '../../src/config/env.js';
import { query } from '../../src/config/db.js';

export const INITIAL_PASSWORD = 'Gls2026!';

export const TEST_CONSULTA = {
  id: 'usr_test_consulta',
  email: 'consulta.test@gls.local',
  nombres: 'Usuario Consulta Test',
  rol: 'consulta',
  activo: true,
};

export const seedTestConsultaUser = async () => {
  const [rolRows] = await query('SELECT id FROM roles WHERE codigo = ? LIMIT 1', [TEST_CONSULTA.rol]);
  const rolId = rolRows[0]?.id;
  if (!rolId) throw new Error('Rol consulta no encontrado para tests');

  const hash = await bcrypt.hash(INITIAL_PASSWORD, env.bcryptRounds);
  const now = new Date();

  await query(
    `INSERT INTO usuarios (id, email, nombres, rol_id, activo, password_hash, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE nombres = VALUES(nombres), activo = VALUES(activo), password_hash = VALUES(password_hash)`,
    [TEST_CONSULTA.id, TEST_CONSULTA.email, TEST_CONSULTA.nombres, rolId, 1, hash, now, now]
  );
};
