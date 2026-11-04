import { Link } from 'react-router-dom';
import { AuthBrand } from '../components/AuthBrand';
import { useAuth } from '../shared/auth';

function callbackMessage(hasError: boolean, loading: boolean, hasSession: boolean) {
  if (hasError) {
    return {
      title: 'Link inválido ou expirado',
      description: 'Não foi possível confirmar por este link. Tente entrar com seu e-mail e senha.',
      action: { label: 'Ir para o login', to: '/login' },
    };
  }
  if (loading) {
    return {
      title: 'Confirmando seu e-mail...',
      description: 'Aguarde enquanto concluímos a confirmação.',
      action: null,
    };
  }
  if (hasSession) {
    return {
      title: 'E-mail confirmado!',
      description: 'Sua conta está pronta para usar.',
      action: { label: 'Continuar', to: '/home' },
    };
  }
  return {
    title: 'Entre na sua conta',
    description: 'Se você abriu o link do e-mail, entre com seu e-mail e senha para continuar.',
    action: { label: 'Ir para o login', to: '/login' },
  };
}

/** Resultado do link de confirmação enviado pelo Supabase. */
export function AuthCallbackPage() {
  const { loading, session } = useAuth();
  const query = new URLSearchParams(window.location.search);
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const hasError = Boolean(query.get('error') || fragment.get('error'));
  const message = callbackMessage(hasError, loading, Boolean(session));

  return (
    <main className="auth-screen">
      <AuthBrand />
      <section className="auth-screen__card">
        <h1 className="auth-screen__title">{message.title}</h1>
        <p className="auth-screen__subtitle">{message.description}</p>
        {message.action && (
          <Link className="primary-button primary-button--full" to={message.action.to}>
            {message.action.label}
          </Link>
        )}
      </section>
    </main>
  );
}
