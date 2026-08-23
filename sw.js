/* =========================================================
sw.js — REFACTOR v3
• CACHE v3 (invalidasi otomatis versi lama)
• Navigasi HTML: NETWORK-FIRST (konten baru lebih cepat sampai)
• Aset statis: STALE-WHILE-REVALIDATE
• data.json & query-string TIDAK di-cache
• Install per-item (toleran 404)
========================================================= */
const CACHE_NAME = 'rw13-mentas-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './struktur.html',
  './rt.html',
  './mitra.html',
  './fasilitas.html',
  './galeri.html',
  './pkk.html',
  './karangtaruna.html',
  './lmk.html',
  './admin/index.html',
  './manifest.json',
  './js/app.js',
  './admin/js/admin.js',
  './js/cuaca-widget.js',
  './js/cursor.js',
  './js/fasilitas.js',
  './js/galeri.js',
  './js/grup.js',
  './js/halaman.js',
  './js/menu-kanan.js',
  './js/mitra.js',
  './js/render.js',
  './js/rt.js',
  './js/struktur.js',
  './js/utils.js',
  './js/tailwind-config.js',
  './js/firebase-config.js',
  './js/peta-cuaca.js',
  './css/style.css',
  './css/cursor.css',
  './assets/logo-rw.png',
  './assets/logo-HUT-RI-81.png',
  './assets/logo-posyandu.png'
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Meng-cache aset statis...');
      for (const url of ASSETS_TO_CACHE) {
        try { await cache.add(url); }
        catch (e) { console.warn('[SW] Lewati (404/offline):', url); }
      }
    })
  );
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((name) => {
        if (name !== CACHE_NAME) { console.log('[SW] Menghapus cache lama:', name); return caches.delete(name); }
      }))
    )
  );
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.search || url.pathname.endsWith('/data.json')) return;   // selalu fresh
  if (url.origin !== self.location.origin) return;                // same-origin saja

  /* NAVIGASI: network-first, fallback cache */
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() =>
        caches.match(req).then((c) => c || caches.match('./index.html'))
      )
    );
    return;
  }

  /* ASET: stale-while-revalidate */
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req).then((res) => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() => cached || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } }));
      return cached || fetched;
    })
  );
});