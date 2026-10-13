import { useState } from 'react';
import { User } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { enviosService } from '../../services/enviosService';

export const PartyLookupPanel = ({ title, rol, party, onPartyChange, errors = {} }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [candidates, setCandidates] = useState([]);

  const prefix = rol;

  const applyParty = (p) => {
    onPartyChange({
      nombres: p.nombres || '',
      documento: p.documento || '',
      telefono: p.telefono || '',
      direccion: p.direccion || '',
    });
    setCandidates([]);
    setMessage({
      type: 'success',
      text: `Datos cargados (${p.fuente === 'cliente' ? 'catálogo de clientes' : 'envíos anteriores'}).`,
    });
  };

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) {
      setMessage({ type: 'warning', text: 'Escriba DNI, RUC o nombre para buscar.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    setCandidates([]);
    try {
      const { matches } = await enviosService.buscarParticipante(rol, q);
      if (!matches?.length) {
        setMessage({
          type: 'info',
          text: 'No se encontraron coincidencias. Complete los datos manualmente.',
        });
        return;
      }
      if (matches.length === 1) {
        applyParty(matches[0]);
        return;
      }
      setCandidates(matches);
      setMessage({ type: 'info', text: 'Seleccione la persona correcta de la lista.' });
    } catch {
      setMessage({ type: 'error', text: 'No se pudo completar la búsqueda. Intente de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleField = (field, value) => {
    onPartyChange({ ...party, [field]: value });
    if (message?.type === 'success') setMessage(null);
  };

  return (
    <div className="party-lookup-panel">
      <div className="party-lookup-head">
        <User size={18} aria-hidden />
        <h4>{title}</h4>
      </div>
      <p className="party-lookup-hint">
        Buscar {rol === 'remitente' ? 'remitente' : 'destinatario'} por DNI / RUC o nombre (envíos anteriores y clientes).
      </p>
      <div className="party-lookup-search">
        <Input
          id={`${prefix}_buscar`}
          label="Buscar por documento o nombre"
          placeholder="Ej. 45678901 o Pedro Sánchez"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <Button type="button" loading={loading} onClick={handleSearch}>
          Buscar
        </Button>
      </div>
      {message && <p className={`party-lookup-msg party-lookup-msg--${message.type}`}>{message.text}</p>}
      {candidates.length > 0 && (
        <ul className="party-lookup-candidates">
          {candidates.map((c) => (
            <li key={c.documento}>
              <button type="button" className="party-lookup-candidate" onClick={() => applyParty(c)}>
                <strong>{c.nombres}</strong>
                <span>{c.documento}</span>
                <small>{c.direccion}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="form-grid party-lookup-fields">
        <Input
          id={`${prefix}_nombres`}
          label="Nombres completos"
          required
          value={party.nombres}
          onChange={(e) => handleField('nombres', e.target.value)}
          error={errors[`${prefix}_nombres`]}
        />
        <Input
          id={`${prefix}_documento`}
          label="Documento (DNI / RUC)"
          required
          value={party.documento}
          onChange={(e) => handleField('documento', e.target.value)}
          error={errors[`${prefix}_documento`]}
        />
        <Input
          id={`${prefix}_telefono`}
          label="Teléfono"
          required
          value={party.telefono}
          onChange={(e) => handleField('telefono', e.target.value)}
          error={errors[`${prefix}_telefono`]}
        />
        <Input
          id={`${prefix}_direccion`}
          label="Dirección"
          required
          value={party.direccion}
          onChange={(e) => handleField('direccion', e.target.value)}
          error={errors[`${prefix}_direccion`]}
        />
      </div>
    </div>
  );
};
