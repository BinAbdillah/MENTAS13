/* =========================================================
   menu-kanan.js — menu pintasan tunggal sisi kanan,
   popup hover; mandiri (tak bergantung render/app)
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
      let host = document.getElementById('menu-kanan-slot');
      if (!host) {
        host = document.createElement('div');
        host.id = 'menu-kanan-slot';
        document.body.appendChild(host);
      }
      host.innerHTML = `
        <div class="menu-kanan" id="menuKanan">
          <button class="menu-btn" id="menuBtn" aria-label="Menu">MENU</button>
          <nav class="menu-popup">
            <span class="m-judul">RW 013 MENTENG ATAS</span>
            ${DAFTAR.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}
          </nav>
        </div>`;
      document.getElementById('menuBtn').addEventListener('click', () =>
        document.getElementById('menuKanan').classList.toggle('buka'));
    }
  
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang);
    else pasang();
  })();