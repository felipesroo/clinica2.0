// Service Worker para PWA e Notificações Push - Dra. Jordane (Agenda)

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Dra. Jordane (Agenda)';
    const options = {
      body: data.body || 'Nova notificação da clínica.',
      icon: data.icon || '/logo.png',
      badge: data.badge || '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      tag: data.tag || 'clinica-notificacao',
      renotify: true,
      data: {
        url: data.url || '/agendamentos',
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Error handling push event:', err);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window open with this app
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
