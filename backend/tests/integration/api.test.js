import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import env from '../../src/config/env.js';
import { isMySQLServerAvailable, prepareTestDbOnce } from '../helpers/prepareTestDb.js';
import { loginAs, authRequest } from '../helpers/authHelper.js';
import { query, closePool } from '../../src/config/db.js';
import { getDevDbName } from '../../src/utils/dbName.js';

let app;
let dbReady = false;
let adminCookie;
let operacionesCookie;
let consultaCookie;

const sampleEnvio = () => ({
  origen: 'Lima',
  destino: 'Arequipa',
  tipoCarga: 'General',
  descripcion: 'Prueba integración',
  peso: 10,
  dimensiones: { largo: 50, ancho: 40, alto: 30, unidadMedida: 'cm' },
  remitente: {
    nombres: 'Remitente Test',
    documento: '20111111111',
    telefono: '999888777',
    direccion: 'Av. Test 100',
  },
  destinatario: {
    nombres: 'Destinatario Test',
    documento: '20222222222',
    telefono: '999888666',
    direccion: 'Calle Test 200',
  },
  cotizacion: {
    distanciaKm: 100,
    tarifaPorKg: 2.5,
    tarifaPorM3: 180,
    tarifaPorKm: 1.2,
    seguroPorcentaje: 5,
    moneda: 'PEN',
  },
});

before(async () => {
  if (!(await isMySQLServerAvailable())) return;
  await prepareTestDbOnce();
  app = (await import('../../src/app.js')).default;
  dbReady = true;

  ({ cookie: adminCookie } = await loginAs(app, 'admin@demo-gls.local'));
  ({ cookie: operacionesCookie } = await loginAs(app, 'operaciones@demo-gls.local'));
  ({ cookie: consultaCookie } = await loginAs(app, 'consulta@demo-gls.local'));
});

after(async () => {
  await closePool();
});

describe('API integración', () => {
  test('NODE_ENV=test usa base aislada', () => {
    assert.equal(process.env.NODE_ENV, 'test');
    assert.notEqual(env.db.name, getDevDbName());
    assert.ok(env.db.name.endsWith('_test'));
  });

  test('GET /api/health', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.database, 'connected');
  });

  test('GET /api/respaldos → 404', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const res = await authRequest(app, 'get', '/api/respaldos', adminCookie);
    assert.equal(res.status, 404);
  });

  test('login correcto', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const { res } = await loginAs(app, 'admin@demo-gls.local');
    assert.equal(res.status, 200);
    assert.ok(res.headers['set-cookie']);
    assert.equal(res.body.data.user.email, 'admin@demo-gls.local');
  });

  test('login incorrecto', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@demo-gls.local', password: 'wrong1' });
    assert.equal(res.status, 401);
  });

  test('usuario inactivo', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const res = await request(app).post('/api/auth/login').send({ email: 'consulta2@demo-gls.local', password: 'demo123' });
    assert.equal(res.status, 401);
  });

  test('endpoint protegido sin sesión → 401', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const res = await request(app).get('/api/envios');
    assert.equal(res.status, 401);
  });

  test('Consulta POST /clientes → 403', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const res = await authRequest(app, 'post', '/api/clientes', consultaCookie).send({
      nombres: 'X', documento: '20999999999', telefono: '111111', direccion: 'Dir',
    });
    assert.equal(res.status, 403);
  });

  test('Operaciones POST /clientes → permitido', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const doc = `20${Date.now()}`.slice(0, 11);
    const res = await authRequest(app, 'post', '/api/clientes', operacionesCookie).send({
      nombres: 'Cliente Integración', documento: doc, telefono: '999000111', direccion: 'Test 123',
    });
    assert.equal(res.status, 201);
  });

  test('creación de envío con código ENV-AAAA-NNNN', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const res = await authRequest(app, 'post', '/api/envios', operacionesCookie).send(sampleEnvio());
    assert.equal(res.status, 201);
    assert.match(res.body.data.codigoEnvio, /^ENV-\d{4}-\d{4}$/);
  });

  test('historial inicial Registrado', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const create = await authRequest(app, 'post', '/api/envios', operacionesCookie).send(sampleEnvio());
    const codigo = create.body.data.codigoEnvio;
    const hist = await authRequest(app, 'get', `/api/envios/${codigo}/historial`, operacionesCookie);
    assert.equal(hist.status, 200);
    assert.ok(hist.body.data.some((e) => e.estado === 'Registrado'));
  });

  test('Entregado sin evidencia → 400', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const create = await authRequest(app, 'post', '/api/envios', operacionesCookie).send(sampleEnvio());
    const codigo = create.body.data.codigoEnvio;
    const res = await authRequest(app, 'post', `/api/envios/${codigo}/estado`, operacionesCookie).send({
      estado: 'Entregado', observacion: 'Entrega sin evidencia',
    });
    assert.equal(res.status, 400);
  });

  test('Entregado correctamente', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const create = await authRequest(app, 'post', '/api/envios', operacionesCookie).send(sampleEnvio());
    const codigo = create.body.data.codigoEnvio;
    const res = await authRequest(app, 'post', `/api/envios/${codigo}/estado`, operacionesCookie).send({
      estado: 'Entregado',
      observacion: 'Entrega confirmada',
      evidenciaReferencia: 'ACTA-001',
      receptorNombre: 'Juan Pérez',
      receptorDocumento: '12345678',
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.envio.estadoActual, 'Entregado');
  });

  test('coordenadas inválidas → 400', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const create = await authRequest(app, 'post', '/api/envios', operacionesCookie).send(sampleEnvio());
    const codigo = create.body.data.codigoEnvio;
    const res = await authRequest(app, 'post', `/api/envios/${codigo}/ubicaciones`, operacionesCookie).send({
      direccion: 'Punto inválido', latitud: 999, longitud: 0,
    });
    assert.equal(res.status, 400);
  });

  test('Consulta registrar ubicación → 403', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const res = await authRequest(app, 'post', '/api/envios/ENV-2026-0001/ubicaciones', consultaCookie).send({
      direccion: 'Punto test', latitud: -12.04, longitud: -77.04,
    });
    assert.equal(res.status, 403);
  });

  test('registrar coordenadas válidas', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const create = await authRequest(app, 'post', '/api/envios', operacionesCookie).send(sampleEnvio());
    const codigo = create.body.data.codigoEnvio;
    const res = await authRequest(app, 'post', `/api/envios/${codigo}/ubicaciones`, operacionesCookie).send({
      direccion: 'Punto control Lima', latitud: -12.0464, longitud: -77.0428, observacion: 'Referencial',
    });
    assert.equal(res.status, 201);
  });

  test('exportación formato inválido → 400', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const res = await authRequest(app, 'post', '/api/reportes/exportacion', adminCookie).send({ formato: 'XML' });
    assert.equal(res.status, 400);
  });

  test('exportación PDF registrada', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const res = await authRequest(app, 'post', '/api/reportes/exportacion', adminCookie).send({ formato: 'PDF' });
    assert.equal(res.status, 200);
  });

  test('remitente faltante → 400', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const payload = sampleEnvio();
    delete payload.remitente;
    const res = await authRequest(app, 'post', '/api/envios', operacionesCookie).send(payload);
    assert.equal(res.status, 400);
    assert.ok(res.body.errors?.remitente || res.body.errors?.remitente_nombres);
  });

  test('transacción createEnvio rollback sin datos parciales', async (t) => {
    if (!dbReady) { t.skip('MySQL no disponible'); return; }
    const [beforeEnvios] = await query('SELECT COUNT(*) AS total FROM envios');
    const [beforeHistorial] = await query('SELECT COUNT(*) AS total FROM historial_envios');
    const [beforeAudit] = await query(`SELECT COUNT(*) AS total FROM auditoria WHERE accion = 'envio_creado'`);

    const payload = { ...sampleEnvio(), __testForceFailBeforeAudit: true };
    const res = await authRequest(app, 'post', '/api/envios', operacionesCookie).send(payload);
    assert.notEqual(res.status, 201);

    const [afterEnvios] = await query('SELECT COUNT(*) AS total FROM envios');
    const [afterHistorial] = await query('SELECT COUNT(*) AS total FROM historial_envios');
    const [afterAudit] = await query(`SELECT COUNT(*) AS total FROM auditoria WHERE accion = 'envio_creado'`);

    assert.equal(afterEnvios[0].total, beforeEnvios[0].total);
    assert.equal(afterHistorial[0].total, beforeHistorial[0].total);
    assert.equal(afterAudit[0].total, beforeAudit[0].total);
  });
});
