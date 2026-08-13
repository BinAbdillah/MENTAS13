/* rt.js — pengurus + statistik seluruh RT */
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
const URUTAN_RT = ['Ketua', 'Sekretaris', 'Bendahara', 'Bank Sampah'];
const orang = (x) => (x && typeof x === 'object') ? { nama: x.nama || '', foto: x.foto || '' } : { nama: (x || ''), foto: '' };
const avatar = (nama, foto, s = 'h-8 w-8', f = 'bg-slate-100 text-slate-500', t = 'text-xs') => ada(foto) ? `
  <span class="relative block ${s} flex-none"><img src="${foto}" class="absolute inset-0 h-full w-full rounded-full object-cover" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
  <span class="hidden h-full w-full place-items-center rounded-full ${f} font-extrabold ${t}">${inisial(nama)}</span></span>`
  : `<span class="grid ${s} flex-none place-items-center rounded-full ${f} font-extrabold ${t}">${inisial(nama)}</span>`;

const d = await muat();
terapkanTema(d.tema);
$('#logoHal').innerHTML = renderLogo(d.identitas.logo, 'h-12 w-12');
$('#judulHal').textContent = 'Pengurus RT 001–009';

$('#rootHal').innerHTML = `
  <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    ${(d.rt || []).map((r) => {
      const keys = Object.keys(r.pengurus || {});
      const urut = URUTAN_RT.filter((k) => keys.includes(k)).concat(keys.filter((k) => !URUTAN_RT.includes(k)));
      const s = r.statistik || {};
      return `
      <div class="kartu p-6">
        <div class="flex items-center justify-between">
          <span class="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white">RT ${r.no}</span>
          <span class="text-sm" style="opacity:.6">${s.jiwa ? s.jiwa + ' jiwa • ' + s.kk + ' KK' : ''}</span>
        </div>
        <div class="mt-4">
          ${urut.map((jab) => { const o = orang(r.pengurus[jab]); return `
          <div class="flex items-center justify-between gap-3 border-b py-2.5 text-base last:border-0" style="border-color:var(--line-soft)">
            <span style="opacity:.6">${jab}</span>
            <b class="flex items-center gap-2.5 ${ada(o.nama) ? '' : 'nilai-kosong'}">${namaAtau(o.nama)} ${avatar(o.nama, o.foto)}</b>
          </div>`; }).join('')}
        </div>
      </div>`;
    }).join('')}
  </div>`;