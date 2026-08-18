/* =========================================================
   halaman.js — REFACTOR v2 (Branding Konsisten)
   Karakter halaman sekarang menjadi "Overlay" yang hanya
   mengubah suasana (latar, kartu, teks) tanpa menghapus
   Tema Aksen utama yang dipilih pengurus RW.
   ========================================================= */

   const DAFTAR_HALAMAN = [
    ['struktur.html', 'Struktur'], ['rt.html', 'RT 001–009'], ['pkk.html', 'TP PKK'],
    ['karangtaruna.html', 'Karang Taruna'], ['lmk.html', 'LMK'],
    ['fasilitas.html', 'Fasilitas'], ['galeri.html', 'Galeri']
  ];
  
  /* Setiap halaman punya "jiwa" visualnya sendiri */
  const KARAKTER = {
    'struktur.html':     { mode: 'light', bg: '#F4F7FB', surface: '#FFFFFF', fill: '#E7EEF7', line: '#CBD9EA', lineSoft: '#DEE7F2', teks: '#16233A', cls: 'hal-struktur' },
    'rt.html':           { mode: 'light', bg: '#F2F8F7', surface: '#FFFFFF', fill: '#DFF0ED', line: '#BFDFD9', lineSoft: '#D0E8E2', teks: '#1C2B29', cls: 'hal-rt' },
    'pkk.html':          { mode: 'light', bg: '#FFF6FA', surface: '#FFFFFF', fill: '#FDE7F2', line: '#FBCFE0', lineSoft: '#FAD5E7', teks: '#33202B', cls: 'hal-pkk' },
    'karangtaruna.html': { mode: 'dark',  bg: '#0B1220', surface: '#101A2E', fill: '#1B2A44', line: '#2C3E5F', lineSoft: '#22324F', teks: '#E2E8F0', cls: 'hal-karangtaruna' },
    'lmk.html':          { mode: 'light', bg: '#FAF6EE', surface: '#FFFCF6', fill: '#F2E8D8', line: '#E3D5BC', lineSoft: '#EBDFCB', teks: '#2E2417', cls: 'hal-lmk' },
    'fasilitas.html':    { mode: 'light', bg: '#F1F8F2', surface: '#FFFFFF', fill: '#DFF0E1', line: '#C4E0C8', lineSoft: '#D1E8D4', teks: '#1B2A20', cls: 'hal-fasilitas' },
    'galeri.html':       { mode: 'dark',  bg: '#0C0D0F', surface: '#15171A', fill: '#23262B', line: '#2E3238', lineSoft: '#25292C', teks: '#E4E4E7', cls: 'hal-galeri' }
  };
  
  function terapkanKarakter(key) {
    const k = KARAKTER[key];
    if (!k) return;
    (k.cls || '').split(' ').filter(Boolean).forEach((c) => document.body.classList.add(c));
    
    const r = document.documentElement;
    if (k.mode) r.dataset.mode = k.mode;
    
    // REFACTOR: HANYA mengubah suasana (bg, surface, fill, line, teks)
    // TIDAK mengubah --accent, --accent-text, --heading (agar tetap konsisten dengan tema user)
    const map = {
      '--bg': k.bg,
      '--surface': k.surface,
      '--fill': k.fill,
      '--line': k.line,
      '--line-soft': k.lineSoft || k.line,
      '--teks': k.teks
    };
    
    Object.entries(map).forEach(([kk, v]) => { if (v) r.style.setProperty(kk, v); });
  }
  
  /* ---------- Muat data subpage (Firebase → lokal, rapikan) ---------- */
  async function muatDataHal() {
    const FB = window.FIREBASE_CONFIG || null;
    if (FB && FB.apiKey && FB.databaseURL) {
      try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
        const _fb = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
        const s = await _fb.get(_fb.ref(_fb.getDatabase(initializeApp(FB)), 'data'));
        if (s.val()) return rapikan(s.val());
      } catch (e) { console.warn('Firebase gagal → fallback lokal.', e); }
    }
    try { return rapikan(await (await fetch('data/data.json')).json()); }
    catch (e) { console.error('data.json gagal dimuat.', e); return {}; }
  }
  
  /* ---------- Setup header subpage + judul + prev/next ---------- */
  async function setupHalaman(judul) {
    const d = await muatDataHal();
    d.identitas = d.identitas || {};
    try { terapkanTema(d.tema); } catch (e) {}
    const cur = (location.pathname.split('/').pop() || '').toLowerCase();
    terapkanKarakter(cur); // Karakter hanya mengubah nuansa, aksen tetap tema pengurus
    document.title = judul + ' — ' + (d.identitas.namaRW || 'RW 013 Menteng Atas');
  
    const host = $('#headerHal');
    if (!host) return d;
  
    const idx = DAFTAR_HALAMAN.findIndex(([h]) => h === cur);
    const prev = idx > 0 ? DAFTAR_HALAMAN[idx - 1] : null;
    const next = (idx >= 0 && idx < DAFTAR_HALAMAN.length - 1) ? DAFTAR_HALAMAN[idx + 1] : null;
  
    host.innerHTML = `
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <span class="flex items-center gap-3">
          ${renderLogo(d.identitas.logo, 'h-12 w-12')}
          <b class="judul-hal" style="color:var(--heading)">${judul}</b>
        </span>
        <div id="cuaca-widget"></div>
      </div>
      <div class="nav-hal-bar mx-auto max-w-6xl px-4 pb-2.5 text-sm">
        ${prev ? `<a class="nav-link" href="${prev[0]}">← ${prev[1]}</a>` : '<span></span>'}
        <a class="nav-link font-bold" href="index.html">Beranda</a>
        ${next ? `<a class="nav-link" href="${next[0]}">${next[1]} →</a>` : '<span></span>'}
      </div>`;
    return d;
  }
  
  /* Alias backward-compatible untuk script subpage */
  const orangHal = orang;
  const avatarHal = avatar;