import { useEffect, useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen } from '@/components/SplashScreen';
import { AuthProvider, useAuth } from '@/shared/auth';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { ToastProvider } from '@/shared/ui/toast';
import { queryClient } from './queryClient';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Splash de abertura (logo) só na PRIMEIRA vez que o app abre nesta sessão do
 * navegador — dá a sensação de "abrir o app". Em recarregamentos de página (F5)
 * da mesma sessão, mostra um loader secundário leve (spinner), não o logo.
 */
function SplashGate({ children }: { children: ReactNode }) {
  const { loading } = useAuth();
  const [firstOpen] = useState(() => !sessionStorage.getItem('wishly-booted'));
  // No F5 não há tempo mínimo: o spinner some assim que a sessão resolve.
  const [minElapsed, setMinElapsed] = useState(!firstOpen);

  useEffect(() => {
    if (!firstOpen) return;
    const timer = setTimeout(() => setMinElapsed(true), 900);
    return () => clearTimeout(timer);
  }, [firstOpen]);

  useEffect(() => {
    if (!loading) sessionStorage.setItem('wishly-booted', '1');
  }, [loading]);

  if (loading || !minElapsed) {
    return firstOpen ? (
      <SplashScreen />
    ) : (
      <div className="route-loader" role="status" aria-live="polite">
        <span className="route-loader__spinner" />
      </div>
    );
  }
  return <>{children}</>;
}

/**
 * Composição central de provedores da aplicação.
 *
 * Ordem: ErrorBoundary > QueryClient (estado de servidor) > Auth (sessão) >
 * Toast (notificações). Mantém o `main.tsx` enxuto.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <SplashGate>{children}</SplashGate>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
