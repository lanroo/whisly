import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export type OAuthProvider = 'google' | 'apple';

export interface AuthResult {
  error: string | null;
}

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
}

export interface AuthContextValue {
  /** `true` quando o Supabase tem credenciais (caso contrário, modo demo). */
  isConfigured: boolean;
  loading: boolean;
  user: User | null;
  session: Session | null;
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signUp: (params: SignUpParams) => Promise<AuthResult>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
