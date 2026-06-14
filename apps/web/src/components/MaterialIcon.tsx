interface MaterialIconProps {
  name: string;
  filled?: boolean;
  className?: string;
}

export function MaterialIcon({ name, filled = false, className = '' }: MaterialIconProps) {
  const classes = ['material-symbols-outlined', filled ? 'filled' : '', className]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{name}</span>;
}
