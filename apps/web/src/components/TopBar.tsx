import { Link } from 'react-router-dom';
import { MaterialIcon } from './MaterialIcon';

interface TopBarProps {
  backTo: string;
  title: string;
  rightIcon?: string;
}

export function TopBar({ backTo, title, rightIcon = 'search' }: TopBarProps) {
  return (
    <header className="top-bar glass-panel">
      <div className="top-bar__inner">
        <Link aria-label="Voltar" className="icon-button" to={backTo}>
          <MaterialIcon name="chevron_left" />
        </Link>
        <h1>{title}</h1>
        <button aria-label="Pesquisar" className="icon-button" type="button">
          <MaterialIcon name={rightIcon} />
        </button>
      </div>
    </header>
  );
}
