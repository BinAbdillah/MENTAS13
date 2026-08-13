/* =========================================================
   halaman.js — header subpage: logo TANPA tautan + prev/next
   ========================================================= */
   const DAFTAR_HALAMAN = [
    ['struktur.html', 'Struktur'], ['rt.html', 'RT 001–009'], ['pkk.html', 'TP PKK'],
    ['karangtaruna.html', 'Karang Taruna'], ['lmk.html', 'LMK'],
    ['fasilitas.html', 'Fasilitas'], ['galeri.html', 'Galeri']
  ];
  
  async function muatDataHal() {
    const FB = window.FIREBASE_CONFIG || null;
    if (FB && FB.apiKey && FB.databaseURL) {
      try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
        const _fb = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
        const s = await _fb.get(_fb.ref(_fb.getDatabase(initializeApp(FB)), 'data'));
        if (s.val()) return s.val();
      } catch (e) {}
    }
    return (await (await fetch('data/data.json')).json());
  }
  
  async function setupHalaman(judul) {
    const d = await muatDataHal();
    terapkanTema(d.tema);
    const cur = (location.pathname.split('/').pop() || '').toLowerCase();
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