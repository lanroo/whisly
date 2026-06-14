import type { ReactNode } from 'react';
import { MaterialIcon } from '@/components/MaterialIcon';
import './primitives.css';

type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: string;
  className?: string;
}

export function Badge({ children, variant = 'neutral', icon, className = '' }: BadgeProps) {
  return (
    <span className={`ui-badge ui-badge--${variant} ${className}`.trim()}>
      {icon ? <MaterialIcon name={icon} /> : null}
      {children}
    </span>
  );
}
