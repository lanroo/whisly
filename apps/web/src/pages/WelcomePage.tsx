import { Link } from 'react-router-dom';
import welcomeCharacter from '@/assets/welcome-character.png';
import { AuthBrand } from '../components/AuthBrand';

/** Coração flat (unidade ~10x9), posicionado via transform. */
const HEART_PATH =
  'M5 9C1.5 6.2 0 4.3 0 2.6 0 1.1 1.1 0 2.5 0 3.4 0 4.2.5 5 1.6 5.8.5 6.6 0 7.5 0 8.9 0 10 1.1 10 2.6 10 4.3 8.5 6.2 5 9Z';

/** Celular flat com a lista de desejos — par da personagem na tela de boas-vindas. */
function PhoneIllustration() {
  return (
    <svg aria-hidden="true" className="auth-screen__illo-phone" fill="none" viewBox="0 0 112 200">
      <rect fill="#FFFFFF" height="192" rx="22" stroke="#242941" strokeWidth="4" width="100" x="6" y="4" />
      <rect fill="#E2E6F0" height="4" rx="2" width="20" x="46" y="15" />

      <g fill="#F0A8C4" transform="translate(46 30) scale(2)">
        <path d={HEART_PATH} />
      </g>

      <circle cx="30" cy="74" fill="#ECEFF7" r="9" />
      <path d="M26 74l3 3 5-5.5" stroke="#242941" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
      <rect fill="#E2E6F0" height="7" rx="3.5" width="42" x="44" y="70" />

      <circle cx="30" cy="104" fill="#ECEFF7" r="9" />
      <rect fill="#C5CCDF" height="7" rx="3.5" width="32" x="44" y="100" />

      <circle cx="30" cy="134" fill="#ECEFF7" r="9" />
      <rect fill="#E2E6F0" height="7" rx="3.5" width="42" x="44" y="130" />

      <circle cx="30" cy="164" fill="#ECEFF7" r="9" />
      <rect fill="#C5CCDF" height="7" rx="3.5" width="28" x="44" y="160" />
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

      <AuthBrand />

      <section className="auth-screen__card">
        <div className="auth-screen__illo auth-screen__illo--pair">
          <div className="auth-screen__illo-item auth-screen__illo-item--phone">
            <PhoneIllustration />
          </div>
          <div className="auth-screen__illo-item auth-screen__illo-item--char">
            <img alt="" className="auth-screen__illo-img" src={welcomeCharacter} />
          </div>
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
