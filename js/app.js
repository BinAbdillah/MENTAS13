/* =========================================================
   app.js (module) — sumber data: Firebase Realtime Database,
   fallback ke data/data.json. Beranda terbuka ikut berubah
   saat admin menyimpan (listener onValue).
   ========================================================= */

   const FB = window.FIREBASE_CONFIG || null;
   const firebaseSiap = !!(FB && FB.apiKey && FB.databaseURL);
   
   let db = null, _fb = null;
   if (firebaseSiap) {
     try {
       const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
       _fb = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
       db = _fb.getDatabase(initializeApp(FB));
     } catch (e) {
       console.warn('Firebase gagal dimuat → pakai data lokal.', e);
       db = null;
     }
   }
   
   /* ---------- Muat data: Firebase dulu, lalu lokal ---------- */
   async function muatData() {
     if (db) {
       try {
         const snap = await _fb.get(_fb.ref(db, 'data'));
         if (snap.val()) return snap.val();
       } catch (e) { console.warn('Baca Firebase gagal → fallback lokal.', e); }
     }
     const r = await fetch('data/data.json');
     if (!r.ok) throw new Error('data.json tidak ditemukan (' + r.status + ')');
     return r.json();
   }
   
   /* ---------- Render seluruh halaman (dipakai load awal & live update) ---------- */
   function renderSemua(DATA) {
     window.DATA = DATA;
     document.title = DATA.identitas.namaRW + ' — Website Resmi';
     renderBanner(DATA);
     renderHeader(DATA);
     renderHero(DATA);
     renderProfil(DATA);
     renderStruktur(DATA);
     renderAgenda(DATA);
     renderFasilitas(DATA);
     renderPetaCuaca(DATA);
     renderFooter(DATA);
     jalankanCounter();
   }
   
   /* ---------- Spanduk HUT RI (ke slot sendiri, aman dari duplikat) ---------- */
   function renderBanner(d) {
     const slot = $('#banner-slot');
     if (!slot) return;
     const b = d.banner;
     if (!bannerAktif(b)) { slot.innerHTML = ''; return; }
     slot.innerHTML = `
       <a href="${b.link || '#agenda'}" class="block w-full md:mx-auto md:max-w-4xl md:px-4 md:pt-4 md:pb-1"
          aria-label="${b.teks || 'Banner HUT RI'}">
         <img src="${b.gambar}" alt="${b.teks || 'Banner HUT RI'}"
              class="h-32 w-full object-cover object-center sm:h-40 md:h-auto md:rounded-2xl md:shadow-lg"
              onerror="this.parentElement.remove()">
       </a>`;
   }
   
   /* ---------- Inisialisasi ---------- */
   (async function main() {
     try {
       const DATA = await muatData();
       window._lastJson = JSON.stringify(DATA);
       renderSemua(DATA);
   
       // Live update: data berubah di Firebase → halaman ikut berubah
       if (db) {
         _fb.onValue(_fb.ref(db, 'data'), (snap) => {
           const v = snap.val();
           if (!v) return;
           const s = JSON.stringify(v);
           if (s === window._lastJson) return;
           window._lastJson = s;
           renderSemua(v);
         });
       }
     } catch (err) {
       console.error(err);
       $('#hero').innerHTML = `
         <section class="mx-auto max-w-lg px-4 py-24">
           <div class="kartu p-8 text-center">
             <div class="text-4xl">⚠️</div>
             <b class="mt-3 block text-lg text-slate-900">Gagal memuat data</b>
             <p class="mt-2 text-base text-slate-500">
               Periksa koneksi, isi <code class="rounded bg-slate-100 px-1">js/firebase-config.js</code>,
               atau pastikan <code class="rounded bg-slate-100 px-1">data/data.json</code> ada.
             </p>
           </div>
         </section>`;
     }
   })();