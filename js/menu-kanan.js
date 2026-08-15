/* =========================================================
   menu-kanan.js — REFACTOR v1
   menu pintasan kanan, popup hover; mandiri; aksesibel;
   link aktif otomatis; tutup via Esc / klik luar / anchor
   ========================================================= */
   (function () {
    const DAFTAR = [
      ['index.html', 'Beranda'],
      ['struktur.html', 'Struktur'],
      ['rt.html', 'RT 001–009'],
      ['pkk.html', 'TP PKK'],
      ['karangtaruna.html', 'Karang Taruna'],
      ['lmk.html', 'LMK'],
      ['fasilitas.html', 'Fasilitas'],
      ['galeri.html', 'Galeri'],
      ['#profil', 'Profil Wilayah'],
      ['#agenda', 'Agenda'],
      ['#kontak', 'Kontak']
    ];
  
    function pasang() {
      if (document.getElementById('menuKanan')) return;          // cegah dobel-render
      let host = document.getElementById('menu-kanan-slot');
      if (!host) {
        host = document.createElement('div');
        host.id = 'menu-kanan-slot';
        document.body.appendChild(host);
      }
  
      const cur = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  
      host.innerHTML = `
        <div class="menu-kanan" id="menuKanan">
          <button class="menu-btn" id="menuBtn" aria-label="Buka menu" aria-expanded="false">MENU</button>
          <nav class="menu-popup" id="menuPopup">
            <span class="m-judul">RW 013 MENTENG ATAS</span>
            ${DAFTAR.map(([h, l]) => {
              const aktif = !h.startsWith('#') && h.toLowerCase() === cur;
              return `<a href="${h}"${aktif ? ' class="aktif" aria-current="page"' : ''}>${l}</a>`;
            }).join('')}
          </nav>
        </div>`;
  
      const wrap = document.getElementById('menuKanan');
      const btn = document.getElementById('menuBtn');
      const setBuka = (v) => { wrap.classList.toggle('buka', v); btn.setAttribute('aria-expanded', String(v)); };
  
      btn.addEventListener('click', (e) => { e.stopPropagation(); setBuka(!wrap.classList.contains('buka')); });
      document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) setBuka(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setBuka(false); });
      wrap.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', () => setBuka(false)));
    }
  
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang);
    else pasang();
  })();