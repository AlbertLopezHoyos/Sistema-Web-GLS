import { getSectionIcon } from '../../constants/uiIcons';

export const Card = ({ title, subtitle, actions, children, className = '', icon: IconProp }) => {
  const SectionIcon = IconProp || (title ? getSectionIcon(title) : null);
  return (
    <div className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-header">
          <div>
            {title && (
              <h3 className="card-title">
                {SectionIcon && (
                  <span className="card-title-icon" aria-hidden>
                    <SectionIcon size={18} strokeWidth={2} />
                  </span>
                )}
                {title}
              </h3>
            )}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
};
