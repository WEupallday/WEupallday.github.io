/* TheFlap service worker — instant app-shell via stale-while-revalidate.
   The shell (index.html + versioned scripts + icons) is served from cache immediately for a
   native, no-white-flash open, then refreshed silently in the background so the next launch is fresh.
   Cross-origin requests (Supabase API, CDNs) are NEVER cached. Bump CACHE to roll old caches out. */
const CACHE = 'theflap-v44';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/challenges.js?v=17', '/flapextras.js?v=1'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  const sameOrigin = url.origin === self.location.origin;
  const accept = req.headers.get('accept') || '';
  const isHTML = req.mode === 'navigate' || accept.includes('text/html');

  if (isHTML) {
    /* STALE-WHILE-REVALIDATE: paint cached shell instantly, refresh in the background. */
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match('/index.html');
      const net = fetch(req).then((res) => {
        if (res && res.ok) cache.put('/index.html', res.clone());
        return res;
      }).catch(() => null);
      return cached || (await net) || cache.match('/');
    })());
    return;
  }

  /* Same-origin static assets only: serve from cache instantly, revalidate in background.
     Cross-origin (Supabase data, CDNs) is passed straight to the network and never cached. */
  if (!sameOrigin) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    const net = fetch(req).then((res) => {
      if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    return cached || (await net) || cached;
  })());
});

/* ===== Web Push: show the notification when one arrives ===== */
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; }
  catch (_) { d = { title: 'TheFlap', body: (e.data && e.data.text && e.data.text()) || '' }; }
  const title = d.title || 'TheFlap';
  const opts = {
    body: d.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'theflap',
    renotify: true,
    data: { url: d.url || '/' }
  };
  e.waitUntil(self.registration.showNotification(title, opts));
});

/* Tapping the notification focuses an open TheFlap tab, or opens one. */
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
