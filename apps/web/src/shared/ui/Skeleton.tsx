import type { CSSProperties } from 'react';
import './primitives.css';

interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({ variant = 'rect', width, height, className = '' }: SkeletonProps) {
  const style: CSSProperties = { width, height };

  return (
    <span
      aria-hidden="true"
      className={`ui-skeleton ui-skeleton--${variant} ${className}`.trim()}
      style={style}
    />
  );
}
