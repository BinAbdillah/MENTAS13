/* =========================================================
   peta-cuaca.js — peta + cuaca (judul section gaya baru)
   ========================================================= */

   function renderPetaCuaca(d) {
    const pakaiGoogle = d.peta && d.peta.mode === 'google' && d.peta.googleEmbed;
  
    $('#peta-cuaca').innerHTML = `
      <section class="mx-auto max-w-6xl px-4 py-16 md:py-24">
        ${judulSeksi('08', 'Peta & Cuaca', 'Peta interaktif RW 013 dan cuaca real-time sekitar wilayah')}
        <div class="reveal grid gap-6 lg:grid-cols-3">
          ${pakaiGoogle ? `
          <div class="overflow-hidden rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
            <iframe src="${d.peta.googleEmbed}" title="Peta Wilayah RW 013 Menteng Atas"
                    class="h-[420px] w-full md:h-[520px]" loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
          </div>` : `
          <div id="peta" class="h-[420px] rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 md:h-[520px]"></div>`}
          <div id="cuacaCard" class="kartu p-6 md:p-7">
            <p class="animate-pulse text-base text-slate-500">Memuat cuaca…</p>
          </div>
        </div>
        ${pakaiGoogle ? `
        <p class="mt-4 text-sm text-slate-500">🗺️ Peta & titik fasilitas dikelola melalui <b>Google My Maps pengurus</b>.</p>` : ''}
      </section>`;
  
    if (!pakaiGoogle) initPeta(d);
    renderCuaca(d);
  }
  
  function initPeta(d) {
    if (window._peta) { window._peta.remove(); window._peta = null; }
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
          iconSize: [38, 38], iconAnchor: [19, 36], popupAnchor: [0, -30] })
      }).addTo(peta).bindPopup('<b>' + f.nama + '</b><br>' + f.jenis);
    });
  
    peta.fitBounds(batas.getBounds(), { padding: [40, 40], maxZoom: 18 });
    window._peta = peta;
  }
  
  async function renderCuaca(d) {
    const [lat, lon] = d.identitas.koordinat;
    const key = lat + ',' + lon;
    if (window._cuacaCache && window._cuacaKey === key) {
      $('#cuacaCard').innerHTML = window._cuacaCache;
      return;
    }
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`);
      const c = (await r.json()).current;
      const [ikon, teks] = labelCuaca(c.weather_code);
      window._cuacaKey = key;
      window._cuacaCache = `
        <h3 class="text-base font-bold uppercase tracking-widest text-slate-500">Cuaca ${d.identitas.kota}</h3>
        <div class="mt-5 flex items-center gap-5">
          <span class="text-6xl">${ikon}</span>
          <div>
            <b class="text-5xl text-slate-900">${Math.round(c.temperature_2m)}°C</b>
            <p class="text-base font-medium text-slate-600">${teks}</p>
          </div>
        </div>
        <div class="mt-6 grid grid-cols-3 gap-2 text-center text-sm">
          <div class="rounded-xl bg-slate-100 p-4">🌡️<br><b class="text-base">${Math.round(c.apparent_temperature)}°C</b><br>Terasa</div>
          <div class="rounded-xl bg-slate-100 p-4">💧<br><b class="text-base">${c.relative_humidity_2m}%</b><br>Kelembapan</div>
          <div class="rounded-xl bg-slate-100 p-4">🌬️<br><b class="text-base">${Math.round(c.wind_speed_10m)}</b><br>km/jam</div>
        </div>
        <p class="mt-5 text-xs text-slate-400">Sumber: Open-Meteo • diperbarui otomatis</p>`;
      $('#cuacaCard').innerHTML = window._cuacaCache;
    } catch (e) {
      $('#cuacaCard').innerHTML = '<p class="text-base text-slate-500">⚠️ Cuaca tidak dapat dimuat. Periksa koneksi internet.</p>';
    }
  }