/** Tabla (~3/4) + panel de detalle al costado, mismo patrón que consulta de envíos */
export const MasterDetailLayout = ({ list, detail }) => (
  <div className="master-detail-layout">
    <div className="master-detail-list">{list}</div>
    {detail}
  </div>
);
