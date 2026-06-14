import { Link } from 'react-router-dom';

export function FloatingActionButton({
  icon = 'add',
  label = 'Adicionar',
  className = '',
  onClick,
  to,
}) {
  const classes = `fab ${className}`.trim();

  if (to) {
    return (
      <Link aria-label={label} className={classes} to={to}>
        <span className="material-symbols-outlined">{icon}</span>
      </Link>
    );
  }

  return (
    <button
      aria-label={label}
      className={classes}
      onClick={onClick}
      type="button"
    >
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );
}
