import {
  ClipboardList,
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Ban,
} from 'lucide-react';

/** Iconos de estado (trazabilidad, consulta, actualizar estado) */
export const STATUS_ICONS = {
  Registrado: ClipboardList,
  'En almacén': Package,
  'En tránsito': Truck,
  'En reparto': MapPin,
  Entregado: CheckCircle2,
  Observado: AlertTriangle,
  Cancelado: Ban,
};
