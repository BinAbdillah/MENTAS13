/* =========================================================
   utils.js — pembantu umum + judul section editorial
   ========================================================= */

const $ = (s) => document.querySelector(s);
const fmtNum = (n) => Number(n).toLocaleString('id-ID');
const ada = (v) => v !== null && v !== undefined && String(v).trim() !== '';
const namaAtau = (v) => ada(v) ? v : '—';

const inisial = (nama) => {
  if (!ada(nama)) return '•';
  return nama
    .replace(/^(H\.|Hj\.|Bpk\.|Ibu|Ust\.|Drs\.|Ir\.)\s*/g, '')
    .split(' ').map((k) => k[0]).slice(0, 2).join('').toUpperCase();
};

const bannerAktif = (b) => {
  if (!b || !b.aktif) return false;
  const now = new Date();
  return now >= new Date(b.mulai + 'T00:00:00') && now <= new Date(b.selesai + 'T23:59:59');
};

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

const labelCuaca = (c) => {
  if (c === 0) return ['☀️', 'Cerah'];
  if (c <= 2)  return ['🌤️', 'Cerah Berawan'];
  if (c === 3) return ['☁️', 'Mendung'];
  if (c === 45 || c === 48) return ['🌫️', 'Berkabut'];
  if (c <= 57) return ['🌦️', 'Gerimis'];
  if (c <= 82) return ['🌧️', 'Hujan'];
  return ['⛈️', 'Hujan Petir'];
};

const WARNA_KATEGORI = {
  'Kegiatan':    'bg-emerald-100 text-emerald-700',
  'Rapat':       'bg-blue-100 text-blue-700',
  'Kesehatan':   'bg-purple-100 text-purple-700',
  'Kerja Bakti': 'bg-amber-100 text-amber-700'
};

/* Judul section gaya editorial: nomor + garis + judul raksasa */
const judulSeksi = (nomor, judul, sub) => `
  <div class="reveal mb-10 md:mb-14">
    <div class="flex items-center gap-4 text-emerald-700">
      <span class="font-mono text-sm font-bold tracking-[0.3em]">${nomor}</span>
      <span class="h-px flex-1 bg-emerald-700/30"></span>
      <span class="text-xs uppercase tracking-[0.3em]">RW 013</span>
    </div>
    <h2 class="mt-4 text-4xl font-extrabold uppercase tracking-tight text-slate-900 md:text-5xl">${judul}</h2>
    <p class="mt-3 max-w-2xl text-base text-slate-500 md:text-lg">${sub}</p>
  </div>`;