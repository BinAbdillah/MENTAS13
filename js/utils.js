/* =========================================================
   utils.js — fungsi pembantu umum
   ========================================================= */

// Pemilih elemen singkat
const $ = (s) => document.querySelector(s);

// Format angka ribuan gaya Indonesia: 1782 → "1.782"
const fmtNum = (n) => Number(n).toLocaleString('id-ID');

// Cek apakah nilai terisi
const ada = (v) => v !== null && v !== undefined && String(v).trim() !== '';

// Nama atau tanda strip bila belum diisi
const namaAtau = (v) => ada(v) ? v : '—';

// Inisial untuk avatar: "Abdillah A. Rahman" → "AR"
const inisial = (nama) => {
  if (!ada(nama)) return '•';
  return nama
    .replace(/^(H\.|Hj\.|Bpk\.|Ibu|Ust\.|Drs\.|Ir\.)\s*/g, '')
    .split(' ').map((k) => k[0]).slice(0, 2).join('').toUpperCase();
};

/* Cek apakah banner temporer sedang aktif (dalam rentang tanggal).
   Dipakai oleh app.js (banner) dan render.js (opsi latar hero). */
const bannerAktif = (b) => {
  if (!b || !b.aktif) return false;
  const now = new Date();
  return now >= new Date(b.mulai + 'T00:00:00')
      && now <= new Date(b.selesai + 'T23:59:59');
};

/* Render logo DIPERBESAR (±56px mobile / 64px desktop).
   - Path gambar → <img> object-contain TANPA kotak hijau (warna asli logo terlihat).
   - Emoji → span berkotak hijau.
   - Fallback otomatis ke emoji bila gambar 404. */
const renderLogo = (logo, cls = 'h-14 w-14 md:h-16 md:w-16') => {
  if (/\.(png|jpe?g|svg|webp)$/i.test(String(logo))) {
    return `
      <span class="relative inline-block ${cls}">
        <img src="${logo}" alt="Logo RW"
             class="absolute inset-0 h-full w-full rounded-xl object-contain"
             onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
        <span class="hidden h-full w-full place-items-center rounded-xl bg-emerald-600 text-2xl shadow md:text-3xl">🏛️</span>
      </span>`;
  }
  return `<span class="grid ${cls} place-items-center rounded-xl bg-emerald-600 text-2xl shadow md:text-3xl">${logo}</span>`;
};

// Kode cuaca WMO → ikon & label bahasa Indonesia
const labelCuaca = (c) => {
  if (c === 0) return ['☀️', 'Cerah'];
  if (c <= 2)  return ['🌤️', 'Cerah Berawan'];
  if (c === 3) return ['☁️', 'Mendung'];
  if (c === 45 || c === 48) return ['🌫️', 'Berkabut'];
  if (c <= 57) return ['🌦️', 'Gerimis'];
  if (c <= 82) return ['🌧️', 'Hujan'];
  return ['⛈️', 'Hujan Petir'];
};

// Warna badge kategori agenda
const WARNA_KATEGORI = {
  'Kegiatan':    'bg-emerald-100 text-emerald-700',
  'Rapat':       'bg-blue-100 text-blue-700',
  'Kesehatan':   'bg-purple-100 text-purple-700',
  'Kerja Bakti': 'bg-amber-100 text-amber-700'
};

// Komponen judul section — ukuran besar
const judulSeksi = (ikon, judul, sub) => `
  <div class="mb-10 text-center md:mb-12">
    <span class="text-4xl">${ikon}</span>
    <h2 class="mt-3 text-3xl font-extrabold text-slate-900 md:text-4xl">${judul}</h2>
    <p class="mt-3 text-base text-slate-500 md:text-lg">${sub}</p>
  </div>`;