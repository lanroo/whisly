// Whisly — Service Worker (Web Push + PWA básico)

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Recebe o push e mostra a notificação.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Whisly', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Whisly';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png?v=2',
    badge: '/favicon.svg?v=2',
    data: { url: data.url || '/activity' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Ao clicar, abre/foca o app na URL do evento.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/activity';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
