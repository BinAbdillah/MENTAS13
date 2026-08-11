/* =========================================================
   mitra.js — halaman khusus mitra (baca data yang sama)
   ========================================================= */

   const FB = window.FIREBASE_CONFIG || null;
   const firebaseSiap = !!(FB && FB.apiKey && FB.databaseURL);
   
   let db = null, _fb = null;
   if (firebaseSiap) {
     try {
       const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
       _fb = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
       db = _fb.getDatabase(initializeApp(FB));
     } catch (e) { db = null; }
   }
   
   async function muatData() {
     if (db) {
       try {
         const snap = await _fb.get(_fb.ref(db, 'data'));
         if (snap.val()) return snap.val();
       } catch (e) {}
     }
     const r = await fetch('data/data.json');
     return r.json();
   }
   
   const linkKontak = (k) => {
     if (!k) return '';
     return /^08/.test(k) ? `https://wa.me/62${k.replace(/^0/, '')}` : `tel:${k}`;
   };
   
   (async function main() {
     const d = await muatData();
     terapkanTema(d.tema);
     $('#logoMitra').innerHTML = renderLogo(d.identitas.logo, 'h-12 w-12');
   
     const list = d.mitra || [];
     $('#mitraRoot').innerHTML = `
       <h1 class="mb-10 text-4xl font-extrabold uppercase tracking-tight md:text-5xl" style="color:var(--heading)">
         Mitra & <span style="color:var(--accent-text)">Susunan Pengurus</span>
       </h1>
       ${list.map((m) => `
       <section class="kartu mb-10 p-6 md:p-10">
         <div class="flex flex-wrap items-center gap-5">
           <span class="grid h-16 w-16 place-items-center rounded-2xl text-3xl" style="background:var(--accent-soft)">${m.ikon}</span>
           <div class="min-w-0 flex-1">
             <h2 class="text-2xl font-extrabold md:text-3xl" style="color:var(--heading)">${m.nama}</h2>
             <p class="mt-1 text-base" style="opacity:.75">${m.deskripsi}</p>
           </div>
           ${m.kontak ? `<a href="${linkKontak(m.kontak)}" class="rounded-full px-5 py-2.5 text-sm font-bold"
              style="background:var(--accent); color:var(--on-accent)">💬 Kontak</a>` : ''}
         </div>
   
         ${m.foto ? `<img src="${m.foto}" alt="${m.nama}" class="mt-6 w-full rounded-xl object-cover" style="max-height:320px" onerror="this.remove()">` : ''}
   
         <div class="mt-8 grid gap-8 md:grid-cols-2">
           <div>
             <h3 class="mb-3 text-lg font-bold" style="color:var(--heading)">Program Kerja</h3>
             <div class="flex flex-wrap gap-2">
               ${(m.program || []).length
                 ? m.program.map((p) => `<span class="rounded-full px-3 py-1.5 text-sm"
                    style="background:color-mix(in srgb, var(--accent) 14%, transparent); color:var(--accent-text)">${p}</span>`).join('')
                 : '<span class="nilai-kosong text-sm">Belum diisi</span>'}
             </div>
           </div>
           <div>
             <h3 class="mb-3 text-lg font-bold" style="color:var(--heading)">Struktur</h3>
             ${(m.struktur || []).map((p) => `
             <div class="flex items-center justify-between border-b py-2.5 text-base last:border-0" style="border-color:var(--line-soft)">
               <span style="opacity:.7">${p.jabatan}</span>
               <b class="${ada(p.nama) ? '' : 'nilai-kosong'}">${namaAtau(p.nama)}</b>
             </div>`).join('')}
           </div>
         </div>
       </section>`).join('')}
   
       <a href="index.html" class="group inline-block rounded-full border px-6 py-3 text-base font-bold"
          style="border-color:var(--accent); color:var(--accent-text)">
         ← Kembali ke beranda
       </a>`;
   })();