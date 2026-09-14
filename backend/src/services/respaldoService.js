import fs from 'fs/promises';
import path from 'path';
import env from '../config/env.js';
import { NotFoundError, AppError } from '../utils/errors.js';
import { auditService } from './auditService.js';
import { respaldosRepository } from '../repositories/respaldosRepository.js';
import { runMysqldump, runMysqlRestore } from '../utils/mysqlCli.js';

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
    const rows = await respaldosRepository.findAll();
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

    const stdout = await runMysqldump();
    await fs.writeFile(filePath, stdout, 'utf8');
    const stat = await fs.stat(filePath);
    const now = new Date();

    await respaldosRepository.insert([
      id, fileName, now, 'Completado', stat.size, 'Exportación MySQL', actor?.id || null,
    ]);

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
    const backup = await respaldosRepository.findById(id);
    if (!backup) throw new NotFoundError('Respaldo no encontrado');

    const filePath = path.resolve(env.backup.dir, path.basename(backup.archivo));
    if (!filePath.startsWith(path.resolve(env.backup.dir))) {
      throw new AppError('Ruta de respaldo inválida', 400);
    }

    try {
      await fs.access(filePath);
    } catch {
      throw new NotFoundError('Archivo de respaldo no encontrado en el servidor');
    }

    const sqlContent = await fs.readFile(filePath, 'utf8');
    await runMysqlRestore(sqlContent);

    await auditService.registrar({
      accion: 'backup_importado',
      modulo: 'Respaldo',
      descripcion: `Restauración del respaldo ${backup.archivo}`,
      usuarioId: actor?.id,
      usuarioEmail: actor?.email || '',
      rol: actor?.rol || '',
    });

    return { success: true, message: 'Respaldo restaurado correctamente' };
  },
};
