/**
 * Captura metadados de um produto a partir da URL, via Microlink
 * (https://microlink.io) — serviço externo que lê as meta tags (Open Graph)
 * da página. Chamado direto do browser (a API tem CORS liberado).
 *
 * Volume baixo funciona sem chave; para produção, defina VITE_MICROLINK_KEY
 * e ela é enviada no header `x-api-key`.
 *
 * Preço não é retornado de forma confiável pela API gratuita — fica manual.
 */
export interface LinkPreview {
  title: string | null;
  image: string | null;
  store: string | null;
}

const API_KEY = import.meta.env.VITE_MICROLINK_KEY as string | undefined;

export async function fetchLinkPreview(url: string): Promise<LinkPreview | null> {
  const target = url.trim();
  if (!target) return null;

  const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(target)}`;
  const headers: HeadersInit = API_KEY ? { 'x-api-key': API_KEY } : {};

  const response = await fetch(endpoint, { headers });
  if (!response.ok) return null;

  const json = (await response.json()) as {
    status?: string;
    data?: {
      title?: string;
      publisher?: string;
      image?: { url?: string };
      logo?: { url?: string };
    };
  };

  if (json.status !== 'success' || !json.data) return null;
  const data = json.data;

  return {
    title: data.title ?? null,
    image: data.image?.url ?? data.logo?.url ?? null,
    store: data.publisher ?? null,
  };
}
