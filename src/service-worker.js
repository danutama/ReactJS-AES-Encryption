self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('aes-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        './static/assets/index.css',
        './static/assets/index.js',
        './upload-icon.png',
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== 'aes-cache') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
