/* galeri.js — galeri penuh + lightbox */
const FB = window.FIREBASE_CONFIG || null;
let db = null, _fb = null;
if (FB && FB.apiKey && FB.databaseURL) {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    _fb = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
    db = _fb.getDatabase(initializeApp(FB));
  } catch (e) {}
}
async function muat() {
  if (db) { try { const s = await _fb.get(_fb.ref(db, 'data')); if (s.val()) return s.val(); } catch (e) {} }
  return (await fetch('data/data.json')).json();
}
const d = await muat();
terapkanTema(d.tema);
$('#logoHal').innerHTML = renderLogo(d.identitas.logo, 'h-12 w-12');
$('#judulHal').textContent = 'Galeri Warga';

$('#rootHal').innerHTML = `
  <div class="columns-1 gap-6 md:columns-2 lg:columns-3" id="galeriGrid">
    ${(d.galeri || []).map((g) => `
    <figure class="galeri-item kartu mb-6 cursor-zoom-in break-inside-avoid overflow-hidden p-0">
      <img src="${g.foto}" alt="${g.keterangan}" loading="lazy" class="w-full object-cover" style="aspect-ratio:4/3"
           onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
      <div class="hidden place-items-center text-5xl" style="aspect-ratio:4/3; background:var(--fill)">🖼️</div>
      <figcaption class="p-5">
        <b class="block text-base" style="color:var(--heading)">${g.keterangan}</b>
        <span class="text-sm" style="opacity:.6">${g.kategori} • ${g.tanggal}</span>
      </figcaption>
    </figure>`).join('')}
  </div>
  <div id="lightbox" class="fixed inset-0 z-[90] hidden items-center justify-center bg-black/85 p-6">
    <button id="lbTutup" aria-label="Tutup" class="absolute right-5 top-5 text-3xl text-white">✕</button>
    <figure class="max-w-3xl">
      <img id="lbImg" class="max-h-[80vh] w-full rounded-xl object-contain" src="" alt="">
      <figcaption id="lbCap" class="mt-3 text-center text-sm text-white/80"></figcaption>
    </figure>
  </div>`;

const lb = $('#lightbox');
const tutup = () => { lb.classList.add('hidden'); lb.classList.remove('flex'); };
$('#galeriGrid').addEventListener('click', (e) => {
  const fig = e.target.closest('.galeri-item'); if (!fig) return;
  const img = fig.querySelector('img'); if (!img || img.style.display === 'none') return;
  $('#lbImg').src = img.src;
  $('#lbCap').textContent = fig.querySelector('figcaption b').textContent;
  lb.classList.remove('hidden'); lb.classList.add('flex');
});
$('#lbTutup').onclick = tutup;
lb.addEventListener('click', (e) => { if (e.target === lb) tutup(); });