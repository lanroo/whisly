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
 * Exibe a splash enquanto a sessão carrega e por um tempo mínimo,
 * para dar a sensação de abertura de app (evita "piscar" a tela).
 */
function SplashGate({ children }: { children: ReactNode }) {
  const { loading } = useAuth();
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), 900);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !minElapsed) {
    return <SplashScreen />;
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
