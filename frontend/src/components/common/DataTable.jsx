import { getColumnIcon } from '../../constants/uiIcons';

export const DataTable = ({
  columns,
  data,
  emptyMessage = 'No hay registros',
  actions,
  onRowClick,
  getRowKey = (row, idx) => row.id || row.codigoEnvio || idx,
  selectedRowKey,
  compact = false,
}) => (
  <div className={`table-wrapper ${compact ? 'table-wrapper--compact' : ''}`}>
    <table className={`data-table ${onRowClick ? 'data-table--selectable' : ''}`}>
      <thead>
        <tr>
          {columns.map((col) => {
            const ColIcon = col.icon || getColumnIcon(col.label);
            return (
              <th key={col.key}>
                <span className="table-col-head">
                  {ColIcon && (
                    <span className="table-col-head-icon" aria-hidden>
                      <ColIcon size={14} strokeWidth={2} />
                    </span>
                  )}
                  {col.label}
                </span>
              </th>
            );
          })}
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
          data.map((row, idx) => {
            const rowKey = getRowKey(row, idx);
            const selected = selectedRowKey != null && selectedRowKey === rowKey;
            return (
              <tr
                key={rowKey}
                className={selected ? 'is-selected' : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                    {actions(row)}
                  </td>
                )}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
);
