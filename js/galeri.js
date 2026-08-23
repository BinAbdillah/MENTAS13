/* =========================================================
galeri.js — REFACTOR v2 (hardening XSS + lightbox aksesibel)
masonry + lightbox: Esc / klik-luar / panah ←→,
focus trap di dalam dialog, fokus dikembalikan saat tutup,
item galeri bisa dibuka lewat keyboard (Enter/Spasi)
========================================================= */
const d = await setupHalaman('Galeri Warga');
const list = d.galeri || [];
$('#rootHal').innerHTML = list.length ? `<div class="columns-1 gap-6 md:columns-2 lg:columns-3" id="galeriGrid"> ${list.map((g, i) => `<figure class="galeri-item kartu mb-6 cursor-zoom-in break-inside-avoid overflow-hidden p-0" data-idx="${i}" tabindex="0" role="button" aria-label="Perbesar foto: ${escAttr(g.keterangan || 'galeri')}"> <img src="${escAttr(g.foto)}" alt="${escAttr(g.keterangan)}" loading="lazy" class="w-full object-cover" style="aspect-ratio:4/3" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"> <div class="hidden place-items-center text-sm" style="aspect-ratio:4/3; background:var(--fill); opacity:.6">Foto tidak tersedia</div> <figcaption class="p-5"> <b class="block text-base" style="color:var(--heading)">${esc(g.keterangan)}</b> <span class="text-sm" style="opacity:.6">${esc(g.kategori)} • ${esc(g.tanggal)}</span> </figcaption> </figure>`).join('')} </div>
<div id="lightbox" class="fixed inset-0 z-[90] hidden items-center justify-center bg-black/85 p-6" role="dialog" aria-modal="true" aria-label="Pratinjau foto">
  <button id="lbTutup" aria-label="Tutup (Esc)" class="absolute right-5 top-5 text-3xl text-white">✕</button>
  <button id="lbPrev" aria-label="Sebelumnya (←)" class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-2xl text-white hover:bg-white/20 md:left-6">‹</button>
  <figure class="max-w-3xl">
    <img id="lbImg" class="max-h-[80vh] w-full rounded-xl object-contain" src="" alt="">
    <figcaption id="lbCap" class="mt-3 text-center text-sm text-white/80"></figcaption>
  </figure>
  <button id="lbNext" aria-label="Berikutnya (→)" class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-2xl text-white hover:bg-white/20 md:right-6">›</button>
</div>`
: `<div class="kartu mx-auto max-w-md p-10 text-center"> <b class="block text-lg" style="color:var(--heading)">Galeri belum terisi</b> <p class="mt-2 text-base" style="opacity:.7">Tambahkan foto lewat halaman admin (📷 Upload).</p> </div>`;
const lb = $('#lightbox');
if (lb) {
  const imgEl = $('#lbImg'), cap = $('#lbCap');
  const bT = $('#lbTutup'), bP = $('#lbPrev'), bN = $('#lbNext');
  let idx = 0, terakhirFokus = null;
  const tampil = (i) => {
    idx = ((i % list.length) + list.length) % list.length;
    const g = list[idx];
    imgEl.src = g.foto || '';
    imgEl.alt = g.keterangan || 'Foto galeri';
    cap.textContent = `${g.keterangan || ''} • ${g.kategori || ''} • ${g.tanggal || ''} (${idx + 1}/${list.length})`;
    const nav = list.length > 1 ? '' : 'none';
    bP.style.display = nav; bN.style.display = nav;
  };
  const buka = (i, sumber) => {
    terakhirFokus = sumber || document.activeElement;
    tampil(i);
    lb.classList.remove('hidden'); lb.classList.add('flex');
    bT.focus();
  };
  const tutup = () => {
    lb.classList.add('hidden'); lb.classList.remove('flex');
    if (terakhirFokus && terakhirFokus.focus) terakhirFokus.focus();
  };
  $('#galeriGrid').addEventListener('click', (e) => {
    const fig = e.target.closest('.galeri-item');
    if (!fig) return;
    const img = fig.querySelector('img');
    if (!img || img.style.display === 'none') return;
    buka(+fig.dataset.idx, fig);
  });
  $('#galeriGrid').addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.galeri-item')) {
      e.preventDefault();
      buka(+e.target.closest('.galeri-item').dataset.idx, e.target);
    }
  });
  bT.onclick = tutup;
  bP.onclick = () => tampil(idx - 1);
  bN.onclick = () => tampil(idx + 1);
  lb.addEventListener('click', (e) => { if (e.target === lb) tutup(); });
  document.addEventListener('keydown', (e) => {
    if (lb.classList.contains('hidden')) return;
    if (e.key === 'Escape') tutup();
    else if (e.key === 'ArrowRight') tampil(idx + 1);
    else if (e.key === 'ArrowLeft') tampil(idx - 1);
    else if (e.key === 'Tab') { /* focus trap */
      const f = [bT, bP, bN];
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      if (e.shiftKey) f[i <= 0 ? f.length - 1 : i - 1].focus();
      else f[i === -1 || i === f.length - 1 ? 0 : i + 1].focus();
    }
  });
}