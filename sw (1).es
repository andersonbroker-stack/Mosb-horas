const CACHE_NAME = 'mosb-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png'
];

// Instalar o Service Worker e fazer cache dos assets
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cache aberto, adicionando assets...');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Alguns assets não puderam ser cacheados:', err);
        // Continua mesmo que alguns assets falhem
        return cache.add('./index.html');
      });
    })
  );
  self.skipWaiting();
});

// Ativar o Service Worker e limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia: Cache First, Fall back to Network
self.addEventListener('fetch', (event) => {
  // Ignorar requisições que não são GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Se encontrou no cache, retorna
      if (response) {
        console.log('[SW] Retornando do cache:', event.request.url);
        return response;
      }

      // Caso contrário, tenta buscar da rede
      return fetch(event.request).then((response) => {
        // Não cacheia respostas que não são sucesso
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Faz uma cópia para cachear
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Se falhar a rede, tenta retornar o index.html (para SPA)
        console.log('[SW] Offline, retornando index.html para:', event.request.url);
        return caches.match('./index.html');
      });
    })
  );
});
