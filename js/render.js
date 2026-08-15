/* =========================================================
   render.js — REFACTOR v1 (renderer BERANDA)
   header: logo + moto + widget cuaca
   hero penuh | profil: counter + donat 3D + batas
   agenda (guard tanggal) | footer ramping
   ========================================================= */

/* ---------- Util lokal ---------- */
const huruf = (teks) => teks
  .split('')
  .map((c) => `<span class="huruf">${c === ' ' ? '&nbsp;' : c}</span>`)
  .join('');

function agregatRT(d) {
  const list = (d.rt || [])
    .map((r) => r.statistik)
    .filter((s) => s && typeof s.jiwa === 'number');
  if (!list.length) return null;
  const sum = (k) => list.reduce((a, s) => a + (Number(s[k]) || 0), 0);
  return {
    kk: sum('kk'), jiwa: sum('jiwa'), laki: sum('laki'),
    perempuan: sum('perempuan'), balita: sum('balita'), lansia: sum('lansia')
  };
}

/* ---------- 1) HEADER: logo + moto + widget cuaca ---------- */
function renderHeader(d) {
  const i = d.identitas || {};
  $('#header').innerHTML = `
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
      <a href="#hero" class="flex items-center gap-4">
        ${renderLogo(i.logo, 'h-16 w-16 md:h-20 md:w-20')}
        <span class="moto-header">A.M.A.N.A.H</span>
      </a>
      <div id="cuaca-widget"></div>
    </div>`;
}

/* ---------- 2) INFO WARGA (marquee pengumuman) ---------- */
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

/* ---------- 3) HERO PENUH (tanpa panel/tombol/marquee) ---------- */
function renderHero(d) {
  const hero = d.hero || {};
  const i = d.identitas || {};
  const inti = (d.strukturRW && d.strukturRW.inti) || [];
  const ketua = inti.find((p) => p.jabatan === 'Ketua') || {};
  const fotoHero = (bannerAktif(d.banner) && d.banner.gantiFotoHero) ? d.banner.gambar : hero.foto;

  $('#hero').innerHTML = `
    <section class="relative flex min-h-[92vh] flex-col justify-center overflow-hidden bg-slate-900 text-white">
      <img src="${fotoHero}" alt="Foto wilayah ${i.namaRW}" onerror="this.remove()"
           class="hero-foto absolute inset-0 h-full w-full object-cover opacity-40">
      <div class="hero-overlay absolute inset-0"></div>
      <div class="relative mx-auto w-full max-w-6xl px-4 pb-24 pt-20 text-center">
        <p class="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
          ${i.kecamatan} • ${i.kota}
        </p>
        <h1 class="hero-judul mt-6 font-extrabold uppercase leading-[0.95] tracking-tight text-[clamp(2.8rem,8vw,6.5rem)]">
          <span class="text-outline block">${huruf('RW 013')}</span>
          <span class="block">${huruf('Menteng Atas')}</span>
        </h1>
        <p class="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-200 md:text-lg">“${hero.sambutan || ''}”</p>
        <div class="mt-8 flex items-center justify-center gap-4">
          ${avatar(ketua.nama, ketua.foto, 'h-14 w-14', 'bg-emerald-500 text-slate-900', 'text-lg')}
          <span class="text-left">
            <span class="block text-lg font-bold">${namaAtau(ketua.nama)}</span>
            <span class="block text-sm text-emerald-300">Ketua RW • Periode ${hero.periode || '—'}</span>
          </span>
        </div>
      </div>
    </section>`;
}

/* ---------- 4) DONAT RT 3D + POPUP HOVER ---------- */
const WARNA_DONAT = ['#DC2626', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#64748B'];

function donatRT(d) {
  const list = (d.rt || []).filter((r) => r.statistik && r.statistik.jiwa > 0);
  const total = list.reduce((a, r) => a + r.statistik.jiwa, 0);
  if (!total) return '';
  const R = 56, C = 2 * Math.PI * R;
  let acc = 0;
  const segs = list.map((r, i) => {
    const frac = r.statistik.jiwa / total;
    const el = `<circle data-i="${i}" r="${R}" cx="80" cy="80" fill="none"
      stroke="${WARNA_DONAT[i % 9]}" stroke-width="26"
      stroke-dasharray="${(frac * C).toFixed(2)} ${C.toFixed(2)}"
      stroke-dashoffset="${(-acc * C).toFixed(2)}"
      transform="rotate(-90 80 80)"><title>RT ${r.no}: ${r.statistik.jiwa} jiwa</title></circle>`;
    acc += frac;
    return el;
  }).join('');
  return `
    <div class="donat-3d">
      <svg viewBox="0 0 160 160" class="h-56 w-56 md:h-64 md:w-64" role="img"
           aria-label="Grafik distribusi jiwa per RT">
        ${segs}
        <text x="80" y="76" text-anchor="middle" style="font-weight:800; font-size:20px; fill:var(--heading)">${fmtNum(total)}</text>
        <text x="80" y="94" text-anchor="middle" style="font-size:9px; letter-spacing:.2em; fill:var(--teks); opacity:.6">JIWA</text>
      </svg>
      <div class="donat-popup"></div>
    </div>
    <div class="donat-leg mt-6">
      ${list.map((r, i) => `<span class="chip"><i style="background:${WARNA_DONAT[i % 9]}"></i>RT ${r.no} • ${r.statistik.jiwa}</span>`).join('')}
    </div>
    <p class="mt-4 text-xs" style="opacity:.6">Arahkan kursor ke potongan donat untuk detail • gerakkan kursor di atas donat untuk memutar.</p>`;
}

function pasangDonat3D(d) {
  const wrap = document.querySelector('.donat-3d');
  if (!wrap) return;
  const svg = wrap.querySelector('svg');
  const popup = wrap.querySelector('.donat-popup');
  if (!svg || !popup) return;
  const list = (d.rt || []).filter((r) => r.statistik && r.statistik.jiwa > 0);

  /* tilt 3D mengikuti kursor */
  wrap.addEventListener('pointermove', (e) => {
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    svg.style.transform = `rotateX(${(-y * 24).toFixed(1)}deg) rotateY(${(x * 28).toFixed(1)}deg)`;
  });
  wrap.addEventListener('pointerleave', () => {
    svg.style.transform = 'rotateX(0deg) rotateY(0deg)';
    popup.classList.remove('on');
  });

  /* popup hover per potongan */
  svg.querySelectorAll('circle[data-i]').forEach((c) => {
    const i = +c.dataset.i, r = list[i], s = r && r.statistik;
    c.addEventListener('pointerenter', () => {
      if (!s) return;
      popup.innerHTML = `
        <b class="block text-sm" style="color:var(--heading)">RT ${r.no}</b>
        <span>Jiwa: <b>${s.jiwa}</b> • KK: <b>${s.kk}</b></span>
        <span>Laki ${s.laki} / Perempuan ${s.perempuan}</span>
        <span>Balita ${s.balita} • Lansia ${s.lansia}</span>`;
      popup.classList.add('on');
    });
    c.addEventListener('pointermove', (e) => {
      const rc = wrap.getBoundingClientRect();
      popup.style.left = (e.clientX - rc.left + 14) + 'px';
      popup.style.top = (e.clientY - rc.top + 14) + 'px';
    });
    c.addEventListener('pointerleave', () => popup.classList.remove('on'));
  });
}

/* ---------- 5) PROFIL (counter + donat + batas) ---------- */
function renderProfil(d) {
  const w = d.wilayah || {};
  const agg = agregatRT(d);
  const panah = { Timur: '➡️', Selatan: '⬇️', Barat: '⬅️', Utara: '⬆️' };

  $('#profil').innerHTML = `
    <section class="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div class="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
        <div class="lg:sticky lg:top-28 lg:self-start">
          ${judulSeksi('01', 'Profil Wilayah', '')}
        </div>
        <div class="space-y-10">
          <div class="reveal grid grid-cols-2 gap-8">
            ${[['Penduduk (jiwa)', agg ? agg.jiwa : w.penduduk], ['Kepala Keluarga', agg ? agg.kk : 0],
               ['Luas (m²)', w.luasM2], ['Rukun Tetangga', w.jumlahRT]]
              .map(([l, v]) => `
              <div class="border-l-2 border-emerald-700/40 pl-5">
                <div class="counter text-5xl font-extrabold text-emerald-800 md:text-6xl" data-target="${v || 0}">0</div>
                <div class="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">${l}</div>
              </div>`).join('')}
          </div>
          <div class="kartu reveal p-6 md:p-8">
            <h3 class="mb-6 text-xl font-bold text-slate-900">Distribusi Jiwa per-RT</h3>
            ${donatRT(d)}
          </div>
          <div class="kartu reveal p-6 md:p-8">
            <h3 class="mb-5 text-xl font-bold text-slate-900">Batas-Batas Wilayah</h3>
            <div class="grid gap-3">
              ${(w.perbatasan || []).map((p) => `
              <div class="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3.5 text-base">
                <span class="flex-none rounded-lg bg-emerald-600/10 px-3 py-1.5 text-sm font-bold text-emerald-700">${panah[p.arah] || '🧭'} ${p.arah}</span>
                <span>${p.dengan}</span>
              </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>`;
  pasangDonat3D(d);
}

/* ---------- 6) AGENDA (guard tanggal bolong) ---------- */
function renderAgenda(d) {
  const list = (d.agenda || [])
    .filter((a) => a && !isNaN(new Date((a.tanggal || '') + 'T00:00:00')))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  const kosong = !list.length;

  $('#agenda').innerHTML = `
    <section class="bg-white py-16 md:py-24">
      <div class="mx-auto max-w-6xl px-4">
        ${judulSeksi('02', 'A G E N D A', 'Kegiatan warga RW 013')}
        ${kosong ? `
          <div class="kartu reveal mx-auto max-w-md p-10 text-center">
            <b class="block text-lg text-slate-900">Belum ada agenda terdaftar</b>
            <p class="mt-2 text-base text-slate-500">Agenda terbaru otomatis tampil setelah ditambahkan lewat halaman admin.</p>
          </div>` : `
          <div class="reveal grid gap-5 md:grid-cols-2">
            ${list.map((a) => {
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

/* ---------- 7) FOOTER ramping (tanpa Tautan Cepat & blok logo) ---------- */
function renderFooter(d) {
  const i = d.identitas || {};
  const darurat = d.kontakDarurat || [];
  $('#kontak').innerHTML = `
    <footer class="bg-slate-900 text-slate-300">
      <div class="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:py-16">
        <div>
          <h4 class="mb-4 text-lg font-bold text-white">Sekretariat</h4>
          <p class="text-base leading-relaxed">${i.alamat || ''}</p>
          <p class="mt-3 text-base">${i.jamLayanan || ''}</p>
        </div>
        <div>
          <h4 class="mb-4 text-lg font-bold text-white">Kontak Pengurus</h4>
          <ul class="space-y-2.5 text-base">
            <li>${ada(i.telepon) ? `<a class="hover:text-emerald-400" href="tel:${i.telepon}">${i.telepon}</a>` : '<span class="nilai-kosong">Telepon akan diperbarui</span>'}</li>
            <li>${ada(i.email) ? `<a class="hover:text-emerald-400" href="mailto:${i.email}">${i.email}</a>` : '<span class="nilai-kosong">Email akan diperbarui</span>'}</li>
            ${ada(i.sosmed && i.sosmed.whatsapp) ? `<li><a class="hover:text-emerald-400" href="https://wa.me/${i.sosmed.whatsapp}">WhatsApp Pengurus</a></li>` : ''}
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
        © ${new Date().getFullYear()} ${i.namaRW || 'RW 013 Menteng Atas'} — dibangun gotong royong oleh warga.
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