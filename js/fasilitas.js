/* fasilitas.js — daftar fasilitas + mini-map + tautan peta */
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
$('#judulHal').textContent = 'Fasilitas Warga';

$('#rootHal').innerHTML = `
  <div id="petaFas" class="mb-10 h-[380px] rounded-2xl border" style="border-color:var(--line)"></div>
  <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    ${(d.fasilitas || []).map((f, i) => `
    <div class="kartu kartu-hover p-6">
      <b class="block text-lg" style="color:var(--heading)">${f.nama}</b>
      <span class="mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
            style="background:color-mix(in srgb, var(--accent) 14%, transparent); color:var(--accent-text)">${f.jenis}</span>
      <p class="mt-2 text-sm" style="opacity:.7">${f.alamat}</p>
      <div class="mt-4 flex gap-2">
        <button data-i="${i}" class="btn-peta rounded-full border px-4 py-2 text-xs font-bold"
                style="border-color:var(--accent); color:var(--accent-text)">Lihat di peta</button>
        <a class="rounded-full border px-4 py-2 text-xs font-bold" style="border-color:var(--line); color:var(--teks)"
           target="_blank" href="https://www.google.com/maps?q=${f.koordinat[0]},${f.koordinat[1]}">Maps ↗</a>
      </div>
    </div>`).join('')}
  </div>`;

const peta = L.map('petaFas', { scrollWheelZoom: false });
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(peta);
const markers = (d.fasilitas || []).map((f) =>
  L.marker(f.koordinat).addTo(peta).bindPopup(`<b>${f.nama}</b><br>${f.jenis}`));
if (d.batasRW && d.batasRW.length) L.polygon(d.batasRW, { color: '#059669', weight: 2, fillOpacity: .08 }).addTo(peta);
if (markers.length) peta.fitBounds(L.latLngBounds((d.fasilitas || []).map((f) => f.koordinat)), { padding: [40, 40] });

document.querySelectorAll('.btn-peta').forEach((b) => b.addEventListener('click', () => {
  const f = d.fasilitas[+b.dataset.i];
  peta.flyTo(f.koordinat, 18);
  markers[+b.dataset.i].openPopup();
  $('#petaFas').scrollIntoView({ behavior: 'smooth', block: 'center' });
}));