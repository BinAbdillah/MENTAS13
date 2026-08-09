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

/* Render logo: bila nilai berupa path gambar → <img>,
   bila emoji → span biasa. Ada fallback emoji bila gambar 404. */
const renderLogo = (logo, cls = 'h-12 w-12') => {
  if (/\.(png|jpe?g|svg|webp)$/i.test(String(logo))) {
    return `
      <span class="relative inline-block ${cls}">
        <img src="${logo}" alt="Logo RW"
             class="absolute inset-0 h-full w-full rounded-xl object-cover shadow"
             onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
        <span class="hidden h-full w-full place-items-center rounded-xl bg-emerald-600 text-2xl shadow">🏛️</span>
      </span>`;
  }
  return `<span class="grid ${cls} place-items-center rounded-xl bg-emerald-600 text-2xl shadow">${logo}</span>`;
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

// Komponen judul section agar konsisten
const judulSeksi = (ikon, judul, sub) => `
  <div class="mb-10 text-center">
    <span class="text-4xl">${ikon}</span>
    <h2 class="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">${judul}</h2>
    <p class="mt-2 text-base text-slate-500 md:text-lg">${sub}</p>
  </div>`;
