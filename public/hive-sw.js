// Hive Service Worker — handles push notification display
// Place this file at the ROOT of your web server (same level as index.html)

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Handle push events (from server-sent pushes if you add a backend later)
self.addEventListener('push', function(event) {
  if (!event.data) return;
  const data = event.data.json();
  const options = buildNotificationOptions(data);
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notifications triggered directly from the app (showNotification via SW)
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        self.clients.openWindow('/');
      }
    })
  );
});

function buildNotificationOptions(data) {
  const tierConfig = {
    friendly: { badge: '🌿', requireInteraction: false, silent: false },
    moderate: { badge: '⚠️', requireInteraction: false, silent: false },
    urgent:   { badge: '🚨', requireInteraction: true,  silent: false },
  };
  const tier = tierConfig[data.tier] || tierConfig.friendly;

  return {
    body: data.body,
    icon: '/hive-icon-192.png',   // add your icon at this path
    badge: '/hive-badge-72.png',  // small monochrome badge icon
    tag: data.tag || 'hive-notification',
    requireInteraction: tier.requireInteraction,
    silent: tier.silent,
    data: { url: '/', taskId: data.taskId || null },
    actions: data.tier === 'urgent'
      ? [{ action: 'open', title: 'Open Hive' }]
      : [],
    vibrate: data.tier === 'urgent' ? [200, 100, 200, 100, 200] : [100],
  };
}

// Message from app: show a notification immediately
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tier, tag, taskId } = event.data;
    const options = buildNotificationOptions({ title, body, tier, tag, taskId });
    event.waitUntil(self.registration.showNotification(title, options));
  }
});
