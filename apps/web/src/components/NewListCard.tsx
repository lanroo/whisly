import { Link } from 'react-router-dom';
import { MaterialIcon } from './MaterialIcon';

interface NewListCardProps {
  className?: string;
  to?: string;
}

export function NewListCard({ className = '', to = '/lists/new' }: NewListCardProps) {
  return (
    <Link className={`new-list-card ${className}`.trim()} to={to}>
      <span className="new-list-card__icon-wrap">
        <MaterialIcon className="new-list-card__icon" name="add" />
      </span>
      <span className="new-list-card__label">Nova Lista</span>
    </Link>
  );
}
