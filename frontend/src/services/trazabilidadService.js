import { STORAGE_KEYS, AREA_DEFAULT } from '../constants/appConfig';
import { SHIPMENT_STATUSES } from '../constants/shipmentStatus';
import { getStore, setStore } from '../utils/dataStore';
import { delay } from '../utils/storage';
import { validateRequired, validateReceptorDocumento } from '../utils/validation';

export const trazabilidadService = {
  async getHistorialByEnvio(codigo) {
    await delay(300);
    const historial = getStore(STORAGE_KEYS.HISTORIAL);
    return historial
      .filter((h) => h.codigoEnvio === codigo)
      .sort((a, b) => new Date(a.fechaActualizacion) - new Date(b.fechaActualizacion));
  },

  async getHistorialGeneral(filters = {}) {
    await delay(300);
    const historial = getStore(STORAGE_KEYS.HISTORIAL);
    const envios = getStore(STORAGE_KEYS.ENVIOS);
    const envioMap = Object.fromEntries(envios.map((e) => [e.codigoEnvio, e]));

    let items = historial.map((h) => {
      const envio = envioMap[h.codigoEnvio];
      return {
        ...h,
        cliente: envio?.clienteAsociado?.nombres || envio?.remitente?.nombres || '—',
        origen: envio?.origen || '—',
        destino: envio?.destino || '—',
      };
    });

    if (filters.estado && filters.estado !== 'Todos') {
      items = items.filter((h) => h.estado === filters.estado);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (h) =>
          h.codigoEnvio.toLowerCase().includes(q) ||
          h.cliente.toLowerCase().includes(q) ||
          h.observacion.toLowerCase().includes(q)
      );
    }
    if (filters.desde) {
      items = items.filter((h) => new Date(h.fechaActualizacion) >= new Date(filters.desde));
    }
    if (filters.hasta) {
      const hasta = new Date(filters.hasta);
      hasta.setHours(23, 59, 59, 999);
      items = items.filter((h) => new Date(h.fechaActualizacion) <= hasta);
    }

    return items.sort((a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion));
  },

  async actualizarEstado(codigo, data, registradoPor) {
    await delay(400);
    const errors = {};

    if (!SHIPMENT_STATUSES.includes(data.estado)) {
      errors.estado = 'Estado inválido';
    }
    const obs = validateRequired(data.observacion, 'Observación');
    if (obs) errors.observacion = obs;
    else if (data.observacion.trim().length < 3) {
      errors.observacion = 'Mínimo 3 caracteres';
    }

    if (data.estado === 'Entregado') {
      const ref = validateRequired(data.evidenciaReferencia, 'Referencia de evidencia');
      if (ref) errors.evidenciaReferencia = ref;
      else if (data.evidenciaReferencia.trim().length < 4) {
        errors.evidenciaReferencia = 'Mínimo 4 caracteres';
      }
      const recNom = validateRequired(data.receptorNombre, 'Nombre del receptor');
      if (recNom) errors.receptorNombre = recNom;
      else if (data.receptorNombre.trim().length < 2) {
        errors.receptorNombre = 'Mínimo 2 caracteres';
      }
      const recDoc = validateReceptorDocumento(data.receptorDocumento);
      if (recDoc) errors.receptorDocumento = recDoc;
    }

    if (Object.keys(errors).length) throw { errors };

    const envios = getStore(STORAGE_KEYS.ENVIOS);
    const idx = envios.findIndex((e) => e.codigoEnvio === codigo);
    if (idx === -1) throw new Error('Envío no encontrado');

    const now = new Date().toISOString();
    envios[idx].estadoActual = data.estado;
    envios[idx].fechaUltimaActualizacion = now;

    if (data.estado === 'Entregado') {
      envios[idx].evidenciaEntrega = {
        referencia: data.evidenciaReferencia.trim(),
        detalle: (data.evidenciaDetalle || '').trim(),
        receptorNombre: data.receptorNombre.trim(),
        receptorDocumento: data.receptorDocumento.trim(),
        fecha: now,
        registradoPor: registradoPor || 'sistema',
      };
    }

    setStore(STORAGE_KEYS.ENVIOS, envios);

    const evento = {
      id: `${codigo}__${now}`,
      codigoEnvio: codigo,
      estado: data.estado,
      fechaActualizacion: now,
      observacion: data.observacion.trim(),
      responsable: AREA_DEFAULT,
      evidenciaReferencia: data.evidenciaReferencia || '',
      evidenciaDetalle: data.evidenciaDetalle || '',
      receptorNombre: data.receptorNombre || '',
      receptorDocumento: data.receptorDocumento || '',
      registradoPor: registradoPor || 'sistema',
    };

    const historial = getStore(STORAGE_KEYS.HISTORIAL);
    historial.push(evento);
    setStore(STORAGE_KEYS.HISTORIAL, historial);

    return { envio: envios[idx], evento };
  },

  getEstadosPermitidos() {
    return SHIPMENT_STATUSES;
  },
};
