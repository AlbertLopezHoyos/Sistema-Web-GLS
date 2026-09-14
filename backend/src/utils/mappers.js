export const mapUsuario = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    nombres: row.nombres,
    rol: row.rol_codigo || row.rol,
    activo: Boolean(row.activo),
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    updatedAt: row.updated_at?.toISOString?.() || row.updated_at,
  };
};

export const mapCliente = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    nombres: row.nombres,
    documento: row.documento,
    telefono: row.telefono,
    direccion: row.direccion,
    empresa: row.empresa || '',
    fechaAlta: row.created_at?.toISOString?.() || row.created_at,
    fechaActualizacion: row.updated_at?.toISOString?.() || row.updated_at,
  };
};

export const mapCotizacion = (row) => {
  if (!row) return null;
  return {
    moneda: row.moneda,
    volumenM3: Number(row.volumen_m3),
    pesoVolumetricoKg: Number(row.peso_volumetrico_kg),
    pesoCobradoKg: Number(row.peso_cobrado_kg),
    desglose: {
      costoPorPeso: Number(row.costo_por_peso),
      costoPorVolumen: Number(row.costo_por_volumen),
      costoPorDistancia: Number(row.costo_por_distancia),
      subtotal: Number(row.subtotal),
      seguroPorcentaje: Number(row.seguro_porcentaje),
      seguroMonto: Number(row.seguro_monto),
      totalEstimado: Number(row.total_estimado),
    },
    nota: row.nota,
  };
};

export const mapEnvio = (row, cotizacionRow = null) => {
  if (!row) return null;
  const envio = {
    codigoEnvio: row.codigo_envio,
    estadoActual: row.estado_nombre,
    observacion: row.observacion,
    fechaRegistro: row.fecha_registro?.toISOString?.() || row.fecha_registro,
    fechaUltimaActualizacion: row.fecha_ultima_actualizacion?.toISOString?.() || row.fecha_ultima_actualizacion,
    remitente: {
      nombres: row.remitente_nombres,
      documento: row.remitente_documento,
      telefono: row.remitente_telefono,
      direccion: row.remitente_direccion,
    },
    destinatario: {
      nombres: row.destinatario_nombres,
      documento: row.destinatario_documento,
      telefono: row.destinatario_telefono,
      direccion: row.destinatario_direccion,
    },
    origen: row.origen,
    destino: row.destino,
    tipoCarga: row.tipo_carga,
    descripcion: row.descripcion,
    peso: Number(row.peso),
    dimensiones: {
      largo: Number(row.dim_largo),
      ancho: Number(row.dim_ancho),
      alto: Number(row.dim_alto),
      unidadMedida: row.dim_unidad,
    },
    clienteAsociado: row.cliente_id
      ? {
          clienteId: row.cliente_id,
          documento: row.cliente_documento,
          nombres: row.cliente_nombres,
          telefono: row.cliente_telefono,
          direccion: row.cliente_direccion,
          empresa: row.cliente_empresa || '',
        }
      : null,
    cotizacionEstimada: mapCotizacion(cotizacionRow),
  };

  if (row.evidencia_referencia) {
    envio.evidenciaEntrega = {
      referencia: row.evidencia_referencia,
      detalle: row.evidencia_detalle || '',
      receptorNombre: row.evidencia_receptor_nombre,
      receptorDocumento: row.evidencia_receptor_documento,
      fecha: row.evidencia_fecha?.toISOString?.() || row.evidencia_fecha,
      registradoPor: row.evidencia_registrado_por,
    };
  }

  return envio;
};

export const mapHistorial = (row) => ({
  id: row.id,
  codigoEnvio: row.codigo_envio,
  estado: row.estado_nombre,
  fechaActualizacion: row.fecha_actualizacion?.toISOString?.() || row.fecha_actualizacion,
  observacion: row.observacion,
  responsable: row.responsable,
  evidenciaReferencia: row.evidencia_referencia || '',
  evidenciaDetalle: row.evidencia_detalle || '',
  receptorNombre: row.receptor_nombre || '',
  receptorDocumento: row.receptor_documento || '',
  registradoPor: row.registrado_por,
});

export const mapUbicacion = (row) => ({
  id: row.id,
  codigoEnvio: row.codigo_envio,
  direccion: row.direccion,
  latitud: String(row.latitud),
  longitud: String(row.longitud),
  observacion: row.observacion || '',
  fechaRegistro: row.fecha_registro?.toISOString?.() || row.fecha_registro,
  responsable: row.responsable,
  registradoPor: row.registrado_por,
});

export const mapAuditoria = (row) => ({
  id: row.id,
  usuario: row.usuario_email || row.usuario || '',
  rol: row.rol || '',
  accion: row.accion,
  fecha: row.fecha?.toISOString?.() || row.fecha,
  modulo: row.modulo,
  descripcion: row.descripcion,
});
