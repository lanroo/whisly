import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** `true` quando as credenciais do Supabase estão presentes no .env. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Cliente Supabase compartilhado.
 *
 * É `null` enquanto o projeto não estiver configurado (sem .env) — assim o app
 * continua rodando em modo demo até as credenciais serem adicionadas.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
