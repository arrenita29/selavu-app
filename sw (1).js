// Cached copy first, so the app opens instantly. A fresh copy is fetched in the background and used on the next open.
// Data requests (Supabase) are never cached: only same-origin GET requests are handled here.
const CACHE = 'selavu-shell-v5';
const SHELL = ['./', 'index.html', 'admin.html', 'privacy.html', 'manifest.webmanifest', 'selavu-icon-192-v2.png', 'selavu-icon-512-v2.png', 'selavu-icon-maskable-512-v2.png', 'selavu-apple-touch-180-v2.png', 'selavu-favicon-48-v2.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then(function (cached) {
      const network = fetch(req).then(function (res) {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return res;
      });
      if (cached) { network.catch(function () { /* offline: the cached copy is already shown */ }); return cached; }
      return network.catch(function () { return caches.match('index.html'); });
    })
  );
});
