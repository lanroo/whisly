import { Link } from 'react-router-dom';
import { MaterialIcon } from './MaterialIcon';

interface SettingsSelectRowProps {
  title: string;
  value?: string;
  /** Ícone à esquerda (opcional) — útil para linhas de menu. */
  icon?: string;
  /** Renderiza um link de rota quando informado. */
  to?: string;
  onClick?: () => void;
}

/**
 * Linha de configuração / item de menu reutilizável.
 *
 * Sem `to`/`onClick` é uma linha estática (título + valor). Com eles, vira uma
 * ação navegável ou clicável — usada no Perfil e nas configurações.
 */
export function SettingsSelectRow({ title, value, icon, to, onClick }: SettingsSelectRowProps) {
  const inner = (
    <>
      {icon ? <MaterialIcon className="settings-row__lead" name={icon} /> : null}
      <strong>{title}</strong>
      <span className="settings-row__value">
        {value}
        <MaterialIcon name="chevron_right" />
      </span>
    </>
  );

  const className = `settings-row settings-row--select ${icon ? 'settings-row--with-icon' : ''}`.trim();

  if (to) {
    return (
      <Link className={className} to={to}>
        {inner}
      </Link>
    );
  }

  return (
    <button className={className} onClick={onClick} type="button">
      {inner}
    </button>
  );
}
