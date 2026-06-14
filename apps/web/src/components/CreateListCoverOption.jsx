import { MaterialIcon } from './MaterialIcon';

export function CreateListCoverOption({
  active = false,
  icon,
  label,
  onClick,
  upload = false,
}) {
  return (
    <button
      aria-label={label}
      className={`create-list-cover-option ${active ? 'is-active' : ''} ${upload ? 'create-list-cover-option--upload' : ''}`.trim()}
      onClick={onClick}
      type="button"
    >
      <span className="create-list-cover-option__icon-wrap">
        <MaterialIcon className="create-list-cover-option__icon" name={icon} />
      </span>
    </button>
  );
}
