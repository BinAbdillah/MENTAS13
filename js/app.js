/* =========================================================
   app.js — entry point + spanduk HUT RI temporer
   ========================================================= */

async function muatData() {
  const r = await fetch('data/data.json');
  if (!r.ok) throw new Error('data.json tidak ditemukan (' + r.status + ')');
  return r.json();
}

/* ---------- Spanduk HUT RI (gambar utuh, tanpa teks tambahan)
   • Mobile : strip penuh (h-32) — sudah pas, tidak diubah.
   • PC     : spanduk berbingkai (lebar dibatasi max-w-4xl, tinggi
              mengikuti rasio asli md:h-auto) → TIDAK terpotong.
   • Otomatis sembunyi di luar periode; klik → #agenda.

   ALTERNATIF full-bleed utuh tanpa bingkai:
   ganti class <img> menjadi:
   class="h-32 w-full object-cover object-center sm:h-40 md:h-auto"
   (konsekuensi: banner sangat tinggi, ±570px di layar 1365px,
    karena rasio asli gambar dipertahankan) ---------------- */
function renderBanner(d) {
  const b = d.banner;
  if (!bannerAktif(b)) return;

  $('#header').insertAdjacentHTML('beforebegin', `
    <a href="${b.link || '#agenda'}" class="block w-full md:mx-auto md:max-w-4xl md:px-4 md:pt-4 md:pb-1"
       aria-label="${b.teks || 'Banner HUT RI'}">
      <img src="${b.gambar}" alt="${b.teks || 'Banner HUT RI'}"
           class="h-32 w-full object-cover object-center sm:h-40 md:h-auto md:rounded-2xl md:shadow-lg"
           onerror="this.parentElement.remove()">
    </a>`);
}

/* ---------- Inisialisasi ---------- */
(async function main() {
  try {
    const DATA = await muatData();
    window.DATA = DATA;                              // cek via Console browser
    document.title = DATA.identitas.namaRW + ' — Website Resmi';

    renderBanner(DATA);      // 1) spanduk HUT RI (paling atas)
    renderHeader(DATA);      // 2) header + logo besar dari assets
    renderHero(DATA);
    renderProfil(DATA);
    renderStruktur(DATA);
    renderAgenda(DATA);
    renderFasilitas(DATA);
    renderPetaCuaca(DATA);
    renderFooter(DATA);
    jalankanCounter();
  } catch (err) {
    console.error(err);
    $('#hero').innerHTML = `
      <section class="mx-auto max-w-lg px-4 py-24">
        <div class="kartu p-8 text-center">
          <div class="text-4xl">⚠️</div>
          <b class="mt-3 block text-lg text-slate-900">Gagal memuat data/data.json</b>
          <p class="mt-2 text-base text-slate-500">
            Bila muncul ini, pastikan membuka lewat server lokal
            (<b>Live Server</b> / <code class="rounded bg-slate-100 px-1">python -m http.server</code>).
          </p>
        </div>
      </section>`;
  }
})();
