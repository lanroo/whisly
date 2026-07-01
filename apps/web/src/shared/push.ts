import { supabase } from '@/lib/supabase';

const VAPID_PUBLIC_KEY =
  (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) ??
  'BDQez_OG3IrAPAd7Kdo6X8XMmf7SfzPoPKUG0KNS-4Z1ERwN11Ww623m681iXGWmkV4CDzvmTtzzIbv-GzW3w8E';

/** Web Push é suportado pelo navegador? */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration('/');
  if (existing) return existing;
  return navigator.serviceWorker.register('/sw.js', { scope: '/' });
}

/** Já existe uma inscrição de push ativa neste device? */
export async function isPushSubscribed(): Promise<boolean> {
  if (!isPushSupported()) return false;
  const reg = await navigator.serviceWorker.getRegistration('/');
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  return Boolean(sub);
}

/** Ativa as notificações: pede permissão, inscreve e salva no Supabase. */
export async function enablePush(): Promise<void> {
  if (!isPushSupported()) throw new Error('Seu navegador não suporta notificações.');
  if (!VAPID_PUBLIC_KEY) throw new Error('VAPID público ausente (defina VITE_VAPID_PUBLIC_KEY).');
  if (!supabase) throw new Error('Supabase não configurado.');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Permissão de notificação negada.');

  const reg = await getRegistration();
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as BufferSource,
    });
  }

  const json = sub.toJSON();
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('Sessão expirada.');

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: sub.endpoint,
      p256dh: json.keys?.p256dh ?? '',
      auth: json.keys?.auth ?? '',
    },
    { onConflict: 'endpoint' },
  );
  if (error) throw error;
}

/** Desativa as notificações neste device. */
export async function disablePush(): Promise<void> {
  if (!isPushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration('/');
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    if (supabase) await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
    await sub.unsubscribe();
  }
}

/** Envia uma notificação de teste para o próprio usuário (valida o pipeline). */
export async function sendTestPush(): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('Sessão expirada.');
  const { data, error } = await supabase.functions.invoke<{ sent?: number; error?: string }>(
    'send-push',
    {
      body: {
        userId,
        title: 'Whisly',
        body: 'Notificações ativadas! 🎉',
        url: '/activity',
      },
    },
  );
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
}
