import { useContext } from 'react';
import { AuthContext } from './auth-context';

/** Acessa o estado e as ações de autenticação. Requer <AuthProvider>. */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  }

  return context;
}
