import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthSocialButtons } from '../components/AuthSocialButtons';
import { MaterialIcon } from '../components/MaterialIcon';
import { PasswordField } from '../components/PasswordField';
import { useAuth } from '../shared/auth';
import { useToast } from '../shared/ui';

export function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signUp, signInWithOAuth, isConfigured } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '');
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');
    const confirm = String(form.get('confirm') ?? '');

    if (password !== confirm) {
      toast.show({ variant: 'error', title: 'As senhas não coincidem' });
      return;
    }

    setSubmitting(true);
    const { error } = await signUp({ email, password, name });
    setSubmitting(false);

    if (error) {
      toast.show({ variant: 'error', title: 'Não foi possível criar a conta', description: error });
      return;
    }

    if (isConfigured) {
      toast.show({
        variant: 'success',
        title: 'Conta criada',
        description: 'Confirme seu e-mail para ativar a conta.',
      });
      navigate('/login');
      return;
    }

    toast.show({ variant: 'success', title: 'Conta criada', description: 'Bem-vindo ao Wishly!' });
    navigate('/home');
  }

  async function handleOAuth(provider: 'google' | 'apple') {
    const { error } = await signInWithOAuth(provider);
    if (error) {
      toast.show({ variant: 'error', title: 'Cadastro social', description: error });
    }
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
              <input autoComplete="name" name="name" placeholder="Seu nome" required type="text" />
            </div>
          </label>

          <label className="field">
            <span>E-mail</span>
            <div className="field__control">
              <MaterialIcon className="field__icon" name="mail" />
              <input autoComplete="email" name="email" placeholder="nome@exemplo.com" required type="email" />
            </div>
          </label>

          <PasswordField autoComplete="new-password" label="Senha" name="password" />
          <PasswordField autoComplete="new-password" label="Confirmar senha" name="confirm" />

          <button className="primary-button primary-button--full" disabled={submitting} type="submit">
            <span>{submitting ? 'Criando...' : 'Criar conta'}</span>
            <MaterialIcon name="arrow_forward" />
          </button>
        </form>

        <AuthSocialButtons label="Ou cadastre-se com" onSelect={handleOAuth} />

        <p className="auth-card__footer">
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </p>
      </section>
    </main>
  );
}
