import { MaterialIcon } from './MaterialIcon';

interface CreateListCoverOptionProps {
  active?: boolean;
  icon: string;
  label: string;
  onClick?: () => void;
  upload?: boolean;
}

export function CreateListCoverOption({
  active = false,
  icon,
  label,
  onClick,
  upload = false,
}: CreateListCoverOptionProps) {
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
