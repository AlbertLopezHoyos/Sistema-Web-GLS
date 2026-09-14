import { STORAGE_KEYS } from '../constants/appConfig';
import { getStore, setStore } from '../utils/dataStore';
import { storage, delay } from '../utils/storage';
import { validateEmail, validatePassword } from '../utils/validation';

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
      throw new Error('Credenciales incorrectas');
    }
    if (!user.activo) {
      throw new Error('Usuario inactivo. Contacte al administrador.');
    }

    const session = {
      user: sanitizeUser(user),
      loginAt: new Date().toISOString(),
      remember,
    };

    storage.set(STORAGE_KEYS.SESSION, session);
    return session;
  },

  async logout() {
    await delay(200);
    storage.remove(STORAGE_KEYS.SESSION);
  },

  getSession() {
    return storage.get(STORAGE_KEYS.SESSION);
  },

  async getCurrentUser() {
    await delay(100);
    const session = this.getSession();
    if (!session?.user) return null;
    const usuarios = getStore(STORAGE_KEYS.USUARIOS);
    const fresh = usuarios.find((u) => u.id === session.user.id);
    if (!fresh || !fresh.activo) {
      storage.remove(STORAGE_KEYS.SESSION);
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
    const session = this.getSession();
    if (session?.user?.id === userId) {
      session.user = sanitizeUser(usuarios[idx]);
      storage.set(STORAGE_KEYS.SESSION, session);
    }
    return sanitizeUser(usuarios[idx]);
  },
};
