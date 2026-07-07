import { Link } from 'react-router-dom';
import { Brand } from './Brand';
import { MaterialIcon } from './MaterialIcon';

interface TopBarProps {
  backTo: string;
  title: string;
  /** Quando true, mostra a logomarca canônica no lugar do título. */
  brand?: boolean;
  /** Ícone da ação à direita. `null` esconde o botão (mantém o título centrado). */
  rightIcon?: string | null;
  onRight?: () => void;
}

export function TopBar({ backTo, title, brand = false, rightIcon = 'search', onRight }: TopBarProps) {
  return (
    <header className="top-bar glass-panel">
      <div className="top-bar__inner">
        <Link aria-label="Voltar" className="icon-button" to={backTo}>
          <MaterialIcon name="chevron_left" />
        </Link>
        {brand ? <Brand /> : <h1>{title}</h1>}
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
