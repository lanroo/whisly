import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Prioriza as variáveis de ambiente; usa os valores PÚBLICOS do projeto como
// fallback (URL + anon key são públicos por design — protegidos por RLS), para
// o build funcionar mesmo sem env configurado no host (ex.: deploy direto).
const FALLBACK_URL = 'https://uvkdhuqndzrxqrkmevtr.supabase.co';
const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2a2RodXFuZHpyeHFya21ldnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NjI1NTMsImV4cCI6MjA5NzAzODU1M30._k12ArPeEGFIg7Y0VjXVhGrAZ6QFcpZUw8cHCMLp1M8';

const url = import.meta.env.VITE_SUPABASE_URL ?? FALLBACK_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? FALLBACK_ANON_KEY;

/** `true` quando as credenciais do Supabase estão presentes no .env. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Cliente Supabase compartilhado.
 *
 * É `null` enquanto o projeto não estiver configurado (sem .env) — assim o app
 * continua rodando em modo demo até as credenciais serem adicionadas.
 */
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
