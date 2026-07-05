import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AuthSocialButtons } from '../components/AuthSocialButtons';
import { MaterialIcon } from '../components/MaterialIcon';
import { PasswordField } from '../components/PasswordField';
import { useAuth } from '../shared/auth';
import { useToast } from '../shared/ui';

/** Normaliza igual ao servidor: minúsculo, sem @, só [a-z0-9_.]. */
function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@+/, '').toLowerCase().replace(/[^a-z0-9_.]/g, '');
}

export function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signUp, signInWithOAuth } = useAuth();
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
            <span>Usuário</span>
            <div className="field__control">
              <MaterialIcon className="field__icon" name="alternate_email" />
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
