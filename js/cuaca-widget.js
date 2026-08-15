/* =========================================================
   cuaca-widget.js — REFACTOR v1
   widget header transparan + tepi emas (Open-Meteo)
   koordinat/kota dari window.DATA • aksesibel (button, Esc)
   ========================================================= */
   (function () {
    const DEFAULT_KOORDINAT = [-6.2138, 106.8478];
    let coba = 0;
  
    function cari() {
      const host = document.getElementById('cuaca-widget');
      if (host) isi(host);
      else if (++coba < 20) setTimeout(cari, 300);
    }
  
    async function isi(host) {
      try {
        const i = (window.DATA && window.DATA.identitas) || {};
        const koord = Array.isArray(i.koordinat) && i.koordinat.length === 2 ? i.koordinat : DEFAULT_KOORDINAT;
        const [lat, lon] = koord;
        const kota = i.kota || 'Jakarta Selatan';
  
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
          `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=1`);
        const j = await r.json();
        const c = j.current, dl = j.daily || {};
        const [ikon, teks] = (typeof labelCuaca === 'function') ? labelCuaca(c.weather_code) : ['🌡️', '—'];
  
        host.innerHTML = `
          <button class="cuaca-widget" id="cwBtn" aria-expanded="false" title="Detail cuaca ${kota}">
            <span aria-hidden="true">${ikon}</span><b>${Math.round(c.temperature_2m)}°C</b>
          </button>
          <div class="cuaca-panel" id="cwPanel" role="dialog" aria-label="Detail cuaca ${kota}">
            <b class="block text-sm" style="color:var(--heading)">${ikon} ${teks} — ${kota}</b>
            <div class="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs" style="color:var(--teks)">
              <span>Terasa</span><b>${Math.round(c.apparent_temperature)}°C</b>
              <span>Maks / Min</span><b>${dl.temperature_2m_max ? Math.round(dl.temperature_2m_max[0]) : '—'}° / ${dl.temperature_2m_min ? Math.round(dl.temperature_2m_min[0]) : '—'}°</b>
              <span>Kelembapan</span><b>${c.relative_humidity_2m}%</b>
              <span>Angin</span><b>${Math.round(c.wind_speed_10m)} km/j</b>
              <span>Peluang hujan</span><b>${dl.precipitation_probability_max != null ? dl.precipitation_probability_max[0] + '%' : '—'}</b>
            </div>
            <p class="mt-2 text-[10px]" style="opacity:.6">Sumber: Open-Meteo</p>
          </div>`;
  
        const btn = $('#cwBtn'), panel = $('#cwPanel');
        const setBuka = (v) => { panel.classList.toggle('buka', v); btn.setAttribute('aria-expanded', String(v)); };
  
        btn.addEventListener('click', (e) => { e.stopPropagation(); setBuka(!panel.classList.contains('buka')); });
        document.addEventListener('click', (e) => { if (!host.contains(e.target)) setBuka(false); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setBuka(false); });
      } catch (e) { host.innerHTML = ''; }
    }
  
    cari();
  })();