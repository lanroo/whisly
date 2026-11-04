/** Links enviados por e-mail precisam abrir fora do computador de desenvolvimento. */
const PUBLIC_APP_ORIGIN = 'https://whislyapp.com';

export function emailRedirectUrl(path: '/auth/callback' | '/reset-password'): string {
  return new URL(path, PUBLIC_APP_ORIGIN).toString();
}
