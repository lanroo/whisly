export function SettingsToggleRow({ checked, description, onChange, title }) {
  return (
    <div className="settings-row settings-row--toggle">
      <div className="settings-row__copy">
        <strong>{title}</strong>
        {description ? <p>{description}</p> : null}
      </div>

      <button
        aria-pressed={checked}
        className={`settings-switch ${checked ? 'is-active' : ''}`}
        onClick={onChange}
        type="button"
      >
        <span />
      </button>
    </div>
  );
}
