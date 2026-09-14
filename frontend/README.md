# Frontend — Sistema Web GLS

Aplicación web React para el seguimiento y trazabilidad de envíos de Grupo Logístico Salazar S.A.C.

## Requisitos

- Node.js 18+
- npm
- Backend API en ejecución (`http://localhost:3000/api`)

## Instalación

```bash
npm install
cp .env.example .env
```

## Desarrollo

```bash
npm run dev
```

## Build de producción

```bash
npm run build
```

## Preview del build

```bash
npm run preview
```

## Variables de entorno

Copiar `.env.example` a `.env`:

```
VITE_API_URL=http://localhost:3000/api
```

## Estructura

```
src/
├── components/   # UI reutilizable (common, layout, forms, charts, maps)
├── pages/        # Páginas por módulo
├── services/     # Capa de servicios (apiClient → API REST)
├── context/      # AuthContext
├── hooks/        # Hooks personalizados
├── routes/       # Configuración de rutas
├── utils/        # Utilidades y validaciones
├── constants/    # Roles, rutas, estados
└── styles/       # CSS modular
```

## Rutas principales

| Ruta | Módulo |
|---|---|
| `/login` | Autenticación |
| `/dashboard` | Panel principal |
| `/clientes` | Gestión de clientes |
| `/envios/nuevo` | Registro de envío |
| `/envios` | Consulta de envíos |
| `/envios/:id` | Detalle de envío |
| `/envios/:id/trazabilidad` | Trazabilidad |
| `/trazabilidad` | Seguimiento activo |
| `/historial` | Historial general |
| `/geolocalizacion` | Mapa de puntos |
| `/reportes` | Reportes y exportación |
| `/usuarios` | Admin usuarios |
| `/auditoria` | Log de auditoría |
| `/perfil` | Perfil de usuario |

## Arquitectura de datos

```
Página React
    ↓
Service
    ↓
apiClient
    ↓
API REST
    ↓
Backend (Express)
    ↓
MySQL
```

## Autenticación y sesión

La autenticación utiliza **JWT en cookie HttpOnly** emitida por el backend.

- **Recordar sesión activado:** cookie HttpOnly persistente.
- **Recordar sesión desactivado:** cookie de sesión (expira al cerrar el navegador).

El JWT **no** se almacena en `localStorage` ni en `sessionStorage`.

Al recargar la página:

```
AuthContext → GET /api/auth/me → backend valida cookie
```

## Persistencia de datos

| Entidad | Almacenamiento |
|---|---|
| Clientes | MySQL |
| Envíos | MySQL |
| Historial | MySQL |
| Ubicaciones | MySQL |
| Usuarios | MySQL |
| Auditoría | MySQL |

## Preferencias locales

Solo se usa `localStorage` para preferencias de interfaz (por ejemplo, sidebar contraído). No se persisten datos empresariales en el navegador.

## Credenciales demo

Ver README principal del repositorio.
