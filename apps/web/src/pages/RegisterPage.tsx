import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AuthBrand } from '../components/AuthBrand';
import { PasswordField } from '../components/PasswordField';
import { useAuth } from '../shared/auth';
import { useToast } from '../shared/ui';

/** Normaliza igual ao servidor: minúsculo, sem @, só [a-z0-9_.]. */
function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@+/, '').toLowerCase().replace(/[^a-z0-9_.]/g, '');
}

/** Ilustração flat: caixa de presente — tela de cadastro. */
function RegisterIllustration() {
  return (
    <svg aria-hidden="true" fill="none" height="90" viewBox="0 0 180 110" width="148">
      <circle cx="90" cy="55" r="44" fill="#ECEFF7" />
      <rect fill="#2F3551" height="38" rx="6" width="48" x="66" y="48" />
      <rect fill="#1E2338" height="14" rx="5" width="58" x="61" y="38" />
      <rect fill="#FFFFFF" height="48" rx="2" width="8" x="86" y="38" />
      <ellipse cx="81" cy="32" fill="#C5CCDF" rx="7" ry="5.5" />
      <ellipse cx="99" cy="32" fill="#C5CCDF" rx="7" ry="5.5" />
      <circle cx="90" cy="33" fill="#FFFFFF" r="3.5" />
      <path d="M32 40h10M37 35v10" stroke="#C5CCDF" strokeLinecap="round" strokeWidth="2.5" />
      <path d="M140 30h8M144 26v8" stroke="#C5CCDF" strokeLinecap="round" strokeWidth="2.2" />
      <circle cx="146" cy="66" r="3.5" fill="#C5CCDF" />
      <circle cx="40" cy="74" r="4" fill="#E2E6F0" />
    </svg>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signUp } = useAuth();
  const [handle, setHandle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '');
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');
    const confirm = String(form.get('confirm') ?? '');
    const cleanHandle = normalizeHandle(handle);

    if (cleanHandle.length < 3) {
      toast.show({
        variant: 'error',
        title: 'Usuário inválido',
        description: 'Use ao menos 3 caracteres: letras, números, ponto ou _.',
      });
      return;
    }

    if (password !== confirm) {
      toast.show({ variant: 'error', title: 'As senhas não coincidem' });
      return;
    }

    setSubmitting(true);

    // Garante que o @usuário ainda está livre antes de criar a conta.
    if (supabase) {
      const { data: available, error: checkError } = await supabase.rpc('is_handle_available', {
        _handle: cleanHandle,
      });
      if (checkError) {
        setSubmitting(false);
        toast.show({ variant: 'error', title: 'Não foi possível validar o usuário', description: checkError.message });
        return;
      }
      if (!available) {
        setSubmitting(false);
        toast.show({
          variant: 'error',
          title: 'Usuário indisponível',
          description: `@${cleanHandle} já está em uso. Escolha outro.`,
        });
        return;
      }
    }

    const { error, needsConfirmation } = await signUp({ email, password, name, handle: cleanHandle });
    setSubmitting(false);

    if (error) {
      toast.show({ variant: 'error', title: 'Não foi possível criar a conta', description: error });
      return;
    }

    if (needsConfirmation) {
      toast.show({
        variant: 'info',
        title: 'Confirme seu e-mail',
        description: 'Enviamos um link de confirmação para a sua caixa de entrada.',
      });
      navigate('/login');
      return;
    }

    toast.show({ variant: 'success', title: 'Conta criada', description: 'Bem-vindo ao Whisly!' });
    navigate('/home');
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
          <RegisterIllustration />
        </div>

        <h1 className="auth-screen__title">Criar conta</h1>
        <p className="auth-screen__subtitle">Comece a guardar seus desejos num só lugar.</p>

        <form className="auth-screen__form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Nome</span>
            <div className="field__control">
              <input autoComplete="name" name="name" placeholder="Seu nome" required type="text" />
            </div>
          </label>

          <label className="field">
            <span>Usuário</span>
            <div className="field__control">
              <input
                autoCapitalize="none"
                autoComplete="username"
                name="handle"
                onChange={(event) => setHandle(event.target.value)}
                placeholder="seu_usuario"
                required
                spellCheck={false}
                type="text"
                value={handle}
              />
            </div>
            <small className="field__hint">Como as pessoas vão te encontrar: @{normalizeHandle(handle) || 'usuario'}</small>
          </label>

          <label className="field">
            <span>E-mail</span>
            <div className="field__control">
              <input autoComplete="email" name="email" placeholder="nome@exemplo.com" required type="email" />
            </div>
          </label>

          <PasswordField autoComplete="new-password" label="Senha" name="password" />
          <PasswordField autoComplete="new-password" label="Confirmar senha" name="confirm" />

          <button className="primary-button primary-button--full" disabled={submitting} type="submit">
            {submitting ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-screen__footer">
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </p>
      </section>
    </main>
  );
}
