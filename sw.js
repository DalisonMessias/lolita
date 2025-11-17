const CACHE_NAME = 'revo-foto-cache-v1';
const OFFLINE_URL = 'offline.html';

// Adicione aqui os recursos essenciais do seu aplicativo que você deseja que funcionem offline.
const ASSETS_TO_CACHE = [
  '/', // Armazena a página inicial
  'index.html',
  OFFLINE_URL,
  'https://raw.githubusercontent.com/DalisonMessias/cdn.rabbit.gg/main/assets/logo-revo.png'
];

// Evento de instalação: abre o cache e armazena os recursos.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Cache aberto');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Evento de ativação: limpa caches antigos.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Evento de busca: intercepta as solicitações de rede.
self.addEventListener('fetch', (event) => {
  // Estratégia "Network first, then cache" para solicitações de navegação.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Tenta obter a resposta da rede primeiro.
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // Se a rede falhar, retorna a página offline do cache.
          console.log('[Service Worker] Busca falhou; retornando página offline.', error);
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse;
        }
      })()
    );
    return;
  }

  // Estratégia "Cache first" para outros recursos (imagens, scripts, etc.).
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
