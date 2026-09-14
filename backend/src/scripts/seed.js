import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import env from '../config/env.js';
import { query, getConnection } from '../config/db.js';
import { usuariosMock, DEMO_PASSWORD } from '../seeds/usuariosMock.js';
import { clientesMock } from '../seeds/clientesMock.js';
import { enviosMock } from '../seeds/enviosMock.js';
import { historialMock } from '../seeds/historialMock.js';
import { ubicacionesMock } from '../seeds/ubicacionesMock.js';
import { auditoriaMock } from '../seeds/auditoriaMock.js';

const getEstadoId = async (nombre) => {
  const [rows] = await query('SELECT id FROM estados_envio WHERE nombre = ? LIMIT 1', [nombre]);
  return rows[0]?.id;
};

const getRolId = async (codigo) => {
  const [rows] = await query('SELECT id FROM roles WHERE codigo = ? LIMIT 1', [codigo]);
  return rows[0]?.id;
};

const seedUsuarios = async () => {
  for (const u of usuariosMock) {
    const rolId = await getRolId(u.rol);
    const hash = await bcrypt.hash(DEMO_PASSWORD, env.bcryptRounds);
    await query(
      `INSERT INTO usuarios (id, email, nombres, rol_id, activo, password_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nombres = VALUES(nombres), activo = VALUES(activo), password_hash = VALUES(password_hash)`,
      [u.id, u.email, u.nombres, rolId, u.activo ? 1 : 0, hash, new Date(u.createdAt), new Date(u.updatedAt)]
    );
  }
  console.log(`✓ ${usuariosMock.length} usuarios`);
};

const seedClientes = async () => {
  for (const c of clientesMock) {
    await query(
      `INSERT INTO clientes (id, nombres, documento, telefono, direccion, empresa, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nombres = VALUES(nombres)`,
      [c.id, c.nombres, c.documento, c.telefono, c.direccion, c.empresa || '', new Date(c.fechaAlta), new Date(c.fechaActualizacion)]
    );
  }
  console.log(`✓ ${clientesMock.length} clientes`);
};

const seedEnvios = async () => {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('INSERT INTO secuencias_envio (anio, contador) VALUES (2026, 20) ON DUPLICATE KEY UPDATE contador = GREATEST(contador, 20)');

    for (const e of enviosMock) {
      const estadoId = await getEstadoId(e.estadoActual);
      const ca = e.clienteAsociado;

      const [existing] = await conn.execute('SELECT id FROM envios WHERE codigo_envio = ? LIMIT 1', [e.codigoEnvio]);
      if (existing[0]) continue;

      const [result] = await conn.execute(
        `INSERT INTO envios (
          codigo_envio, cliente_id, estado_actual_id,
          remitente_nombres, remitente_documento, remitente_telefono, remitente_direccion,
          destinatario_nombres, destinatario_documento, destinatario_telefono, destinatario_direccion,
          cliente_documento, cliente_nombres, cliente_telefono, cliente_direccion, cliente_empresa,
          origen, destino, tipo_carga, descripcion, peso,
          dim_largo, dim_ancho, dim_alto, dim_unidad, observacion,
          evidencia_referencia, evidencia_detalle, evidencia_receptor_nombre, evidencia_receptor_documento,
          evidencia_fecha, evidencia_registrado_por,
          fecha_registro, fecha_ultima_actualizacion, created_at, updated_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          e.codigoEnvio, ca?.clienteId || null, estadoId,
          e.remitente.nombres, e.remitente.documento, e.remitente.telefono, e.remitente.direccion,
          e.destinatario.nombres, e.destinatario.documento, e.destinatario.telefono, e.destinatario.direccion,
          ca?.documento || null, ca?.nombres || null, ca?.telefono || null, ca?.direccion || null, ca?.empresa || null,
          e.origen, e.destino, e.tipoCarga, e.descripcion, e.peso,
          e.dimensiones.largo, e.dimensiones.ancho, e.dimensiones.alto, e.dimensiones.unidadMedida, e.observacion || 'Sin observaciones',
          e.evidenciaEntrega?.referencia || null, e.evidenciaEntrega?.detalle || null,
          e.evidenciaEntrega?.receptorNombre || null, e.evidenciaEntrega?.receptorDocumento || null,
          e.evidenciaEntrega?.fecha ? new Date(e.evidenciaEntrega.fecha) : null,
          e.evidenciaEntrega?.registradoPor || null,
          new Date(e.fechaRegistro), new Date(e.fechaUltimaActualizacion),
          new Date(e.fechaRegistro), new Date(e.fechaUltimaActualizacion),
        ]
      );

      if (e.cotizacionEstimada) {
        const cot = e.cotizacionEstimada;
        const d = cot.desglose;
        await conn.execute(
          `INSERT INTO cotizaciones_envio (
            envio_id, moneda, distancia_km, tarifa_por_kg, tarifa_por_m3, tarifa_por_km, seguro_porcentaje,
            volumen_m3, peso_volumetrico_kg, peso_cobrado_kg,
            costo_por_peso, costo_por_volumen, costo_por_distancia, subtotal, seguro_monto, total_estimado, nota
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            result.insertId, cot.moneda, 0, 2.5, 180, 1.2, d.seguroPorcentaje || 0,
            cot.volumenM3, cot.pesoVolumetricoKg, cot.pesoCobradoKg,
            d.costoPorPeso, d.costoPorVolumen, d.costoPorDistancia, d.subtotal, d.seguroMonto, d.totalEstimado, cot.nota,
          ]
        );
      }
    }
    await conn.commit();
    console.log(`✓ ${enviosMock.length} envíos`);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const seedHistorial = async () => {
  for (const h of historialMock) {
    const [envioRows] = await query('SELECT id FROM envios WHERE codigo_envio = ? LIMIT 1', [h.codigoEnvio]);
    if (!envioRows[0]) continue;
    const estadoId = await getEstadoId(h.estado);
    await query(
      `INSERT INTO historial_envios (
        id, envio_id, estado_id, fecha_actualizacion, observacion, responsable,
        evidencia_referencia, evidencia_detalle, receptor_nombre, receptor_documento, registrado_por
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE observacion = VALUES(observacion)`,
      [
        h.id, envioRows[0].id, estadoId, new Date(h.fechaActualizacion), h.observacion, h.responsable,
        h.evidenciaReferencia || '', h.evidenciaDetalle || '', h.receptorNombre || '', h.receptorDocumento || '',
        h.registradoPor,
      ]
    );
  }
  console.log(`✓ ${historialMock.length} eventos historial`);
};

const seedUbicaciones = async () => {
  for (const u of ubicacionesMock) {
    const [envioRows] = await query('SELECT id FROM envios WHERE codigo_envio = ? LIMIT 1', [u.codigoEnvio]);
    if (!envioRows[0]) continue;
    await query(
      `INSERT INTO ubicaciones_envio (
        id, envio_id, direccion, latitud, longitud, observacion, fecha_registro, responsable, registrado_por
      ) VALUES (?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE direccion = VALUES(direccion)`,
      [
        u.id, envioRows[0].id, u.direccion, Number(u.latitud), Number(u.longitud),
        u.observacion || '', new Date(u.fechaRegistro), u.responsable, u.registradoPor,
      ]
    );
  }
  console.log(`✓ ${ubicacionesMock.length} ubicaciones`);
};

const seedAuditoria = async () => {
  for (const a of auditoriaMock) {
    const [userRows] = await query('SELECT id FROM usuarios WHERE email = ? LIMIT 1', [a.usuario]);
    await query(
      `INSERT INTO auditoria (id, usuario_id, usuario_email, rol, accion, modulo, descripcion, fecha)
       VALUES (?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion)`,
      [a.id, userRows[0]?.id || null, a.usuario, a.rol, a.accion, a.modulo, a.descripcion, new Date(a.fecha)]
    );
  }
  console.log(`✓ ${auditoriaMock.length} eventos auditoría`);
};

export const runSeeds = async () => {
  console.log('Sembrando datos demo...');
  await seedUsuarios();
  await seedClientes();
  await seedEnvios();
  await seedHistorial();
  await seedUbicaciones();
  await seedAuditoria();
  console.log('Seed completado.');
};

const isDirectRun = process.argv[1]
  && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (isDirectRun) {
  runSeeds().catch((err) => {
    console.error('Error en seed:', err.message);
    process.exit(1);
  });
}
