import { Loader } from './Loader';

export const RecordDetailPanel = ({
  label = 'Detalle',
  title,
  loading = false,
  emptyText = 'Seleccione un registro de la lista para ver su detalle.',
  children,
  actions,
}) => {
  if (!title && !loading) {
    return (
      <aside className="master-detail-panel master-detail-panel--empty">
        <p>{emptyText}</p>
      </aside>
    );
  }

  if (loading) {
    return (
      <aside className="master-detail-panel">
        <Loader />
      </aside>
    );
  }

  return (
    <aside className="master-detail-panel">
      <header className="master-detail-panel-head">
        <div>
          <p className="master-detail-panel-label">{label}</p>
          {title && <h2 className="master-detail-panel-title">{title}</h2>}
        </div>
        {actions && <div className="master-detail-panel-actions">{actions}</div>}
      </header>
      <div className="master-detail-panel-body">{children}</div>
    </aside>
  );
};
