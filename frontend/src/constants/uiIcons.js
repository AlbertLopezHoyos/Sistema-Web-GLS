import {
  AlertCircle,
  Building2,
  Calendar,
  CalendarClock,
  ClipboardList,
  CreditCard,
  FileText,
  Hash,
  History,
  IdCard,
  MapPin,
  MessageSquare,
  Navigation,
  Package,
  Phone,
  Route,
  Scale,
  Shield,
  Truck,
  User,
  UserCheck,
  Users,
  Wallet,
  Ruler,
  Box,
  RefreshCw,
  BarChart3,
  LayoutDashboard,
  Search,
  MapPinned,
} from 'lucide-react';

const norm = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

/** Iconos por etiqueta de campo (DataFieldGrid) */
const FIELD_ICON_ENTRIES = [
  [['nombres', 'nombre', 'cliente', 'remitente', 'destinatario', 'receptor'], User],
  [['documento', 'dni', 'doc. receptor', 'doc receptor'], IdCard],
  [['telefono', 'teléfono'], Phone],
  [['direccion', 'dirección', 'ubicacion', 'ubicación'], MapPin],
  [['origen'], Navigation],
  [['destino'], MapPinned],
  [['estado'], RefreshCw],
  [['fecha', 'fecha registro', 'ultima actualización', 'última actualización'], Calendar],
  [['tipo de carga', 'tipo carga'], Box],
  [['descripcion', 'descripción'], FileText],
  [['peso'], Scale],
  [['dimensiones'], Ruler],
  [['observacion', 'observación'], MessageSquare],
  [['responsable', 'registrado por'], UserCheck],
  [['evidencia', 'referencia', 'detalle evidencia'], ClipboardList],
  [['empresa'], Building2],
  [['total estimado', 'total', 'cotizacion', 'cotización'], Wallet],
  [['nota'], AlertCircle],
  [['codigo', 'código'], Hash],
  [['ruta'], Route],
];

const fieldIconMap = new Map();
FIELD_ICON_ENTRIES.forEach(([keys, Icon]) => {
  keys.forEach((k) => fieldIconMap.set(norm(k), Icon));
});

export const getFieldIcon = (label) => fieldIconMap.get(norm(label)) || null;

/** Iconos por título de sección / tarjeta */
const SECTION_ICON_ENTRIES = [
  [['remitente'], User],
  [['destinatario', 'receptor'], UserCheck],
  [['cliente asociado', 'cliente'], Users],
  [['datos del envío', 'datos del envio', 'envío', 'envio'], Package],
  [['cotización estimada', 'cotizacion estimada'], CreditCard],
  [['evidencia de entrega', 'evidencia'], ClipboardList],
  [['registro'], CalendarClock],
  [['detalle del evento', 'evento'], History],
  [['trazabilidad', 'seguimiento'], Route],
  [['geolocalización', 'geolocalizacion', 'ubicación', 'ubicacion'], MapPin],
  [['distribución por estado', 'distribucion por estado'], BarChart3],
  [['evolución reciente', 'evolucion reciente'], BarChart3],
  [['últimos envíos', 'ultimos envios'], Truck],
  [['actividad reciente'], History],
  [['reporte', 'reportes'], FileText],
];

const sectionIconMap = new Map();
SECTION_ICON_ENTRIES.forEach(([keys, Icon]) => {
  keys.forEach((k) => sectionIconMap.set(norm(k), Icon));
});

export const getSectionIcon = (title) => sectionIconMap.get(norm(title)) || null;

/** Iconos por título de página */
const PAGE_ICON_ENTRIES = [
  [['dashboard'], LayoutDashboard],
  [['consulta de envíos', 'consulta de envios', 'envíos', 'envios'], Search],
  [['historial general', 'historial'], History],
  [['registrar envío', 'registrar envio'], Package],
  [['seguimiento', 'trazabilidad', 'seguimiento y trazabilidad'], Route],
  [['geolocalización', 'geolocalizacion'], MapPin],
  [['reportes'], BarChart3],
  [['clientes'], Users],
  [['usuarios', 'administración de usuarios'], Shield],
  [['auditoría', 'auditoria'], ClipboardList],
];

const pageIconMap = new Map();
PAGE_ICON_ENTRIES.forEach(([keys, Icon]) => {
  keys.forEach((k) => pageIconMap.set(norm(k), Icon));
});

export const getPageIcon = (title) => pageIconMap.get(norm(title)) || null;

/** Iconos por columna de tabla (label) */
const COLUMN_ICON_ENTRIES = [
  [['código', 'codigo'], Hash],
  [['cliente'], Users],
  [['origen'], Navigation],
  [['destino'], MapPinned],
  [['ruta'], Route],
  [['fecha'], Calendar],
  [['estado'], RefreshCw],
  [['acciones'], null],
];

const columnIconMap = new Map();
COLUMN_ICON_ENTRIES.forEach(([keys, Icon]) => {
  keys.forEach((k) => columnIconMap.set(norm(k), Icon));
});

export const getColumnIcon = (label) => columnIconMap.get(norm(label)) ?? null;
