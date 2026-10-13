import { Card } from './Card';

/**
 * Bloque estándar de búsqueda/filtros (tarjeta + fila alineada de campos y botones).
 */
export const FiltersPanel = ({
  title = 'Buscar',
  children,
  actions,
  footer,
  className = '',
  onSubmit,
}) => {
  const formInner = (
    <>
      <div className="filters-panel-fields">{children}</div>
      {actions ? <div className="filters-panel-actions">{actions}</div> : null}
    </>
  );

  return (
    <Card title={title} className={`filters-panel ${className}`.trim()}>
      {onSubmit ? (
        <form
          className="filters-panel-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e);
          }}
        >
          {formInner}
        </form>
      ) : (
        <div className="filters-panel-form">{formInner}</div>
      )}
      {footer}
    </Card>
  );
};
