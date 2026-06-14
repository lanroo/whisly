import type { HTMLAttributes } from 'react';
import './primitives.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  interactive?: boolean;
}

export function Card({
  padded = false,
  interactive = false,
  className = '',
  children,
  ...rest
}: CardProps) {
  const classes = [
    'ui-card',
    padded ? 'ui-card--padded' : '',
    interactive ? 'ui-card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
