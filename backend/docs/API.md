# API REST — Sistema Web GLS

Base URL: `http://localhost:3000/api`

Formato respuesta:

```json
{ "success": true, "data": {} }
{ "success": false, "message": "...", "errors": {} }
```

## Health

| Método | Ruta | Rol |
|---|---|---|
| GET | `/health` | Público |

## Auth

| Método | Ruta | Rol | Body |
|---|---|---|---|
| POST | `/auth/login` | Público | email, password, remember |
| GET | `/auth/me` | Autenticado | — |
| POST | `/auth/logout` | Autenticado | — |
| PATCH | `/auth/profile` | Autenticado | nombres |

## Clientes

| Método | Ruta | Rol |
|---|---|---|
| GET | `/clientes` | Todos |
| GET | `/clientes/:id` | Todos |
| GET | `/clientes/documento/:documento` | Todos |
| POST | `/clientes` | admin, operaciones |
| PUT | `/clientes/:id` | admin, operaciones |

Query: `q` (búsqueda)

## Envíos

| Método | Ruta | Rol |
|---|---|---|
| GET | `/envios` | Todos |
| GET | `/envios/activos` | Todos |
| GET | `/envios/dashboard` | Todos |
| GET | `/envios/:codigo` | Todos |
| POST | `/envios` | admin, operaciones |
| GET | `/envios/:codigo/historial` | Todos |
| POST | `/envios/:codigo/estado` | admin, operaciones |
| GET | `/envios/:codigo/ubicaciones` | Todos |
| GET | `/envios/:codigo/ubicaciones/ultima` | Todos |
| POST | `/envios/:codigo/ubicaciones` | admin, operaciones |

Filtros GET `/envios`: estado, codigo, cliente, desde, hasta

## Historial

| Método | Ruta | Rol |
|---|---|---|
| GET | `/historial` | Todos |
| GET | `/historial/estados` | Todos |

## Reportes

| Método | Ruta | Rol |
|---|---|---|
| GET | `/reportes/envios` | Todos |
| POST | `/reportes/exportacion` | Todos |

## Usuarios (solo admin)

| Método | Ruta |
|---|---|
| GET | `/usuarios` |
| GET | `/usuarios/:id` |
| POST | `/usuarios` |
| PUT | `/usuarios/:id` |
| PATCH | `/usuarios/:id/estado` |

## Auditoría (solo admin)

| Método | Ruta |
|---|---|
| GET | `/auditoria` |
| GET | `/auditoria/modulos` |
| GET | `/auditoria/acciones` |

## Respaldos (solo admin)

| Método | Ruta | Body |
|---|---|---|
| GET | `/respaldos` | — |
| POST | `/respaldos` | — |
| POST | `/respaldos/:id/restaurar` | confirmar: true |
