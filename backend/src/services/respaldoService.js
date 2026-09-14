import fs from 'fs/promises';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import env from '../config/env.js';
import { query } from '../config/db.js';
import { NotFoundError, AppError } from '../utils/errors.js';
import { auditService } from './auditService.js';

const execFileAsync = promisify(execFile);

const ensureBackupDir = async () => {
  await fs.mkdir(env.backup.dir, { recursive: true });
};

const formatFileName = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `gls_backup_${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.sql`;
};

export const respaldoService = {
  async getInfo() {
    const [rows] = await query(
      `SELECT r.*, u.email AS usuario_email FROM respaldos r
       LEFT JOIN usuarios u ON u.id = r.usuario_id
       ORDER BY r.fecha DESC`
    );
    const historial = rows.map((r) => ({
      id: r.id,
      fecha: r.fecha?.toISOString?.() || r.fecha,
      estado: r.estado,
      usuario: r.usuario_email || '—',
      tipo: r.tipo,
    }));
    const ultimo = historial[0]
      ? {
          fecha: historial[0].fecha,
          estado: historial[0].estado,
          usuario: historial[0].usuario,
          tamano: rows[0].tamano_bytes ? `${(rows[0].tamano_bytes / 1024 / 1024).toFixed(2)} MB` : '—',
        }
      : null;
    return { ultimo, historial };
  },

  async generar(actor) {
    await ensureBackupDir();
    const fileName = formatFileName();
    const filePath = path.join(env.backup.dir, fileName);
    const id = `bk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    let stdout;
    try {
      const result = await execFileAsync(env.backup.mysqldumpPath, [
        '-h', env.db.host,
        '-P', String(env.db.port),
        '-u', env.db.user,
        `-p${env.db.password}`,
        '--single-transaction',
        '--routines',
        '--triggers',
        env.db.name,
      ], { maxBuffer: 100 * 1024 * 1024 });
      stdout = result.stdout;
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new AppError(
          `MySQL CLI no disponible (${env.backup.mysqldumpPath}). Instale MySQL Client y configure MYSQLDUMP_PATH.`,
          503
        );
      }
      throw new AppError(`Error al ejecutar mysqldump: ${err.message}`, 500);
    }

    await fs.writeFile(filePath, stdout, 'utf8');
    const stat = await fs.stat(filePath);
    const now = new Date();

    await query(
      `INSERT INTO respaldos (id, archivo, fecha, estado, tamano_bytes, tipo, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, fileName, now, 'Completado', stat.size, 'Exportación MySQL', actor?.id || null]
    );

    await auditService.registrar({
      accion: 'backup_exportado',
      modulo: 'Respaldo',
      descripcion: 'Respaldo MySQL generado',
      usuarioId: actor?.id,
      usuarioEmail: actor?.email || '',
      rol: actor?.rol || '',
    });

    return {
      id,
      fecha: now.toISOString(),
      estado: 'Completado',
      usuario: actor?.email || 'admin',
      tipo: 'Exportación MySQL',
    };
  },

  async restaurar(id, actor) {
    const [rows] = await query('SELECT * FROM respaldos WHERE id = ? LIMIT 1', [id]);
    if (!rows[0]) throw new NotFoundError('Respaldo no encontrado');

    const filePath = path.resolve(env.backup.dir, path.basename(rows[0].archivo));
    if (!filePath.startsWith(path.resolve(env.backup.dir))) {
      throw new AppError('Ruta de respaldo inválida', 400);
    }

    try {
      await fs.access(filePath);
    } catch {
      throw new NotFoundError('Archivo de respaldo no encontrado en el servidor');
    }

    const sqlContent = await fs.readFile(filePath, 'utf8');

    try {
      await execFileAsync(env.backup.mysqlPath, [
        '-h', env.db.host,
        '-P', String(env.db.port),
        '-u', env.db.user,
        `-p${env.db.password}`,
        env.db.name,
      ], { input: sqlContent, maxBuffer: 100 * 1024 * 1024 });
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new AppError(
          `MySQL CLI no disponible (${env.backup.mysqlPath}). Instale MySQL Client y configure MYSQL_PATH.`,
          503
        );
      }
      throw new AppError(`Error al restaurar respaldo: ${err.message}`, 500);
    }

    await auditService.registrar({
      accion: 'backup_importado',
      modulo: 'Respaldo',
      descripcion: `Restauración del respaldo ${rows[0].archivo}`,
      usuarioId: actor?.id,
      usuarioEmail: actor?.email || '',
      rol: actor?.rol || '',
    });

    return { success: true, message: 'Respaldo restaurado correctamente' };
  },
};
