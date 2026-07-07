import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AuthBrand } from '../components/AuthBrand';
import { PasswordField } from '../components/PasswordField';
import { useAuth } from '../shared/auth';
import { useToast } from '../shared/ui';

/** Ilustração flat: celular com coração — tela de login. */
function LoginIllustration() {
  return (
    <svg aria-hidden="true" fill="none" height="96" viewBox="0 0 180 110" width="158">
      <circle cx="90" cy="55" r="44" fill="#ECEFF7" />
      <rect fill="#2F3551" height="74" rx="9" width="36" x="72" y="18" />
      <rect fill="#FFFFFF" height="54" rx="5" width="28" x="76" y="26" />
      <path
        d="M90 61c-6-4.5-10-8-10-12.2 0-3 2.3-5.3 5.2-5.3 1.9 0 3.7 1 4.8 2.7 1.1-1.7 2.9-2.7 4.8-2.7 2.9 0 5.2 2.3 5.2 5.3 0 4.2-4 7.7-10 12.2z"
        fill="#2F3551"
      />
      <rect fill="#C5CCDF" height="3" rx="1.5" width="12" x="84" y="84" />
      <path d="M30 26h10M35 21v10" stroke="#C5CCDF" strokeLinecap="round" strokeWidth="2.5" />
      <path d="M142 68h8M146 64v8" stroke="#C5CCDF" strokeLinecap="round" strokeWidth="2.2" />
      <circle cx="140" cy="26" r="3.5" fill="#C5CCDF" />
      <circle cx="42" cy="80" r="4" fill="#E2E6F0" />
      <path
        d="M128 44c-2.6-2-4.4-3.5-4.4-5.4 0-1.3 1-2.3 2.3-2.3.8 0 1.6.4 2.1 1.2.5-.8 1.3-1.2 2.1-1.2 1.3 0 2.3 1 2.3 2.3 0 1.9-1.8 3.4-4.4 5.4z"
        fill="#F0A8C4"
      />
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signInWithPassword, resetPassword } = useAuth();
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

  async function handleForgotPassword() {
    if (!email) {
      toast.show({ title: 'Informe seu e-mail ou usuário', description: 'Digite o e-mail ou @usuário para recuperar a senha.' });
      return;
    }
    // Aceita @usuário: resolve para o e-mail antes de enviar a recuperação.
    let target = email.trim();
    if (supabase && (!target.includes('@') || target.startsWith('@'))) {
      const { data: resolved } = await supabase.rpc('email_for_handle', { _handle: target });
      if (!resolved) {
        toast.show({ variant: 'error', title: 'Usuário não encontrado' });
        return;
      }
      target = resolved as string;
    }
    const { error } = await resetPassword(target);
    toast.show(
      error
        ? { variant: 'error', title: 'Erro', description: error }
        : { variant: 'success', title: 'E-mail enviado', description: 'Confira sua caixa de entrada.' },
    );
  }

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
        <div className="auth-screen__illo">
          <LoginIllustration />
        </div>

        <h1 className="auth-screen__title">Bem-vindo de volta!</h1>
        <p className="auth-screen__subtitle">Entre para continuar organizando seus desejos.</p>

        <form className="auth-screen__form" onSubmit={handleSubmit}>
          <label className="field">
            <span>E-mail ou usuário</span>
            <div className="field__control">
              <input
                autoCapitalize="none"
                autoComplete="username"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nome@exemplo.com ou @usuario"
                required
                spellCheck={false}
                type="text"
                value={email}
              />
            </div>
          </label>

          <PasswordField autoComplete="current-password" label="Senha" name="password" />

          <div className="auth-screen__row">
            <button className="auth-screen__forgot" onClick={handleForgotPassword} type="button">
              Esqueceu a senha?
            </button>
          </div>

          <button className="primary-button primary-button--full" disabled={submitting} type="submit">
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-screen__footer">
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </section>
    </main>
  );
}
