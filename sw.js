// Jona Ordini: service worker minimo per installare l'app e aprirla anche senza rete.
// Strategia "prima la rete": prende sempre la versione più recente, usa la copia salvata solo se offline.
const CACHE = 'jona-ordini-v75';
const FILES = ['./', './index.html', './manifest.webmanifest', './firebase-config.js', './lib/firebase-10.14.1.js', './lib/qrcode-1.4.4.js', './jona-icon-192.png', './jona-icon-512.png', './media/invio-chef.mp4', './media/invio-fornitore.mp4', './lib/jsqr-1.4.0.js', './media/invito.jpg', './media/ynoy.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== 'jona-allegati' && k !== 'jona-badge').map(k => caches.delete(k)))) // jona-allegati: foto e vocali della chat già scaricati
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
  // «URGENTE» (prodotto urgente dello staff): resta sullo schermo finché non la tocchi e vibra più a lungo.
  const urg = /^URGENTE\b/.test(d.titolo || '');
  e.waitUntil(Promise.all([self.registration.showNotification(d.titolo || 'Jona Ordini', {
    body: d.testo || '', tag: d.tag || undefined, renotify: !!d.tag, requireInteraction: urg,
    icon: './jona-icon-192.png', badge: './jona-icon-192.png', vibrate: urg ? [300, 100, 300, 100, 300] : [80, 40, 80]
  }), badgeBump()]));
});

// Pallino sull'icona: l'app scrive il numero giusto in «jona-badge», qui si aggiunge 1 per ogni push arrivata con l'app non in vista.
async function badgeGet() { try { const r = await (await caches.open('jona-badge')).match('./badge-n'); return r ? (+(await r.text()) || 0) : 0; } catch (err) { return 0; } }
async function badgeSet(n) {
  n = Math.max(0, n);
  try { await (await caches.open('jona-badge')).put('./badge-n', new Response(String(n))); } catch (err) {}
  try { if (self.navigator.setAppBadge) await (n ? self.navigator.setAppBadge(n) : self.navigator.clearAppBadge()); } catch (err) {}
}
async function badgeBump() {
  const open = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  if (!open.some(c => c.visibilityState === 'visible')) await badgeSet((await badgeGet()) + 1);
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const w = list.find(c => c.url.startsWith(self.registration.scope));
    return w ? w.focus() : self.clients.openWindow('./');
  }));
});

// Invii in sospeso (index.html, IndexedDB «jona-outbox»): su Android le push non partite escono anche con l'app chiusa.
// Se l'app è aperta in primo piano le manda lei (obxFlush), così non partono due volte.
const PUSH_URL = 'https://jona-notifiche.jona-ristorante-by-ynoy-corp.workers.dev';
const obxDb = () => new Promise((res, rej) => {
  const r = indexedDB.open('jona-outbox', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('q', { keyPath: 'id' });
  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
});
const obxTx = (db, mode, f) => new Promise((res, rej) => {
  const t = db.transaction('q', mode); const q = f(t.objectStore('q'));
  t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error);
});
async function obxFlush() {
  const open = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  if (open.some(c => c.visibilityState === 'visible')) return;
  const db = await obxDb();
  const list = ((await obxTx(db, 'readonly', s => s.getAll())) || []).sort((a, b) => a.creato - b.creato);
  let left = list.length;
  try {
    for (const x of list) {
      if (Date.now() - x.creato < 864e5) {
        const r = await fetch(PUSH_URL + '/invia', { method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ titolo: x.titolo, testo: x.testo, subs: x.subs.map(s => s.sub) }) });
        if (!r.ok) throw new Error('invia ' + r.status); // Background Sync riprova più tardi
      }
      await obxTx(db, 'readwrite', s => s.delete(x.id)); left--;
    }
  } finally {
    if (left < list.length) await badgeSet((await badgeGet()) - (list.length - left));
  }
}
self.addEventListener('sync', e => { if (e.tag === 'jona-outbox') e.waitUntil(obxFlush()); });
