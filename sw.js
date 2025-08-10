// Service Worker para miBodaGA
const VERSION = '2.0.1754370293418';
const CACHE_NAME = `miboda-v${VERSION}-${Date.now()}`;
const STATIC_CACHE = `miboda-static-v${VERSION}-${Date.now()}`;
const DYNAMIC_CACHE = `miboda-dynamic-v${VERSION}`;

// Recursos críticos para cachear inmediatamente
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/css/styles.css',
    '/src/js/invitation.js',
    '/src/js/gallery.js',
    '/src/js/countdown.js',
    '/src/js/player.js',
    '/assets/audio/unicos.mp3',
    '/assets/images/logo.png',
    '/assets/images/img01.JPG',
    '/assets/images/img02.JPG',
    '/assets/images/img03.JPG',
    '/assets/images/img04.JPG',
    '/assets/images/img05.JPG',
    '/assets/images/img06.JPG',
    '/assets/images/img07.JPG',
    '/assets/images/img08.JPG',
    '/assets/images/img09.JPG',
    '/assets/images/img10.JPG',
    '/assets/images/img11.JPG',
    '/assets/images/img12.JPG',
    '/assets/images/img13.JPG',
    '/assets/images/img14.JPG',
    '/data/invitados.json',
    '/manifest.json'
];

// Recursos dinámicos (se cachean bajo demanda)
const DYNAMIC_ASSETS = [
    '/qrcodes/',
    '/assets/images/',
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap',
    'https://kit.fontawesome.com/171beeb065.js',
    'https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs/qrcode.min.js'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
            .catch(error => {
                // Error silencioso
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Eliminar caches antiguos
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Estrategia: Stale While Revalidate para recursos principales (HTML, CSS, JS)
    if (isMainResource(request.url)) {
        event.respondWith(
            caches.open(STATIC_CACHE).then(cache => {
                return cache.match(request).then(cachedResponse => {
                    const fetchPromise = fetch(request).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            // Actualizar cache con la nueva versión
                            cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => {
                        return cachedResponse;
                    });
                    
                    // Devolver cache inmediatamente si existe, pero seguir actualizando en segundo plano
                    return cachedResponse || fetchPromise;
                });
            })
        );
    }
    
    // Estrategia: Cache First para recursos pesados (imágenes, audio)
    else if (isStaticAsset(request.url)) {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    
                    return fetch(request)
                        .then(response => {
                            if (response && response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(STATIC_CACHE)
                                    .then(cache => {
                                        cache.put(request, responseClone);
                                    });
                            }
                            return response;
                        });
                })
                .catch(() => {
                    // Fallback para recursos críticos
                    if (request.url.includes('.css')) {
                        return caches.match('/src/css/styles.css');
                    }
                    if (request.url.includes('.js')) {
                        return caches.match('/src/js/invitation.js');
                    }
                })
        );
    }
    
    // Estrategia: Network First para datos dinámicos
    else if (isDynamicAsset(request.url)) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => {
                                cache.put(request, responseClone);
                            });
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(request);
                })
        );
    }
    
    // Estrategia: Stale While Revalidate para otros recursos
    else {
        event.respondWith(
            caches.match(request)
                .then(cachedResponse => {
                    const fetchPromise = fetch(request)
                        .then(response => {
                            if (response && response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(DYNAMIC_CACHE)
                                    .then(cache => {
                                        cache.put(request, responseClone);
                                    });
                            }
                            return response;
                        });
                    
                    return cachedResponse || fetchPromise;
                })
        );
    }
});

// Función para determinar si es un recurso principal (HTML, CSS, JS que debe actualizarse)
function isMainResource(url) {
    return url.endsWith('.html') ||
           url.includes('/src/css/') ||
           url.includes('/src/js/') ||
           url.includes('/data/invitados.json') ||
           url === '/' ||
           url.endsWith('/');
}

// Función para determinar si es un recurso estático (imágenes, audio)
function isStaticAsset(url) {
    return url.includes('/assets/images/') ||
           url.includes('/assets/audio/') ||
           url.includes('/qrcodes/') ||
           url.includes('/manifest.json') ||
           url.includes('.png') ||
           url.includes('.jpg') ||
           url.includes('.jpeg') ||
           url.includes('.gif') ||
           url.includes('.svg') ||
           url.includes('.mp3') ||
           url.includes('.wav');
}

// Función para determinar si es un recurso dinámico
function isDynamicAsset(url) {
    return url.includes('/data/') ||
           url.includes('/qrcodes/') ||
           url.includes('googleapis.com') ||
           url.includes('fontawesome.com') ||
           url.includes('cdn.jsdelivr.net');
}

// Manejo de mensajes del cliente
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
    
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        checkForUpdates();
    }
});

// Función para verificar actualizaciones (silenciosa)
function checkForUpdates() {
    // No enviar mensajes visibles; los clientes consultan y activan SKIP_WAITING
    // Mantener función por compatibilidad
}

// Manejo de sincronización en segundo plano
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Función para sincronización en segundo plano
function doBackgroundSync() {
    // Aquí puedes implementar sincronización de datos
    // Por ejemplo, enviar confirmaciones de RSVP pendientes
    return Promise.resolve();
}

// Manejo de notificaciones push
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/assets/images/logo-192.png',
            badge: '/assets/images/logo-72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Ver Invitación',
                    icon: '/assets/images/logo-72.png'
                },
                {
                    action: 'close',
                    title: 'Cerrar',
                    icon: '/assets/images/logo-72.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Manejo de errores
self.addEventListener('error', event => {
    console.error('Service Worker: Error:', event.error);
});

// Manejo de rechazos de promesas no manejados
self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker: Promesa rechazada no manejada:', event.reason);
}); 