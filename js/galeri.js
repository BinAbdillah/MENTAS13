/* =========================================================
   galeri.js — REFACTOR v1
   masonry + lightbox (Esc/klik-luar) + empty state
   ========================================================= */
   const d = await setupHalaman('Galeri Warga');
   const list = d.galeri || [];
   
   $('#rootHal').innerHTML = list.length ? `
     <div class="columns-1 gap-6 md:columns-2 lg:columns-3" id="galeriGrid">
       ${list.map((g) => `
       <figure class="galeri-item kartu mb-6 cursor-zoom-in break-inside-avoid overflow-hidden p-0">
         <img src="${g.foto || ''}" alt="${g.keterangan || ''}" loading="lazy" class="w-full object-cover" style="aspect-ratio:4/3"
              onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
         <div class="hidden place-items-center text-sm" style="aspect-ratio:4/3; background:var(--fill); opacity:.6">
           Foto tidak tersedia
         </div>
         <figcaption class="p-5">
           <b class="block text-base" style="color:var(--heading)">${g.keterangan || ''}</b>
           <span class="text-sm" style="opacity:.6">${g.kategori || ''} • ${g.tanggal || ''}</span>
         </figcaption>
       </figure>`).join('')}
     </div>
   
     <div id="lightbox" class="fixed inset-0 z-[90] hidden items-center justify-center bg-black/85 p-6">
       <button id="lbTutup" aria-label="Tutup" class="absolute right-5 top-5 text-3xl text-white">✕</button>
       <figure class="max-w-3xl">
         <img id="lbImg" class="max-h-[80vh] w-full rounded-xl object-contain" src="" alt="">
         <figcaption id="lbCap" class="mt-3 text-center text-sm text-white/80"></figcaption>
       </figure>
     </div>`
   : `<div class="kartu mx-auto max-w-md p-10 text-center">
       <b class="block text-lg" style="color:var(--heading)">Galeri belum terisi</b>
       <p class="mt-2 text-base" style="opacity:.7">Tambahkan foto lewat halaman admin (📷 Upload).</p>
     </div>`;
   
   const lb = $('#lightbox');
   if (lb) {
     const tutup = () => { lb.classList.add('hidden'); lb.classList.remove('flex'); };
     $('#galeriGrid').addEventListener('click', (e) => {
       const fig = e.target.closest('.galeri-item');
       if (!fig) return;
       const img = fig.querySelector('img');
       if (!img || img.style.display === 'none') return;
       $('#lbImg').src = img.src;
       $('#lbCap').textContent = fig.querySelector('figcaption b') ? fig.querySelector('figcaption b').textContent : '';
       lb.classList.remove('hidden');
       lb.classList.add('flex');
     });
     $('#lbTutup').onclick = tutup;
     lb.addEventListener('click', (e) => { if (e.target === lb) tutup(); });
     document.addEventListener('keydown', (e) => { if (e.key === 'Escape') tutup(); });
   }