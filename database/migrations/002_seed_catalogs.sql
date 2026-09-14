-- Catálogos base — idempotente

INSERT INTO roles (codigo, etiqueta) VALUES
  ('admin', 'Administrador'),
  ('operaciones', 'Operaciones'),
  ('consulta', 'Consulta')
ON DUPLICATE KEY UPDATE etiqueta = VALUES(etiqueta);

INSERT INTO estados_envio (nombre, es_activo) VALUES
  ('Registrado', 1),
  ('En almacén', 1),
  ('En tránsito', 1),
  ('En reparto', 1),
  ('Entregado', 0),
  ('Observado', 1),
  ('Cancelado', 0)
ON DUPLICATE KEY UPDATE es_activo = VALUES(es_activo);
