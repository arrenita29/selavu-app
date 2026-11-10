// Network first, so a new version of the page shows up as soon as you are online.
// The cached copy only opens the app when offline. Data requests (Supabase) are never cached.
const CACHE = 'selavu-shell-v4';
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
    fetch(req).then(function (res) {
      const copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () { return caches.match(req).then(function (r) { return r || caches.match('index.html'); }); })
  );
});
