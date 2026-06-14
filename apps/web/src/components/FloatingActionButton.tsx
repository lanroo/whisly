import { Link } from 'react-router-dom';

interface FloatingActionButtonProps {
  icon?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
  to?: string;
}

export function FloatingActionButton({
  icon = 'add',
  label = 'Adicionar',
  className = '',
  onClick,
  to,
}: FloatingActionButtonProps) {
  const classes = `fab ${className}`.trim();

  if (to) {
    return (
      <Link aria-label={label} className={classes} to={to}>
        <span className="material-symbols-outlined">{icon}</span>
      </Link>
    );
  }

  return (
    <button aria-label={label} className={classes} onClick={onClick} type="button">
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );
}
