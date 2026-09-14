export const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-content">
      <span className="stat-title">{title}</span>
      <span className="stat-value">{value}</span>
      {subtitle && <span className="stat-subtitle">{subtitle}</span>}
    </div>
    {Icon && (
      <div className="stat-icon">
        <Icon size={24} />
      </div>
    )}
  </div>
);
