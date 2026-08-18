/* =========================================================
   sw.js — Service Worker v1 (PWA untuk RW 013)
   Meng-cache semua aset statis agar website dapat diakses
   secara offline total setelah kunjungan pertama.
   ========================================================= */

   const CACHE_NAME = 'rw13-mentas-v1';
   const ASSETS_TO_CACHE = [
     '/', // Root index.html
     '/index.html',
     '/struktur.html',
     '/rt.html',
     '/mitra.html',
     '/fasilitas.html',
     '/galeri.html',
     '/pkk.html',
     '/karangtaruna.html',
     '/lmk.html',
     '/js/app.js',
     '/js/admin.js',
     '/js/cuaca-widget.js',
     '/js/cursor.js',
     '/js/fasilitas.js',
     '/js/galeri.js',
     '/js/grup.js',
     '/js/halaman.js',
     '/js/menu-kanan.js',
     '/js/mitra.js',
     '/js/render.js',
     '/js/rt.js',
     '/js/struktur.js',
     '/js/utils.js',
     '/js/tailwind-config.js',
     '/js/firebase-config.js',
     '/css/style.css',
     '/css/cursor.css',
     '/data/data.json'
   ];
   
   // Install: Membuka cache dan menyimpan semua aset
   self.addEventListener('install', (event) => {
     event.waitUntil(
       caches.open(CACHE_NAME).then((cache) => {
         console.log('[Service Worker] Meng-cache aset...');
         return cache.addAll(ASSETS_TO_CACHE);
       })
     );
     self.skipWaiting();
   });
   
   // Aktifkan: Membersihkan cache lama
   self.addEventListener('activate', (event) => {
     event.waitUntil(
       caches.keys().then((cacheNames) => {
         return Promise.all(
           cacheNames.map((cache) => {
             if (cache !== CACHE_NAME) {
               console.log('[Service Worker] Menghapus cache lama:', cache);
               return caches.delete(cache);
             }
           })
         );
       })
     );
     return self.clients.claim();
   });
   
   // Fetch: Strategi Stale-While-Revalidate (Cepat dari cache, update di background)
   self.addEventListener('fetch', (event) => {
     event.respondWith(
       caches.match(event.request).then((cachedResponse) => {
         const fetchPromise = fetch(event.request).then((networkResponse) => {
           // Update cache dengan respons baru
           if (networkResponse && networkResponse.status === 200) {
             caches.open(CACHE_NAME).then((cache) => {
               cache.put(event.request, networkResponse.clone());
             });
           }
           return networkResponse;
         }).catch(() => {
           // Jika gagal fetch dan tidak ada cache, berikan halaman offline minimalis
           if (event.request.mode === 'navigate') {
             return caches.match('/index.html');
           }
           return new Response('Offline', { status: 503 });
         });
   
         // Kembalikan cache jika ada, jika tidak, tunggu fetch
         return cachedResponse || fetchPromise;
       })
     );
   });