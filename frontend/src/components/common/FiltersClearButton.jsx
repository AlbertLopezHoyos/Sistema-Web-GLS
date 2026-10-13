import { Button } from './Button';

/** Botón secundario «Limpiar» alineado con la barra de filtros estándar */
export const FiltersClearButton = ({ onClear, visible = true, disabled = false }) => {
  if (!visible) return null;
  return (
    <Button type="button" variant="ghost" onClick={onClear} disabled={disabled}>
      Limpiar
    </Button>
  );
};
