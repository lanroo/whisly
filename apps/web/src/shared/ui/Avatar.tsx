import './primitives.css';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const initial = name?.trim().charAt(0).toUpperCase() ?? '?';

  return (
    <span className={`ui-avatar ui-avatar--${size} ${className}`.trim()}>
      {src ? <img alt={name ?? ''} src={src} /> : <span>{initial}</span>}
    </span>
  );
}
