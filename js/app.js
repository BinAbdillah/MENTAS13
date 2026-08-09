/* =========================================================
   app.js — entry point + banner temporer (HUT RI)
   Banner ditaruh di sini karena bersifat sementara,
   sehingga render.js tidak perlu diubah-ubah.
   ========================================================= */

async function muatData() {
  const r = await fetch('data/data.json');
  if (!r.ok) throw new Error('data.json tidak ditemukan (' + r.status + ')');
  return r.json();
}

/* ---------- Banner temporer (otomatis sembunyi di luar periode) ---------- */
function renderBanner(d) {
  const b = d.banner;
  if (!b || !b.aktif) return;

  // Cek rentang tanggal → lewat tanggal selesai, banner hilang sendiri
  const now     = new Date();
  const mulai   = new Date(b.mulai   + 'T00:00:00');
  const selesai = new Date(b.selesai + 'T23:59:59');
  if (now < mulai || now > selesai) return;

  // Sisipkan tepat DI ATAS hero
  $('#hero').insertAdjacentHTML('beforebegin', `
    <a href="${b.link || '#'}" class="block bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white hover:via-red-500">
      <div class="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <img src="${b.gambar}" alt="Logo HUT RI"
             class="h-12 w-12 flex-none rounded-full bg-white object-contain p-1"
             onerror="this.style.display='none'">
        <div class="min-w-0">
          <b class="block truncate text-base md:text-lg">${b.teks}</b>
          <span class="block truncate text-xs text-red-100 md:text-sm">${b.sub}</span>
        </div>
        <span class="ml-auto hidden flex-none rounded-full bg-white/15 px-4 py-2 text-sm font-bold md:block">Lihat Agenda ➜</span>
      </div>
    </a>`);
}

/* ---------- Inisialisasi ---------- */
(async function main() {
  try {
    const DATA = await muatData();
    window.DATA = DATA;                              // cek via Console browser
    document.title = DATA.identitas.namaRW + ' — Website Resmi';

    renderBanner(DATA);      // 1) banner HUT RI (di atas hero)
    renderHeader(DATA);      // 2) header + logo dari assets
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
            Catatan: Firefox umumnya tetap bisa memuat dari file://.
          </p>
        </div>
      </section>`;
  }
})();