/* =========================================================
   peta-cuaca.js — peta interaktif (Leaflet) + cuaca (Open-Meteo)
   ========================================================= */

function renderPetaCuaca(d) {
  $('#peta-cuaca').innerHTML = `
    <section class="mx-auto max-w-6xl px-4 py-16">
      ${judulSeksi('🗺️', 'Peta Wilayah & Cuaca', 'Peta interaktif RW 013 dan cuaca real-time sekitar wilayah')}
      <div class="grid gap-6 lg:grid-cols-3">
        <div id="peta" class="h-[380px] rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 md:h-[460px]"></div>
        <div id="cuacaCard" class="kartu p-6">
          <p class="animate-pulse text-sm text-slate-500">Memuat cuaca…</p>
        </div>
      </div>
    </section>`;
  initPeta(d);
  renderCuaca(d);
}

/* Peta: polygon batas RW + marker fasilitas */
function initPeta(d) {
  const peta = L.map('peta', { scrollWheelZoom: false });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(peta);

  const batas = L.polygon(d.batasRW,
    { color: '#059669', weight: 2.5, fillColor: '#10b981', fillOpacity: .12 })
    .addTo(peta)
    .bindPopup('<b>Batas Wilayah ' + d.identitas.namaRW + '</b><br>± ' + fmtNum(d.wilayah.luasM2) + ' m²');

  d.fasilitas.forEach((f) => {
    L.marker(f.koordinat, {
      icon: L.divIcon({ className: '', html: '<div class="pin-f">' + f.ikon + '</div>',
        iconSize: [34, 34], iconAnchor: [17, 32], popupAnchor: [0, -28] })
    }).addTo(peta).bindPopup('<b>' + f.nama + '</b><br>' + f.jenis);
  });

  peta.fitBounds(batas.getBounds(), { padding: [40, 40], maxZoom: 18 });
}

/* Cuaca real-time dari Open-Meteo (gratis, tanpa API key) */
async function renderCuaca(d) {
  const [lat, lon] = d.identitas.koordinat;
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`);
    const c = (await r.json()).current;
    const [ikon, teks] = labelCuaca(c.weather_code);
    $('#cuacaCard').innerHTML = `
      <h3 class="text-sm font-bold uppercase tracking-wider text-slate-500">Cuaca ${d.identitas.kota}</h3>
      <div class="mt-4 flex items-center gap-4">
        <span class="text-5xl">${ikon}</span>
        <div>
          <b class="text-4xl text-slate-900">${Math.round(c.temperature_2m)}°C</b>
          <p class="text-sm font-medium text-slate-600">${teks}</p>
        </div>
      </div>
      <div class="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
        <div class="rounded-xl bg-slate-100 p-3">🌡️<br><b class="text-sm">${Math.round(c.apparent_temperature)}°C</b><br>Terasa</div>
        <div class="rounded-xl bg-slate-100 p-3">💧<br><b class="text-sm">${c.relative_humidity_2m}%</b><br>Kelembapan</div>
        <div class="rounded-xl bg-slate-100 p-3">🌬️<br><b class="text-sm">${Math.round(c.wind_speed_10m)}</b><br>km/jam</div>
      </div>
      <p class="mt-4 text-[11px] text-slate-400">Sumber: Open-Meteo • diperbarui otomatis</p>`;
  } catch (e) {
    $('#cuacaCard').innerHTML = '<p class="text-sm text-slate-500">⚠️ Cuaca tidak dapat dimuat. Periksa koneksi internet.</p>';
  }
}
