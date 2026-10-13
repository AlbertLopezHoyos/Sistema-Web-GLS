import { getPageIcon } from '../../constants/uiIcons';

export const PageHeader = ({ title, subtitle, actions, icon: IconProp }) => {
  const PageIcon = IconProp || (title ? getPageIcon(title) : null);
  return (
    <div className="page-header">
      <div className="page-header-text">
        {PageIcon && (
          <span className="page-title-icon" aria-hidden>
            <PageIcon size={26} strokeWidth={2} />
          </span>
        )}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
};
