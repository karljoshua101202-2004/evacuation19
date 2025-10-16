const CACHE_NAME = 'shelter-locator-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  // Add your JS/CSS/map tiles or other files below
  './styles.css',
  './app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).then(fetchResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            // Cache fetched files for offline use
            if (event.request.url.startsWith(self.location.origin)) {
              cache.put(event.request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        }).catch(() => {
          // Optional: fallback page
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        })
      );
    })
  );
});




