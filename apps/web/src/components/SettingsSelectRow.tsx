import { MaterialIcon } from './MaterialIcon';

interface SettingsSelectRowProps {
  title: string;
  value: string;
}

export function SettingsSelectRow({ title, value }: SettingsSelectRowProps) {
  return (
    <button className="settings-row settings-row--select" type="button">
      <strong>{title}</strong>
      <span className="settings-row__value">
        {value}
        <MaterialIcon name="chevron_right" />
      </span>
    </button>
  );
}
