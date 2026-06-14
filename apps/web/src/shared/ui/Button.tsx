import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { MaterialIcon } from '@/components/MaterialIcon';
import './button.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: string;
  iconPosition?: 'start' | 'end';
  /** Quando presente, renderiza um <Link> de rota em vez de <button>. */
  to?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * Botão único e reutilizável do app.
 *
 * Centraliza estilo, variantes e tamanhos para que toda ação tenha a mesma
 * aparência (cor do tema) — acabando com botões avulsos e fora do padrão.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'start',
  to,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {icon && iconPosition === 'start' ? (
        <MaterialIcon className="btn__icon" name={icon} />
      ) : null}
      <span>{children}</span>
      {icon && iconPosition === 'end' ? (
        <MaterialIcon className="btn__icon" name={icon} />
      ) : null}
    </>
  );

  if (to && !disabled) {
    return (
      <Link aria-label={ariaLabel} className={classes} to={to}>
        {content}
      </Link>
    );
  }

  return (
    <button
      aria-label={ariaLabel}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {content}
    </button>
  );
}
