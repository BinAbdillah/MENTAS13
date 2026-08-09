/* =========================================================
   app.js (module) — Firebase + fallback lokal + live update
   + normalisasi(): data bolong tetap aman dirender
   ========================================================= */

const FB = window.FIREBASE_CONFIG || null;
const firebaseSiap = !!(FB && FB.apiKey && FB.databaseURL);

let db = null, _fb = null;
if (firebaseSiap) {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    _fb = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
    db = _fb.getDatabase(initializeApp(FB));
  } catch (e) { console.warn('Firebase gagal dimuat → pakai data lokal.', e); db = null; }
}

/* ---------- Normalisasi: isi default bila field hilang ---------- */
function normalisasi(d) {
  d = d || {};
  d.identitas = d.identitas || {};
  d.identitas.sosmed = d.identitas.sosmed || {};
  d.hero = d.hero || { foto: '', judul: '', sambutan: '', periode: '' };
  d.wilayah = d.wilayah || {};
  d.wilayah.luasM2 = d.wilayah.luasM2 || 0;
  d.wilayah.penduduk = d.wilayah.penduduk || 0;
  d.wilayah.jumlahRT = d.wilayah.jumlahRT || 0;
  d.wilayah.perbatasan = d.wilayah.perbatasan || [];
  d.penasehat = d.penasehat || [];
  d.strukturRW = d.strukturRW || {};
  d.strukturRW.inti = d.strukturRW.inti || [];
  d.strukturRW.seksi = d.strukturRW.seksi || [];
  d.strukturRW.seksi.forEach((s) => { s.anggota = s.anggota || []; });
  d.rt = d.rt || [];
  d.rt.forEach((r) => { r.pengurus = r.pengurus || {}; });
  d.mitra = d.mitra || [];
  d.mitra.forEach((m) => { m.struktur = m.struktur || []; });
  d.agenda = d.agenda || [];
  d.fasilitas = d.fasilitas || [];
  d.peta = d.peta || {};
  d.banner = d.banner || {};
  d.batasRW = d.batasRW || [];
  return d;
}

/* ---------- Muat data: Firebase dulu, lalu lokal ---------- */
async function muatData() {
  if (db) {
    try {
      const snap = await _fb.get(_fb.ref(db, 'data'));
      if (snap.val()) return snap.val();
    } catch (e) { console.warn('Baca Firebase gagal → fallback lokal.', e); }
  }
  const r = await fetch('data/data.json');
  if (!r.ok) throw new Error('data.json tidak ditemukan (' + r.status + ')');
  return r.json();
}

/* ---------- Render seluruh halaman ---------- */
function renderSemua(input) {
  const DATA = normalisasi(input);
  window.DATA = DATA;
  document.title = DATA.identitas.namaRW + ' — Website Resmi';
  renderBanner(DATA);
  renderHeader(DATA);
  renderHero(DATA);
  renderProfil(DATA);
  renderStruktur(DATA);
  renderAgenda(DATA);
  renderFasilitas(DATA);
  renderPetaCuaca(DATA);
  renderFooter(DATA);
  jalankanCounter();
}

/* ---------- Spanduk HUT RI (slot sendiri, aman duplikat) ---------- */
function renderBanner(d) {
  const slot = $('#banner-slot');
  if (!slot) return;
  const b = d.banner;
  if (!bannerAktif(b)) { slot.innerHTML = ''; return; }
  slot.innerHTML = `
    <a href="${b.link || '#agenda'}" class="block w-full md:mx-auto md:max-w-4xl md:px-4 md:pt-4 md:pb-1"
       aria-label="${b.teks || 'Banner HUT RI'}">
      <img src="${b.gambar}" alt="${b.teks || 'Banner HUT RI'}"
           class="h-32 w-full object-cover object-center sm:h-40 md:h-auto md:rounded-2xl md:shadow-lg"
           onerror="this.parentElement.remove()">
    </a>`;
}

/* ---------- Inisialisasi ---------- */
(async function main() {
  try {
    const DATA = await muatData();
    window._lastJson = JSON.stringify(DATA);
    renderSemua(DATA);

    // Live update dari Firebase
    if (db) {
      _fb.onValue(_fb.ref(db, 'data'), (snap) => {
        const v = snap.val();
        if (!v) return;
        const s = JSON.stringify(v);
        if (s === window._lastJson) return;
        window._lastJson = s;
        renderSemua(v);
      });
    }
  } catch (err) {
    console.error(err);
    $('#hero').innerHTML = `
      <section class="mx-auto max-w-lg px-4 py-24">
        <div class="kartu p-8 text-center">
          <div class="text-4xl">⚠️</div>
          <b class="mt-3 block text-lg text-slate-900">Gagal memuat data</b>
          <p class="mt-2 text-base text-slate-500">
            Periksa koneksi, isi <code class="rounded bg-slate-100 px-1">js/firebase-config.js</code>,
            atau pastikan <code class="rounded bg-slate-100 px-1">data/data.json</code> ada.
          </p>
        </div>
      </section>`;
  }
})();
