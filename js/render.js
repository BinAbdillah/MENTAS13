/* =========================================================
   render.js — utama v2: hero penuh, donat 3D, cuaca→widget,
   peta dipindah ke halaman Fasilitas (My Maps)
   ========================================================= */

   const huruf = (teks) => teks.split('').map((c) => `<span class="huruf">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
   const orang = (x) => (x && typeof x === 'object') ? { nama: x.nama || '', foto: x.foto || '' } : { nama: (x || ''), foto: '' };
   const avatar = (nama, foto, s = 'h-14 w-14', f = 'bg-slate-100 text-slate-500', t = 'text-lg') => ada(foto) ? `
     <span class="relative block ${s} flex-none">
       <img src="${foto}" alt="${nama}" class="absolute inset-0 h-full w-full rounded-full object-cover"
            onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
       <span class="hidden h-full w-full place-items-center rounded-full ${f} font-extrabold ${t}">${inisial(nama)}</span>
     </span>`
     : `<span class="grid ${s} flex-none place-items-center rounded-full ${f} font-extrabold ${t}">${inisial(nama)}</span>`;
   
   function agregatRT(d) {
     const list = (d.rt || []).map((r) => r.statistik).filter((s) => s && typeof s.jiwa === 'number');
     if (!list.length) return null;
     const sum = (k) => list.reduce((a, s) => a + (Number(s[k]) || 0), 0);
     return { kk: sum('kk'), jiwa: sum('jiwa'), laki: sum('laki'), perempuan: sum('perempuan'), balita: sum('balita'), lansia: sum('lansia') };
   }
   
   /* ---------- HEADER: logo besar + widget cuaca kanan ---------- */
   function renderHeader(d) {
     const i = d.identitas;
     $('#header').innerHTML = `
       <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
         <a href="#hero" class="flex items-center gap-4">
           ${renderLogo(i.logo, 'h-20 w-20 md:h-24 md:w-24')}
           <span>
             <span class="block text-2xl font-extrabold leading-tight text-slate-900 md:text-3xl">${i.namaRW}</span>
             <span class="block text-base text-slate-500">${i.tagline}</span>
           </span>
         </a>
         <div id="cuaca-widget"></div>
       </div>`;
   }
   
   /* ---------- MENU KANAN popup ---------- */
   function renderMenuKanan() {
     const slot = $('#menu-kanan-slot');
     if (!slot) return;
     slot.innerHTML = `
       <div class="menu-kanan" id="menuKanan">
         <button class="menu-btn" id="menuBtn" aria-label="Menu">MENU</button>
         <nav class="menu-popup">
           <span class="m-judul">RW 013 MENTENG ATAS</span>
           ${DAFTAR_HALAMAN.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}
           <a href="#profil">Profil Wilayah</a>
           <a href="#agenda">Agenda</a>
           <a href="#kontak">Kontak</a>
         </nav>
       </div>`;
     $('#menuBtn').addEventListener('click', () => $('#menuKanan').classList.toggle('buka'));
   }
   
   /* ---------- INFO WARGA ---------- */
   function renderPengumuman(d) {
     const slot = $('#pengumuman-slot');
     if (!slot) return;
     const list = (d.pengumuman || []).slice()
       .sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || (b.tanggal || '').localeCompare(a.tanggal || ''));
     if (!list.length) { slot.innerHTML = ''; return; }
     const setengah = list.map((p) =>
       `<span class="mx-6"><b>${p.pin ? 'PENTING: ' : ''}${p.judul}</b> — ${p.isi}</span><span aria-hidden="true">✦</span>`).join('');
     slot.innerHTML = `
       <div class="flex items-stretch border-b" style="border-color:var(--line); background:var(--surface)">
         <span class="flex-none px-4 py-2.5 text-sm font-extrabold uppercase tracking-widest"
               style="background:var(--accent); color:var(--on-accent)">Info Warga</span>
         <div class="marquee flex-1"><div class="marquee-track text-sm" style="color:var(--teks)">${setengah}${setengah}</div></div>
       </div>`;
   }
   
   /* ---------- HERO PENUH (tanpa panel sekilas) ---------- */
   function renderHero(d) {
     const { hero, identitas: i } = d;
     const ketua = d.strukturRW.inti.find((p) => p.jabatan === 'Ketua') || {};
     const fotoHero = (bannerAktif(d.banner) && d.banner.gantiFotoHero) ? d.banner.gambar : hero.foto;
     const kata = ['GOTONG ROYONG', 'MANDIRI', 'RUKUN', 'SEJAHTERA', 'INDONESIA HIJAU', 'MENJAGA ALAM'];
     const setengah = kata.map((k) => `<span class="mx-6 text-sm font-bold tracking-[0.25em]">${k}</span><span aria-hidden="true">✦</span>`).join('');
   
     $('#hero').innerHTML = `
       <section class="relative flex min-h-[92vh] flex-col justify-center overflow-hidden bg-slate-900 text-white">
         <img src="${fotoHero}" alt="Foto wilayah ${i.namaRW}" onerror="this.remove()"
              class="hero-foto absolute inset-0 h-full w-full object-cover opacity-40">
         <div class="hero-overlay absolute inset-0"></div>
         <div class="relative mx-auto w-full max-w-6xl px-4 pb-24 pt-20 text-center">
           <p class="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
             ${i.kecamatan} • ${i.kota}
           </p>
           <h1 class="hero-judul mt-6 font-extrabold uppercase leading-[0.95] tracking-tight text-[clamp(3rem,9vw,7.5rem)]">
             <span class="text-outline block">${huruf('RW 013')}</span>
             <span class="block">${huruf('Menteng Atas')}</span>
           </h1>
           <p class="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-200 md:text-lg">“${hero.sambutan}”</p>
           <div class="mt-8 flex items-center justify-center gap-4">
             ${avatar(ketua.nama, ketua.foto, 'h-14 w-14', 'bg-emerald-500 text-slate-900', 'text-lg')}
             <span class="text-left">
               <span class="block text-lg font-bold">${namaAtau(ketua.nama)}</span>
               <span class="block text-sm text-emerald-300">Ketua RW • Periode ${hero.periode}</span>
             </span>
           </div>
           <div class="mt-10 flex flex-wrap justify-center gap-3">
             <a href="struktur.html" class="group rounded-full bg-emerald-500 px-7 py-3.5 text-base font-bold text-slate-900 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400">
               Struktur Pengurus <span class="inline-block transition-transform group-hover:translate-x-1.5">→</span>
             </a>
             <a href="#kontak" class="group rounded-full border border-white/30 px-7 py-3.5 text-base font-bold hover:bg-white/10">
               Kontak <span class="inline-block transition-transform group-hover:translate-x-1.5">→</span>
             </a>
           </div>
         </div>
         <div class="marquee relative border-t border-white/10 bg-emerald-600/90 text-emerald-50">
           <div class="marquee-track">${setengah}${setengah}</div>
         </div>
       </section>`;
   }
   
   /* ---------- DONAT RT 3D ---------- */
   const WARNA_DONAT = ['#DC2626', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#64748B'];
   
   function donatRT(d) {
     const list = (d.rt || []).filter((r) => r.statistik && r.statistik.jiwa > 0);
     const total = list.reduce((a, r) => a + r.statistik.jiwa, 0);
     if (!total) return '';
     const R = 56, C = 2 * Math.PI * R;
     let acc = 0;
     const segs = list.map((r, i) => {
       const frac = r.statistik.jiwa / total;
       const el = `<circle r="${R}" cx="80" cy="80" fill="none" stroke="${WARNA_DONAT[i % 9]}" stroke-width="26"
         stroke-dasharray="${(frac * C).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-acc * C).toFixed(2)}"
         transform="rotate(-90 80 80)"><title>RT ${r.no}: ${r.statistik.jiwa} jiwa</title></circle>`;
       acc += frac;
       return el;
     }).join('');
     return `
       <div class="flex flex-wrap items-center gap-8">
         <div class="donat-3d">
           <svg viewBox="0 0 160 160" class="h-52 w-52">
             ${segs}
             <text x="80" y="76" text-anchor="middle" style="font-weight:800; font-size:20px; fill:var(--heading)">${fmtNum(total)}</text>
             <text x="80" y="94" text-anchor="middle" style="font-size:9px; letter-spacing:.2em; fill:var(--teks); opacity:.6">JIWA</text>
           </svg>
         </div>
         <div class="donat-leg">
           ${list.map((r, i) => `<div><span style="background:${WARNA_DONAT[i % 9]}"></span>RT ${r.no} — <b>${r.statistik.jiwa}</b> jiwa</div>`).join('')}
         </div>
       </div>`;
   }
   
   /* ---------- PROFIL ---------- */
   function renderProfil(d) {
     const w = d.wilayah;
     const agg = agregatRT(d);
     $('#profil').innerHTML = `
       <section class="mx-auto max-w-6xl px-4 py-16 md:py-24">
         <div class="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
           <div class="lg:sticky lg:top-28 lg:self-start">
             ${judulSeksi('01', 'Profil Wilayah', 'Geser kursor di atas donat untuk memutar.')}
           </div>
           <div class="space-y-10">
             <div class="reveal grid grid-cols-2 gap-8">
               ${[['Penduduk (jiwa)', agg ? agg.jiwa : w.penduduk], ['Kepala Keluarga', agg ? agg.kk : 0],
                  ['Luas (m²)', w.luasM2], ['Rukun Tetangga', w.jumlahRT]]
                 .map(([l, v]) => `
                 <div class="border-l-2 border-emerald-700/40 pl-5">
                   <div class="counter text-5xl font-extrabold text-emerald-800 md:text-6xl" data-target="${v}">0</div>
                   <div class="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">${l}</div>
                 </div>`).join('')}
             </div>
             <div class="kartu reveal p-6 md:p-8">
               <h3 class="mb-5 text-xl font-bold text-slate-900">Distribusi Jiwa per-RT</h3>
               ${donatRT(d)}
             </div>
             <div class="kartu reveal p-6 md:p-8">
               <h3 class="mb-5 text-xl font-bold text-slate-900">Batas-Batas Wilayah</h3>
               <div class="grid gap-3">
                 ${w.perbatasan.map((p) => `
                 <div class="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3.5 text-base">
                   <span class="flex-none rounded-lg bg-emerald-600/10 px-3 py-1.5 text-sm font-bold text-emerald-700">${p.arah}</span>
                   <span>${p.dengan}</span>
                 </div>`).join('')}
               </div>
               <p class="mt-4 text-sm" style="opacity:.6">Visual batas wilayah terintegrasi di <a class="font-bold" style="color:var(--accent-text)" href="fasilitas.html">peta Fasilitas →</a></p>
             </div>
           </div>
         </div>
       </section>`;
   }
   
   /* ---------- AGENDA ---------- */
   function renderAgenda(d) {
     const kosong = !d.agenda || d.agenda.length === 0;
     $('#agenda').innerHTML = `
       <section class="bg-white py-16 md:py-24">
         <div class="mx-auto max-w-6xl px-4">
           ${judulSeksi('02', 'A G E N D A', 'Kegiatan warga RW 013')}
           ${kosong ? `
             <div class="kartu reveal mx-auto max-w-md p-10 text-center">
               <b class="block text-lg text-slate-900">Belum ada agenda terdaftar</b>
               <p class="mt-2 text-base text-slate-500">Agenda terbaru otomatis tampil setelah ditambahkan lewat admin.</p>
             </div>` : `
             <div class="reveal grid gap-5 md:grid-cols-2">
               ${[...d.agenda].sort((a, b) => a.tanggal.localeCompare(b.tanggal)).map((a) => {
                 const t = new Date(a.tanggal + 'T00:00:00');
                 const bulan = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(t);
                 return `
                 <article class="kartu kartu-hover flex gap-5 p-6">
                   <div class="flex h-20 w-20 flex-none flex-col items-center justify-center rounded-xl bg-emerald-600 text-white">
                     <b class="text-3xl leading-none">${t.getDate()}</b><span class="text-sm uppercase">${bulan}</span>
                   </div>
                   <div>
                     <span class="rounded-full px-3 py-1.5 text-xs font-bold ${WARNA_KATEGORI[a.kategori] || 'bg-slate-100 text-slate-600'}">${a.kategori}</span>
                     <h3 class="mt-2 text-lg font-bold text-slate-900">${a.judul}</h3>
                     <p class="mt-1 text-sm text-slate-500">${a.waktu} WIB • ${a.tempat}</p>
                     <p class="mt-2 text-base text-slate-600">${a.deskripsi}</p>
                   </div>
                 </article>`;
               }).join('')}
             </div>`}
         </div>
       </section>`;
   }
   
   /* ---------- FOOTER (tanpa tautan cepat) ---------- */
   function renderFooter(d) {
     const i = d.identitas;
     const darurat = d.kontakDarurat || [];
     $('#kontak').innerHTML = `
       <footer class="bg-slate-900 text-slate-300">
         <div class="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:py-16">
           <div>
             <div class="flex items-center gap-4">
               ${renderLogo(i.logo, 'h-16 w-16')}
               <b class="text-2xl text-white">${i.namaRW}</b>
             </div>
             <p class="mt-4 text-base leading-relaxed">${i.alamat}</p>
           </div>
           <div>
             <h4 class="mb-4 text-lg font-bold text-white">Kontak Pengurus</h4>
             <ul class="space-y-2.5 text-base">
               <li>${ada(i.telepon) ? `<a class="hover:text-emerald-400" href="tel:${i.telepon}">${i.telepon}</a>` : '<span class="nilai-kosong">Telepon akan diperbarui</span>'}</li>
               <li>${ada(i.email) ? `<a class="hover:text-emerald-400" href="mailto:${i.email}">${i.email}</a>` : '<span class="nilai-kosong">Email akan diperbarui</span>'}</li>
               ${ada(i.sosmed.whatsapp) ? `<li><a class="hover:text-emerald-400" href="https://wa.me/${i.sosmed.whatsapp}">WhatsApp Pengurus</a></li>` : ''}
               <li>${i.jamLayanan}</li>
             </ul>
           </div>
         </div>
         ${darurat.length ? `
         <div class="mx-auto max-w-6xl px-4 pb-10">
           <h4 class="mb-4 text-lg font-bold text-white">Kontak Darurat</h4>
           <div class="flex flex-wrap gap-3">
             ${darurat.map((k) => `
             <a href="tel:${k.nomor}" class="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
               ${k.nama} • ${k.nomor} <span class="opacity-60">(${k.jabatan || ''})</span>
             </a>`).join('')}
           </div>
         </div>` : ''}
         <div class="mx-auto max-w-6xl select-none px-4">
           <div class="text-outline-dark text-[clamp(3rem,10vw,7.5rem)] font-extrabold uppercase leading-none opacity-60">RW 013</div>
         </div>
         <div class="border-t border-slate-800 py-5 text-center text-sm text-slate-500">
           © ${new Date().getFullYear()} ${i.namaRW} — dibangun gotong royong oleh warga.
         </div>
       </footer>`;
   }
   
   function renderBanner(d) {
     const slot = $('#banner-slot');
     if (!slot) return;
     const b = d.banner;
     if (!bannerAktif(b)) { slot.innerHTML = ''; return; }
     slot.innerHTML = `
       <a href="${b.link || '#agenda'}" class="block w-full md:mx-auto md:max-w-4xl md:px-4 md:pt-4 md:pb-1" aria-label="${b.teks}">
         <img src="${b.gambar}" alt="${b.teks}" class="h-32 w-full object-cover object-center sm:h-40 md:h-auto md:rounded-2xl md:shadow-lg"
              onerror="this.parentElement.remove()">
       </a>`;
   }
   
   function jalankanCounter() {
     const io = new IntersectionObserver((entries) => entries.forEach((e) => {
       if (!e.isIntersecting) return;
       const el = e.target, target = +el.dataset.target, t0 = performance.now();
       (function step(t) {
         const p = Math.min((t - t0) / 1400, 1);
         el.textContent = fmtNum(Math.round(target * p));
         if (p < 1) requestAnimationFrame(step);
       })(t0);
       io.unobserve(el);
     }), { threshold: .6 });
     document.querySelectorAll('.counter').forEach((el) => io.observe(el));
   }
   
   /* tilt 3D donat */
   function pasangDonat3D() {
     const w = document.querySelector('.donat-3d');
     if (!w) return;
     const svg = w.querySelector('svg');
     w.addEventListener('pointermove', (e) => {
       const r = w.getBoundingClientRect();
       const x = (e.clientX - r.left) / r.width - .5;
       const y = (e.clientY - r.top) / r.height - .5;
       svg.style.transform = `rotateX(${(-y * 24).toFixed(1)}deg) rotateY(${(x * 28).toFixed(1)}deg)`;
     });
     w.addEventListener('pointerleave', () => { svg.style.transform = 'rotateX(0deg) rotateY(0deg)'; });
   }