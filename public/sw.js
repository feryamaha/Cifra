/* Cifra Tom PWA — cache de navegação e cifras visitadas (SPEC_006 D1) */
const CACHE = 'cifratom-v2';
const PRECACHE = ['/', '/manifest.json', '/favico.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

/* Documento de cifra: rede primeiro; cache só como fallback offline. */
async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const cached =
      (await cache.match(req)) || (await cache.match(req, { ignoreSearch: true }));
    return cached || Response.error();
  }
}

/* Estático imutável (hash no nome em produção): cache primeiro. */
async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // NUNCA interceptar data requests do App Router (flight RSC): são
  // atreladas à sessão/build; servi-las do cache trava a soft-navigation
  // em "Rendering…" (ISSUE_003).
  if (url.searchParams.has('_rsc') || req.headers.get('RSC') === '1') return;

  if (req.mode === 'navigate' && url.pathname.startsWith('/musica/')) {
    event.respondWith(networkFirst(req));
    return;
  }

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(req));
  }
});
