import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/shared/auth';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { ToastProvider } from '@/shared/ui/toast';
import { queryClient } from './queryClient';

interface AppProvidersProps {
  children: ReactNode;
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
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
