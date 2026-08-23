/* =========================================================
cursor.js — REFACTOR v3 (toggle bersih, tanpa location.reload)
========================================================= */
(function () {
  const K_CURSOR = 'rw13_cursor_active';
  let stopLoop = null;
  function initCursor() {
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
    let hidup = true;
    addEventListener('mousemove', (e) => {
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate(${x}px, ${y}px)`;
    }, { passive: true });
    (function loop() {
      if (!hidup) return;
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();
    stopLoop = () => { hidup = false; };
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
  if (localStorage.getItem(K_CURSOR) === 'true') initCursor();
  window.toggleCursor = (active) => {
    if (active) {
      localStorage.setItem(K_CURSOR, 'true');
      if (!document.querySelector('.cur-dot')) initCursor();
    } else {
      localStorage.setItem(K_CURSOR, 'false');
      if (stopLoop) stopLoop();
      stopLoop = null;
      document.querySelectorAll('.cur-dot, .cur-ring').forEach((el) => el.remove());
      document.documentElement.classList.remove('cur-on');
      document.body.classList.remove('cur-aktif');
    }
  };
})();