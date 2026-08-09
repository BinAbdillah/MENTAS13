/* =========================================================
   render.js — renderer tiap bagian halaman dari DATA
   (versi tipografi besar & ramah mobile)
   ========================================================= */

const NAV = [
  ['#hero', 'Beranda'], ['#profil', 'Profil'], ['#struktur', 'Struktur'],
  ['#agenda', 'Agenda'], ['#fasilitas', 'Fasilitas'], ['#peta-cuaca', 'Peta'], ['#kontak', 'Kontak']
];

/* ---------- 1) HEADER ---------- */
function renderHeader(d) {
  const i = d.identitas;
  $('#header').innerHTML = `
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
      <a href="#hero" class="flex items-center gap-3">
        ${renderLogo(i.logo)}
        <span>
          <span class="block text-lg font-extrabold leading-tight text-slate-900">${i.namaRW}</span>
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

  // Perilaku hamburger menu (mobile)
  $('#btnMenu').addEventListener('click', () => $('#navMobile').classList.toggle('hidden'));
  $('#navMobile').querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => $('#navMobile').classList.add('hidden')));
}

/* ---------- 2) HERO ---------- */
function renderHero(d) {
  const { hero, identitas: i, wilayah: w } = d;
  const ketua = d.strukturRW.inti.find((p) => p.jabatan === 'Ketua') || {};
  $('#hero').innerHTML = `
    <section class="relative overflow-hidden bg-slate-900 text-white">
      <img src="${hero.foto}" alt="Foto wilayah ${i.namaRW}" onerror="this.remove()"
           class="absolute inset-0 h-full w-full object-cover opacity-40">
      <div class="hero-overlay absolute inset-0"></div>

      <div class="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-[1.2fr_.8fr] md:py-28">
        <div>
          <span class="rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/40">
            ${i.kecamatan} • ${i.kota}
          </span>
          <h1 class="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">
            ${hero.judul}<br><span class="text-emerald-400">${i.namaRW}</span>
          </h1>
          <blockquote class="mt-6 border-l-4 border-emerald-400 pl-4 text-base leading-relaxed text-slate-200 md:text-lg">
            “${hero.sambutan}”
          </blockquote>
          <div class="mt-6 flex items-center gap-4">
            <span class="grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-lg font-extrabold text-slate-900">${inisial(ketua.nama)}</span>
            <span>
              <span class="block text-lg font-bold">${namaAtau(ketua.nama)}</span>
              <span class="block text-sm text-emerald-300">Ketua RW • Periode ${hero.periode}</span>
            </span>
          </div>
          <!-- Tombol full-width di HP agar mudah ditekan -->
          <div class="mt-8 flex flex-wrap gap-3">
            <a href="#struktur" class="w-full rounded-xl bg-emerald-500 px-7 py-3.5 text-center text-base font-bold text-slate-900 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 sm:w-auto">Struktur Pengurus</a>
            <a href="#kontak" class="w-full rounded-xl border border-white/30 px-7 py-3.5 text-center text-base font-bold hover:bg-white/10 sm:w-auto">Kontak</a>
          </div>
        </div>

        <!-- Kartu sekilas wilayah -->
        <div class="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur md:p-7">
          <h3 class="mb-4 text-base font-bold uppercase tracking-wider text-emerald-300">Sekilas Wilayah</h3>
          ${[['👥', 'Penduduk', fmtNum(w.penduduk) + ' jiwa'],
             ['📐', 'Luas Wilayah', fmtNum(w.luasM2) + ' m²'],
             ['🚩', 'Jumlah RT', w.jumlahRT + ' RT'],
             ['🏗️', 'Fasilitas', d.fasilitas.length + ' unit']]
            .map(([ik, l, v]) => `
            <div class="flex items-center justify-between border-b border-white/10 py-3.5 text-base last:border-0">
              <span class="text-slate-200">${ik} ${l}</span><b class="text-lg">${v}</b>
            </div>`).join('')}
        </div>
      </div>
    </section>`;
}

/* ---------- 3) PROFIL WILAYAH ---------- */
function renderProfil(d) {
  const w = d.wilayah;
  const panah = { Timur: '➡️', Selatan: '⬇️', Barat: '⬅️', Utara: '⬆️' };
  $('#profil').innerHTML = `
    <section class="mx-auto max-w-6xl px-4 py-16 md:py-20">
      ${judulSeksi('📊', 'Profil Wilayah', 'Statistik warga dan batas-batas wilayah RW 013')}

      <div class="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        ${[['👥', 'Penduduk', w.penduduk, 'jiwa'], ['📐', 'Luas', w.luasM2, 'm²'],
           ['🚩', 'Rukun Tetangga', w.jumlahRT, 'RT'], ['🏗️', 'Fasilitas', d.fasilitas.length, 'unit']]
          .map(([ik, l, v, u]) => `
          <div class="kartu kartu-hover p-6 text-center">
            <div class="text-3xl">${ik}</div>
            <div class="counter mt-2 text-3xl font-extrabold text-emerald-700 md:text-4xl" data-target="${v}">0</div>
            <div class="mt-1 text-sm text-slate-500">${l} (${u})</div>
          </div>`).join('')}
      </div>

      <div class="kartu mt-8 p-6 md:p-7">
        <h3 class="mb-5 text-lg font-bold text-slate-900">🧭 Batas-Batas Wilayah</h3>
        <div class="grid gap-3 sm:grid-cols-2">
          ${w.perbatasan.map((p) => `
          <div class="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3.5 text-base">
            <span class="flex-none rounded-lg bg-emerald-600/10 px-3 py-1.5 text-sm font-bold text-emerald-700">${panah[p.arah] || '🧭'} ${p.arah}</span>
            <span>${p.dengan}</span>
          </div>`).join('')}
        </div>
      </div>
    </section>`;
}

/* ---------- 4) STRUKTUR ORGANISASI ---------- */
function renderStruktur(d) {
  const s = d.strukturRW;

  // Baris jabatan–nama (dipakai juga untuk kartu mitra)
  const barisJabatan = (jab, nama) => `
    <div class="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 text-base last:border-0">
      <span class="text-slate-500">${jab}</span>
      <b class="text-right ${ada(nama) ? '' : 'nilai-kosong'}">${namaAtau(nama)}</b>
    </div>`;

  $('#struktur').innerHTML = `
    <section class="bg-white py-16 md:py-20">
      <div class="mx-auto max-w-6xl px-4">
        ${judulSeksi('🧑‍💼', 'Struktur Organisasi', 'Penasihat, pengurus RW, pengurus RT, dan mitra')}

        <!-- Penasihat (5 orang) -->
        <h3 class="mb-5 text-xl font-bold text-slate-900">Penasihat RW</h3>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-5">
          ${d.penasehat.map((p, i) => `
          <div class="kartu kartu-hover p-5 text-center">
            <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-lg font-extrabold text-slate-500">${inisial(p.nama)}</span>
            <b class="mt-3 block text-base ${ada(p.nama) ? '' : 'nilai-kosong'}">${namaAtau(p.nama)}</b>
            <span class="text-sm text-slate-500">Penasihat ${i + 1}</span>
          </div>`).join('')}
        </div>

        <!-- Pengurus harian RW -->
        <h3 class="mb-5 mt-12 text-xl font-bold text-slate-900">Pengurus Harian RW</h3>
        <div class="grid gap-5 sm:grid-cols-3">
          ${s.inti.map((p, i) => `
          <div class="kartu kartu-hover p-6 text-center ${i === 0 ? 'ring-2 ring-emerald-500' : ''}">
            <span class="mx-auto grid h-16 w-16 place-items-center rounded-full ${i === 0 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'} text-xl font-extrabold">${inisial(p.nama)}</span>
            <b class="mt-3 block text-lg text-slate-900">${namaAtau(p.nama)}</b>
            <span class="mt-1 block text-sm text-slate-500">${p.jabatan}</span>
          </div>`).join('')}
        </div>

        <!-- Seksi-seksi -->
        <h3 class="mb-5 mt-12 text-xl font-bold text-slate-900">Seksi-Seksi</h3>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

        <!-- Pengurus RT 001–009 -->
        <h3 class="mb-5 mt-12 text-xl font-bold text-slate-900">Pengurus RT 001–009</h3>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          ${d.rt.map((r) => `
          <div class="kartu p-6">
            <span class="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white">RT ${r.no}</span>
            <div class="mt-4">
              ${Object.entries(r.pengurus).map(([jab, nama]) => barisJabatan(jab, nama)).join('')}
            </div>
          </div>`).join('')}
        </div>

        <!-- Mitra / unsur pendukung -->
        <h3 class="mb-5 mt-12 text-xl font-bold text-slate-900">Mitra & Unsur Pendukung</h3>
        <div class="grid gap-5 lg:grid-cols-3">
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

/* ---------- 5) AGENDA (empty-state bila kosong) ---------- */
function renderAgenda(d) {
  const kosong = !d.agenda || d.agenda.length === 0;
  $('#agenda').innerHTML = `
    <section class="mx-auto max-w-6xl px-4 py-16 md:py-20">
      ${judulSeksi('📅', 'Agenda Kegiatan', 'Informasi kegiatan warga RW 013')}
      ${kosong ? `
        <div class="kartu mx-auto max-w-md p-10 text-center">
          <div class="text-5xl">📭</div>
          <b class="mt-4 block text-lg text-slate-900">Belum ada agenda terdaftar</b>
          <p class="mt-2 text-base text-slate-500">Agenda terbaru otomatis tampil di sini setelah ditambahkan pada <code class="rounded bg-slate-100 px-1">data/data.json</code>.</p>
        </div>` : `
        <div class="grid gap-5 md:grid-cols-2">
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

/* ---------- 6) FASILITAS ---------- */
function renderFasilitas(d) {
  $('#fasilitas').innerHTML = `
    <section class="bg-white py-16 md:py-20">
      <div class="mx-auto max-w-6xl px-4">
        ${judulSeksi('🏗️', 'Fasilitas Warga', 'Fasilitas yang tersedia di wilayah RW 013')}
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          ${d.fasilitas.map((f) => `
          <div class="kartu kartu-hover flex items-start gap-4 p-6">
            <span class="grid h-14 w-14 flex-none place-items-center rounded-xl bg-emerald-100 text-3xl">${f.ikon}</span>
            <div>
              <b class="text-base text-slate-900 md:text-lg">${f.nama}</b>
              <span class="ml-2 rounded-full bg-emerald-600/10 px-2.5 py-1 text-xs font-semibold text-emerald-700">${f.jenis}</span>
              <p class="mt-1.5 text-sm text-slate-500">📍 ${f.alamat}</p>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </section>`;
}

/* ---------- 7) FOOTER ---------- */
function renderFooter(d) {
  const i = d.identitas;
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
      <div class="border-t border-slate-800 py-5 text-center text-sm text-slate-500">
        © ${new Date().getFullYear()} ${i.namaRW} — dibangun gotong royong oleh warga.
      </div>
    </footer>`;
}

/* ---------- Animasi angka statistik ---------- */
function jalankanCounter() {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.target, t0 = performance.now();
    (function step(t) {
      const p = Math.min((t - t0) / 1200, 1);
      el.textContent = fmtNum(Math.round(target * p));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
    io.unobserve(el);
  }), { threshold: .6 });
  document.querySelectorAll('.counter').forEach((el) => io.observe(el));
}