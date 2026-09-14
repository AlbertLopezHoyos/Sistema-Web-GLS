import { ROLES } from '../constants/roles';

export const DEMO_PASSWORD = 'demo123';

export const usuariosMock = [
  {
    id: 'usr_001',
    email: 'admin@demo-gls.local',
    nombres: 'Carlos Mendoza Ríos',
    rol: ROLES.ADMIN,
    activo: true,
    password: DEMO_PASSWORD,
    createdAt: '2025-01-10T08:00:00.000Z',
    updatedAt: '2025-06-01T10:00:00.000Z',
  },
  {
    id: 'usr_002',
    email: 'operaciones@demo-gls.local',
    nombres: 'María Elena Vargas',
    rol: ROLES.OPERACIONES,
    activo: true,
    password: DEMO_PASSWORD,
    createdAt: '2025-02-15T09:00:00.000Z',
    updatedAt: '2025-06-01T10:00:00.000Z',
  },
  {
    id: 'usr_003',
    email: 'consulta@demo-gls.local',
    nombres: 'Luis Alberto Paredes',
    rol: ROLES.CONSULTA,
    activo: true,
    password: DEMO_PASSWORD,
    createdAt: '2025-03-01T08:30:00.000Z',
    updatedAt: '2025-06-01T10:00:00.000Z',
  },
  {
    id: 'usr_004',
    email: 'operaciones2@demo-gls.local',
    nombres: 'Ana Sofía Quispe',
    rol: ROLES.OPERACIONES,
    activo: true,
    password: DEMO_PASSWORD,
    createdAt: '2025-04-20T11:00:00.000Z',
    updatedAt: '2025-06-01T10:00:00.000Z',
  },
  {
    id: 'usr_005',
    email: 'consulta2@demo-gls.local',
    nombres: 'Jorge Ramírez Castro',
    rol: ROLES.CONSULTA,
    activo: false,
    password: DEMO_PASSWORD,
    createdAt: '2025-05-05T14:00:00.000Z',
    updatedAt: '2025-08-01T09:00:00.000Z',
  },
];
