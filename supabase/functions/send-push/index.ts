// ============================================================
// Whisly — Edge Function: send-push
// Envia Web Push para todos os devices de um usuário.
// Chamada por: botão de teste (JWT do próprio usuário, só pode notificar a si
// mesmo) e pelo trigger de activity (service role, pode notificar qualquer um).
// Secrets necessários: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT.
// ============================================================
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { userId, title, body, url } = await req.json();
    if (!userId || typeof userId !== 'string') return json({ error: 'userId obrigatório' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:contato@whisly.app';

    if (!vapidPublic || !vapidPrivate) {
      return json({ error: 'VAPID não configurado no servidor.' }, 200);
    }

    // Autorização: usuário normal só pode notificar a si mesmo; service role libera.
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: caller } = await userClient.auth.getUser();
    if (caller.user && caller.user.id !== userId) {
      return json({ error: 'Não autorizado.' }, 403);
    }

    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: subs, error } = await admin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', userId);
    if (error) return json({ error: error.message }, 200);

    const payload = JSON.stringify({
      title: title ?? 'Whisly',
      body: body ?? '',
      url: url ?? '/activity',
    });

    let sent = 0;
    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
        sent += 1;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await admin.from('push_subscriptions').delete().eq('id', sub.id);
        }
      }
    }

    return json({ sent });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Erro inesperado' }, 200);
  }
});
