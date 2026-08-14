/* =========================================================
   cuaca-widget.js — widget header: transparan + tepi emas,
   klik untuk panel detail (Open-Meteo)
   ========================================================= */
   (function () {
    let coba = 0;
    function cari() {
      const host = document.getElementById('cuaca-widget');
      if (host) isi(host);
      else if (++coba < 20) setTimeout(cari, 300);
    }
  
    async function isi(host) {
      try {
        const lat = -6.2138, lon = 106.8478;
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
          `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=1`);
        const j = await r.json();
        const c = j.current, dl = j.daily || {};
        const [ikon, teks] = labelCuaca(c.weather_code);
  
        host.innerHTML = `
          <div class="cuaca-widget" id="cwBtn" title="Detail cuaca Jakarta Selatan">
            <span>${ikon}</span><b>${Math.round(c.temperature_2m)}°C</b>
          </div>
          <div class="cuaca-panel" id="cwPanel">
            <b class="block text-sm" style="color:var(--heading)">${ikon} ${teks} — Jakarta Selatan</b>
            <div class="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs" style="color:var(--teks)">
              <span>Terasa</span><b>${Math.round(c.apparent_temperature)}°C</b>
              <span>Maks / Min</span><b>${dl.temperature_2m_max ? Math.round(dl.temperature_2m_max[0]) : '—'}° / ${dl.temperature_2m_min ? Math.round(dl.temperature_2m_min[0]) : '—'}°</b>
              <span>Kelembapan</span><b>${c.relative_humidity_2m}%</b>
              <span>Angin</span><b>${Math.round(c.wind_speed_10m)} km/j</b>
              <span>Peluang hujan</span><b>${dl.precipitation_probability_max ? dl.precipitation_probability_max[0] + '%' : '—'}</b>
            </div>
            <p class="mt-2 text-[10px]" style="opacity:.6">Sumber: Open-Meteo</p>
          </div>`;
  
        const btn = $('#cwBtn'), panel = $('#cwPanel');
        btn.addEventListener('click', (e) => { e.stopPropagation(); panel.classList.toggle('buka'); });
        document.addEventListener('click', (e) => { if (!host.contains(e.target)) panel.classList.remove('buka'); });
      } catch (e) { host.innerHTML = ''; }
    }
    cari();
  })();