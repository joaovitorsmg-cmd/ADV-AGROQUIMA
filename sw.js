const CACHE_NAME = 'agroquima-v5';
const RUNTIME_CACHE = 'agroquima-runtime-v5';
const SYNC_TAG = 'agrowa-sync';

const ASSETS = [
  './',
  './index.html',
  './dados-brasil.js',
  './api.js',
  './ocr.js',
  './manifest.json',
  './assets/logo-agroquima.png',
  './assets/logo-agroquima-transparente.png',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

// Origens externas usadas pelo OCR (Tesseract.js/PDF.js) e fontes — cacheadas
// sob demanda no primeiro uso (não dá para precache por CORS/tamanho), para
// funcionarem offline depois de carregadas uma vez.
const RUNTIME_HOSTS = ['unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'tessdata.projectnaptha.com'];

// Instala e cacheia assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== RUNTIME_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Serve do cache — offline first. Para recursos de terceiros (OCR/fontes),
// usa cache-first com atualização em segundo plano (stale-while-revalidate).
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  if (RUNTIME_HOSTS.includes(url.hostname)) {
    e.respondWith(
      caches.open(RUNTIME_CACHE).then(async cache => {
        const cacheado = await cache.match(e.request);
        const buscaRede = fetch(e.request).then(resp => {
          if (resp.ok) cache.put(e.request, resp.clone());
          return resp;
        }).catch(() => cacheado);
        return cacheado || buscaRede;
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() =>
      caches.match('./index.html')
    ))
  );
});

// Background sync — dispara quando internet volta
self.addEventListener('sync', e => {
  if (e.tag === SYNC_TAG) {
    e.waitUntil(syncPendentes());
  }
});

// Notifica clientes após sync
async function syncPendentes() {
  const clients = await self.clients.matchAll();
  clients.forEach(c => c.postMessage({ type: 'SYNC_TRIGGERED' }));
}

// Escuta mensagem manual de sync
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'FORCE_SYNC') {
    syncPendentes();
  }
});
