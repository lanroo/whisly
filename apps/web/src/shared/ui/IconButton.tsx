import { MaterialIcon } from '@/components/MaterialIcon';
import './primitives.css';

interface IconButtonProps {
  icon: string;
  /** Rótulo acessível (obrigatório). */
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'ghost';
  filled?: boolean;
  className?: string;
}

export function IconButton({
  icon,
  label,
  onClick,
  variant = 'default',
  filled = false,
  className = '',
}: IconButtonProps) {
  const classes = [
    'ui-icon-button',
    variant === 'ghost' ? 'ui-icon-button--ghost' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button aria-label={label} className={classes} onClick={onClick} type="button">
      <MaterialIcon filled={filled} name={icon} />
    </button>
  );
}
