import { MaterialIcon } from './MaterialIcon';

export function NewListCard({ className = '' }) {
  return (
    <button className={`new-list-card ${className}`.trim()} type="button">
      <span className="new-list-card__icon-wrap">
        <MaterialIcon className="new-list-card__icon" name="add" />
      </span>
      <span className="new-list-card__label">Nova Lista</span>
    </button>
  );
}
