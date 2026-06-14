import type { ReactNode } from 'react';
import { AuthProvider } from '@/shared/auth';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { ToastProvider } from '@/shared/ui/toast';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Composição central de provedores da aplicação.
 *
 * Mantém o `main.tsx` enxuto e dá um único ponto para adicionar novos
 * contextos (ex: QueryClientProvider na Fase 4, Auth na Fase 6).
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
