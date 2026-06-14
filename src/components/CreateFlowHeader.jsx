import { Link } from 'react-router-dom';
import { MaterialIcon } from './MaterialIcon';

export function CreateFlowHeader({ backTo, title, rightIcon, rightLabel }) {
  return (
    <header className="create-flow-header">
      <div className="create-flow-header__inner">
        <Link aria-label="Voltar" className="create-flow-header__button" to={backTo}>
          <MaterialIcon name="arrow_back" />
        </Link>

        <h1>{title}</h1>

        {rightIcon ? (
          <button aria-label={rightLabel ?? 'Ação'} className="create-flow-header__button" type="button">
            <MaterialIcon name={rightIcon} />
          </button>
        ) : (
          <div aria-hidden="true" className="create-flow-header__spacer" />
        )}
      </div>
    </header>
  );
}
