const CACHE_NAME = "timesync-v2";
const OFFLINE_URL = "./index.html";

const urlsToCache = [
  "./",
  "./index.html",
  "./assets/manifest.json",
  "./assets/icon-192x192.png",
  "./assets/icon-512x512.png",
  "./assets/favicon.png",
  "./assets/logo.svg",
  // Add any other static assets you want to cache
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Install");
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log("[ServiceWorker] Caching app shell");
      await cache.addAll(urlsToCache);
      
      // Force the waiting service worker to become the active service worker
      self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activate");
  
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheWhitelist = [CACHE_NAME];
      const cacheNames = await caches.keys();
      
      await Promise.all(
        cacheNames.map(async (cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log("[ServiceWorker] Deleting cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
      
      // Take control of all pages
      self.clients.claim();
    })()
  );
});

// Fetch event - serve cached content when offline
self.addEventListener("fetch", (event) => {
  console.log("[ServiceWorker] Fetch", event.request.url);
  
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try to fetch from network first
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // If network fails, serve cached version
          console.log("[ServiceWorker] Fetch failed; returning offline page instead.", error);
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse;
        }
      })()
    );
  } 
  // Handle other requests (CSS, JS, images, etc.)
  else {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          // Serve from cache
          return cachedResponse;
        }
        
        try {
          // Try to fetch from network
          const networkResponse = await fetch(event.request);
          
          // Cache successful responses
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          
          return networkResponse;
        } catch (error) {
          console.log("[ServiceWorker] Fetch failed:", error);
          
          // Return a fallback response for failed requests
          if (event.request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#999">Image unavailable</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
          
          throw error;
        }
      })()
    );
  }
});

// Background sync for when the app comes back online
self.addEventListener('sync', (event) => {
  console.log("[ServiceWorker] Background sync", event.tag);
  
  if (event.tag === 'timezone-sync') {
    event.waitUntil(
      // Perform any sync operations here
      syncTimezoneData()
    );
  }
});

// Push notifications (if you want to add them later)
self.addEventListener('push', (event) => {
  console.log("[ServiceWorker] Push received", event);
  
  const options = {
    body: event.data ? event.data.text() : 'New meeting reminder',
    icon: './icon-192.png',
    badge: './badge-72.png',
    tag: 'timesync-notification',
    renotify: true,
    actions: [
      {
        action: 'view',
        title: 'View Schedule',
        icon: './action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: './action-dismiss.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('TimeSync', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log("[ServiceWorker] Notification click received", event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

// Utility function for syncing timezone data
async function syncTimezoneData() {
  try {
    // This could sync with a backend service if you have one
    console.log("[ServiceWorker] Syncing timezone data");
    
    // For now, just update the local cache timestamp
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify({
      lastSync: new Date().toISOString(),
      status: 'synced'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put('./sync-status', response);
    
    return Promise.resolve();
  } catch (error) {
    console.error("[ServiceWorker] Sync failed:", error);
    return Promise.reject(error);
  }
}

// Handle app updates
self.addEventListener('message', (event) => {
  console.log("[ServiceWorker] Message received", event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log("[ServiceWorker] Script loaded");
