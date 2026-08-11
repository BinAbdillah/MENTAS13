/* =========================================================
   render.js — + pengumuman, galeri(+lightbox), layanan,
   umkm, kontak darurat, tautan mitra.html
   ========================================================= */

   const NAV = [
    ['#hero', 'Beranda'], ['#profil', 'Profil'], ['#struktur', 'Struktur'],
    ['#agenda', 'Agenda'], ['#fasilitas', 'Fasilitas'], ['mitra.html', 'Mitra'],
    ['#peta-cuaca', 'Peta'], ['#kontak', 'Kontak']
  ];
  
  const huruf = (teks) => teks.split('').map((c) => `<span class="huruf">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
  
  function agregatRT(d) {
    const list = (d.rt || []).map((r) => r.statistik).filter((s) => s && typeof s.jiwa === 'number');
    if (!list.length) return null;
    const sum = (k) => list.reduce((a, s) => a + (Number(s[k]) || 0), 0);
    return { kk: sum('kk'), jiwa: sum('jiwa'), laki: sum('laki'), perempuan: sum('perempuan'), balita: sum('balita'), lansia: sum('lansia') };
  }
  
  /* ---------- 1) HEADER ---------- */
  function renderHeader(d) {
    const i = d.identitas;
    $('#header').innerHTML = `
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <a href="#hero" class="flex items-center gap-3">
          ${renderLogo(i.logo)}
          <span>
            <span class="block text-lg font-extrabold leading-tight text-slate-900 md:text-xl">${i.namaRW}</span>
            <span class="block text-sm text-slate-500">${i.tagline}</span>
          </span>
        </a>
        <nav class="hidden items-center gap-1 md:flex">
          ${NAV.map(([h, l]) => `<a href="${h}" class="nav-link">${l}</a>`).join('')}
        </nav>
        <button id="btnMenu" aria-label="Buka menu" class="rounded-lg border border-slate-200 p-2.5 text-2xl md:hidden">☰</button>
      </div>
      <nav id="navMobile" class="hidden border-t border-slate-200 bg-white px-4 py-2 md:hidden">
        ${NAV.map(([h, l]) => `<a href="${h}" class="nav-link block">${l}</a>`).join('')}
      </nav>`;
  
    $('#btnMenu').addEventListener('click', () => $('#navMobile').classList.toggle('hidden'));
    $('#navMobile').querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => $('#navMobile').classList.add('hidden')));
  }
  
  /* ---------- 2) PENGUMUMAN (marquee, pin dulu) ---------- */
  function renderPengumuman(d) {
    const slot = $('#pengumuman-slot');
    if (!slot) return;
    const list = (d.pengumuman || []).slice()
      .sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || (b.tanggal || '').localeCompare(a.tanggal || ''));
    if (!list.length) { slot.innerHTML = ''; return; }
    const setengah = list.map((p) =>
      `<span class="mx-6"><b>${p.pin ? '📌 ' : ''}${p.judul}</b> — ${p.isi}</span><span aria-hidden="true">✦</span>`).join('');
    slot.innerHTML = `
      <div class="flex items-stretch border-b" style="border-color:var(--line); background:var(--surface)">
        <span class="flex-none px-4 py-2.5 text-sm font-extrabold uppercase tracking-widest"
              style="background:var(--accent); color:var(--on-accent)">📢 Info Warga</span>
        <div class="marquee flex-1"><div class="marquee-track text-sm" style="color:var(--teks)">${setengah}${setengah}</div></div>
      </div>`;
  }
  
  /* ---------- 3) HERO ---------- */
  function renderHero(d) {
    const { hero, identitas: i, wilayah: w } = d;
    const agg = agregatRT(d);
    const ketua = d.strukturRW.inti.find((p) => p.jabatan === 'Ketua') || {};
    const fotoHero = (bannerAktif(d.banner) && d.banner.gantiFotoHero) ? d.banner.gambar : hero.foto;
  
    const kata = ['GOTONG ROYONG', 'MANDIRI', 'RUKUN', 'SEJAHTERA', 'INDONESIA HIJAU', 'MENJAGA ALAM'];
    const setengah = kata.map((k) => `<span class="mx-6 text-sm font-bold tracking-[0.25em]">${k}</span><span aria-hidden="true">✦</span>`).join('');
  
    $('#hero').innerHTML = `
      <section class="relative overflow-hidden bg-slate-900 text-white">
        <img src="${fotoHero}" alt="Foto wilayah ${i.namaRW}" onerror="this.remove()"
             class="hero-foto absolute inset-0 h-full w-full object-cover opacity-40">
        <div class="hero-overlay absolute inset-0"></div>
  
        <div class="relative mx-auto max-w-6xl px-4 pb-20 pt-20 md:pb-24 md:pt-28">
          <div class="grid items-end gap-12 md:grid-cols-[1.25fr_.75fr]">
            <div>
              <p class="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                ${i.kecamatan} • ${i.kota}
              </p>
              <h1 class="hero-judul mt-6 font-extrabold uppercase leading-[0.95] tracking-tight text-[clamp(2.6rem,7.5vw,6rem)]">
                <span class="text-outline block">${huruf('RW 013')}</span>
                <span class="block">${huruf('Menteng Atas')}</span>
              </h1>
              <p class="mt-6 max-w-xl text-base leading-relaxed text-slate-200 md:text-lg">“${hero.sambutan}”</p>
  
              <div class="mt-6 flex items-center gap-4">
                <span class="grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-lg font-extrabold text-slate-900">${inisial(ketua.nama)}</span>
                <span>
                  <span class="block text-lg font-bold">${namaAtau(ketua.nama)}</span>
                  <span class="block text-sm text-emerald-300">Ketua RW • Periode ${hero.periode}</span>
                </span>
              </div>
  
              <div class="mt-8 flex flex-wrap gap-3">
                <a href="#struktur" class="group w-full rounded-full bg-emerald-500 px-7 py-3.5 text-center text-base font-bold text-slate-900 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 sm:w-auto">
                  Struktur Pengurus <span class="inline-block transition-transform group-hover:translate-x-1.5">→</span>
                </a>
                <a href="#kontak" class="group w-full rounded-full border border-white/30 px-7 py-3.5 text-center text-base font-bold hover:bg-white/10 sm:w-auto">
                  Kontak <span class="inline-block transition-transform group-hover:translate-x-1.5">→</span>
                </a>
              </div>
            </div>
  
            <aside class="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur md:p-7">
              <h3 class="mb-4 text-base font-bold uppercase tracking-widest text-emerald-300">Sekilas Wilayah</h3>
              ${[['👥', 'Penduduk', fmtNum(agg ? agg.jiwa : w.penduduk) + ' jiwa'],
                 ['🏠', 'Kepala Keluarga', fmtNum(agg ? agg.kk : 0) + ' KK'],
                 ['🚩', 'Jumlah RT', w.jumlahRT + ' RT'],
                 ['🏗️', 'Fasilitas', d.fasilitas.length + ' unit']]
                .map(([ik, l, v]) => `
                <div class="flex items-center justify-between border-b border-white/10 py-3.5 text-base last:border-0">
                  <span class="text-slate-200">${ik} ${l}</span><b class="text-xl">${v}</b>
                </div>`).join('')}
            </aside>
          </div>
        </div>
  
        <div class="marquee relative border-t border-white/10 bg-emerald-600/90 text-emerald-50">
          <div class="marquee-track">${setengah}${setengah}</div>
        </div>
      </section>`;
  }
  
  /* ---------- 4) PROFIL ---------- */
  function renderProfil(d) {
    const w = d.wilayah;
    const agg = agregatRT(d);
    const panah = { Timur: '➡️', Selatan: '⬇️', Barat: '⬅️', Utara: '⬆️' };
  
    const barisRT = (d.rt || []).map((r) => {
      const s = r.statistik || {};
      return `<tr class="border-b last:border-0" style="border-color:var(--line-soft)">
        <td class="py-2.5 pr-4 font-bold">${r.no}</td>
        <td class="py-2.5 pr-4">${s.kk ?? '—'}</td>
        <td class="py-2.5 pr-4">${s.jiwa ?? '—'}</td>
        <td class="py-2.5 pr-4">${s.laki ?? '—'}</td>
        <td class="py-2.5 pr-4">${s.perempuan ?? '—'}</td>
        <td class="py-2.5 pr-4">${s.balita ?? '—'}</td>
        <td class="py-2.5">${s.lansia ?? '—'}</td>
      </tr>`;
    }).join('');
  
    $('#profil').innerHTML = `
      <section class="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div class="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
          <div class="lg:sticky lg:top-28 lg:self-start">
            ${judulSeksi('01', 'Profil Wilayah', '')}
          </div>
  
          <div class="space-y-10">
            <div class="reveal grid grid-cols-2 gap-8">
              ${[['👥', agg ? agg.jiwa : w.penduduk, 'Penduduk (jiwa)'],
                 ['🏠', agg ? agg.kk : 0, 'Kepala Keluarga'],
                 ['📐', w.luasM2, 'Luas (m²)'],
                 ['🚩', w.jumlahRT, 'Rukun Tetangga']]
                .map(([ik, v, l]) => `
                <div class="border-l-2 border-emerald-700/40 pl-5">
                  <div class="counter text-5xl font-extrabold text-emerald-800 md:text-6xl" data-target="${v}">0</div>
                  <div class="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">${ik} ${l}</div>
                </div>`).join('')}
            </div>
  
            <div class="kartu reveal p-6 md:p-8">
              <h3 class="mb-5 text-xl font-bold text-slate-900">🧭 Batas-Batas Wilayah</h3>
              <div class="grid gap-3">
                ${w.perbatasan.map((p) => `
                <div class="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3.5 text-base">
                  <span class="flex-none rounded-lg bg-emerald-600/10 px-3 py-1.5 text-sm font-bold text-emerald-700">${panah[p.arah] || '🧭'} ${p.arah}</span>
                  <span>${p.dengan}</span>
                </div>`).join('')}
              </div>
            </div>
  
            <div class="kartu reveal overflow-x-auto p-6 md:p-8">
              <h3 class="mb-5 text-xl font-bold text-slate-900">📊 Data Statistik RT</h3>
              <table class="w-full min-w-[560px] text-left text-sm md:text-base">
                <thead>
                  <tr class="border-b" style="border-color:var(--line)">
                    <th class="py-2 pr-4 font-bold">RT</th><th class="py-2 pr-4 font-bold">KK</th>
                    <th class="py-2 pr-4 font-bold">Jiwa</th><th class="py-2 pr-4 font-bold">Laki</th>
                    <th class="py-2 pr-4 font-bold">Perempuan</th><th class="py-2 pr-4 font-bold">Balita</th>
                    <th class="py-2 font-bold">Lansia</th>
                  </tr>
                </thead>
                <tbody>
                  ${barisRT}
                  <tr class="font-extrabold" style="color:var(--accent-text)">
                    <td class="py-2.5 pr-4">Σ Total</td>
                    <td class="py-2.5 pr-4">${agg ? fmtNum(agg.kk) : '—'}</td>
                    <td class="py-2.5 pr-4">${agg ? fmtNum(agg.jiwa) : '—'}</td>
                    <td class="py-2.5 pr-4">${agg ? fmtNum(agg.laki) : '—'}</td>
                    <td class="py-2.5 pr-4">${agg ? fmtNum(agg.perempuan) : '—'}</td>
                    <td class="py-2.5 pr-4">${agg ? fmtNum(agg.balita) : '—'}</td>
                    <td class="py-2.5">${agg ? fmtNum(agg.lansia) : '—'}</td>
                  </tr>
                </tbody>
              </table>
              <p class="mt-3 text-xs" style="opacity:.6">Sumber: DAWIS 013.</p>
            </div>
          </div>
        </div>
      </section>`;
  }
  
  /* ---------- 5) STRUKTUR (+ tautan halaman mitra) ---------- */
  function renderStruktur(d) {
    const s = d.strukturRW;
    const barisJabatan = (jab, nama) => `
      <div class="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 text-base last:border-0">
        <span class="text-slate-500">${jab}</span>
        <b class="text-right ${ada(nama) ? '' : 'nilai-kosong'}">${namaAtau(nama)}</b>
      </div>`;
  
    $('#struktur').innerHTML = `
      <section class="bg-white py-16 md:py-24">
        <div class="mx-auto max-w-6xl px-4">
          ${judulSeksi('02', 'Struktur Organisasi', 'Penasihat, pengurus RW, pengurus RT, dan mitra')}
  
          <h3 class="mb-5 text-xl font-bold text-slate-900">Penasihat RW</h3>
          <div class="reveal grid grid-cols-2 gap-4 sm:grid-cols-5">
            ${d.penasehat.map((p, i) => `
            <div class="kartu kartu-hover p-5 text-center">
              <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-lg font-extrabold text-slate-500">${inisial(p.nama)}</span>
              <b class="mt-3 block text-base ${ada(p.nama) ? '' : 'nilai-kosong'}">${namaAtau(p.nama)}</b>
              <span class="text-sm text-slate-500">Penasihat ${i + 1}</span>
            </div>`).join('')}
          </div>
  
          <h3 class="mb-5 mt-14 text-xl font-bold text-slate-900">Pengurus RW</h3>
          <div class="reveal grid gap-5 sm:grid-cols-3">
            ${s.inti.map((p, i) => `
            <div class="kartu kartu-hover p-6 text-center ${i === 0 ? 'ring-2 ring-emerald-500' : ''}">
              <span class="mx-auto grid h-16 w-16 place-items-center rounded-full ${i === 0 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'} text-xl font-extrabold">${inisial(p.nama)}</span>
              <b class="mt-3 block text-lg text-slate-900">${namaAtau(p.nama)}</b>
              <span class="mt-1 block text-sm text-slate-500">${p.jabatan}</span>
            </div>`).join('')}
          </div>
  
          <h3 class="mb-5 mt-14 text-xl font-bold text-slate-900">Seksi-Seksi</h3>
          <div class="reveal grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            ${s.seksi.map((sk) => `
            <div class="kartu kartu-hover p-6">
              <div class="text-3xl">${sk.ikon}</div>
              <b class="mt-2 block text-base text-slate-900">${sk.nama}</b>
              <div class="mt-3 flex flex-wrap gap-2">
                ${sk.anggota.length
                  ? sk.anggota.map((a) => `<span class="rounded-full bg-emerald-600/10 px-3 py-1.5 text-sm font-medium text-emerald-700">${a}</span>`).join('')
                  : '<span class="nilai-kosong text-sm">Belum diisi</span>'}
              </div>
            </div>`).join('')}
          </div>
  
          <h3 class="mb-5 mt-14 text-xl font-bold text-slate-900">Pengurus RT 001–009</h3>
          <div class="reveal grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            ${d.rt.map((r) => `
            <div class="kartu p-6">
              <span class="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white">RT ${r.no}</span>
              <div class="mt-4">
                ${Object.entries(r.pengurus).map(([jab, nama]) => barisJabatan(jab, nama)).join('')}
              </div>
            </div>`).join('')}
          </div>
  
          <div class="mb-5 mt-14 flex flex-wrap items-center justify-between gap-3">
            <h3 class="text-xl font-bold text-slate-900">Mitra</h3>
            <a href="mitra.html" class="group rounded-full border px-5 py-2.5 text-sm font-bold"
               style="border-color:var(--accent); color:var(--accent-text)">
              Halaman Mitra <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
          <div class="reveal grid gap-5 lg:grid-cols-3">
            ${d.mitra.map((m) => `
            <div class="kartu kartu-hover p-6">
              <div class="flex items-center gap-4">
                <span class="grid h-12 w-12 flex-none place-items-center rounded-xl bg-emerald-100 text-2xl">${m.ikon}</span>
                <div><b class="block text-base text-slate-900">${m.nama}</b>
                <span class="text-sm text-slate-500">${m.deskripsi}</span></div>
              </div>
              <div class="mt-4">
                ${m.struktur.map((p) => barisJabatan(p.jabatan, p.nama)).join('')}
              </div>
            </div>`).join('')}
          </div>
        </div>
      </section>`;
  }
  
  /* ---------- 6) AGENDA ---------- */
  function renderAgenda(d) {
    const kosong = !d.agenda || d.agenda.length === 0;
    $('#agenda').innerHTML = `
      <section class="mx-auto max-w-6xl px-4 py-16 md:py-24">
        ${judulSeksi('03', 'Agenda Kegiatan.')}
        ${kosong ? `
          <div class="kartu reveal mx-auto max-w-md p-10 text-center">
            <div class="text-5xl">📭</div>
            <b class="mt-4 block text-lg text-slate-900">Belum ada agenda terdaftar</b>
            <p class="mt-2 text-base text-slate-500">Agenda terbaru otomatis tampil di sini setelah ditambahkan lewat halaman admin.</p>
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
                  <p class="mt-1 text-sm text-slate-500">🕐 ${a.waktu} WIB • 📍 ${a.tempat}</p>
                  <p class="mt-2 text-base text-slate-600">${a.deskripsi}</p>
                </div>
              </article>`;
            }).join('')}
          </div>`}
      </section>`;
  }
  
  /* ---------- 7) FASILITAS ---------- */
  function renderFasilitas(d) {
    $('#fasilitas').innerHTML = `
      <section class="bg-white py-16 md:py-24">
        <div id="fasWrap" class="relative">
          <div class="mx-auto max-w-6xl px-4">
            ${judulSeksi('04', 'Fasilitas Warga')}
          </div>
          <div id="fasTrack" class="fas-track">
            ${d.fasilitas.map((f) => `
            <div class="kartu fas-card group flex items-start gap-4 p-6">
              <span class="grid h-14 w-14 flex-none place-items-center rounded-xl bg-emerald-100 text-3xl transition-transform group-hover:scale-110">${f.ikon}</span>
              <div>
                <b class="text-base text-slate-900 md:text-lg">${f.nama}</b>
                <span class="ml-2 rounded-full bg-emerald-600/10 px-2.5 py-1 text-xs font-semibold text-emerald-700">${f.jenis}</span>
                <p class="mt-1.5 text-sm text-slate-500">📍 ${f.alamat}</p>
              </div>
            </div>`).join('')}
          </div>
          <p class="mt-8 hidden text-center text-xs uppercase tracking-[0.3em] text-slate-400 lg:block">Terus gulir ↓</p>
        </div>
      </section>`;
  }
  
  /* ---------- 8) GALERI (masonry + lightbox) ---------- */
  function renderGaleri(d) {
    const el = $('#galeri');
    if (!el) return;
    const list = d.galeri || [];
    if (!list.length) { el.innerHTML = ''; return; }
  
    el.innerHTML = `
      <section class="mx-auto max-w-6xl px-4 py-16 md:py-24">
        ${judulSeksi('05', 'Galeri Warga', 'Klik foto untuk memperbesar.')}
        <div class="reveal columns-1 gap-6 md:columns-2" id="galeriGrid">
          ${list.map((g, i) => `
          <figure class="galeri-item kartu mb-6 cursor-zoom-in break-inside-avoid overflow-hidden p-0 ${i % 2 ? 'md:translate-y-6' : ''}">
            <img src="${g.foto}" alt="${g.keterangan}" loading="lazy" class="w-full object-cover" style="aspect-ratio:4/3"
                 onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
            <div class="hidden place-items-center text-5xl" style="aspect-ratio:4/3; background:var(--fill)">🖼️</div>
            <figcaption class="p-5">
              <b class="block text-base" style="color:var(--heading)">${g.keterangan}</b>
              <span class="text-sm" style="opacity:.6">${g.kategori} • ${g.tanggal}</span>
            </figcaption>
          </figure>`).join('')}
        </div>
  
        <div id="lightbox" class="fixed inset-0 z-[90] hidden items-center justify-center bg-black/85 p-6">
          <button id="lbTutup" aria-label="Tutup" class="absolute right-5 top-5 text-3xl text-white">✕</button>
          <figure class="max-w-3xl">
            <img id="lbImg" class="max-h-[80vh] w-full rounded-xl object-contain" src="" alt="">
            <figcaption id="lbCap" class="mt-3 text-center text-sm text-white/80"></figcaption>
          </figure>
        </div>
      </section>`;
  
    const lb = $('#lightbox');
    const tutup = () => { lb.classList.add('hidden'); lb.classList.remove('flex'); };
    $('#galeriGrid').addEventListener('click', (e) => {
      const fig = e.target.closest('.galeri-item');
      if (!fig) return;
      const img = fig.querySelector('img');
      if (!img || img.style.display === 'none') return;
      $('#lbImg').src = img.src;
      $('#lbCap').textContent = fig.querySelector('figcaption b') ? fig.querySelector('figcaption b').textContent : '';
      lb.classList.remove('hidden'); lb.classList.add('flex');
    });
    $('#lbTutup').onclick = tutup;
    lb.addEventListener('click', (e) => { if (e.target === lb) tutup(); });
  }
  
  /* ---------- 9) LAYANAN (list bernomor, detail lipat) ---------- */
  function renderLayanan(d) {
    const el = $('#layanan');
    if (!el) return;
    const list = d.layanan || [];
    if (!list.length) { el.innerHTML = ''; return; }
  
    el.innerHTML = `
      <section class="bg-white py-16 md:py-24">
        <div class="mx-auto max-w-6xl px-4">
          ${judulSeksi('06', 'Layanan Warga', 'Syarat & prosedur surat — klik untuk detail.')}
          <div class="reveal">
            ${list.map((l, i) => `
            <details class="group border-b py-5" style="border-color:var(--line-soft)">
              <summary class="flex cursor-pointer items-baseline gap-4 list-none">
                <span class="font-mono text-sm font-bold" style="color:var(--accent-text)">${String(i + 1).padStart(2, '0')}</span>
                <b class="flex-1 text-lg md:text-xl" style="color:var(--heading)">${l.nama}</b>
                <span class="text-sm" style="opacity:.6">${l.biaya || 'Gratis'}</span>
                <span class="text-xl transition-transform group-open:rotate-45">＋</span>
              </summary>
              <div class="mt-4 grid gap-4 pl-10 md:grid-cols-2">
                <p class="whitespace-pre-line text-base" style="color:var(--teks)"><b>Syarat:</b><br>${l.syarat || '—'}</p>
                <p class="text-base" style="color:var(--teks)"><b>Penanggung jawab:</b> ${l.penanggungJawab || '—'}<br><b>Estimasi:</b> ${l.durasi || '—'}</p>
              </div>
            </details>`).join('')}
          </div>
        </div>
      </section>`;
  }
  
  /* ---------- 10) UMKM ---------- */
  function renderUMKM(d) {
    const el = $('#umkm');
    if (!el) return;
    const list = d.umkm || [];
    if (!list.length) { el.innerHTML = ''; return; }
  
    el.innerHTML = `
      <section class="mx-auto max-w-6xl px-4 py-16 md:py-24">
        ${judulSeksi('07', 'UMKM Warga.')}
        <div class="reveal grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          ${list.map((u) => `
          <div class="kartu kartu-hover p-6">
            <b class="block text-lg" style="color:var(--heading)">${u.nama}</b>
            <span class="mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
                  style="background:color-mix(in srgb, var(--accent) 14%, transparent); color:var(--accent-text)">${u.jenis}</span>
            <p class="mt-2 text-sm" style="opacity:.7">RT ${u.rt || '—'}</p>
            ${u.kontak ? `<a class="mt-3 inline-block text-sm font-bold" style="color:var(--accent-text)"
              href="${/^08/.test(u.kontak) ? 'https://wa.me/62' + u.kontak.replace(/^0/, '') : 'tel:' + u.kontak}">💬 Hubungi</a>` : ''}
          </div>`).join('')}
        </div>
      </section>`;
  }
  
  /* ---------- 11) FOOTER (+ kontak darurat) ---------- */
  function renderFooter(d) {
    const i = d.identitas;
    const darurat = d.kontakDarurat || [];
    $('#kontak').innerHTML = `
      <footer class="bg-slate-900 text-slate-300">
        <div class="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3 md:py-16">
          <div>
            <div class="flex items-center gap-3">
              ${renderLogo(i.logo)}
              <b class="text-xl text-white">${i.namaRW}</b>
            </div>
            <p class="mt-4 text-base leading-relaxed">📍 ${i.alamat}</p>
          </div>
          <div>
            <h4 class="mb-4 text-lg font-bold text-white">Kontak Pengurus</h4>
            <ul class="space-y-2.5 text-base">
              <li>📞 ${ada(i.telepon) ? `<a class="hover:text-emerald-400" href="tel:${i.telepon}">${i.telepon}</a>` : '<span class="nilai-kosong">Akan diperbarui</span>'}</li>
              <li>✉️ ${ada(i.email) ? `<a class="hover:text-emerald-400" href="mailto:${i.email}">${i.email}</a>` : '<span class="nilai-kosong">Akan diperbarui</span>'}</li>
              ${ada(i.sosmed.whatsapp) ? `<li>💬 <a class="hover:text-emerald-400" href="https://wa.me/${i.sosmed.whatsapp}">WhatsApp Pengurus</a></li>` : ''}
              <li>🕐 ${i.jamLayanan}</li>
            </ul>
          </div>
          <div>
            <h4 class="mb-4 text-lg font-bold text-white">Tautan Cepat</h4>
            <ul class="space-y-2.5 text-base">
              ${NAV.slice(1).map(([h, l]) => `<li><a href="${h}" class="hover:text-emerald-400">${l}</a></li>`).join('')}
            </ul>
          </div>
        </div>
  
        ${darurat.length ? `
        <div class="mx-auto max-w-6xl px-4 pb-10">
          <h4 class="mb-4 text-lg font-bold text-white">🚨 Kontak Darurat</h4>
          <div class="flex flex-wrap gap-3">
            ${darurat.map((k) => `
            <a href="tel:${k.nomor}" class="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
              📞 ${k.nama} • ${k.nomor} <span class="opacity-60">(${k.jabatan || ''})</span>
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
  
  /* ---------- Animasi angka ---------- */
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
