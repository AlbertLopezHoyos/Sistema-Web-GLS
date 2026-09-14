# Sistema Web GLS

Sistema web de información para el seguimiento y trazabilidad de envíos en el área de Operaciones de **Grupo Logístico Salazar S.A.C.**

## Descripción

Plataforma web administrativa orientada al registro, consulta, seguimiento y trazabilidad de envíos logísticos, con soporte para gestión de clientes, reportes operativos, geolocalización referencial por puntos de control y administración de usuarios.

## Objetivo

Centralizar la información operativa de envíos en una aplicación web accesible desde navegador, facilitando el control del ciclo de vida de cada envío desde su registro hasta la entrega.

## Estado del proyecto

| Componente | Estado |
|---|---|
| Frontend React | **Implementado** |
| Backend API REST | Pendiente |
| Base de datos MySQL | Pendiente |
| Datos actuales | Mock / localStorage |

## Arquitectura prevista

```
Usuario → Navegador Web → Frontend React → API REST → Backend → MySQL
```

En esta etapa:

```
Usuario → Navegador Web → Frontend React → Servicios Mock
```

## Tecnologías

- React 19 + Vite
- JavaScript
- React Router DOM
- Lucide React
- Chart.js + react-chartjs-2
- Leaflet + React Leaflet + OpenStreetMap
- jsPDF, XLSX (exportaciones)

## Estructura del repositorio

```
Sistema-Web-GLS/
├── frontend/     # Aplicación web (implementada)
├── backend/      # Preparado para etapa posterior
├── database/     # Preparado para MySQL
├── README.md
└── .gitignore
```

## Módulos

1. Inicio de sesión
2. Dashboard
3. Gestión de clientes
4. Registro de envíos
5. Consulta de envíos
6. Seguimiento y trazabilidad
7. Historial general
8. Geolocalización (puntos de control)
9. Reportes con exportación
10. Administración de usuarios
11. Auditoría
12. Respaldo (simulado)
13. Perfil de usuario

## Roles

| Rol | Permisos |
|---|---|
| **Administrador** | Acceso completo incluyendo usuarios, auditoría y respaldo |
| **Operaciones** | Operaciones CRUD sobre clientes, envíos, estados y ubicaciones |
| **Consulta** | Solo lectura en módulos permitidos |

## Instalación

```bash
cd frontend
npm install
```

## Ejecución

```bash
cd frontend
npm run dev
```

Abrir `http://localhost:5173`

## Build

```bash
cd frontend
npm run build
```

## Datos mock — credenciales demo

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@demo-gls.local | demo123 |
| Operaciones | operaciones@demo-gls.local | demo123 |
| Consulta | consulta@demo-gls.local | demo123 |

## Próxima etapa

- Backend con API REST
- Autenticación y autorización real (JWT)
- Modelo relacional MySQL
- Auditoría y respaldos reales
- Validaciones del servidor

## Base de datos

La base de datos definitiva será **MySQL**. Los scripts y el modelo relacional se desarrollarán en una etapa posterior.

## Seguridad

El control de roles actual es **demostrativo en frontend**. La seguridad real será responsabilidad del backend en la siguiente etapa.

## Consideraciones

- Los envíos se identifican por código único `ENV-AAAA-NNNN`
- La geolocalización usa puntos de control registrados, no GPS en tiempo real
- Los respaldos están simulados hasta implementar backend y MySQL
