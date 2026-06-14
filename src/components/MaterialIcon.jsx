export function MaterialIcon({ name, filled = false, className = '' }) {
  const classes = ['material-symbols-outlined', filled ? 'filled' : '', className]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{name}</span>;
}
