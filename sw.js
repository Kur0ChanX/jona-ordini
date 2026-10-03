// Jona Ordini: service worker minimo per installare l'app e aprirla anche senza rete.
// Strategia "prima la rete": prende sempre la versione più recente, usa la copia salvata solo se offline.
const CACHE = 'jona-ordini-v15';
const FILES = ['./', './index.html', './manifest.webmanifest', './firebase-config.js', './lib/firebase-10.14.1.js', './lib/qrcode-1.4.4.js', './jona-icon-192.png', './jona-icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});

// Notifiche push dal server (worker/): mostra il messaggio anche con l'app chiusa.
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { testo: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.titolo || 'Jona Ordini', {
    body: d.testo || '', tag: d.tag || undefined, renotify: !!d.tag,
    icon: './jona-icon-192.png', badge: './jona-icon-192.png', vibrate: [80, 40, 80]
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const w = list.find(c => c.url.startsWith(self.registration.scope));
    return w ? w.focus() : self.clients.openWindow('./');
  }));
});
