/* =========================================================
   app.js — entry point: muat data lalu render seluruh halaman
   ========================================================= */

async function muatData() {
  const r = await fetch('data/data.json');          // index di root → path ini benar
  if (!r.ok) throw new Error('data.json tidak ditemukan (' + r.status + ')');
  return r.json();
}

(async function main() {
  try {
    const DATA = await muatData();
    window.DATA = DATA;                              // cek via Console browser
    document.title = DATA.identitas.namaRW + ' — Website Resmi';

    renderHeader(DATA);
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
          <b class="mt-3 block text-slate-900">Gagal memuat data/data.json</b>
          <p class="mt-2 text-sm text-slate-500">
            Project ini memuat JSON via <code>fetch</code> — jalankan lewat server lokal:
            <code class="rounded bg-slate-100 px-1">python -m http.server</code>,
            <code class="rounded bg-slate-100 px-1">npx serve</code>, atau <b>Live Server</b> (VS Code).
          </p>
        </div>
      </section>`;
  }
})();
