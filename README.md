# Sistema Web GLS

Sistema web de información para el seguimiento y trazabilidad de envíos en el área de Operaciones de **Grupo Logístico Salazar S.A.C.**

## Arquitectura

```
Usuario → Navegador → React → API REST → Controllers → Services → Repositories → MySQL
```

Backend interno: `Routes → Controllers → Services → Repositories → MySQL`

## Estado del proyecto

| Componente | Estado |
|---|---|
| Frontend React | **Implementado** |
| Backend Node.js / Express | **Implementado** |
| API REST | **Implementada** |
| MySQL | **Implementado** (requiere instalación/configuración local) |
| Autenticación | **Real** (JWT HttpOnly cookie) |
| Persistencia | **MySQL** |
| Datos semilla | **MySQL** (entorno local) |
| Geolocalización | Puntos de control referenciales |
| Reportes | **Implementados** |
| Auditoría | **Implementada** |
| QR / Firebase / Electron / Respaldo | **No existen** |

## Requisitos

- Node.js 20.19+
- MySQL 8+
- npm

## Instalación

### 1. Base de datos

Configure `backend/.env` desde `.env.example` y ejecute migraciones/seeds.

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

## Accesos iniciales (entorno local)

Datos semilla sintéticos para desarrollo y presentación académica. No representan registros empresariales reales.

| Rol | Nombre | Correo | Contraseña inicial |
|---|---|---|---|
| Administrador | Jorge Salazar | jorge.salazar@gls.local | Gls2026! |
| Operaciones | Luis Mesia | luis.mesia@gls.local | Gls2026! |
| Operaciones | Crosbin Salazar | crosbin.salazar@gls.local | Gls2026! |

El rol **Consulta** permanece soportado por el sistema; las pruebas automatizadas utilizan un usuario exclusivo de test.

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
