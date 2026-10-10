// sw.ts - Service Worker for EarthMind AI (PIOS) PWA Map Tile Caching

const CACHE_NAME = 'earthmind-cache-v1';
const MAP_TILE_CACHE = 'earthmind-map-tiles-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/global.css',
  '/manifest.json',
  '/favicon.ico',
];

// Install Service Worker and cache static assets
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate worker and clean up legacy caches
self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== MAP_TILE_CACHE) {
            console.log('[Service Worker] Deleting legacy cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Intercept network requests for assets and OpenStreetMap tiles
self.addEventListener('fetch', (event: any) => {
  const url = new URL(event.request.url);

  // Caching OpenStreetMap map tiles offline
  if (url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('basemaps.cartocdn.com')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; // Return cache immediately
        }
        
        return fetch(event.request).then((networkResponse) => {
          return caches.open(MAP_TILE_CACHE).then((cache) => {
            // Store tile image in background cache for offline viewing
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => {
          // Fallback image if map tile fails and isn't cached
          return new Response('', { status: 404 });
        });
      })
    );
  } else {
    // Standard static resource cache-first, fall back to network strategy
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((response) => {
          if (event.request.method === 'GET' && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      }).catch(() => {
        // Fallback for document pages when offline
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html') || new Response('Offline content unavailable.', { status: 503 });
        }
      })
    );
  }
});
