import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PasswordField } from '../components/PasswordField';
import { useAuth } from '../shared/auth';
import { useToast } from '../shared/ui';

/** Ilustração flat: cadeado — tela de nova senha. */
function ResetIllustration() {
  return (
    <svg aria-hidden="true" fill="none" height="90" viewBox="0 0 180 110" width="148">
      <circle cx="90" cy="55" r="44" fill="#ECEFF7" />
      <rect fill="#2F3551" height="34" rx="8" width="44" x="68" y="50" />
      <path
        d="M78 50v-8c0-6.6 5.4-12 12-12s12 5.4 12 12v8"
        stroke="#2F3551"
        strokeLinecap="round"
        strokeWidth="7"
      />
      <circle cx="90" cy="64" fill="#FFFFFF" r="5" />
      <rect fill="#FFFFFF" height="9" rx="2" width="4" x="88" y="66" />
      <path d="M32 40h10M37 35v10" stroke="#C5CCDF" strokeLinecap="round" strokeWidth="2.5" />
      <path d="M140 30h8M144 26v8" stroke="#C5CCDF" strokeLinecap="round" strokeWidth="2.2" />
      <circle cx="146" cy="66" r="3.5" fill="#C5CCDF" />
      <circle cx="40" cy="74" r="4" fill="#E2E6F0" />
    </svg>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, session, updatePassword } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') ?? '');
    const confirm = String(form.get('confirm') ?? '');

    if (password !== confirm) {
      toast.show({ variant: 'error', title: 'As senhas não coincidem' });
      return;
    }

    setSubmitting(true);
    const { error } = await updatePassword(password);
    setSubmitting(false);

    if (error) {
      toast.show({ variant: 'error', title: 'Não foi possível salvar', description: error });
      return;
    }

    toast.show({ variant: 'success', title: 'Senha atualizada', description: 'Você já está conectado.' });
    navigate('/home');
  }

  // O link do e-mail traz a sessão de recuperação na URL; sem ela não há o que salvar.
  const linkInvalid = !loading && !session;

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

      <header className="auth-screen__brand">Wishly</header>

      <section className="auth-screen__card">
        <div className="auth-screen__illo">
          <ResetIllustration />
        </div>

        {linkInvalid ? (
          <>
            <h1 className="auth-screen__title">Link inválido ou expirado</h1>
            <p className="auth-screen__subtitle">
              Peça um novo link de recuperação na tela de login.
            </p>
            <Link className="primary-button primary-button--full" to="/login">
              Voltar ao login
            </Link>
          </>
        ) : (
          <>
            <h1 className="auth-screen__title">Criar nova senha</h1>
            <p className="auth-screen__subtitle">Escolha uma senha nova para a sua conta.</p>

            <form className="auth-screen__form" onSubmit={handleSubmit}>
              <PasswordField autoComplete="new-password" label="Nova senha" name="password" />
              <PasswordField autoComplete="new-password" label="Confirmar nova senha" name="confirm" />

              <button className="primary-button primary-button--full" disabled={submitting || loading} type="submit">
                {submitting ? 'Salvando...' : 'Salvar nova senha'}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
