import { type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthSocialButtons } from '../components/AuthSocialButtons';
import { MaterialIcon } from '../components/MaterialIcon';
import { PasswordField } from '../components/PasswordField';
import { useToast } from '../shared/ui';

export function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate('/home');
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand__logo">W</span>
          <span className="auth-brand__name">Wishly</span>
        </div>

        <div className="auth-card__header">
          <h1>Bem-vindo de volta</h1>
          <p className="auth-card__subtitle">Entre para continuar organizando seus desejos.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>E-mail</span>
            <div className="field__control">
              <MaterialIcon className="field__icon" name="mail" />
              <input autoComplete="email" placeholder="nome@exemplo.com" required type="email" />
            </div>
          </label>

          <PasswordField
            autoComplete="current-password"
            label="Senha"
            meta={
              <button
                className="link-button"
                onClick={() =>
                  toast.show({ title: 'Recuperação de senha', description: 'Em breve disponível.' })
                }
                type="button"
              >
                Esqueceu a senha?
              </button>
            }
          />

          <button className="primary-button primary-button--full" type="submit">
            <span>Entrar</span>
            <MaterialIcon name="arrow_forward" />
          </button>
        </form>

        <AuthSocialButtons label="Ou continue com" />

        <p className="auth-card__footer">
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </section>
    </main>
  );
}
