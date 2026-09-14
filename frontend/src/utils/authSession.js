import { STORAGE_KEYS } from '../constants/appConfig';

const SESSION_KEY = STORAGE_KEYS.SESSION;

const parse = (raw) => {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Gestión centralizada de sesión de autenticación.
 * remember=true  → localStorage (persiste al cerrar navegador)
 * remember=false → sessionStorage (solo mientras la pestaña esté abierta)
 */
export const authSession = {
  clear() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  },

  get() {
    const persistent = parse(localStorage.getItem(SESSION_KEY));
    if (persistent) return persistent;
    return parse(sessionStorage.getItem(SESSION_KEY));
  },

  save(session, remember = false) {
    this.clear();
    const data = JSON.stringify({ ...session, remember });
    if (remember) {
      localStorage.setItem(SESSION_KEY, data);
    } else {
      sessionStorage.setItem(SESSION_KEY, data);
    }
  },

  update(partial) {
    const current = this.get();
    if (!current) return;
    const remember = current.remember === true;
    this.save({ ...current, ...partial }, remember);
  },

  getUser() {
    return this.get()?.user ?? null;
  },
};
