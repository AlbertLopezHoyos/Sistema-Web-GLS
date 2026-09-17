# Base de datos — Sistema Web GLS

Base de datos MySQL: **sistema_web_gls** (utf8mb4 / utf8mb4_unicode_ci)

## Tablas

| Tabla | Propósito | PK | FK principales |
|---|---|---|---|
| `roles` | Catálogo admin/operaciones/consulta | id | — |
| `estados_envio` | Estados del ciclo de envío | id | — |
| `usuarios` | Cuentas del sistema | id | rol_id → roles |
| `clientes` | Clientes registrados | id | — |
| `secuencias_envio` | Contador anual ENV-AAAA-NNNN | anio | — |
| `envios` | Envíos con snapshot remitente/destinatario/cliente | id | cliente_id, estado_actual_id |
| `cotizaciones_envio` | Cotización estimada (0..1) | id | envio_id |
| `historial_envios` | Trazabilidad por envío | id | envio_id, estado_id, usuario_id |
| `ubicaciones_envio` | Puntos de control referenciales | id | envio_id, usuario_id |
| `auditoria` | Eventos de auditoría | id | usuario_id |

## Índices relevantes

- `usuarios.email` (UNIQUE)
- `clientes.documento` (UNIQUE)
- `envios.codigo_envio` (UNIQUE)
- `envios.estado_actual_id`, `envios.cliente_id`, `envios.fecha_registro`
- `historial_envios.envio_id`, `historial_envios.fecha_actualizacion`
- `ubicaciones_envio.envio_id`
- `auditoria.fecha`, `auditoria.usuario_id`, `auditoria.accion`, `auditoria.modulo`

## Scripts

```bash
cd backend
cp .env.example .env
npm run db:migrate
npm run db:seed
```

Solo `development` o `test` (bloqueado en producción):

```bash
npm run db:reset
npm run db:migrate
npm run db:seed
```

Los datos semilla iniciales se cargan desde `backend/src/seeds/` (independiente del frontend).

## Diagrama

Ver `model.dbml` (compatible con dbdiagram.io).
