/* =========================================================
   cursor.js — REFACTOR v2 (Aman & Aksesibel)
   Tidak menyala otomatis. Hanya aktif jika user mengaktifkan 
   toggle di halaman admin (tersimpan di localStorage).
   ========================================================= */

   (function () {
    const K_CURSOR = 'rw13_cursor_active';
    
    function initCursor() {
      // Cek kondisi perangkat: nonaktif jika layar sentuh (HP) atau preferensi aksesibilitas OS
      const pointerHalus = window.matchMedia('(pointer: fine)').matches;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!pointerHalus || reduced) return;
  
      document.documentElement.classList.add('cur-on');
      const dot = document.createElement('div');
      const ring = document.createElement('div');
      dot.className = 'cur-dot';
      ring.className = 'cur-ring';
      document.body.append(dot, ring);
  
      let x = innerWidth / 2, y = innerHeight / 2;
      let rx = x, ry = y;
  
      addEventListener('mousemove', (e) => {
        x = e.clientX; y = e.clientY;
        dot.style.transform = `translate(${x}px, ${y}px)`;
      }, { passive: true });
  
      (function loop() {
        rx += (x - rx) * 0.16;
        ry += (y - ry) * 0.16;
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        requestAnimationFrame(loop);
      })();
  
      const INTERAKTIF = 'a, button, .kartu, .nav-link, input, textarea, select, .fas-card';
      document.addEventListener('mouseover', (e) => {
        if (e.target.closest(INTERAKTIF)) document.body.classList.add('cur-aktif');
      });
      document.addEventListener('mouseout', (e) => {
        if (e.target.closest(INTERAKTIF)) document.body.classList.remove('cur-aktif');
      });
      document.addEventListener('mouseleave', () => { dot.style.opacity = 0; ring.style.opacity = 0; });
      document.addEventListener('mouseenter', () => { dot.style.opacity = 1; ring.style.opacity = 1; });
    }
  
    // CEK LOCALSTORAGE. Hanya aktif jika user mengaktifkannya secara manual di panel admin!
    if (localStorage.getItem(K_CURSOR) === 'true') {
      initCursor();
    }
  
    // Tambahkan function global agar bisa dipanggil dari admin panel
    window.toggleCursor = (active) => {
      if (active) {
        localStorage.setItem(K_CURSOR, 'true');
        // Jika sudah ada elemen cursor, jangan buat duplikat
        if (!document.querySelector('.cur-dot')) {
          initCursor();
        }
      } else {
        localStorage.setItem(K_CURSOR, 'false');
        // Refresh untuk menghapus DOM cursor dan mereset class
        location.reload();
      }
    };
  })();