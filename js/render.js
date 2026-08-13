/* =========================================================
   render.js — MULTIPAGES v1: halaman utama saja, tanpa ikon
   (kecuali cuaca). Navigasi = menu kanan popup.
   ========================================================= */

   const NAV_HALAMAN = [
    ['index.html', 'Beranda'], ['struktur.html', 'Penasehat • Pengurus • Bidang'],
    ['rt.html', 'RT 001–009'], ['pkk.html', 'TP PKK'], ['karangtaruna.html', 'Karang Taruna'],
    ['lmk.html', 'LMK'], ['fasilitas.html', 'Fasilitas'], ['galeri.html', 'Galeri']
  ];
  
  const huruf = (teks) => teks.split('').map((c) => `<span class="huruf">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
  
  const orang = (x) => (x && typeof x === 'object') ? { nama: x.nama || '', foto: x.foto || '' } : { nama: (x || ''), foto: '' };
  
  const avatar = (nama, foto, sizeCls = 'h-14 w-14', fallCls = 'bg-slate-100 text-slate-500', txt = 'text-lg') => ada(foto) ? `
    <span class="relative block ${sizeCls} flex-none">
      <img src="${foto}" alt="${nama}" class="absolute inset-0 h-full w-full rounded-full object-cover"
           onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
      <span class="hidden h-full w-full place-items-center rounded-full ${fallCls} font-extrabold ${txt}">${inisial(nama)}</span>
    </span>`
    : `<span class="grid ${sizeCls} flex-none place-items-center rounded-full ${fallCls} font-extrabold ${txt}">${inisial(nama)}</span>`;
  
  function agregatRT(d) {
    const list = (d.rt || []).map((r) => r.statistik).filter((s) => s && typeof s.jiwa === 'number');
    if (!list.length) return null;
    const sum = (k) => list.reduce((a, s) => a + (Number(s[k]) || 0), 0);
    return { kk: sum('kk'), jiwa: sum('jiwa'), laki: sum('laki'), perempuan: sum('perempuan'), balita: sum('balita'), lansia: sum('lansia') };
  }
  
  /* ---------- HEADER besar, tanpa nav ---------- */
  function renderHeader(d) {
    const i = d.identitas;
    $('#header').innerHTML = `
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <a href="#hero" class="flex items-center gap-4">
          <span class="logo-besar block">${renderLogo(i.logo, 'logo-besar h-20 w-20 md:h-24 md:w-24')}</span>
          <span>
            <span class="block text-2xl font-extrabold leading-tight text-slate-900 md:text-3xl">${i.namaRW}</span>
            <span class="block text-base text-slate-500">${i.tagline}</span>
          </span>
        </a>
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
          ${NAV_HALAMAN.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}
          <a href="#profil">Profil Wilayah</a>
          <a href="#agenda">Agenda</a>
          <a href="#cuaca">Cuaca</a>
          <a href="#kontak">Kontak</a>
        </nav>
      </div>`;
    $('#menuBtn').addEventListener('click', () => $('#menuKanan').classList.toggle('buka'));
  }
  
  /* ---------- INFO WARGA (marquee, tanpa emoji) ---------- */
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
  
  /* ---------- HERO ---------- */
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
                ${avatar(ketua.nama, ketua.foto, 'h-14 w-14', 'bg-emerald-500 text-slate-900', 'text-lg')}
                <span>
                  <span class="block text-lg font-bold">${namaAtau(ketua.nama)}</span>
                  <span class="block text-sm text-emerald-300">Ketua RW • Periode ${hero.periode}</span>
                </span>
              </div>
              <div class="mt-8 flex flex-wrap gap-3">
                <a href="struktur.html" class="group w-full rounded-full bg-emerald-500 px-7 py-3.5 text-center text-base font-bold text-slate-900 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 sm:w-auto">
                  Struktur Pengurus <span class="inline-block transition-transform group-hover:translate-x-1.5">→</span>
                </a>
                <a href="#kontak" class="group w-full rounded-full border border-white/30 px-7 py-3.5 text-center text-base font-bold hover:bg-white/10 sm:w-auto">
                  Kontak <span class="inline-block transition-transform group-hover:translate-x-1.5">→</span>
                </a>
              </div>
            </div>
            <aside class="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur md:p-7">
              <h3 class="mb-4 text-base font-bold uppercase tracking-widest text-emerald-300">Sekilas Wilayah</h3>
              ${[['Penduduk', fmtNum(agg ? agg.jiwa : w.penduduk) + ' jiwa'],
                 ['Kepala Keluarga', fmtNum(agg ? agg.kk : 0) + ' KK'],
                 ['Jumlah RT', w.jumlahRT + ' RT'],
                 ['Luas Wilayah', fmtNum(w.luasM2) + ' m²']]
                .map(([l, v]) => `
                <div class="flex items-center justify-between border-b border-white/10 py-3.5 text-base last:border-0">
                  <span class="text-slate-200">${l}</span><b class="text-xl">${v}</b>
                </div>`).join('')}
            </aside>
          </div>
        </div>
        <div class="marquee relative border-t border-white/10 bg-emerald-600/90 text-emerald-50">
          <div class="marquee-track">${setengah}${setengah}</div>
        </div>
      </section>`;
  }
  
  /* ---------- DONAT RT (SVG) ---------- */
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
        <svg viewBox="0 0 160 160" class="h-44 w-44 flex-none">
          ${segs}
          <text x="80" y="76" text-anchor="middle" style="font-weight:800; font-size:20px; fill:var(--heading)">${fmtNum(total)}</text>
          <text x="80" y="94" text-anchor="middle" style="font-size:9px; letter-spacing:.2em; fill:var(--teks); opacity:.6">JIWA</text>
        </svg>
        <div class="donat-leg">
          ${list.map((r, i) => `<div><span style="background:${WARNA_DONAT[i % 9]}"></span>RT ${r.no} — <b>${r.statistik.jiwa}</b> jiwa</div>`).join('')}
        </div>
      </div>`;
  }
  
  /* ---------- PROFIL (statistik + donat + batas) ---------- */
  function renderProfil(d) {
    const w = d.wilayah;
    const agg = agregatRT(d);
    const barisRT = (d.rt || []).map((r) => {
      const s = r.statistik || {};
      return `<tr class="border-b last:border-0" style="border-color:var(--line-soft)">
        <td class="py-2.5 pr-4 font-bold">${r.no}</td><td class="py-2.5 pr-4">${s.kk ?? '—'}</td>
        <td class="py-2.5 pr-4">${s.jiwa ?? '—'}</td><td class="py-2.5 pr-4">${s.laki ?? '—'}</td>
        <td class="py-2.5 pr-4">${s.perempuan ?? '—'}</td><td class="py-2.5 pr-4">${s.balita ?? '—'}</td>
        <td class="py-2.5">${s.lansia ?? '—'}</td></tr>`;
    }).join('');
  
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
            </div>
  
            <div class="kartu reveal overflow-x-auto p-6 md:p-8">
              <h3 class="mb-5 text-xl font-bold text-slate-900">DATA STATISTIK RT</h3>
              <table class="w-full min-w-[560px] text-left text-sm md:text-base">
                <thead><tr class="border-b" style="border-color:var(--line)">
                  <th class="py-2 pr-4 font-bold">RT</th><th class="py-2 pr-4 font-bold">KK</th>
                  <th class="py-2 pr-4 font-bold">Jiwa</th><th class="py-2 pr-4 font-bold">Laki</th>
                  <th class="py-2 pr-4 font-bold">Perempuan</th><th class="py-2 pr-4 font-bold">Balita</th>
                  <th class="py-2 font-bold">Lansia</th></tr></thead>
                <tbody>${barisRT}
                  <tr class="font-extrabold" style="color:var(--accent-text)">
                    <td class="py-2.5 pr-4">Σ Total</td><td class="py-2.5 pr-4">${agg ? fmtNum(agg.kk) : '—'}</td>
                    <td class="py-2.5 pr-4">${agg ? fmtNum(agg.jiwa) : '—'}</td><td class="py-2.5 pr-4">${agg ? fmtNum(agg.laki) : '—'}</td>
                    <td class="py-2.5 pr-4">${agg ? fmtNum(agg.perempuan) : '—'}</td><td class="py-2.5 pr-4">${agg ? fmtNum(agg.balita) : '—'}</td>
                    <td class="py-2.5">${agg ? fmtNum(agg.lansia) : '—'}</td></tr>
                </tbody>
              </table>
              <p class="mt-3 text-xs" style="opacity:.6">Sumber: DAWIS 013 • <a class="font-bold" style="color:var(--accent-text)" href="rt.html">lihat halaman RT →</a></p>
            </div>
          </div>
        </div>
      </section>`;
  }
  
  /* ---------- AGENDA (tanpa ikon) ---------- */
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
  
  /* ---------- CUACA (BMKG → fallback Open-Meteo) ---------- */
  const ikonCuacaTeks = (t) => {
    t = (t || '').toLowerCase();
    if (t.includes('cerah')) return '☀️';
    if (t.includes('berawan')) return '⌛';
    if (t.includes('mendung') || t.includes('berawan')) return '☁️';
    if (t.includes('gerimis')) return '🌦️';
    if (t.includes('hujan')) return '🌧️';
    if (t.includes('petir')) return '⛈️';
    if (t.includes('kabut')) return '🌫️';
    return '🌡️';
  };
  
  async function ambilBMKG() {
    const r = await fetch('https://data.bmkg.go.id/cuaca/31.xml');
    if (!r.ok) throw new Error('bmkg');
    const doc = new DOMParser().parseFromString(await r.text(), 'text/xml');
    const areas = [...doc.querySelectorAll('area')];
    const a = areas.find((x) => (x.getAttribute('name') || '').toLowerCase().includes('setia')) || areas[0];
    if (!a) throw new Error('bmkg');
    const cuaca = a.querySelector('weather') ? a.querySelector('weather').textContent : '';
    const hum = a.querySelector('humidity') ? a.querySelector('humidity').textContent : '';
    const tmax = a.querySelector('tmax') ? a.querySelector('tmax').textContent : '';
    const tmin = a.querySelector('tmin') ? a.querySelector('tmin').textContent : '';
    if (!cuaca && !tmax) throw new Error('bmkg');
    return { sumber: 'BMKG', teks: cuaca || '—', hum, tmax, tmin, angin: '' };
  }
  
  async function ambilOpenMeteo(lat, lon) {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`);
    const c = (await r.json()).current;
    const [ikon, teks] = labelCuaca(c.weather_code);
    return { sumber: 'Open-Meteo', teks, ikon, hum: c.relative_humidity_2m + '%',
             tmax: Math.round(c.temperature_2m), tmin: Math.round(c.apparent_temperature), angin: Math.round(c.wind_speed_10m) };
  }
  
  function renderCuaca(d) {
    $('#cuaca').innerHTML = `
      <section class="mx-auto max-w-6xl px-4 py-16 md:py-24">
        ${judulSeksi('03', 'Cuaca Wilayah', 'Prakiraan resmi BMKG untuk Jakarta Selatan (fallback Open-Meteo)')}
        <div id="cuacaCard" class="kartu reveal max-w-xl p-6 md:p-8">
          <p class="animate-pulse text-base text-slate-500">Memuat cuaca…</p>
        </div>
      </section>`;
  
    (async () => {
      let c = null;
      try { c = await ambilBMKG(); } catch (e) {}
      if (!c) { try { c = await ambilOpenMeteo(...d.identitas.koordinat); } catch (e) {
        $('#cuacaCard').innerHTML = '<p class="text-base text-slate-500">Cuaca tidak dapat dimuat.</p>'; return;
      }}
      const ikon = c.ikon || ikonCuacaTeks(c.teks);
      $('#cuacaCard').innerHTML = `
        <div class="flex items-center gap-6">
          <span class="text-6xl">${ikon}</span>
          <div>
            <b class="text-4xl md:text-5xl" style="color:var(--heading)">${c.teks}</b>
            <p class="mt-1 text-base" style="opacity:.7">Jakarta Selatan • hari ini</p>
          </div>
        </div>
        <div class="mt-6 grid grid-cols-3 gap-2 text-center text-sm">
          <div class="rounded-xl p-4" style="background:var(--fill)">Suhu Maks<br><b class="text-base">${c.tmax || '—'}°C</b></div>
          <div class="rounded-xl p-4" style="background:var(--fill)">Suhu Min<br><b class="text-base">${c.tmin || '—'}°C</b></div>
          <div class="rounded-xl p-4" style="background:var(--fill)">Kelembapan<br><b class="text-base">${c.hum || '—'}${String(c.hum).includes('%') ? '' : '%'}</b></div>
        </div>
        <p class="mt-4 text-xs" style="opacity:.55">Sumber: ${c.sumber}</p>`;
    })();
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