import { mapCliente } from '../utils/mappers.js';
import { validateDocumento, validateTelefono, validateRequired } from '../utils/validation.js';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors.js';
import { auditService } from './auditService.js';
import { clientesRepository } from '../repositories/clientesRepository.js';

const validateCliente = (data) => {
  const errors = {};
  const nombres = validateRequired(data.nombres, 'Razón social / nombres');
  if (nombres) errors.nombres = nombres;
  const doc = validateDocumento(data.documento);
  if (doc) errors.documento = doc;
  const tel = validateTelefono(data.telefono);
  if (tel) errors.telefono = tel;
  const dir = validateRequired(data.direccion, 'Dirección');
  if (dir) errors.direccion = dir;
  return errors;
};

export const clientesService = {
  async getAll() {
    const rows = await clientesRepository.findAll();
    return rows.map(mapCliente);
  },

  async getById(id) {
    const row = await clientesRepository.findById(id);
    return mapCliente(row);
  },

  async getByDocumento(documento) {
    const row = await clientesRepository.findByDocumento(documento);
    return mapCliente(row);
  },

  async search(queryStr) {
    if (!queryStr?.trim()) return this.getAll();
    const rows = await clientesRepository.search(queryStr);
    return rows.map(mapCliente);
  },

  async create(data, actor) {
    const errors = validateCliente(data);
    if (Object.keys(errors).length) throw new ValidationError(errors);

    const doc = data.documento.trim();
    const existing = await this.getByDocumento(doc);
    if (existing) throw new ValidationError({ documento: 'Ya existe un cliente con este documento' });

    const now = new Date();
    const id = `cli_${doc.replace(/[^0-9A-Za-z]/g, '_')}`;
    try {
      await clientesRepository.insert([
        id, data.nombres.trim(), doc, data.telefono.trim(), data.direccion.trim(),
        (data.empresa || '').trim(), now, now,
      ]);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') throw new ConflictError('Cliente duplicado');
      throw err;
    }

    await auditService.registrar({
      accion: 'cliente_creado',
      modulo: 'Clientes',
      descripcion: `Cliente ${id} creado`,
      usuarioId: actor?.id,
      usuarioEmail: actor?.email || '',
      rol: actor?.rol || '',
    });

    return this.getById(id);
  },

  async update(id, data, actor) {
    const errors = validateCliente(data);
    if (Object.keys(errors).length) throw new ValidationError(errors);

    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Cliente no encontrado');

    const now = new Date();
    await clientesRepository.update(id, [
      data.nombres.trim(), data.telefono.trim(), data.direccion.trim(), (data.empresa || '').trim(), now, id,
    ]);

    await auditService.registrar({
      accion: 'cliente_modificado',
      modulo: 'Clientes',
      descripcion: `Cliente ${id} actualizado`,
      usuarioId: actor?.id,
      usuarioEmail: actor?.email || '',
      rol: actor?.rol || '',
    });

    return this.getById(id);
  },
};
