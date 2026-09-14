# Sistema Web GLS

Sistema web de información para el seguimiento y trazabilidad de envíos en el área de Operaciones de **Grupo Logístico Salazar S.A.C.**

## Arquitectura

```
Usuario → Navegador → React → API REST → Node.js/Express → MySQL
```

## Estado del proyecto

| Componente | Estado |
|---|---|
| Frontend React | **Implementado** |
| Backend Node.js / Express | **Implementado** |
| API REST | **Implementada** |
| MySQL | **Implementado** (requiere instalación/configuración local) |
| Autenticación | **Real** (JWT HttpOnly cookie) |
| Persistencia | **MySQL** |
| Datos mock runtime | **Eliminados** |
| Geolocalización | Puntos de control referenciales |
| QR / Firebase / Electron | **No existen** |

## Instalación

### 1. Base de datos

Instale MySQL 8+, cree usuario y base. Configure `backend/.env` desde `.env.example`.

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
```

### 2. Backend

```bash
cd backend
npm run dev
```

API: `http://localhost:3000/api`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`

## Credenciales demo

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@demo-gls.local | demo123 |
| Operaciones | operaciones@demo-gls.local | demo123 |
| Consulta | consulta@demo-gls.local | demo123 |

## Roles

| Rol | Permisos |
|---|---|
| **Administrador** | Acceso completo |
| **Operaciones** | CRUD operativo (clientes, envíos, trazabilidad, ubicaciones, reportes) |
| **Consulta** | Solo lectura |

## Estructura

```
Sistema-Web-GLS/
├── frontend/     React + Vite
├── backend/      Express + mysql2
├── database/     Migraciones SQL y modelo relacional
└── README.md
```

## Documentación

- [Backend README](./backend/README.md)
- [API REST](./backend/docs/API.md)
- [Modelo MySQL](./database/README.md)
