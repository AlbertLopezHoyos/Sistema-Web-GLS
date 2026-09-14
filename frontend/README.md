# Frontend — Sistema Web GLS

Aplicación web React para el seguimiento y trazabilidad de envíos de Grupo Logístico Salazar S.A.C.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
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
├── services/     # Capa de servicios (mock → API futura)
├── mocks/        # Datos de demostración
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
| `/respaldo` | Respaldo simulado |
| `/perfil` | Perfil de usuario |

## Arquitectura de datos

```
Página → Servicio → Mock/localStorage
```

Futuro:

```
Página → Servicio → API REST → Backend → MySQL
```

## Credenciales demo

Ver README principal del repositorio.
