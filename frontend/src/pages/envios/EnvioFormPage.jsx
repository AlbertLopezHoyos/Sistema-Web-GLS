import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, Eye, Plus } from 'lucide-react';
import { clientesService } from '../../services/clientesService';
import { enviosService, validateEnvioForm } from '../../services/enviosService';
import { PageHeader } from '../../components/common/PageHeader';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Card } from '../../components/common/Card';
import { downloadComprobanteEnvio } from '../../utils/comprobanteEnvio';
import { DIMENSION_UNITS, CURRENCIES, DEFAULT_TARIFF } from '../../constants/appConfig';
import { calcularCotizacion } from '../../utils/cotizacionEnvio';
import { ROUTES } from '../../constants/routes';

const emptyParty = { nombres: '', documento: '', telefono: '', direccion: '' };
const REQUIRED_LAST_TAB = 1; // 0: Cliente, 1: Datos del envío (2 y 3 opcionales)

export const EnvioFormPage = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [errors, setErrors] = useState({});
  const [tabError, setTabError] = useState('');
  const [saving, setSaving] = useState(false);
  const [registeredEnvio, setRegisteredEnvio] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [cotizacionPreview, setCotizacionPreview] = useState(null);

  const [form, setForm] = useState({
    clienteDocumento: '',
    remitente: { ...emptyParty },
    destinatario: { ...emptyParty },
    origen: '', destino: '', tipoCarga: '', descripcion: '',
    peso: '', dimensiones: { largo: '', ancho: '', alto: '', unidadMedida: 'cm' },
    cotizacion: { moneda: 'PEN', distanciaKm: '', seguroPorcentaje: 0, tarifaPorKg: DEFAULT_TARIFF.tarifaPorKg, tarifaPorM3: DEFAULT_TARIFF.tarifaPorM3, tarifaPorKm: DEFAULT_TARIFF.tarifaPorKm },
    observacion: '',
  });

  useEffect(() => {
    clientesService.getClientes().then(setClientes);
  }, []);

  const tabs = ['Cliente', 'Datos del envío', 'Cotización estimada', 'Observaciones'];

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const handleParty = (party, field, value) => setForm((p) => ({ ...p, [party]: { ...p[party], [field]: value } }));
  const handleDim = (field, value) => setForm((p) => ({ ...p, dimensiones: { ...p.dimensiones, [field]: value } }));
  const handleCot = (field, value) => setForm((p) => ({ ...p, cotizacion: { ...p.cotizacion, [field]: value } }));

  const handleClienteSelect = async (doc) => {
    handleChange('clienteDocumento', doc);
    if (doc) {
      const c = await clientesService.getClienteByDocumento(doc);
      if (c) {
        setForm((p) => ({
          ...p,
          remitente: { nombres: c.nombres, documento: c.documento, telefono: c.telefono, direccion: c.direccion },
        }));
      }
    }
  };

  const buildPayload = () => ({
    ...form,
    peso: Number(form.peso),
    dimensiones: {
      ...form.dimensiones,
      largo: Number(form.dimensiones.largo),
      ancho: Number(form.dimensiones.ancho),
      alto: Number(form.dimensiones.alto),
    },
  });

  const isPartyField = (key) => key.startsWith('remitente') || key.startsWith('destinatario');

  const validateRequiredTabsUpTo = (upToTab) => {
    const allErrors = validateEnvioForm(buildPayload());
    const tabErrors = {};
    for (let i = 0; i <= upToTab; i++) {
      Object.keys(allErrors).forEach((key) => {
        if (i === 0 && isPartyField(key)) tabErrors[key] = allErrors[key];
        if (i === 1 && !isPartyField(key)) tabErrors[key] = allErrors[key];
      });
    }
    return tabErrors;
  };

  const getFirstErrorTab = (tabErrors) => {
    if (Object.keys(tabErrors).some(isPartyField)) return 0;
    if (Object.keys(tabErrors).length) return 1;
    return null;
  };

  const validateBeforeTab = (targetIndex) => {
    if (targetIndex <= activeTab) return { valid: true, errors: {} };
    const lastRequired = Math.min(targetIndex - 1, REQUIRED_LAST_TAB);
    const errors = validateRequiredTabsUpTo(lastRequired);
    return { valid: Object.keys(errors).length === 0, errors };
  };

  const handleTabChange = (targetIndex) => {
    if (targetIndex === activeTab) return;

    if (targetIndex < activeTab) {
      setTabError('');
      setActiveTab(targetIndex);
      return;
    }

    const { valid, errors } = validateBeforeTab(targetIndex);
    if (!valid) {
      setErrors(errors);
      setTabError('Complete los campos obligatorios antes de continuar.');
      return;
    }

    setTabError('');
    setErrors({});
    setActiveTab(targetIndex);
  };

  const handleNextTab = () => handleTabChange(activeTab + 1);

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    setTabError('');
    const allErrors = validateRequiredTabsUpTo(REQUIRED_LAST_TAB);
    if (Object.keys(allErrors).length) {
      setErrors(allErrors);
      setTabError('Revise los campos obligatorios en todas las secciones.');
      const firstTab = getFirstErrorTab(allErrors);
      if (firstTab !== null) setActiveTab(firstTab);
      return;
    }
    setConfirmOpen(true);
  };

  const calcPreview = () => {
    if (form.peso && form.dimensiones.largo) {
      setCotizacionPreview(calcularCotizacion({
        peso: form.peso,
        largo: form.dimensiones.largo,
        ancho: form.dimensiones.ancho,
        alto: form.dimensiones.alto,
        unidadMedida: form.dimensiones.unidadMedida,
        ...form.cotizacion,
      }));
    }
  };

  const resetForm = () => {
    setForm({
      clienteDocumento: '',
      remitente: { ...emptyParty },
      destinatario: { ...emptyParty },
      origen: '', destino: '', tipoCarga: '', descripcion: '',
      peso: '', dimensiones: { largo: '', ancho: '', alto: '', unidadMedida: 'cm' },
      cotizacion: { moneda: 'PEN', distanciaKm: '', seguroPorcentaje: 0, tarifaPorKg: DEFAULT_TARIFF.tarifaPorKg, tarifaPorM3: DEFAULT_TARIFF.tarifaPorM3, tarifaPorKm: DEFAULT_TARIFF.tarifaPorKm },
      observacion: '',
    });
    setActiveTab(0);
    setErrors({});
    setTabError('');
    setCotizacionPreview(null);
    setRegisteredEnvio(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors({});
    try {
      const envio = await enviosService.createEnvio(buildPayload());
      setRegisteredEnvio(envio);
    } catch (err) {
      if (err.errors) setErrors(err.errors);
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  const handleDownloadComprobante = async () => {
    if (!registeredEnvio) return;
    setDownloading(true);
    try {
      await downloadComprobanteEnvio(registeredEnvio);
    } finally {
      setDownloading(false);
    }
  };

  if (registeredEnvio) {
    return (
      <div className="page">
        <PageHeader title="Envío registrado" subtitle="El envío se guardó correctamente en el sistema" />
        <Card title="Confirmación de registro">
          <div className="envio-success">
            <p className="envio-success-message">Envío registrado correctamente</p>
            <p className="envio-success-code">{registeredEnvio.codigoEnvio}</p>
            <div className="envio-success-actions">
              <Button icon={Download} loading={downloading} onClick={handleDownloadComprobante}>Descargar comprobante</Button>
              <Link to={`${ROUTES.ENVIOS}/${registeredEnvio.codigoEnvio}`}>
                <Button variant="secondary" icon={Eye}>Ver envío</Button>
              </Link>
              <Button variant="ghost" icon={Plus} onClick={resetForm}>Registrar otro envío</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title="Registrar envío" subtitle="Complete los datos del nuevo envío" />
      {tabError && <Alert type="warning" message={tabError} onClose={() => setTabError('')} />}
      <div className="tabs">
        {tabs.map((t, i) => (
          <button key={t} type="button" className={`tab ${activeTab === i ? 'active' : ''}`} onClick={() => handleTabChange(i)}>{t}</button>
        ))}
      </div>
      <form className="form-sections" onSubmit={handleSubmitRequest}>
        {activeTab === 0 && (
          <section className="form-section">
            <Select id="cliente" label="Seleccionar cliente registrado" value={form.clienteDocumento} onChange={(e) => handleClienteSelect(e.target.value)} placeholder="— Sin cliente —" options={clientes.map((c) => ({ value: c.documento, label: `${c.documento} — ${c.nombres}` }))} />
            <h4>Remitente</h4>
            <div className="form-grid">
              <Input id="r_nombres" label="Nombres completos" required value={form.remitente.nombres} onChange={(e) => handleParty('remitente', 'nombres', e.target.value)} error={errors.remitente_nombres} />
              <Input id="r_documento" label="Documento" required value={form.remitente.documento} onChange={(e) => handleParty('remitente', 'documento', e.target.value)} error={errors.remitente_documento} />
              <Input id="r_telefono" label="Teléfono" required value={form.remitente.telefono} onChange={(e) => handleParty('remitente', 'telefono', e.target.value)} error={errors.remitente_telefono} />
              <Input id="r_direccion" label="Dirección" required value={form.remitente.direccion} onChange={(e) => handleParty('remitente', 'direccion', e.target.value)} error={errors.remitente_direccion} />
            </div>
            <h4>Destinatario</h4>
            <div className="form-grid">
              <Input id="d_nombres" label="Nombres completos" required value={form.destinatario.nombres} onChange={(e) => handleParty('destinatario', 'nombres', e.target.value)} error={errors.destinatario_nombres} />
              <Input id="d_documento" label="Documento" required value={form.destinatario.documento} onChange={(e) => handleParty('destinatario', 'documento', e.target.value)} error={errors.destinatario_documento} />
              <Input id="d_telefono" label="Teléfono" required value={form.destinatario.telefono} onChange={(e) => handleParty('destinatario', 'telefono', e.target.value)} error={errors.destinatario_telefono} />
              <Input id="d_direccion" label="Dirección" required value={form.destinatario.direccion} onChange={(e) => handleParty('destinatario', 'direccion', e.target.value)} error={errors.destinatario_direccion} />
            </div>
          </section>
        )}
        {activeTab === 1 && (
          <section className="form-section">
            <div className="form-grid">
              <Input id="origen" label="Origen" required value={form.origen} onChange={(e) => handleChange('origen', e.target.value)} error={errors.origen} />
              <Input id="destino" label="Destino" required value={form.destino} onChange={(e) => handleChange('destino', e.target.value)} error={errors.destino} />
              <Input id="tipoCarga" label="Tipo de carga" required value={form.tipoCarga} onChange={(e) => handleChange('tipoCarga', e.target.value)} error={errors.tipoCarga} />
              <Input id="descripcion" label="Descripción" required value={form.descripcion} onChange={(e) => handleChange('descripcion', e.target.value)} error={errors.descripcion} />
              <Input id="peso" label="Peso (kg)" type="number" step="0.01" min="0.01" required value={form.peso} onChange={(e) => handleChange('peso', e.target.value)} error={errors.peso} />
              <Input id="dim_largo" label="Largo" type="number" step="0.01" min="0.01" required value={form.dimensiones.largo} onChange={(e) => handleDim('largo', e.target.value)} error={errors.largo} />
              <Input id="dim_ancho" label="Ancho" type="number" step="0.01" min="0.01" required value={form.dimensiones.ancho} onChange={(e) => handleDim('ancho', e.target.value)} error={errors.ancho} />
              <Input id="dim_alto" label="Alto" type="number" step="0.01" min="0.01" required value={form.dimensiones.alto} onChange={(e) => handleDim('alto', e.target.value)} error={errors.alto} />
              <Select id="dim_unidad" label="Unidad" required value={form.dimensiones.unidadMedida} onChange={(e) => handleDim('unidadMedida', e.target.value)} options={DIMENSION_UNITS} />
            </div>
          </section>
        )}
        {activeTab === 2 && (
          <section className="form-section">
            <p className="text-muted">Cotización opcional según tarifas configuradas.</p>
            <div className="form-grid">
              <Select id="cot_moneda" label="Moneda" value={form.cotizacion.moneda} onChange={(e) => handleCot('moneda', e.target.value)} options={CURRENCIES} />
              <Input id="cot_distanciaKm" label="Distancia aprox. (km)" type="number" value={form.cotizacion.distanciaKm} onChange={(e) => handleCot('distanciaKm', e.target.value)} />
              <Input id="cot_seguroPct" label="Seguro (%)" type="number" min="0" max="100" value={form.cotizacion.seguroPorcentaje} onChange={(e) => handleCot('seguroPorcentaje', e.target.value)} />
              <Input id="cot_tarifaKg" label="Tarifa por kg" type="number" value={form.cotizacion.tarifaPorKg} onChange={(e) => handleCot('tarifaPorKg', e.target.value)} />
              <Input id="cot_tarifaM3" label="Tarifa por m³" type="number" value={form.cotizacion.tarifaPorM3} onChange={(e) => handleCot('tarifaPorM3', e.target.value)} />
              <Input id="cot_tarifaKm" label="Tarifa por km" type="number" value={form.cotizacion.tarifaPorKm} onChange={(e) => handleCot('tarifaPorKm', e.target.value)} />
            </div>
            <Button type="button" variant="secondary" onClick={calcPreview}>Calcular cotización</Button>
            {cotizacionPreview && (
              <div className="cotizacion-preview">
                <p>Total estimado: <strong>{cotizacionPreview.desglose.totalEstimado} {cotizacionPreview.moneda}</strong></p>
                <p className="text-muted">{cotizacionPreview.nota}</p>
              </div>
            )}
          </section>
        )}
        {activeTab === 3 && (
          <section className="form-section">
            <div className="form-group">
              <label htmlFor="observacion" className="form-label">Observación</label>
              <textarea id="observacion" className="form-input" rows={4} value={form.observacion} onChange={(e) => handleChange('observacion', e.target.value)} />
            </div>
          </section>
        )}
        <div className="form-actions">
          <Button type="button" variant="ghost" onClick={() => navigate(ROUTES.ENVIOS)}>Cancelar</Button>
          {activeTab > 0 && <Button type="button" variant="secondary" onClick={() => handleTabChange(activeTab - 1)}>Anterior</Button>}
          {activeTab < tabs.length - 1 ? (
            <Button type="button" onClick={handleNextTab}>Siguiente</Button>
          ) : (
            <Button type="submit" loading={saving}>Guardar envío</Button>
          )}
        </div>
      </form>
      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleSave} message="¿Confirma el registro de este envío?" loading={saving} />
    </div>
  );
};
