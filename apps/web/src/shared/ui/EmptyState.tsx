import type { ReactNode } from 'react';
import { MaterialIcon } from '@/components/MaterialIcon';
import './primitives.css';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="ui-empty">
      <div className="ui-empty__icon">
        <MaterialIcon name={icon} />
      </div>
      <h2 className="ui-empty__title">{title}</h2>
      {description ? <p className="ui-empty__text">{description}</p> : null}
      {action ? <div className="ui-empty__action">{action}</div> : null}
    </div>
  );
}
