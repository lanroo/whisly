function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="social-icon" height="18" viewBox="0 0 24 24" width="18">
      <path
        fill="#4285F4"
        d="M23.06 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.38z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.1 0 5.7-1.03 7.6-2.78l-3.72-2.89c-1.03.69-2.35 1.1-3.88 1.1-2.98 0-5.5-2.01-6.4-4.72H1.76v2.97A11.5 11.5 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.6 14.71a6.9 6.9 0 0 1 0-4.42V7.32H1.76a11.5 11.5 0 0 0 0 10.36l3.84-2.97z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.68 0 3.2.58 4.39 1.72l3.3-3.3C17.7 1.24 15.1.24 12 .24A11.5 11.5 0 0 0 1.76 7.32l3.84 2.97C6.5 7.58 9.02 4.77 12 4.77z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg aria-hidden="true" className="social-icon" fill="currentColor" height="18" viewBox="0 0 24 24" width="18">
      <path d="M17.05 12.04c-.03-2.4 1.96-3.55 2.05-3.6-1.12-1.64-2.86-1.86-3.47-1.88-1.48-.15-2.88.87-3.63.87-.74 0-1.9-.85-3.12-.83-1.6.02-3.08.93-3.9 2.37-1.66 2.88-.42 7.15 1.2 9.49.79 1.14 1.74 2.43 2.98 2.38 1.2-.05 1.65-.77 3.1-.77 1.44 0 1.85.77 3.12.75 1.29-.02 2.1-1.16 2.89-2.31.91-1.33 1.28-2.61 1.3-2.68-.03-.01-2.49-.96-2.52-3.8zM14.66 4.7c.66-.8 1.1-1.91.98-3.02-.95.04-2.1.63-2.78 1.43-.61.71-1.14 1.85-1 2.93 1.06.08 2.14-.54 2.8-1.34z" />
    </svg>
  );
}

interface AuthSocialButtonsProps {
  label: string;
  onSelect?: (provider: 'google' | 'apple') => void;
}

/** Divisor + botões de login social (Apple/Google) — compartilhado por login e registro. */
export function AuthSocialButtons({ label, onSelect }: AuthSocialButtonsProps) {
  return (
    <>
      <div className="separator">
        <span>{label}</span>
      </div>
      <div className="social-actions">
        <button className="secondary-button" onClick={() => onSelect?.('apple')} type="button">
          <AppleIcon />
          <span>Apple</span>
        </button>
        <button className="secondary-button" onClick={() => onSelect?.('google')} type="button">
          <GoogleIcon />
          <span>Google</span>
        </button>
      </div>
    </>
  );
}
