/* =========================================================
   cursor.js — titik + cincin menyusul (lerp), membesar saat
   hover elemen interaktif. Nonaktif otomatis di layar sentuh
   dan prefers-reduced-motion.
   ========================================================= */
   (function () {
    const pointerHalus = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!pointerHalus || reduced) return;          // HP / aksesibilitas → normal
  
    document.documentElement.classList.add('cur-on');
  
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cur-dot';
    ring.className = 'cur-ring';
    document.body.append(dot, ring);
  
    let x = innerWidth / 2, y = innerHeight / 2;   // target (dot)
    let rx = x, ry = y;                            // posisi cincin (lerp)
  
    addEventListener('mousemove', (e) => {
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate(${x}px, ${y}px)`;
    }, { passive: true });
  
    (function loop() {
      rx += (x - rx) * 0.16;                        // kehalusan susulan
      ry += (y - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();
  
    // Membesar di elemen interaktif
    const INTERAKTIF = 'a, button, .kartu, .nav-link, input, textarea, select, .fas-card';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(INTERAKTIF)) document.body.classList.add('cur-aktif');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(INTERAKTIF)) document.body.classList.remove('cur-aktif');
    });
  
    // Sembunyikan saat kursor keluar jendela
    document.addEventListener('mouseleave', () => { dot.style.opacity = 0; ring.style.opacity = 0; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = 1; ring.style.opacity = 1; });
  })();