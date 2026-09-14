# Backend — Sistema Web GLS

API REST Node.js + Express + MySQL para persistencia real del frontend React.

## Stack

- Node.js 20+
- Express
- mysql2/promise
- JWT en cookie HttpOnly
- bcryptjs
- helmet, cors, express-rate-limit

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
| `npm test` | Pruebas unitarias |
| `npm run db:migrate` | Ejecuta SQL de `database/migrations/` |
| `npm run db:seed` | Datos demo desde mocks del frontend |
| `npm run db:reset` | DROP database (solo development) |

## Autenticación

- `POST /api/auth/login` — cookie HttpOnly
- `GET /api/auth/me` — sesión actual
- `POST /api/auth/logout`
- `PATCH /api/auth/profile`

El frontend debe usar `credentials: 'include'`.

## Documentación API

Ver [docs/API.md](./docs/API.md)

## Estructura

```
src/
├── config/       db.js, env.js
├── middleware/   auth, roles, errors
├── routes/       endpoints REST
├── services/     lógica de negocio
├── scripts/      migrate, seed, reset
├── utils/        validación, cotización, mappers
├── app.js
└── server.js
```
