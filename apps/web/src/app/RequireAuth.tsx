import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/shared/auth';

/**
 * Guarda de rotas: bloqueia telas que exigem login.
 * - Enquanto carrega a sessão, mostra um loader.
 * - Sem usuário (e Supabase configurado), redireciona para /welcome.
 * - Em modo demo (sem Supabase), libera o acesso.
 */
export function RequireAuth() {
  const { isConfigured, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="route-loader" role="status" aria-live="polite">
        <span className="route-loader__spinner" />
      </div>
    );
  }

  if (isConfigured && !user) {
    return <Navigate replace to="/welcome" />;
  }

  return <Outlet />;
}
