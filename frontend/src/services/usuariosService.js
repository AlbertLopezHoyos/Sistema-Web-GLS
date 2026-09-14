import { STORAGE_KEYS } from '../constants/appConfig';
import { ROLES } from '../constants/roles';
import { getStore, setStore, generateId } from '../utils/dataStore';
import { delay } from '../utils/storage';
import { validateEmail, validatePassword, validateRequired } from '../utils/validation';
import { logAudit } from '../utils/auditHelper';

const sanitizeUser = (user) => {
  const { password: _password, ...safe } = user;
  return safe;
};

export const usuariosService = {
  async getUsuarios() {
    await delay(300);
    return getStore(STORAGE_KEYS.USUARIOS).map(sanitizeUser);
  },

  async getUsuarioById(id) {
    await delay(200);
    const user = getStore(STORAGE_KEYS.USUARIOS).find((u) => u.id === id);
    return user ? sanitizeUser(user) : null;
  },

  async createUsuario(data) {
    await delay(400);
    const errors = {};
    const nombres = validateRequired(data.nombres, 'Nombres');
    if (nombres) errors.nombres = nombres;
    const email = validateEmail(data.email);
    if (email) errors.email = email;
    const pass = validatePassword(data.password);
    if (pass) errors.password = pass;
    if (!Object.values(ROLES).includes(data.rol)) errors.rol = 'Rol inválido';
    if (Object.keys(errors).length) throw { errors };

    const usuarios = getStore(STORAGE_KEYS.USUARIOS);
    if (usuarios.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
      throw { errors: { email: 'El correo ya está registrado' } };
    }

    const now = new Date().toISOString();
    const user = {
      id: generateId('usr'),
      email: data.email.trim().toLowerCase(),
      nombres: data.nombres.trim(),
      rol: data.rol,
      activo: true,
      password: data.password,
      createdAt: now,
      updatedAt: now,
    };
    usuarios.push(user);
    setStore(STORAGE_KEYS.USUARIOS, usuarios);
    logAudit({ accion: 'registro_usuario', modulo: 'Usuarios', descripcion: `Usuario ${user.email} creado` });
    return sanitizeUser(user);
  },

  async updateUsuario(id, data) {
    await delay(400);
    const usuarios = getStore(STORAGE_KEYS.USUARIOS);
    const idx = usuarios.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('Usuario no encontrado');

    const errors = {};
    const nombres = validateRequired(data.nombres, 'Nombres');
    if (nombres) errors.nombres = nombres;
    if (!Object.values(ROLES).includes(data.rol)) errors.rol = 'Rol inválido';
    if (Object.keys(errors).length) throw { errors };

    usuarios[idx] = {
      ...usuarios[idx],
      nombres: data.nombres.trim(),
      rol: data.rol,
      activo: data.activo !== undefined ? data.activo : usuarios[idx].activo,
      updatedAt: new Date().toISOString(),
    };
    setStore(STORAGE_KEYS.USUARIOS, usuarios);
    logAudit({ accion: 'usuario_modificado', modulo: 'Usuarios', descripcion: `Usuario ${usuarios[idx].email} actualizado` });
    return sanitizeUser(usuarios[idx]);
  },

  async toggleActivo(id) {
    await delay(300);
    const usuarios = getStore(STORAGE_KEYS.USUARIOS);
    const idx = usuarios.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('Usuario no encontrado');
    usuarios[idx].activo = !usuarios[idx].activo;
    usuarios[idx].updatedAt = new Date().toISOString();
    setStore(STORAGE_KEYS.USUARIOS, usuarios);
    logAudit({
      accion: 'usuario_modificado',
      modulo: 'Usuarios',
      descripcion: `Usuario ${usuarios[idx].email} ${usuarios[idx].activo ? 'activado' : 'desactivado'}`,
    });
    return sanitizeUser(usuarios[idx]);
  },
};
