/* =========================================================
   mitra.js — REFACTOR v1 (ringkasan M I T R A)
   setupHalaman + helper utils; LMK satu orang = kartu tunggal;
   tautan otomatis ke halaman khusus (pkk/karangtaruna/lmk)
   ========================================================= */

   const d = await setupHalaman('M I T R A');

   const HALAMAN_MITRA = [
     ['TP PKK', 'pkk.html'],
     ['Karang Taruna', 'karangtaruna.html'],
     ['LMK', 'lmk.html']
   ];
   const tautanKhusus = (nama) => {
     const hit = HALAMAN_MITRA.find(([k]) => (nama || '').includes(k));
     return hit ? hit[1] : '';
   };
   
   const list = d.mitra || [];
   $('#rootHal').innerHTML = `
     <p class="mb-8 max-w-3xl text-base md:text-lg" style="opacity:.8">
       PKK • Karang Taruna • LMK — mitra pembangunan warga RW 013 Menteng Atas.
     </p>
     ${list.length ? list.map((m) => {
       const struktur = m.struktur || [];
       const tunggal = struktur.length <= 1;
       const satu = tunggal ? orang(struktur[0]) : null;
       const khusus = tautanKhusus(m.nama);
       return `
       <section class="kartu mb-10 p-6 md:p-10">
         <div class="flex flex-wrap items-center gap-5">
           <span class="grid h-16 w-16 place-items-center rounded-2xl text-3xl" style="background:var(--accent-soft)">${m.ikon || ''}</span>
           <div class="min-w-0 flex-1">
             <h2 class="text-2xl font-extrabold md:text-3xl" style="color:var(--heading)">${m.nama || ''}</h2>
             <p class="mt-1 text-base" style="opacity:.75">${m.deskripsi || ''}</p>
           </div>
           ${khusus ? `<a href="${khusus}" class="rounded-full border px-5 py-2.5 text-sm font-bold"
              style="border-color:var(--accent); color:var(--accent-text)">Halaman khusus →</a>` : ''}
           ${m.kontak ? `<a href="${linkKontak(m.kontak)}" class="rounded-full px-5 py-2.5 text-sm font-bold"
              style="background:var(--accent); color:var(--on-accent)">💬 Kontak</a>` : ''}
         </div>
   
         ${m.foto ? `<img src="${m.foto}" alt="${m.nama}" class="mt-6 w-full rounded-xl object-cover" style="max-height:320px" onerror="this.remove()">` : ''}
   
         <div class="mt-8 grid gap-8 md:grid-cols-2">
           <div>
             <h3 class="mb-3 text-lg font-bold" style="color:var(--heading)">Program Kerja</h3>
             <div class="flex flex-wrap gap-2">
               ${(m.program || []).length
                 ? (m.program || []).map((p) => `<span class="rounded-full px-3 py-1.5 text-sm"
                    style="background:color-mix(in srgb, var(--accent) 14%, transparent); color:var(--accent-text)">${p}</span>`).join('')
                 : '<span class="nilai-kosong text-sm">Belum diisi</span>'}
             </div>
           </div>
   
           ${tunggal ? `
           <div>
             <div class="kartu p-8 text-center">
               ${avatar(satu.nama, satu.foto, 'h-24 w-24', 'bg-slate-100 text-slate-500', 'text-3xl')}
               <b class="mt-4 block text-xl" style="color:var(--heading)">${namaAtau(satu.nama)}</b>
               <span class="text-sm" style="opacity:.7">${struktur[0] ? struktur[0].jabatan : 'Penanggung jawab'}</span>
             </div>
           </div>` : `
           <div>
             <h3 class="mb-3 text-lg font-bold" style="color:var(--heading)">Susunan Pengurus</h3>
             ${struktur.map((p) => {
               const o = orang(p);
               return `
               <div class="flex items-center justify-between border-b py-2.5 text-base last:border-0" style="border-color:var(--line-soft)">
                 <span style="opacity:.7">${p.jabatan || ''}</span>
                 <b class="flex items-center gap-2.5 ${ada(o.nama) ? '' : 'nilai-kosong'}">
                   ${namaAtau(o.nama)} ${avatar(o.nama, o.foto, 'h-8 w-8', 'bg-slate-100 text-slate-500', 'text-xs')}
                 </b>
               </div>`;
             }).join('')}
           </div>`}
         </div>
       </section>`;
     }).join('') : `
     <div class="kartu mx-auto max-w-md p-10 text-center">
       <b class="block text-lg" style="color:var(--heading)">Data mitra belum terisi</b>
       <p class="mt-2 text-base" style="opacity:.7">Lengkapi lewat halaman admin.</p>
     </div>`}`;