import { Link } from 'react-router-dom';
import { MaterialIcon } from '../components/MaterialIcon';

export function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card__header">
          <p className="eyebrow">Wishly</p>
          <h1>Bem-vindo de volta</h1>
          <p className="auth-card__subtitle">
            Entre para continuar organizando seus desejos.
          </p>
        </div>

        <form className="auth-form">
          <label className="field">
            <span>E-mail</span>
            <div className="field__control">
              <MaterialIcon className="field__icon" name="mail" />
              <input placeholder="nome@exemplo.com" type="email" />
            </div>
          </label>

          <label className="field">
            <span>Senha</span>
            <div className="field__meta">
              <a href="/">Esqueceu a senha?</a>
            </div>
            <div className="field__control">
              <MaterialIcon className="field__icon" name="lock" />
              <input placeholder="••••••••" type="password" />
            </div>
          </label>

          <Link className="primary-button" to="/home">
            <span>Entrar</span>
            <MaterialIcon name="arrow_forward" />
          </Link>
        </form>

        <div className="separator">
          <span>Ou continue com</span>
        </div>

        <div className="social-actions">
          <button className="secondary-button" type="button">
            <MaterialIcon filled name="apps" />
            <span>Continuar com Apple</span>
          </button>
          <button className="secondary-button" type="button">
            <MaterialIcon className="google-accent" filled name="google" />
            <span>Continuar com Google</span>
          </button>
        </div>

        <p className="auth-card__footer">
          Não tem uma conta? <a href="/">Cadastre-se</a>
        </p>
      </section>
    </main>
  );
}
