-- Sistema Web GLS — Esquema relacional MySQL 8+
-- Base de datos: sistema_web_gls

CREATE DATABASE IF NOT EXISTS sistema_web_gls
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sistema_web_gls;

-- ---------------------------------------------------------------------------
-- Catálogos
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(20) NOT NULL,
  etiqueta VARCHAR(50) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_roles_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS estados_envio (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  es_activo TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_estados_envio_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Usuarios
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS usuarios (
  id VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  nombres VARCHAR(255) NOT NULL,
  rol_id INT UNSIGNED NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_email (email),
  KEY idx_usuarios_rol_id (rol_id),
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Clientes
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS clientes (
  id VARCHAR(50) NOT NULL,
  nombres VARCHAR(255) NOT NULL,
  documento VARCHAR(20) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  direccion TEXT NOT NULL,
  empresa VARCHAR(255) NOT NULL DEFAULT '',
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_clientes_documento (documento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Secuencia transaccional de códigos ENV-AAAA-NNNN
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS secuencias_envio (
  anio SMALLINT UNSIGNED NOT NULL,
  contador INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (anio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Envíos (snapshot de remitente/destinatario/cliente)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS envios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo_envio VARCHAR(20) NOT NULL,
  cliente_id VARCHAR(50) NULL,
  estado_actual_id INT UNSIGNED NOT NULL,
  remitente_nombres VARCHAR(255) NOT NULL,
  remitente_documento VARCHAR(20) NOT NULL,
  remitente_telefono VARCHAR(30) NOT NULL,
  remitente_direccion TEXT NOT NULL,
  destinatario_nombres VARCHAR(255) NOT NULL,
  destinatario_documento VARCHAR(20) NOT NULL,
  destinatario_telefono VARCHAR(30) NOT NULL,
  destinatario_direccion TEXT NOT NULL,
  cliente_documento VARCHAR(20) NULL,
  cliente_nombres VARCHAR(255) NULL,
  cliente_telefono VARCHAR(30) NULL,
  cliente_direccion TEXT NULL,
  cliente_empresa VARCHAR(255) NULL,
  origen VARCHAR(255) NOT NULL,
  destino VARCHAR(255) NOT NULL,
  tipo_carga VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  peso DECIMAL(10,2) NOT NULL,
  dim_largo DECIMAL(10,2) NOT NULL,
  dim_ancho DECIMAL(10,2) NOT NULL,
  dim_alto DECIMAL(10,2) NOT NULL,
  dim_unidad VARCHAR(20) NOT NULL DEFAULT 'cm',
  observacion TEXT NOT NULL,
  evidencia_referencia VARCHAR(255) NULL,
  evidencia_detalle TEXT NULL,
  evidencia_receptor_nombre VARCHAR(255) NULL,
  evidencia_receptor_documento VARCHAR(20) NULL,
  evidencia_fecha DATETIME(3) NULL,
  evidencia_registrado_por VARCHAR(255) NULL,
  fecha_registro DATETIME(3) NOT NULL,
  fecha_ultima_actualizacion DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_envios_codigo (codigo_envio),
  KEY idx_envios_estado (estado_actual_id),
  KEY idx_envios_cliente (cliente_id),
  KEY idx_envios_fecha_registro (fecha_registro),
  CONSTRAINT fk_envios_cliente FOREIGN KEY (cliente_id) REFERENCES clientes (id) ON DELETE SET NULL,
  CONSTRAINT fk_envios_estado FOREIGN KEY (estado_actual_id) REFERENCES estados_envio (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Cotización estimada (0..1 por envío)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cotizaciones_envio (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  envio_id BIGINT UNSIGNED NOT NULL,
  moneda VARCHAR(10) NOT NULL DEFAULT 'PEN',
  distancia_km DECIMAL(10,2) NOT NULL DEFAULT 0,
  tarifa_por_kg DECIMAL(10,4) NOT NULL,
  tarifa_por_m3 DECIMAL(10,4) NOT NULL,
  tarifa_por_km DECIMAL(10,4) NOT NULL,
  seguro_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 0,
  volumen_m3 DECIMAL(12,4) NOT NULL,
  peso_volumetrico_kg DECIMAL(12,2) NOT NULL,
  peso_cobrado_kg DECIMAL(12,2) NOT NULL,
  costo_por_peso DECIMAL(12,2) NOT NULL,
  costo_por_volumen DECIMAL(12,2) NOT NULL,
  costo_por_distancia DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  seguro_monto DECIMAL(12,2) NOT NULL,
  total_estimado DECIMAL(12,2) NOT NULL,
  nota TEXT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_cotizaciones_envio (envio_id),
  CONSTRAINT fk_cotizaciones_envio FOREIGN KEY (envio_id) REFERENCES envios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Historial de envíos
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS historial_envios (
  id VARCHAR(100) NOT NULL,
  envio_id BIGINT UNSIGNED NOT NULL,
  estado_id INT UNSIGNED NOT NULL,
  fecha_actualizacion DATETIME(3) NOT NULL,
  observacion TEXT NOT NULL,
  responsable VARCHAR(100) NOT NULL DEFAULT 'Área de operaciones',
  evidencia_referencia VARCHAR(255) NOT NULL DEFAULT '',
  evidencia_detalle TEXT NOT NULL DEFAULT '',
  receptor_nombre VARCHAR(255) NOT NULL DEFAULT '',
  receptor_documento VARCHAR(20) NOT NULL DEFAULT '',
  registrado_por VARCHAR(255) NOT NULL,
  usuario_id VARCHAR(50) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_historial_envio (envio_id),
  KEY idx_historial_fecha (fecha_actualizacion),
  KEY idx_historial_estado (estado_id),
  CONSTRAINT fk_historial_envio FOREIGN KEY (envio_id) REFERENCES envios (id) ON DELETE CASCADE,
  CONSTRAINT fk_historial_estado FOREIGN KEY (estado_id) REFERENCES estados_envio (id),
  CONSTRAINT fk_historial_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Ubicaciones de control referencial
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ubicaciones_envio (
  id VARCHAR(100) NOT NULL,
  envio_id BIGINT UNSIGNED NOT NULL,
  direccion TEXT NOT NULL,
  latitud DECIMAL(10,7) NOT NULL,
  longitud DECIMAL(10,7) NOT NULL,
  observacion TEXT NOT NULL DEFAULT '',
  fecha_registro DATETIME(3) NOT NULL,
  responsable VARCHAR(100) NOT NULL DEFAULT 'Área de operaciones',
  registrado_por VARCHAR(255) NOT NULL,
  usuario_id VARCHAR(50) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_ubicaciones_envio (envio_id),
  CONSTRAINT fk_ubicaciones_envio FOREIGN KEY (envio_id) REFERENCES envios (id) ON DELETE CASCADE,
  CONSTRAINT fk_ubicaciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Auditoría
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS auditoria (
  id VARCHAR(100) NOT NULL,
  usuario_id VARCHAR(50) NULL,
  usuario_email VARCHAR(255) NOT NULL DEFAULT '',
  rol VARCHAR(50) NOT NULL DEFAULT '',
  accion VARCHAR(50) NOT NULL,
  modulo VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  ip VARCHAR(45) NULL,
  user_agent TEXT NULL,
  fecha DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_auditoria_fecha (fecha),
  KEY idx_auditoria_usuario (usuario_id),
  KEY idx_auditoria_accion (accion),
  KEY idx_auditoria_modulo (modulo),
  CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Respaldos
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS respaldos (
  id VARCHAR(50) NOT NULL,
  archivo VARCHAR(255) NOT NULL,
  fecha DATETIME(3) NOT NULL,
  estado VARCHAR(100) NOT NULL,
  tamano_bytes BIGINT UNSIGNED NULL,
  tipo VARCHAR(100) NOT NULL DEFAULT 'Exportación MySQL',
  usuario_id VARCHAR(50) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_respaldos_fecha (fecha),
  CONSTRAINT fk_respaldos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
