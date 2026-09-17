# Backend — Sistema Web GLS

API REST Node.js + Express + MySQL para persistencia real del frontend React.

## Stack

- Node.js 20.19+
- Express
- mysql2/promise
- JWT en cookie HttpOnly
- bcryptjs
- helmet, cors, express-rate-limit
- ESLint

## Arquitectura

```
Routes → Controllers → Services → Repositories → MySQL
```

## Instalación

```bash
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

API: `http://localhost:3000/api`

## Base de datos

- **Development:** `DB_NAME` (default `sistema_web_gls`)
- **Test:** `DB_NAME_TEST` (default `sistema_web_gls_test`, debe terminar en `_test` y ser distinta de `DB_NAME`)

Las migraciones crean la base indicada por `env.db.name` — no contienen nombres hardcodeados.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor con watch |
| `npm test` | Pruebas (NODE_ENV=test, base aislada) |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Migraciones sobre `DB_NAME` |
| `npm run db:seed` | Datos semilla iniciales |
| `npm run db:reset` | DROP de la base del entorno actual (solo development/test) |

## Tests

Los tests preparan automáticamente `sistema_web_gls_test` (reset + migrate + seed) sin tocar la base de desarrollo.

```bash
npm test
```

## Documentación API

Ver [docs/API.md](./docs/API.md)
