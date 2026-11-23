const CACHE = 'logbook-v25';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Önce internetten dene (güncelleme gelsin), olmazsa önbellekten aç (uçakta da çalışsın)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    // Kendi dosyalarımız için tarayıcı önbelleğini atla: GitHub yeni sürümü yayınlayınca hemen gelsin
    (new URL(e.request.url).origin === self.location.origin
      ? fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' })
      : fetch(e.request))
      .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
