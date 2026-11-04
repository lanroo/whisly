import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { AuthContext, type AuthResult, type OAuthProvider, type SignUpParams } from './auth-context';
import { emailRedirectUrl } from './email-redirect';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    // Sem Supabase configurado, `loading` já inicia como false (modo demo).
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const signInWithPassword = useCallback(
    async (identifier: string, password: string): Promise<AuthResult> => {
      if (!supabase) return { error: null };
      // Login por e-mail ou @usuário: se não parecer e-mail, resolve o e-mail
      // a partir do handle antes de autenticar.
      let email = identifier.trim();
      if (!email.includes('@') || email.startsWith('@')) {
        const { data: resolved, error: lookupError } = await supabase.rpc('email_for_handle', {
          _handle: identifier,
        });
        if (lookupError) return { error: lookupError.message };
        if (!resolved) return { error: 'Usuário não encontrado.' };
        email = resolved as string;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    [],
  );

  const signUp = useCallback(
    async ({ email, password, name, handle }: SignUpParams): Promise<AuthResult> => {
      if (!supabase) return { error: null, needsConfirmation: false };
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, handle },
          emailRedirectTo: emailRedirectUrl('/auth/callback'),
        },
      });
      return {
        error: error?.message ?? null,
        needsConfirmation: !error && !data.session,
      };
    },
    [],
  );

  const signInWithOAuth = useCallback(async (provider: OAuthProvider): Promise<AuthResult> => {
    if (!supabase) return { error: 'Login social indisponível em modo demo.' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/home` },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    if (!supabase) return { error: null };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: emailRedirectUrl('/reset-password'),
    });
    return { error: error?.message ?? null };
  }, []);

  const updatePassword = useCallback(async (password: string): Promise<AuthResult> => {
    if (!supabase) return { error: null };
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  }, []);

  const value = useMemo(
    () => ({
      isConfigured: isSupabaseConfigured,
      loading,
      user,
      session,
      signInWithPassword,
      signUp,
      signInWithOAuth,
      signOut,
      resetPassword,
      updatePassword,
    }),
    [
      loading,
      user,
      session,
      signInWithPassword,
      signUp,
      signInWithOAuth,
      signOut,
      resetPassword,
      updatePassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
