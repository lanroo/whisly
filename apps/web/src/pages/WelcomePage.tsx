import { Link } from 'react-router-dom';
import welcomeCharacter from '@/assets/welcome-character.png';

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
          <img alt="" className="auth-screen__illo-img" src={welcomeCharacter} />
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
