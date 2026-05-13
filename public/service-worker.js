// Service Worker para INFRATEC CRM PWA
// Versión 1.0.0

const CACHE_NAME = 'infratec-crm-v1';
const OFFLINE_URL = '/offline.html';

// Recursos para cachear en instalación
const STATIC_RESOURCES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // Agregar más recursos estáticos según necesidad
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Cacheando recursos estáticos');
      return cache.addAll(STATIC_RESOURCES);
    })
  );
  
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Estrategia de Fetch: Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  // Ignorar requests que no sean GET
  if (event.request.method !== 'GET') return;
  
  // Ignorar requests a Supabase (siempre online)
  if (event.request.url.includes('supabase.co')) return;
  
  // Ignorar requests de Chrome extensions
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, cachearla
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, buscar en cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Si es navegación y no hay cache, mostrar página offline
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          
          return new Response('Recurso no disponible offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});

// Sincronización en Background
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sincronización:', event.tag);
  
  if (event.tag === 'sync-tickets') {
    event.waitUntil(syncTickets());
  }
  
  if (event.tag === 'sync-photos') {
    event.waitUntil(syncPhotos());
  }
});

// Función para sincronizar tickets pendientes
async function syncTickets() {
  try {
    const cache = await caches.open('pending-tickets');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        await fetch(request.clone());
        await cache.delete(request);
        console.log('[Service Worker] Ticket sincronizado');
      } catch (error) {
        console.error('[Service Worker] Error sincronizando ticket:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Error en syncTickets:', error);
  }
}

// Función para sincronizar fotos pendientes
async function syncPhotos() {
  try {
    const cache = await caches.open('pending-photos');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        await fetch(request.clone());
        await cache.delete(request);
        console.log('[Service Worker] Foto sincronizada');
      } catch (error) {
        console.error('[Service Worker] Error sincronizando foto:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Error en syncPhotos:', error);
  }
}

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push recibido');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de INFRATEC',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'infratec-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/icon-open.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icon-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('INFRATEC CRM', options)
  );
});

// Acción de notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificación clickeada:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Mensajes desde la app
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

console.log('[Service Worker] Registrado correctamente');
