import { authSession } from './authSession';
import { auditoriaService } from '../services/auditoriaService';
import { ROLE_LABELS } from '../constants/roles';

export const logAudit = ({ accion, modulo, descripcion, usuario, rol }) => {
  const session = authSession.get();
  auditoriaService.registrarEvento({
    usuario: usuario || session?.user?.email || 'sistema',
    rol: rol || ROLE_LABELS[session?.user?.rol] || session?.user?.rol || '—',
    accion,
    modulo,
    descripcion,
  });
};
