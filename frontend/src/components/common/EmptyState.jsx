import { Inbox } from 'lucide-react';

export const EmptyState = ({ title = 'Sin registros', message, action }) => (
  <div className="empty-state">
    <Inbox size={48} strokeWidth={1.2} />
    <h3>{title}</h3>
    {message && <p>{message}</p>}
    {action}
  </div>
);
