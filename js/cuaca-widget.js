/* cuaca-widget.js — widget kecil kanan header (Open-Meteo) */
(function () {
    let coba = 0;
    function cari() {
      const host = document.getElementById('cuaca-widget');
      if (host) { isi(host); return; }
      if (++coba < 20) setTimeout(cari, 300);
    }
    async function isi(host) {
      try {
        const lat = -6.2138, lon = 106.8478;
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`);
        const c = (await r.json()).current;
        const [ikon, teks] = labelCuaca(c.weather_code);
        host.innerHTML = `<div class="cuaca-widget" title="${teks} — Jakarta Selatan">${ikon}<b>${Math.round(c.temperature_2m)}°C</b></div>`;
      } catch (e) { host.innerHTML = ''; }
    }
    cari();
  })();