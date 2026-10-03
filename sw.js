// Jona Ordini: service worker minimo per installare l'app e aprirla anche senza rete.
// Strategia "prima la rete": prende sempre la versione più recente, usa la copia salvata solo se offline.
const CACHE = 'jona-ordini-v12';
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
