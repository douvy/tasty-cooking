// Service Worker for Tasty Cooking
const CACHE_NAME = 'tasty-cooking-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.min.css',
  '/js/recipes.min.js',
  '/js/recipe-search.min.js',
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

// Fetch event - stale-while-revalidate strategy for better performance
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Apply different strategies based on resource type
  if (url.pathname.endsWith('.html') || url.pathname === '/' || !url.pathname.includes('.')) {
    // For HTML pages - network first with fallback to cache
    event.respondWith(networkFirstWithCache(event.request));
  } else if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    // For images - cache first with background update
    event.respondWith(cacheFirstWithRefresh(event.request));
  } else {
    // For other assets (CSS, JS, fonts) - stale-while-revalidate
    event.respondWith(staleWhileRevalidate(event.request));
  }
});

// Network-first strategy with cache fallback for HTML
function networkFirstWithCache(request) {
  return fetch(request)
    .then(response => {
      // Cache the new response
      const responseToCache = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        if (request.url.startsWith(self.location.origin)) {
          cache.put(request, responseToCache);
        }
      });
      return response;
    })
    .catch(() => {
      // If network fails, try cache
      return caches.match(request)
        .then(cachedResponse => {
          // Return cached response or fallback to index
          return cachedResponse || caches.match('/index.html');
        });
    });
}

// Cache-first strategy with background refresh for images
function cacheFirstWithRefresh(request) {
  return caches.match(request)
    .then(cachedResponse => {
      // Return cached response immediately if available
      const fetchPromise = fetch(request)
        .then(networkResponse => {
          // Update cache in the background
          caches.open(CACHE_NAME).then(cache => {
            if (request.url.startsWith(self.location.origin)) {
              cache.put(request, networkResponse.clone());
            }
          });
          return networkResponse;
        });
      
      return cachedResponse || fetchPromise;
    });
}

// Stale-while-revalidate strategy for JS/CSS
function staleWhileRevalidate(request) {
  return caches.match(request)
    .then(cachedResponse => {
      // Fetch regardless of cache hit/miss
      const fetchPromise = fetch(request)
        .then(networkResponse => {
          // Update the cache
          caches.open(CACHE_NAME).then(cache => {
            if (request.url.startsWith(self.location.origin)) {
              cache.put(request, networkResponse.clone());
            }
          });
          return networkResponse;
        })
        .catch(() => {
          // If fetch fails and we have a cached response, use it
          if (cachedResponse) return cachedResponse;
          
          // Otherwise try to find an appropriate fallback
          if (request.url.includes('.css')) {
            return caches.match('/css/style.min.css');
          } else if (request.url.includes('.js')) {
            return caches.match('/js/recipes.min.js');
          }
          // No fallback available
          return new Response('Network error occurred', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      
      // Return cached response or wait for network
      return cachedResponse || fetchPromise;
    });
}