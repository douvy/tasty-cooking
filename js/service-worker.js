// Service Worker for Tasty Cooking
const CACHE_NAME = 'tasty-cooking-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.min.css',
  '/js/recipes.min.js',
  '/js/all.js',
  '/assets/img/favicon.png',
  '/manifest.json',
  '/assets/fonts/GT-Flexa-Standard-Regular.woff2',
  '/assets/fonts/WindsorBold.woff2'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching core assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise, fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Cache the fetched response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                // Only cache same-origin requests
                if (event.request.url.startsWith(self.location.origin)) {
                  cache.put(event.request, responseToCache);
                }
              });
            
            return response;
          })
          .catch(() => {
            // If both cache and network fail, serve fallback for HTML pages
            if (event.request.headers.get('Accept').includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});