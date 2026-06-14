import { MaterialIcon } from './MaterialIcon';

export function CreateListPrivacyOption({
  checked,
  description,
  icon,
  name,
  onChange,
  title,
  value,
}) {
  return (
    <div className="create-list-privacy-option">
      <input
        checked={checked}
        className="create-list-privacy-option__input"
        id={value}
        name={name}
        onChange={() => onChange(value)}
        type="radio"
        value={value}
      />
      <label className="create-list-privacy-option__label" htmlFor={value}>
        <div className="create-list-privacy-option__icon">
          <MaterialIcon name={icon} />
        </div>
        <div className="create-list-privacy-option__copy">
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <span className="create-list-privacy-option__radio" />
      </label>
    </div>
  );
}
