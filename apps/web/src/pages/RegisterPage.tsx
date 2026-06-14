import { type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthSocialButtons } from '../components/AuthSocialButtons';
import { MaterialIcon } from '../components/MaterialIcon';
import { PasswordField } from '../components/PasswordField';
import { useToast } from '../shared/ui';

export function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.show({ variant: 'success', title: 'Conta criada', description: 'Bem-vindo ao Wishly!' });
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
          <h1>Criar conta</h1>
          <p className="auth-card__subtitle">Comece a organizar e compartilhar seus desejos.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Nome</span>
            <div className="field__control">
              <MaterialIcon className="field__icon" name="person" />
              <input autoComplete="name" placeholder="Seu nome" required type="text" />
            </div>
          </label>

          <label className="field">
            <span>E-mail</span>
            <div className="field__control">
              <MaterialIcon className="field__icon" name="mail" />
              <input autoComplete="email" placeholder="nome@exemplo.com" required type="email" />
            </div>
          </label>

          <PasswordField autoComplete="new-password" label="Senha" />
          <PasswordField autoComplete="new-password" label="Confirmar senha" />

          <button className="primary-button primary-button--full" type="submit">
            <span>Criar conta</span>
            <MaterialIcon name="arrow_forward" />
          </button>
        </form>

        <AuthSocialButtons label="Ou cadastre-se com" />

        <p className="auth-card__footer">
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </p>
      </section>
    </main>
  );
}
