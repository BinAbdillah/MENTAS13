/* =========================================================
   halaman.js — header subpage + prev/next + KARAKTER halaman
   ========================================================= */
   const DAFTAR_HALAMAN = [
    ['struktur.html', 'Struktur'], ['rt.html', 'RT 001–009'], ['pkk.html', 'TP PKK'],
    ['karangtaruna.html', 'Karang Taruna'], ['lmk.html', 'LMK'],
    ['fasilitas.html', 'Fasilitas'], ['galeri.html', 'Galeri']
  ];
  
  /* Setiap halaman punya "jiwa" visualnya sendiri */
  const KARAKTER = {
    'struktur.html':     { mode: 'light', bg: '#F4F7FB', surface: '#FFFFFF', fill: '#E7EEF7', line: '#CBD9EA',
                           accent: '#1D4ED8', accentSoft: '#DBEAFE', accentText: '#1E40AF', onAccent: '#FFFFFF',
                           heading: '#0A1F44', nav: '#33415C', navHover: '#1D4ED8', teks: '#16233A', cls: 'hal-struktur' },
    'rt.html':           { mode: 'light', bg: '#F2F8F7', surface: '#FFFFFF', fill: '#DFF0ED', line: '#BFDFD9',
                           accent: '#0F766E', accentSoft: '#CCFBF1', accentText: '#0F766E', onAccent: '#FFFFFF',
                           heading: '#134E4A', nav: '#3D5A56', navHover: '#0F766E', teks: '#1C2B29', cls: 'hal-rt' },
    'pkk.html':          { mode: 'light', bg: '#FFF6FA', surface: '#FFFFFF', fill: '#FDE7F2', line: '#FBCFE0',
                           accent: '#DB2777', accentSoft: '#FCE7F3', accentText: '#BE185D', onAccent: '#FFFFFF',
                           heading: '#7A1B4E', nav: '#6D4059', navHover: '#DB2777', teks: '#33202B', cls: 'hal-pkk' },
    'karangtaruna.html': { mode: 'dark',  bg: '#0B1220', surface: '#101A2E', fill: '#1B2A44', line: '#2C3E5F',
                           accent: '#F97316', accentSoft: '#3A2410', accentText: '#FB923C', accentTextSoft: '#FDBA74', onAccent: '#0B1220',
                           heading: '#F8FAFC', nav: '#C7D2E2', navHover: '#FB923C', teks: '#E2E8F0', cls: 'hal-karangtaruna' },
    'lmk.html':          { mode: 'light', bg: '#FAF6EE', surface: '#FFFCF6', fill: '#F2E8D8', line: '#E3D5BC',
                           accent: '#A16207', accentSoft: '#F7EED9', accentText: '#854D0E', onAccent: '#FFFFFF',
                           heading: '#40301D', nav: '#5C4B33', navHover: '#A16207', teks: '#2E2417', cls: 'hal-lmk' },
    'fasilitas.html':    { mode: 'light', bg: '#F1F8F2', surface: '#FFFFFF', fill: '#DFF0E1', line: '#C4E0C8',
                           accent: '#16A34A', accentSoft: '#DCFCE7', accentText: '#15803D', onAccent: '#FFFFFF',
                           heading: '#14351C', nav: '#3E5A46', navHover: '#16A34A', teks: '#1B2A20', cls: 'hal-fasilitas' },
    'galeri.html':       { mode: 'dark',  bg: '#0C0D0F', surface: '#15171A', fill: '#23262B', line: '#2E3238',
                           accent: '#E11D48', accentSoft: '#3B1220', accentText: '#F87171', onAccent: '#FFFFFF',
                           heading: '#F4F4F5', nav: '#CFD4DA', navHover: '#F87171', teks: '#E4E4E7', cls: 'hal-galeri' }
  };
  
  function terapkanKarakter(key) {
    const k = KARAKTER[key];
    if (!k) return;
    (k.cls || '').split(' ').filter(Boolean).forEach((c) => document.body.classList.add(c));
    const r = document.documentElement;
    if (k.mode) r.dataset.mode = k.mode;
    const map = {
      '--bg': k.bg, '--surface': k.surface, '--fill': k.fill, '--line': k.line, '--line-soft': k.lineSoft || k.line,
      '--accent': k.accent, '--accent-strong': k.accentStrong || k.accent, '--accent-bright': k.accentBright || k.accent,
      '--accent-soft': k.accentSoft, '--accent-text': k.accentText, '--accent-text-soft': k.accentTextSoft || k.accentText,
      '--on-accent': k.onAccent, '--heading': k.heading, '--nav': k.nav, '--nav-hover': k.navHover, '--teks': k.teks
    };
    Object.entries(map).forEach(([kk, v]) => { if (v) r.style.setProperty(kk, v); });
  }
  
  async function muatDataHal() {
    const FB = window.FIREBASE_CONFIG || null;
    if (FB && FB.apiKey && FB.databaseURL) {
      try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
        const _fb = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
        const s = await _fb.get(_fb.ref(_fb.getDatabase(initializeApp(FB)), 'data'));
        if (s.val()) return rapikan(s.val());
      } catch (e) {}
    }
    return rapikan(await (await fetch('data/data.json')).json());
  }
  
  async function setupHalaman(judul) {
    const d = await muatDataHal();
    terapkanTema(d.tema);
    const cur = (location.pathname.split('/').pop() || '').toLowerCase();
    terapkanKarakter(cur);                      // karakter halaman menimpa tema global
    const idx = DAFTAR_HALAMAN.findIndex(([h]) => h === cur);
    const prev = idx > 0 ? DAFTAR_HALAMAN[idx - 1] : null;
    const next = (idx >= 0 && idx < DAFTAR_HALAMAN.length - 1) ? DAFTAR_HALAMAN[idx + 1] : null;
  
    $('#headerHal').innerHTML = `
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <span class="flex items-center gap-3">
          ${renderLogo(d.identitas.logo, 'h-12 w-12')}
          <b class="text-lg md:text-xl" style="color:var(--heading)">${judul}</b>
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
  
  const orangHal = (x) => (x && typeof x === 'object') ? { nama: x.nama || '', foto: x.foto || '' } : { nama: (x || ''), foto: '' };
  const avatarHal = (nama, foto, s = 'h-9 w-9', f = 'bg-slate-100 text-slate-500', t = 'text-xs') => ada(foto) ? `
    <span class="relative block ${s} flex-none">
      <img src="${foto}" alt="${nama}" class="absolute inset-0 h-full w-full rounded-full object-cover"
           onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
      <span class="hidden h-full w-full place-items-center rounded-full ${f} font-extrabold ${t}">${inisial(nama)}</span>
    </span>`
    : `<span class="grid ${s} flex-none place-items-center rounded-full ${f} font-extrabold ${t}">${inisial(nama)}</span>`;