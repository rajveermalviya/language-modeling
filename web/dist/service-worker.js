var CACHE_NAME = 'nxtWord';
var urlsToCache = [
  'main.bundle.js',
  'tensorflow.bundle.js',
  'vendors~MDCRipple~MDCTextField~MDCTopAppBar.bundle.js',
  'vendors~MDCTemporaryDrawer.bundle.js',
  'vendors~MDCTextField.bundle.js',
  'vendors~MDCTopAppBar.bundle.js',
  'vendors~tensorflow.bundle.js',
  '/web_model/group1-shard1of2',
  '/web_model/group1-shard2of2',
  '/web_model/group2-shard1of1',
  '/web_model/group3-shard1of1',
  '/web_model/group4-shard1of2',
  '/web_model/group4-shard2of2',
  '/web_model/model.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(
        keyList.map(function(key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
