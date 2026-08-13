/* grup.js — halaman per-mitra via body[data-mitra] */
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
const orang = (x) => (x && typeof x === 'object') ? { nama: x.nama || '', foto: x.foto || '' } : { nama: (x || ''), foto: '' };
const avatar = (nama, foto, s = 'h-9 w-9', f = 'bg-slate-100 text-slate-500', t = 'text-xs') => ada(foto) ? `
  <span class="relative block ${s} flex-none"><img src="${foto}" class="absolute inset-0 h-full w-full rounded-full object-cover" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
  <span class="hidden h-full w-full place-items-center rounded-full ${f} font-extrabold ${t}">${inisial(nama)}</span></span>`
  : `<span class="grid ${s} flex-none place-items-center rounded-full ${f} font-extrabold ${t}">${inisial(nama)}</span>`;

const d = await muat();
terapkanTema(d.tema);
$('#logoHal').innerHTML = renderLogo(d.identitas.logo, 'h-12 w-12');
const m = (d.mitra || [])[+document.body.dataset.mitra || 0] || {};
$('#judulHal').textContent = m.nama || 'Mitra';
const linkKontak = (k) => k ? (/^08/.test(k) ? `https://wa.me/62${k.replace(/^0/, '')}` : `tel:${k}`) : '';

$('#rootHal').innerHTML = `
  ${m.foto ? `<img src="${m.foto}" alt="${m.nama}" class="mb-8 w-full rounded-2xl object-cover" style="max-height:340px" onerror="this.remove()">` : ''}
  <p class="max-w-3xl text-base md:text-lg" style="opacity:.8">${m.deskripsi || ''}</p>
  <div class="mt-10 grid gap-10 md:grid-cols-2">
    <div>
      <h2 class="mb-4 text-2xl font-extrabold" style="color:var(--heading)">Program Kerja</h2>
      <div class="flex flex-wrap gap-2">
        ${(m.program || []).length ? m.program.map((p) => `<span class="rounded-full px-4 py-2 text-sm font-semibold"
          style="background:color-mix(in srgb, var(--accent) 14%, transparent); color:var(--accent-text)">${p}</span>`).join('')
          : '<span class="nilai-kosong">Belum diisi</span>'}
      </div>
      ${m.kontak ? `<a href="${linkKontak(m.kontak)}" class="mt-6 inline-block rounded-full px-6 py-3 text-sm font-bold"
         style="background:var(--accent); color:var(--on-accent)">Hubungi ${m.nama}</a>` : ''}
    </div>
    <div>
      <h2 class="mb-4 text-2xl font-extrabold" style="color:var(--heading)">Susunan Pengurus</h2>
      ${(m.struktur || []).map((p) => { const o = orang(p); return `
        <div class="flex items-center justify-between border-b py-3 text-base last:border-0" style="border-color:var(--line-soft)">
          <span style="opacity:.7">${p.jabatan}</span>
          <b class="flex items-center gap-2.5 ${ada(o.nama) ? '' : 'nilai-kosong'}">${namaAtau(o.nama)} ${avatar(o.nama, o.foto)}</b>
        </div>`; }).join('')}
    </div>
  </div>`;