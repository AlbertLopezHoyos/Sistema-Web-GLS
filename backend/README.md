# Backend — Sistema Web GLS

API REST Node.js + Express + MySQL para persistencia real del frontend React.

## Stack

- Node.js 20+
- Express
- mysql2/promise
- JWT en cookie HttpOnly
- bcryptjs
- helmet, cors, express-rate-limit
- ESLint (lint real del proyecto)

## Arquitectura

```
Routes → Controllers → Services → Repositories → MySQL
```

| Capa | Responsabilidad |
|---|---|
| `routes/` | Endpoints, middlewares de auth/roles |
| `controllers/` | HTTP req/res/next |
| `services/` | Reglas de negocio, transacciones |
| `repositories/` | Consultas SQL parametrizadas |
| `config/` | Pool MySQL, variables de entorno |

## Instalación

```bash
cd backend
npm install
cp .env.example .env
```

Configure MySQL en `.env` y ejecute:

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

API: `http://localhost:3000/api`

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor con watch |
| `npm run start` | Servidor producción |
| `npm test` | Pruebas unitarias + integración (NODE_ENV=test) |
| `npm run lint` | ESLint sobre `src/` y `tests/` |
| `npm run check` | Verificación de sintaxis del entrypoint |
| `npm run db:migrate` | Ejecuta SQL de `database/migrations/` (idempotente) |
| `npm run db:seed` | Datos demo desde `src/seeds/` (independiente del frontend) |
| `npm run db:reset` | DROP database (solo development/test) |

## Tests

Configure `DB_NAME_TEST` en `.env` para pruebas aisladas (opcional; si no se define, usa `DB_NAME`).

```bash
npm test
```

Incluye: health, auth, roles, envíos, transacciones, SQL injection, validaciones.

## Seeds

Los datos demo están en `src/seeds/` — el backend **no importa** código del frontend.

## Autenticación

- `POST /api/auth/login` — cookie HttpOnly (`remember=false` sesión, `remember=true` persistente)
- `GET /api/auth/me` — sesión actual
- `POST /api/auth/logout`
- `PATCH /api/auth/profile`

El frontend debe usar `credentials: 'include'`. JWT **no** va en localStorage/sessionStorage.

## Producción

- `JWT_SECRET` obligatorio (sin fallback)
- `DB_PASSWORD` obligatorio
- `COOKIE_SECURE=true` recomendado

## Documentación API

Ver [docs/API.md](./docs/API.md)

## Estructura

```
src/
├── config/         db.js, env.js
├── controllers/  auth, clientes, envios, historial, reportes, usuarios, auditoria, respaldo
├── middleware/     auth, roles, errors
├── repositories/ acceso SQL
├── routes/         endpoints REST declarativos
├── seeds/          datos demo independientes
├── services/       lógica de negocio
├── scripts/        migrate, seed, reset
├── utils/          validación, cotización, mappers, mysqlCli
├── app.js
└── server.js
```
