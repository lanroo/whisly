import { Link } from 'react-router-dom';

/** Ilustração flat: celular grande + pessoa — tela de boas-vindas. */
function WelcomeIllustration() {
  return (
    <svg aria-hidden="true" fill="none" height="178" viewBox="0 0 260 180" width="258">
      <ellipse cx="130" cy="164" fill="#ECEFF7" rx="102" ry="10" />

      {/* Celular */}
      <rect fill="#FFFFFF" height="132" rx="14" stroke="#242941" strokeWidth="3" width="68" x="72" y="20" />
      <rect fill="#E2E6F0" height="6" rx="3" width="36" x="82" y="40" />
      <rect fill="#E2E6F0" height="6" rx="3" width="26" x="82" y="52" />
      <circle cx="106" cy="86" fill="#ECEFF7" r="13" />
      <path d="M100 86l4 4 8-8" stroke="#242941" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
      <rect fill="#E2E6F0" height="6" rx="3" width="32" x="82" y="110" />
      <rect fill="#C5CCDF" height="4" rx="2" width="16" x="98" y="140" />

      {/* Pessoa */}
      <circle cx="180" cy="64" fill="#E8B48F" r="10" />
      <path d="M170 62a10 10 0 0 1 20 0c-3-4-6-5.5-10-5.5s-7 1.5-10 5.5z" fill="#1B1F33" />
      <rect fill="#2F3551" height="36" rx="9" width="26" x="167" y="76" />
      <rect fill="#2F3551" height="7" rx="3.5" width="22" x="148" y="82" />
      <rect fill="#1B1F33" height="38" rx="3.5" width="7" x="170" y="112" />
      <rect fill="#1B1F33" height="38" rx="3.5" width="7" x="182" y="112" />
      <rect fill="#242941" height="5" rx="2.5" width="12" x="166" y="150" />
      <rect fill="#242941" height="5" rx="2.5" width="12" x="180" y="150" />

      {/* Faíscas */}
      <path d="M36 48h10M41 43v10" stroke="#C5CCDF" strokeLinecap="round" strokeWidth="2.5" />
      <path d="M218 34h8M222 30v8" stroke="#C5CCDF" strokeLinecap="round" strokeWidth="2.2" />
      <circle cx="226" cy="96" r="4" fill="#E2E6F0" />
      <circle cx="44" cy="104" r="3.5" fill="#C5CCDF" />
      <path
        d="M214 132c-2.6-2-4.4-3.5-4.4-5.4 0-1.3 1-2.3 2.3-2.3.8 0 1.6.4 2.1 1.2.5-.8 1.3-1.2 2.1-1.2 1.3 0 2.3 1 2.3 2.3 0 1.9-1.8 3.4-4.4 5.4z"
        fill="#F0A8C4"
      />
    </svg>
  );
}

export function WelcomePage() {
  return (
    <main className="auth-screen">
      <div aria-hidden="true" className="auth-screen__deco">
        <span />
        <span />
        <span />
        <span />
        <i>+</i>
        <i>+</i>
      </div>

      <section className="auth-screen__card">
        <div className="auth-screen__illo">
          <WelcomeIllustration />
        </div>

        <h1 className="auth-screen__title auth-screen__title--lg">Olá!</h1>
        <p className="auth-screen__subtitle">
          Bem-vindo ao Wishly, onde você guarda e organiza todos os seus desejos.
        </p>

        <div className="auth-screen__actions">
          <Link className="primary-button primary-button--full" to="/login">
            Entrar
          </Link>
          <Link className="auth-screen__secondary" to="/register">
            Criar conta
          </Link>
        </div>
      </section>
    </main>
  );
}
