/** TLDs de segundo nível comuns (ex.: amazon.com.br → o rótulo é "amazon"). */
const SECOND_LEVEL = new Set(['com', 'co', 'org', 'net', 'gov', 'edu', 'ac', 'loja']);

/**
 * Deriva um nome de loja apresentável a partir de uma URL, usando o domínio.
 * Ex.: "https://www.amazon.com.br/dp/123" → "Amazon"; "https://loja.com" → "Loja".
 * Não faz nenhuma requisição — só analisa o hostname.
 */
export function storeNameFromUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const host = new URL(withProtocol).hostname.replace(/^www\./i, '');
    const parts = host.split('.');
    let index = parts.length - 2;
    if (parts.length >= 3 && SECOND_LEVEL.has(parts[parts.length - 2])) {
      index = parts.length - 3;
    }
    const label = parts[Math.max(0, index)] || host;
    return label.charAt(0).toUpperCase() + label.slice(1);
  } catch {
    return null;
  }
}
