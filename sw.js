const CACHE_NAME = 'agrowa-v1';
const SYNC_TAG = 'agrowa-sync';

const ASSETS = [
  './',
  './index.html',
  './dados-brasil.js',
  './manifest.json'
];

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
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Serve do cache — offline first
self.addEventListener('fetch', e => {
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
