var CACHE_NAME = 'nxtWord';
var urlsToCache = [
  '/bundle.js',
  '/web_model/group1-shard1of2',
  '/web_model/group1-shard2of2',
  '/web_model/group2-shard1of1',
  '/web_model/group3-shard1of1',
  '/web_model/group4-shard1of2',
  '/web_model/group4-shard2of2',
  '/web_model/model.json'
];


self.addEventListener('install', function (event) {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function (cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
});


self.addEventListener('activate', function (event) {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});


self.addEventListener('fetch', function (event) {
  console.log('[Service Worker] Fetch', event.request.url);
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});