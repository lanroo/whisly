import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthSocialButtons } from '../components/AuthSocialButtons';
import { MaterialIcon } from '../components/MaterialIcon';
import { PasswordField } from '../components/PasswordField';
import { useAuth } from '../shared/auth';
import { useToast } from '../shared/ui';

export function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signInWithPassword, signInWithOAuth, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get('password') ?? '');

    setSubmitting(true);
    const { error } = await signInWithPassword(email, password);
    setSubmitting(false);

    if (error) {
      toast.show({ variant: 'error', title: 'Não foi possível entrar', description: error });
      return;
    }
    navigate('/home');
  }

  async function handleOAuth(provider: 'google' | 'apple') {
    const { error } = await signInWithOAuth(provider);
    if (error) {
      toast.show({ variant: 'error', title: 'Login social', description: error });
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      toast.show({ title: 'Informe seu e-mail', description: 'Digite o e-mail para recuperar a senha.' });
      return;
    }
    const { error } = await resetPassword(email);
    toast.show(
      error
        ? { variant: 'error', title: 'Erro', description: error }
        : { variant: 'success', title: 'E-mail enviado', description: 'Confira sua caixa de entrada.' },
    );
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
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nome@exemplo.com"
                required
                type="email"
                value={email}
              />
            </div>
          </label>

          <PasswordField
            autoComplete="current-password"
            label="Senha"
            name="password"
            meta={
              <button className="link-button" onClick={handleForgotPassword} type="button">
                Esqueceu a senha?
              </button>
            }
          />

          <button className="primary-button primary-button--full" disabled={submitting} type="submit">
            <span>{submitting ? 'Entrando...' : 'Entrar'}</span>
            <MaterialIcon name="arrow_forward" />
          </button>
        </form>

        <AuthSocialButtons label="Ou continue com" onSelect={handleOAuth} />

        <p className="auth-card__footer">
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </section>
    </main>
  );
}
