/* =========================================================
   sw.js — REFACTOR v2
   • path RELATIF (aman subpath GitHub Pages)
   • install per-item (satu 404 tidak menggagalkan semua)
   • hanya cache same-origin; query-string (?…) TIDAK di-cache
   • fallback offline untuk navigasi → index.html
   ========================================================= */
   const CACHE_NAME = 'rw13-mentas-v2';   /* naikkan v3, v4, … tiap rilis besar */
   const ASSETS = [
     './', './index.html',
     './struktur.html', './rt.html', './mitra.html', './fasilitas.html',
     './galeri.html', './pkk.html', './karangtaruna.html', './lmk.html',
     './admin/index.html',
     './js/app.js', './admin/js/admin.js', './js/cuaca-widget.js', './js/cursor.js',
     './js/fasilitas.js', './js/galeri.js', './js/grup.js', './js/halaman.js',
     './js/menu-kanan.js', './js/mitra.js', './js/render.js', './js/rt.js', './js/struktur.js',
     './js/utils.js', './js/tailwind-config.js', './js/firebase-config.js', './js/peta-cuaca.js',
     './css/style.css', './css/cursor.css',
     './data/data.json',
     './assets/logo-rw.png', './assets/logo-HUT-RI-81.png', './assets/logo-posyandu.png'
   ];
   
   self.addEventListener('install', (event) => {
     event.waitUntil(
       caches.open(CACHE_NAME).then(async (cache) => {
         for (const a of ASSETS) {
           try { await cache.add(a); } catch (e) { console.warn('[SW] lewati:', a); }
         }
       })
     );
     self.skipWaiting();
   });
   
   self.addEventListener('activate', (event) => {
     event.waitUntil(
       caches.keys().then((names) =>
         Promise.all(names.map((c) => { if (c !== CACHE_NAME) return caches.delete(c); }))
       )
     );
     self.clients.claim();
   });
   
   self.addEventListener('fetch', (event) => {
     const req = event.request;
     if (req.method !== 'GET') return;                       /* POST/PUT dll dibiarkan */
     const url = new URL(req.url);
     if (url.search) return;                                 /* ?preview=1 dll → selalu jaringan */
   
     event.respondWith(
       caches.match(req).then((cached) => {
         const fetched = fetch(req).then((res) => {
           /* hanya cache respons same-origin yang sukses */
           if (res && res.ok && url.origin === self.location.origin) {
             const cl = res.clone();
             caches.open(CACHE_NAME).then((c) => c.put(req, cl));
           }
           return res;
         }).catch(() => {
           if (req.mode === 'navigate') return caches.match('./index.html');
           return Response.error();
         });
         return cached || fetched;   /* stale-while-revalidate */
       })
     );
   });