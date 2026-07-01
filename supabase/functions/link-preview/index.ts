// ============================================================
// Whisly — Edge Function: link-preview
// Busca a página de um produto e extrai metadados (Open Graph
// + JSON-LD schema.org/Product) para auto-preencher o form de
// "Adicionar item": nome, marca, preço e imagem.
// ============================================================
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const IMAGE_BUCKET = 'item-images';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Preview {
  title?: string;
  brand?: string;
  price?: string;
  image?: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Extrai o conteúdo de uma <meta property|name="key" content="..."> (qualquer ordem dos atributos). */
function metaContent(html: string, key: string): string | undefined {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`,
      'i',
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`,
      'i',
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeEntities(m[1].trim());
  }
  return undefined;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, ' ');
}

function absoluteUrl(src: string | undefined, base: string): string | undefined {
  if (!src) return undefined;
  try {
    return new URL(src, base).toString();
  } catch {
    return src;
  }
}

function formatPrice(amount?: string | number, currency?: string): string | undefined {
  if (amount === undefined || amount === null || amount === '') return undefined;
  const value = String(amount).trim();
  if (!value) return undefined;
  const cur = (currency ?? '').toUpperCase();
  if (cur === 'BRL' || cur === 'R$') return `R$ ${value}`;
  if (cur === 'USD') return `US$ ${value}`;
  if (cur === 'EUR') return `€ ${value}`;
  return cur ? `${cur} ${value}` : value;
}

/** Procura um objeto Product dentro de qualquer bloco JSON-LD. */
function fromJsonLd(html: string): Preview {
  const out: Preview = {};
  const blocks = [
    ...html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];

  const findProduct = (node: unknown): Record<string, unknown> | undefined => {
    if (!node || typeof node !== 'object') return undefined;
    if (Array.isArray(node)) {
      for (const item of node) {
        const found = findProduct(item);
        if (found) return found;
      }
      return undefined;
    }
    const obj = node as Record<string, unknown>;
    const type = obj['@type'];
    const isProduct = Array.isArray(type)
      ? type.includes('Product')
      : type === 'Product';
    if (isProduct) return obj;
    if (Array.isArray(obj['@graph'])) return findProduct(obj['@graph']);
    return undefined;
  };

  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block[1].trim());
      const product = findProduct(parsed);
      if (!product) continue;

      if (typeof product.name === 'string') out.title = product.name.trim();

      const brand = product.brand;
      if (typeof brand === 'string') out.brand = brand;
      else if (brand && typeof brand === 'object' && 'name' in brand)
        out.brand = String((brand as Record<string, unknown>).name);

      const image = product.image;
      if (typeof image === 'string') out.image = image;
      else if (Array.isArray(image) && image.length) out.image = String(image[0]);
      else if (image && typeof image === 'object' && 'url' in image)
        out.image = String((image as Record<string, unknown>).url);

      const offers = Array.isArray(product.offers)
        ? product.offers[0]
        : product.offers;
      if (offers && typeof offers === 'object') {
        const o = offers as Record<string, unknown>;
        out.price = formatPrice(
          o.price as string | number,
          o.priceCurrency as string,
        );
      }
      if (out.title || out.image) break;
    } catch {
      // bloco JSON-LD inválido — ignora
    }
  }
  return out;
}

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

/**
 * Baixa a imagem do produto (server-side, com Referer da loja para driblar
 * hotlink) e a hospeda no Supabase Storage. Retorna a URL pública.
 * Em qualquer falha, devolve a URL original (melhor esforço).
 */
async function storeImage(
  imageUrl: string | undefined,
  pageUrl: string,
): Promise<string | undefined> {
  if (!imageUrl || imageUrl.startsWith('data:')) return imageUrl;

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return imageUrl;

  try {
    let referer = pageUrl;
    try {
      referer = new URL(pageUrl).origin;
    } catch {
      // mantém pageUrl
    }

    const res = await fetch(imageUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/png,image/*,*/*;q=0.8',
        Referer: referer,
      },
    });
    if (!res.ok) return imageUrl;

    const contentType = (res.headers.get('content-type') ?? '')
      .split(';')[0]
      .trim()
      .toLowerCase();
    if (!contentType.startsWith('image/')) return imageUrl;

    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength === 0 || bytes.byteLength > 8_000_000) return imageUrl;

    const ext = EXT_BY_TYPE[contentType] ?? 'jpg';
    const path = `${crypto.randomUUID()}.${ext}`;

    const admin = createClient(supabaseUrl, serviceKey);
    const { error } = await admin.storage
      .from(IMAGE_BUCKET)
      .upload(path, bytes, { contentType, upsert: false });
    if (error) return imageUrl;

    const { data } = admin.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl || imageUrl;
  } catch {
    return imageUrl;
  }
}

/**
 * Fallback via Microlink (renderiza JS) — pega dados de sites que não expõem
 * OG no HTML cru (ex.: alguns varejistas). Free tier, sem chave.
 */
async function microlinkFallback(
  url: string,
): Promise<{ title?: string; image?: string; store?: string }> {
  try {
    // Com MICROLINK_API_KEY (plano pago) habilita proxy — passa por sites
    // protegidos (Magalu, Amazon, Mercado Livre). Sem chave, usa o free tier.
    const apiKey = Deno.env.get('MICROLINK_API_KEY');
    const endpoint = apiKey
      ? `https://pro.microlink.io/?url=${encodeURIComponent(url)}&proxy=residential`
      : `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (apiKey) headers['x-api-key'] = apiKey;

    const r = await fetch(endpoint, { headers });
    if (!r.ok) return {};
    const j = (await r.json()) as {
      status?: string;
      data?: { title?: string; publisher?: string; image?: { url?: string }; logo?: { url?: string } };
    };
    if (j.status !== 'success' || !j.data) return {};
    return {
      title: j.data.title ?? undefined,
      image: j.data.image?.url ?? j.data.logo?.url ?? undefined,
      store: j.data.publisher ?? undefined,
    };
  } catch {
    return {};
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (typeof url !== 'string' || !/^https?:\/\/.+/i.test(url)) {
      return json({ error: 'URL inválida' }, 400);
    }

    let title: string | undefined;
    let brand: string | undefined;
    let price: string | undefined;
    let image: string | undefined;
    let baseUrl = url;

    // 1) Raspagem direta do HTML (rápida; funciona onde há OG/JSON-LD).
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        },
      });
      if (res.ok) {
        baseUrl = res.url || url;
        const html = (await res.text()).slice(0, 1_500_000);
        const ld = fromJsonLd(html);
        const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();
        title =
          ld.title ??
          metaContent(html, 'og:title') ??
          metaContent(html, 'twitter:title') ??
          (titleTag ? decodeEntities(titleTag) : undefined);
        brand = ld.brand ?? metaContent(html, 'product:brand') ?? metaContent(html, 'og:site_name');
        price =
          ld.price ??
          formatPrice(
            metaContent(html, 'product:price:amount') ?? metaContent(html, 'og:price:amount'),
            metaContent(html, 'product:price:currency') ?? metaContent(html, 'og:price:currency'),
          );
        image = absoluteUrl(
          ld.image ??
            metaContent(html, 'og:image:secure_url') ??
            metaContent(html, 'og:image') ??
            metaContent(html, 'twitter:image'),
          baseUrl,
        );
      }
    } catch {
      // segue para o fallback
    }

    // 2) Fallback Microlink (renderiza JS) para o que faltou.
    if (!title || !image) {
      const ml = await microlinkFallback(url);
      title = title ?? ml.title;
      brand = brand ?? ml.store;
      image = image ?? ml.image;
    }

    const preview: Preview = {
      title,
      brand,
      price,
      // Hospeda a imagem no Storage (evita hotlink 403 ao exibir na lista).
      image: await storeImage(image, baseUrl),
    };

    return json(preview);
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'Erro inesperado' },
      200,
    );
  }
});
