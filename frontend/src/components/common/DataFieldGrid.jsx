import { getFieldIcon } from '../../constants/uiIcons';



const renderRows = (rows) =>

  rows.map(([label, value]) => {

    const Icon = getFieldIcon(label);

    return (

      <div className="data-field-row" key={label}>

        <dt>

          {Icon && (

            <span className="data-field-label-icon" aria-hidden>

              <Icon size={14} strokeWidth={2} />

            </span>

          )}

          <span>{label}</span>

        </dt>

        <dd>{value}</dd>

      </div>

    );

  });



/** Filas tipo ficha (inspirado en consulta del sistema de escritorio GLS) */

export const DataFieldGrid = ({ fields = [], columns = 1 }) => {

  const rows = fields.filter(([, value]) => value !== undefined && value !== null && value !== '');

  if (!rows.length) return <p className="text-muted">Sin datos.</p>;



  if (columns === 2 && rows.length >= 2) {

    const mid = Math.ceil(rows.length / 2);

    const left = rows.slice(0, mid);

    const right = rows.slice(mid);

    return (

      <div className="data-field-grid-split">

        <dl className="data-field-grid">{renderRows(left)}</dl>

        {right.length > 0 && <dl className="data-field-grid">{renderRows(right)}</dl>}

      </div>

    );

  }



  return <dl className="data-field-grid">{renderRows(rows)}</dl>;

};


