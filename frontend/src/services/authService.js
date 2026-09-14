import { getStore, setStore } from '../utils/dataStore';
import { authSession } from '../utils/authSession';
import { delay } from '../utils/storage';
import { validateEmail, validatePassword } from '../utils/validation';
import { logAudit } from '../utils/auditHelper';
import { STORAGE_KEYS } from '../constants/appConfig';
import { ROLE_LABELS } from '../constants/roles';

const sanitizeUser = (user) => {
  const { password: _password, ...safe } = user;
  return safe;
};

export const authService = {
  async login(email, password, remember = false) {
    await delay(400);
    const emailErr = validateEmail(email);
    if (emailErr) throw new Error(emailErr);
    const passErr = validatePassword(password);
    if (passErr) throw new Error(passErr);

    const usuarios = getStore(STORAGE_KEYS.USUARIOS);
    const user = usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user || user.password !== password) {
      logAudit({
        accion: 'login_fallido',
        modulo: 'Autenticación',
        descripcion: `Intento fallido para ${email.trim().toLowerCase()}`,
        usuario: email.trim().toLowerCase(),
        rol: '—',
      });
      throw new Error('Credenciales incorrectas');
    }
    if (!user.activo) {
      logAudit({
        accion: 'login_fallido',
        modulo: 'Autenticación',
        descripcion: 'Intento de inicio de sesión con usuario inactivo',
        usuario: user.email,
        rol: ROLE_LABELS[user.rol],
      });
      throw new Error('Usuario inactivo. Contacte al administrador.');
    }

    const session = {
      user: sanitizeUser(user),
      loginAt: new Date().toISOString(),
      remember,
    };

    authSession.save(session, remember);

    logAudit({
      accion: 'login',
      modulo: 'Autenticación',
      descripcion: 'Inicio de sesión exitoso',
      usuario: user.email,
      rol: ROLE_LABELS[user.rol],
    });

    return session;
  },

  async logout() {
    await delay(200);
    const session = authSession.get();
    if (session?.user) {
      logAudit({
        accion: 'logout',
        modulo: 'Autenticación',
        descripcion: 'Cierre de sesión',
        usuario: session.user.email,
        rol: ROLE_LABELS[session.user.rol],
      });
    }
    authSession.clear();
  },

  getSession() {
    return authSession.get();
  },

  async getCurrentUser() {
    await delay(100);
    const session = authSession.get();
    if (!session?.user) return null;
    const usuarios = getStore(STORAGE_KEYS.USUARIOS);
    const fresh = usuarios.find((u) => u.id === session.user.id);
    if (!fresh || !fresh.activo) {
      authSession.clear();
      return null;
    }
    return sanitizeUser(fresh);
  },

  async updateProfile(userId, data) {
    await delay(300);
    const usuarios = getStore(STORAGE_KEYS.USUARIOS);
    const idx = usuarios.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('Usuario no encontrado');
    usuarios[idx] = { ...usuarios[idx], ...data, updatedAt: new Date().toISOString() };
    setStore(STORAGE_KEYS.USUARIOS, usuarios);
    const session = authSession.get();
    if (session?.user?.id === userId) {
      authSession.update({ user: sanitizeUser(usuarios[idx]) });
    }
    return sanitizeUser(usuarios[idx]);
  },
};
