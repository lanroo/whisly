/** Marca das telas de auth: logo "W" + nome "Wishly" na fonte serif. */
export function AuthBrand() {
  return (
    <header className="auth-screen__brand">
      <span aria-hidden="true" className="auth-screen__brand-logo">
        <svg fill="none" height="30" viewBox="0 0 48 48" width="30">
          <rect fill="#242941" height="48" rx="13" width="48" />
          <path
            d="M11 15 17 33 24 22 31 33 37 15"
            fill="none"
            stroke="#ffffff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4.2"
          />
        </svg>
      </span>
      <span className="auth-screen__brand-name">Wishly</span>
    </header>
  );
}
