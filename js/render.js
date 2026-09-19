/* =========================================================
 render.js — REFACTOR v2 (HARDENING XSS)
 Semua string data → esc()/escAttr() sebelum injeksi innerHTML.
 header: logo + moto + widget cuaca
 hero penuh | profil: counter + donat 3D + batas
 agenda (guard tanggal) | footer ramping
 ========================================================= */

/* ---------- Util lokal ---------- */
const huruf = (teks) => String(teks)
  .split('')
  .map((c) => `<span class="huruf">${c === ' ' ? '&nbsp;' : esc(c)}</span>`)
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
  const namaRW = i.namaRW || 'RW 013 Menteng Atas';
  $('#header').innerHTML = `
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
      <a href="#hero" class="flex items-center gap-3">
        ${renderLogo(i.logo, 'h-12 w-12 md:h-14 md:w-14')}
        <div class="leading-none">
          <div class="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[color:var(--muted)]">RW</div>
          <div class="mt-1 text-sm font-black tracking-[0.18em] text-[color:var(--ink)]">${esc(namaRW)}</div>
        </div>
      </a>

      <nav class="hidden items-center gap-2 md:flex">
        <a href="#hero" class="nav-link">Beranda</a>
        <a href="#profil" class="nav-link">Profil</a>
        <a href="#agenda" class="nav-link">Agenda</a>
        <a href="#kontak" class="nav-link">Kontak</a>
      </nav>

      <div class="flex items-center gap-3">
        <div id="cuaca-widget"></div>
      </div>
    </div>
  `;
  renderPetaCuaca(d);
}

/* ---------- 2) INFO WARGA (marquee pengumuman) ---------- */
function renderPengumuman(d) {
  const slot = $('#pengumuman-slot');
  if (!slot) return;

  const list = (d.pengumuman || []).slice()
    .sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || (b.tanggal || '').localeCompare(a.tanggal || ''));

  if (!list.length) {
    slot.innerHTML = '';
    return;
  }

  const setengah = list.map((p) =>
    `<span class="mx-5 inline-flex items-center gap-2"><span class="inline-flex h-2 w-2 rounded-full bg-[color:var(--gold)]"></span><b>${p.pin ? '📌 ' : ''}${esc(p.judul)}</b> — ${esc(p.isi)}</span><span aria-hidden="true" class="mx-2 text-[color:var(--gold)]">✦</span>`
  ).join('');

  slot.innerHTML = `
    <div class="border-b border-[color:var(--line)] bg-[color:var(--surface)]/90">
      <div class="marquee mx-auto max-w-6xl px-4 py-2.5 text-sm font-semibold tracking-[0.18em] uppercase text-[color:var(--ink-soft)]">
        <div class="marquee-track">${setengah}${setengah}</div>
      </div>
    </div>
  `;
}

/* ---------- 3) HERO PENUH ---------- */
function renderHero(d) {
  const hero = d.hero || {};
  const i = d.identitas || {};
  const inti = (d.strukturRW && d.strukturRW.inti) || [];
  const ketua = inti.find((p) => p.jabatan === 'Ketua') || {};
  const fotoHero = (bannerAktif(d.banner) && d.banner.gantiFotoHero) ? d.banner.gambar : hero.foto;
  const subtitle = hero.sambutan || 'Membangun lingkungan yang aman, rukun, dan berdaya guna untuk seluruh warga.';
  const periode = hero.periode || 'Periode 2025 - 2026';
  const namaKetua = ketua.nama || 'Ketua RW 013';

  $('#hero').innerHTML = `
    <section class="relative overflow-hidden bg-[color:var(--ink)] text-white">
      <img src="${escAttr(fotoHero || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80')}" alt="Foto wilayah ${escAttr(i.namaRW || 'RW 013 Menteng Atas')}" class="absolute inset-0 h-full w-full object-cover opacity-70" />
      <div class="hero-overlay absolute inset-0"></div>

      <div class="relative mx-auto grid min-h-[88vh] max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.2fr_0.8fr] md:py-20">
        <div class="max-w-2xl">
          <div class="mb-5 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.26em] text-white/85 backdrop-blur-sm">
            <span class="inline-block h-2 w-2 rounded-full bg-[color:var(--gold)]"></span>
            ${esc(i.namaRW || 'RW 013 Menteng Atas')}
          </div>

          <h1 class="text-5xl font-black leading-[0.95] tracking-[-0.04em] md:text-7xl">
            <span class="mask"><span class="mask-line block">Website Resmi</span></span>
            <span class="mask"><span class="mask-line block text-[color:var(--gold)]">RW 013</span></span>
            <span class="mask"><span class="mask-line block text-white/90">Menteng Atas</span></span>
          </h1>

          <p class="mt-6 max-w-xl text-base leading-7 text-white/80 md:text-lg">${esc(subtitle)}</p>

          <div class="mt-8 flex flex-wrap items-center gap-4">
            <a href="#profil" class="rounded-full bg-[color:var(--gold)] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[color:var(--ink)] transition hover:brightness-110">Profil RW</a>
            <a href="#agenda" class="rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/10">Agenda</a>
          </div>

          <div class="mt-8 flex flex-wrap gap-4 text-sm text-white/80">
            <div class="rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-sm">${esc(periode)}</div>
            <div class="rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-sm">${esc(namaKetua)}</div>
          </div>
        </div>

        <div class="relative">
          <div class="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
            <div class="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/15">
              <div class="bg-[color:var(--surface)] px-5 py-4 text-[color:var(--ink)]">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <div class="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[color:var(--muted)]">Pimpinan</div>
                    <div class="mt-1 text-xl font-black">${esc(namaKetua)}</div>
                  </div>
                  <div class="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--accent-soft)] text-lg text-[color:var(--accent)]">🏛️</div>
                </div>
              </div>
              <div class="grid gap-3 bg-[color:var(--surface)]/90 p-5 text-[color:var(--ink)]">
                <div class="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-alt)] p-4">
                  <div class="text-[10px] font-extrabold uppercase tracking-[0.26em] text-[color:var(--muted)]">Visi</div>
                  <p class="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">Lingkungan RW 013 yang aman, rukun, sehat, dan berdaya guna untuk kesejahteraan seluruh warga.</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-alt)] p-3">
                    <div class="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[color:var(--muted)]">Kegiatan</div>
                    <div class="mt-2 text-2xl font-black text-[color:var(--accent)]">${esc(String((d.agenda || []).length || 0))}</div>
                  </div>
                  <div class="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-alt)] p-3">
                    <div class="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[color:var(--muted)]">RT</div>
                    <div class="mt-2 text-2xl font-black text-[color:var(--accent)]">${esc(String((d.rt || []).length || 0))}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

/* ---------- 4) DONAT RT 3D + POPUP HOVER ---------- */
const WARNA_DONAT = ['#7A2D22', '#B98945', '#3B5B49', '#6C7A89', '#8B5E3C', '#A95A4E', '#7B7B5D', '#B7855C', '#637D77'];

function donatRT(d) {
  const list = (d.rt || []).filter((r) => r.statistik && r.statistik.jiwa > 0);
  const total = list.reduce((a, r) => a + r.statistik.jiwa, 0);
  if (!total) return '';
  const R = 56, C = 2 * Math.PI * R;
  const segs = list.map((r, i) => {
    const frac = r.statistik.jiwa / total;
    return `<circle data-i="${i}" r="${R}" cx="80" cy="80" fill="none" stroke="${WARNA_DONAT[i % 9]}" stroke-width="26" stroke-dasharray="${(frac * C).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-((list.slice(0, i).reduce((a, x) => a + (x.statistik.jiwa / total), 0)) * C))}" transform="rotate(-90 80 80)" />`;
  }).join('');

  return `
    <div class="donat-3d">
      <svg viewBox="0 0 160 160" class="h-56 w-56 md:h-64 md:w-64" role="img" aria-label="Grafik distribusi jiwa per RT">
        <circle r="56" cx="80" cy="80" fill="none" stroke="rgba(122,45,34,0.12)" stroke-width="26" />
        ${segs}
        <text x="80" y="76" text-anchor="middle" font-size="15" font-weight="800" fill="var(--ink)">${esc(String(total))}</text>
        <text x="80" y="94" text-anchor="middle" font-size="9" fill="var(--muted)" letter-spacing="0.18em">JIWA</text>
      </svg>
      <div class="donat-popup"></div>
    </div>
  `;
}

function pasangDonat3D(d) {
  const wrap = document.querySelector('.donat-3d');
  if (!wrap) return;
  const svg = wrap.querySelector('svg');
  const popup = wrap.querySelector('.donat-popup');
  if (!svg || !popup) return;

  const list = (d.rt || []).filter((r) => r.statistik && r.statistik.jiwa > 0);
  wrap.addEventListener('pointermove', (e) => {
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    svg.style.transform = `rotateX(${(-y * 18).toFixed(1)}deg) rotateY(${(x * 20).toFixed(1)}deg)`;
  });
  wrap.addEventListener('pointerleave', () => {
    svg.style.transform = 'rotateX(0deg) rotateY(0deg)';
    popup.classList.remove('on');
  });

  svg.querySelectorAll('circle[data-i]').forEach((c) => {
    const i = +c.dataset.i, r = list[i], s = r && r.statistik;
    c.addEventListener('pointerenter', () => {
      if (!s) return;
      popup.innerHTML = `<b class="block text-sm font-black text-[color:var(--ink)]">RT ${esc(r.no)}</b><span>Jiwa: <b>${s.jiwa}</b> • KK: <b>${s.kk}</b></span><span>Laki ${s.laki} / Perempuan ${s.perempuan}</span>`;
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
  const stats = [
    ['Luas Wilayah', w.luasM2 ? `${fmtNum(w.luasM2)} m²` : '—'],
    ['Penduduk', agg ? fmtNum(agg.jiwa) : (w.penduduk ? fmtNum(w.penduduk) : '—')],
    ['Jumlah RT', w.jumlahRT || (d.rt || []).length || '—'],
    ['Perbatasan', (w.perbatasan || []).length ? (w.perbatasan.map((x) => `${panah[x.arah] || '•'} ${esc(x.nama || x.arah || '')}`).join(', ')) : '—']
  ];

  $('#profil').innerHTML = `
    <section class="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div class="mb-10">${judulSeksi('01', 'Profil Warga', 'Kondisi sosial, demografi, dan tata ruang RW 013 Menteng Atas.')}</div>
      <div class="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <div class="kartu p-6 md:p-8">
          <div class="mb-5 text-[10px] font-extrabold uppercase tracking-[0.28em] text-[color:var(--muted)]">Data Umum</div>
          <div class="space-y-5">
            ${stats.map(([label, value]) => `
              <div class="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-alt)] p-4">
                <div class="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[color:var(--muted)]">${esc(label)}</div>
                <div class="mt-2 text-2xl font-black text-[color:var(--ink)]">${value}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="kartu p-6 md:p-8">
          <div class="mb-6 flex items-center justify-between gap-4">
            <div>
              <div class="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[color:var(--muted)]">Komposisi</div>
              <h3 class="mt-2 text-3xl font-black text-[color:var(--ink)]">Distribusi warga</h3>
            </div>
            <div class="rounded-full border border-[color:var(--line)] bg-[color:var(--surface-alt)] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[color:var(--muted)]">RT</div>
          </div>

          <div class="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
            <div class="flex justify-center">${donatRT(d)}</div>
            <div class="space-y-3">
              ${((d.rt || []).filter((r) => r && r.statistik && r.statistik.jiwa > 0).map((r, idx) => `
                <div class="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-alt)] p-3">
                  <div class="flex items-center gap-3">
                    <span class="h-3 w-3 rounded-full" style="background:${WARNA_DONAT[idx % 9]};"></span>
                    <div>
                      <div class="text-sm font-black text-[color:var(--ink)]">RT ${esc(r.no || (idx + 1))}</div>
                      <div class="text-xs text-[color:var(--muted)]">Jiwa: ${fmtNum(r.statistik.jiwa || 0)}</div>
                    </div>
                  </div>
                  <div class="text-xs font-extrabold uppercase tracking-[0.22em] text-[color:var(--muted)]">${esc(String((r.statistik.kk || 0)))} KK</div>
                </div>
              `).join('') || '<div class="text-sm italic text-[color:var(--muted)]">Belum ada data RT.</div>')}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  pasangDonat3D(d);
}

/* ---------- 6) AGENDA (guard tanggal bolong) ---------- */
function renderAgenda(d) {
  const list = (d.agenda || [])
    .filter((a) => a && !isNaN(new Date((a.tanggal || '') + 'T00:00:00')))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  const kosong = !list.length;

  $('#agenda').innerHTML = `
    <section class="bg-[color:var(--surface)] py-16 md:py-24">
      <div class="mx-auto max-w-6xl px-4">
        ${judulSeksi('02', 'Agenda Warga', 'Kegiatan, rapat, dan agenda yang sedang berlangsung di lingkungan RW 013.')}

        ${kosong ? `
          <div class="kartu p-8 text-center text-[color:var(--muted)]">Belum ada agenda yang dipublikasikan.</div>
        ` : `
          <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            ${list.slice(0, 6).map((a) => {
              const t = new Date(a.tanggal + 'T00:00:00');
              const bulan = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(t);
              const panjang = String(a.judul || '').length > 30 ? '...' : '';
              return `
                <article class="kartu kartu-hover p-5">
                  <div class="mb-4 flex items-center justify-between gap-3">
                    <div class="rounded-full border border-[color:var(--line)] bg-[color:var(--surface-alt)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.26em] text-[color:var(--muted)]">${esc(a.kategori || 'Kegiatan')}</div>
                    <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--gold)]">${esc(bulan)}</div>
                  </div>

                  <div class="mb-4 flex items-center gap-4">
                    <div class="flex h-16 w-16 flex-none flex-col items-center justify-center rounded-2xl bg-[color:var(--accent)] text-center text-white shadow-lg">
                      <div class="text-2xl font-black leading-none">${esc(String(t.getDate()).padStart(2, '0'))}</div>
                      <div class="mt-1 text-[10px] font-extrabold uppercase tracking-[0.2em]">${esc(new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(t).slice(0, 3).toUpperCase())}</div>
                    </div>
                    <div class="min-w-0">
                      <div class="text-xs font-extrabold uppercase tracking-[0.2em] text-[color:var(--muted)]">Agenda</div>
                      <h3 class="mt-1 text-xl font-black leading-snug text-[color:var(--ink)]">${esc((a.judul || '').slice(0, 35) + panjang)}</h3>
                    </div>
                  </div>

                  <p class="text-sm leading-6 text-[color:var(--ink-soft)]">${esc(a.isi || 'Informasi kegiatan warga.')}</p>
                </article>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </section>
  `;
}

/* ---------- 7) FOOTER ramping ---------- */
function renderFooter(d) {
  const i = d.identitas || {};
  const darurat = d.kontakDarurat || [];
  const wa = ada(i.sosmed && i.sosmed.whatsapp) ? String(i.sosmed.whatsapp).replace(/\D/g, '') : '';
  const telepon = ada(i.telepon) ? String(i.telepon) : '';

  $('#kontak').innerHTML = `
    <footer class="bg-[color:var(--ink)] text-white">
      <div class="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-16">
        <div>
          <div class="mb-4 text-[10px] font-extrabold uppercase tracking-[0.28em] text-[color:var(--gold)]">RW 013</div>
          <h4 class="text-3xl font-black leading-tight text-white">${esc(i.namaRW || 'Menteng Atas')}</h4>
          <p class="mt-4 max-w-lg text-sm leading-7 text-white/70">${esc(i.deskripsi || 'Website resmi RW 013 Menteng Atas sebagai media informasi, komunikasi, dan pelayanan untuk seluruh warga.')}</p>

          <div class="mt-6 flex flex-wrap gap-3">
            ${wa ? `<a href="https://wa.me/62${wa}" target="_blank" rel="noreferrer" class="rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.24em] text-white/90 hover:bg-white/15">WhatsApp</a>` : ''}
            ${telepon ? `<a href="tel:${escAttr(telepon)}" class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.24em] text-white/90 hover:bg-white/10">Telepon</a>` : ''}
          </div>
        </div>

        <div class="grid gap-4 md:justify-items-end">
          <div class="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div class="mb-3 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[color:var(--gold)]">Kontak Darurat</div>
            ${darurat.length ? darurat.map((k) => `
              <div class="mt-2 text-sm text-white/80">${esc(k.nama || 'Kontak')} — ${esc(k.telepon || '—')}</div>
            `).join('') : '<div class="text-sm text-white/60">Belum ada kontak darurat.</div>'}
          </div>
        </div>
      </div>
      <div class="border-t border-white/10">
        <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 text-xs uppercase tracking-[0.18em] text-white/50">
          <span>© ${new Date().getFullYear()} RW 013 Menteng Atas</span>
          <span>Website Resmi</span>
        </div>
      </div>
    </footer>
  `;
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
