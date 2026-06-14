import { Link } from 'react-router-dom';
import { MaterialIcon } from './MaterialIcon';

interface TopBarProps {
  backTo: string;
  title: string;
  /** Ícone da ação à direita. `null` esconde o botão (mantém o título centrado). */
  rightIcon?: string | null;
  onRight?: () => void;
}

export function TopBar({ backTo, title, rightIcon = 'search', onRight }: TopBarProps) {
  return (
    <header className="top-bar glass-panel">
      <div className="top-bar__inner">
        <Link aria-label="Voltar" className="icon-button" to={backTo}>
          <MaterialIcon name="chevron_left" />
        </Link>
        <h1>{title}</h1>
        {rightIcon ? (
          <button aria-label="Ação" className="icon-button" onClick={onRight} type="button">
            <MaterialIcon name={rightIcon} />
          </button>
        ) : (
          <span aria-hidden="true" className="icon-button top-bar__spacer" />
        )}
      </div>
    </header>
  );
}
