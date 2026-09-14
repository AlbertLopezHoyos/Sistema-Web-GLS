export const DataTable = ({ columns, data, emptyMessage = 'No hay registros', actions }) => (
  <div className="table-wrapper">
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
          {actions && <th className="col-actions">Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length + (actions ? 1 : 0)} className="table-empty">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((row, idx) => (
            <tr key={row.id || row.codigoEnvio || idx}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              {actions && <td className="col-actions">{actions(row)}</td>}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
