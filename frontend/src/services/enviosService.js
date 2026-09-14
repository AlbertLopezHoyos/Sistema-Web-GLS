import { STORAGE_KEYS, AREA_DEFAULT } from '../constants/appConfig';
import { INITIAL_STATUS, ACTIVE_STATUSES } from '../constants/shipmentStatus';
import { getStore, setStore } from '../utils/dataStore';
import { delay } from '../utils/storage';
import { formatCodigoEnvio } from '../utils/codigoEnvio';
import { calcularCotizacion } from '../utils/cotizacionEnvio';
import { normalizeText } from '../utils/formatters';
import { validateDocumento, validateTelefono, validateRequired, validatePositiveNumber } from '../utils/validation';
import { clientesService } from './clientesService';
import { logAudit } from '../utils/auditHelper';

const nextCodigo = () => {
  const counter = getStore(STORAGE_KEYS.COUNTER);
  const year = new Date().getFullYear();
  if (counter.year !== year) {
    counter.year = year;
    counter.current = 0;
  }
  counter.current += 1;
  setStore(STORAGE_KEYS.COUNTER, counter);
  return formatCodigoEnvio(year, counter.current);
};

const validateEnvio = (data) => {
  const errors = {};
  ['origen', 'destino', 'tipoCarga', 'descripcion'].forEach((f) => {
    const err = validateRequired(data[f], f);
    if (err) errors[f] = err;
  });
  const peso = validatePositiveNumber(data.peso, 'Peso');
  if (peso) errors.peso = peso;
  ['largo', 'ancho', 'alto'].forEach((d) => {
    const err = validatePositiveNumber(data.dimensiones?.[d], d);
    if (err) errors[d] = err;
  });

  const validateParty = (party, prefix) => {
    if (!party) return;
    const n = validateRequired(party.nombres, `${prefix} nombres`);
    if (n) errors[`${prefix}_nombres`] = n;
    const doc = validateDocumento(party.documento);
    if (doc) errors[`${prefix}_documento`] = doc;
    const tel = validateTelefono(party.telefono);
    if (tel) errors[`${prefix}_telefono`] = tel;
    const dir = validateRequired(party.direccion, `${prefix} dirección`);
    if (dir) errors[`${prefix}_direccion`] = dir;
  };

  validateParty(data.remitente, 'remitente');
  validateParty(data.destinatario, 'destinatario');
  return errors;
};

export const validateEnvioForm = validateEnvio;

export const enviosService = {
  async getEnvios(filters = {}) {
    await delay(300);
    let envios = getStore(STORAGE_KEYS.ENVIOS);

    if (filters.estado && filters.estado !== 'Todos') {
      envios = envios.filter((e) => e.estadoActual === filters.estado);
    }
    if (filters.codigo) {
      const q = filters.codigo.toUpperCase();
      envios = envios.filter((e) => e.codigoEnvio.includes(q));
    }
    if (filters.cliente) {
      const q = normalizeText(filters.cliente);
      envios = envios.filter(
        (e) =>
          normalizeText(e.clienteAsociado?.nombres).includes(q) ||
          normalizeText(e.clienteAsociado?.documento).includes(q) ||
          normalizeText(e.remitente?.nombres).includes(q) ||
          normalizeText(e.destinatario?.nombres).includes(q)
      );
    }
    if (filters.desde) {
      envios = envios.filter((e) => new Date(e.fechaRegistro) >= new Date(filters.desde));
    }
    if (filters.hasta) {
      const hasta = new Date(filters.hasta);
      hasta.setHours(23, 59, 59, 999);
      envios = envios.filter((e) => new Date(e.fechaRegistro) <= hasta);
    }

    return envios.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro));
  },

  async getEnvioById(codigo) {
    await delay(200);
    const envios = getStore(STORAGE_KEYS.ENVIOS);
    return envios.find((e) => e.codigoEnvio === codigo) || null;
  },

  async getEnviosActivos() {
    await delay(300);
    const envios = getStore(STORAGE_KEYS.ENVIOS);
    return envios.filter((e) => ACTIVE_STATUSES.includes(e.estadoActual));
  },

  async createEnvio(data, registradoPor) {
    await delay(500);
    const errors = validateEnvio(data);
    if (Object.keys(errors).length) throw { errors };

    const codigoEnvio = nextCodigo();
    const now = new Date().toISOString();

    let clienteAsociado = null;
    if (data.clienteDocumento) {
      const cliente = await clientesService.getClienteByDocumento(data.clienteDocumento);
      if (cliente) {
        clienteAsociado = {
          clienteId: cliente.id,
          documento: cliente.documento,
          nombres: cliente.nombres,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          empresa: cliente.empresa,
        };
      }
    }

    let cotizacionEstimada = null;
    if (data.cotizacion && (data.cotizacion.distanciaKm || data.cotizacion.tarifaPorKg)) {
      cotizacionEstimada = calcularCotizacion({
        peso: data.peso,
        largo: data.dimensiones.largo,
        ancho: data.dimensiones.ancho,
        alto: data.dimensiones.alto,
        unidadMedida: data.dimensiones.unidadMedida,
        ...data.cotizacion,
      });
    }

    const envio = {
      codigoEnvio,
      remitente: { ...data.remitente },
      destinatario: { ...data.destinatario },
      origen: data.origen.trim(),
      destino: data.destino.trim(),
      tipoCarga: data.tipoCarga.trim(),
      descripcion: data.descripcion.trim(),
      peso: Number(data.peso),
      dimensiones: { ...data.dimensiones },
      observacion: data.observacion?.trim() || 'Sin observaciones',
      cotizacionEstimada,
      clienteAsociado,
      estadoActual: INITIAL_STATUS,
      fechaRegistro: now,
      fechaUltimaActualizacion: now,
    };

    const envios = getStore(STORAGE_KEYS.ENVIOS);
    envios.push(envio);
    setStore(STORAGE_KEYS.ENVIOS, envios);

    const historial = getStore(STORAGE_KEYS.HISTORIAL);
    historial.push({
      id: `${codigoEnvio}__${now}`,
      codigoEnvio,
      estado: INITIAL_STATUS,
      fechaActualizacion: now,
      observacion: 'Registro inicial del envío',
      responsable: AREA_DEFAULT,
      evidenciaReferencia: '',
      evidenciaDetalle: '',
      registradoPor: registradoPor || 'sistema',
    });
    setStore(STORAGE_KEYS.HISTORIAL, historial);

    logAudit({
      accion: 'envio_creado',
      modulo: 'Envíos',
      descripcion: `Envío ${codigoEnvio} registrado`,
    });

    return envio;
  },

  async getDashboardStats() {
    await delay(300);
    const envios = getStore(STORAGE_KEYS.ENVIOS);
    const porEstado = {};
    envios.forEach((e) => {
      porEstado[e.estadoActual] = (porEstado[e.estadoActual] || 0) + 1;
    });
    return {
      total: envios.length,
      porEstado,
      entregados: porEstado['Entregado'] || 0,
      pendientes: (porEstado['Registrado'] || 0) + (porEstado['En almacén'] || 0) + (porEstado['En tránsito'] || 0) + (porEstado['En reparto'] || 0),
      observados: porEstado['Observado'] || 0,
      ultimos: envios.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro)).slice(0, 5),
    };
  },
};
