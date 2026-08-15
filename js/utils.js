/* =========================================================
   utils.js — REFACTOR v1 (fondasi bersama semua halaman)
   helper umum • tema • ronda • judul section • data bersih
   ========================================================= */

/* ---------- DOM & format ---------- */
const $ = (s) => document.querySelector(s);
const fmtNum = (n) => Number(n).toLocaleString('id-ID');

/* ---------- Predikat & teks ---------- */
const ada = (v) => v !== null && v !== undefined && String(v).trim() !== '';
const namaAtau = (v) => (ada(v) ? v : '—');

const inisial = (nama) => {
  if (!ada(nama)) return '•';
  return String(nama)
    .replace(/^(H\.|Hj\.|Bpk\.|Ibu|Ust\.|Drs\.|Ir\.)\s*/g, '')
    .split(' ')
    .map((k) => k[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

/* Normalisasi orang: terima string lama ATAU objek {nama, foto} */
const orang = (x) =>
  (x && typeof x === 'object')
    ? { nama: x.nama || '', foto: x.foto || '' }
    : { nama: (x || ''), foto: '' };

/* Avatar bulat + fallback inisial (dipakai semua halaman) */
const avatar = (nama, foto, sizeCls = 'h-14 w-14', fallCls = 'bg-slate-100 text-slate-500', txt = 'text-lg') =>
  ada(foto) ? `
    <span class="relative block ${sizeCls} flex-none">
      <img src="${foto}" alt="${nama}" class="absolute inset-0 h-full w-full rounded-full object-cover"
           onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
      <span class="hidden h-full w-full place-items-center rounded-full ${fallCls} font-extrabold ${txt}">${inisial(nama)}</span>
    </span>`
  : `<span class="grid ${sizeCls} flex-none place-items-center rounded-full ${fallCls} font-extrabold ${txt}">${inisial(nama)}</span>`;

/* Kontak: 08xx → WhatsApp, selain itu tel: */
const linkKontak = (k) => {
  if (!ada(k)) return '';
  return /^08/.test(k) ? `https://wa.me/62${k.replace(/^0/, '')}` : `tel:${k}`;
};

/* ---------- Banner ---------- */
const bannerAktif = (b) => {
  if (!b || !b.aktif) return false;
  const now = new Date();
  return now >= new Date((b.mulai || '2000-01-01') + 'T00:00:00') &&
         now <= new Date((b.selesai || '2099-12-31') + 'T23:59:59');
};

/* ---------- Logo + fallback ---------- */
const renderLogo = (logo, cls = 'h-14 w-14 md:h-16 md:w-16') => {
  if (/\.(png|jpe?g|svg|webp)([?#].*)?$/i.test(String(logo))) {
    return `
      <span class="relative inline-block ${cls}">
        <img src="${logo}" alt="Logo RW"
             class="absolute inset-0 h-full w-full rounded-xl object-contain"
             onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
        <span class="hidden h-full w-full place-items-center rounded-xl bg-emerald-600 text-2xl shadow md:text-3xl">🏛️</span>
      </span>`;
  }
  return `<span class="grid ${cls} place-items-center rounded-xl bg-emerald-600 text-2xl shadow md:text-3xl">${logo || '🏛️'}</span>`;
};

/* ---------- Cuaca ---------- */
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

/* ---------- TEMA ---------- */
const PRESET_TEMA = {
  garuda: { mode: 'dark',  bg: '#0C0D0F', surface: '#15171A', fill: '#23262B', line: '#2E3238', lineSoft: '#23262B',
            accent: '#DC2626', accentStrong: '#B91C1C', accentBright: '#EF4444', accentSoft: '#3B1214',
            accentText: '#F87171', accentTextSoft: '#FCA5A5', onAccent: '#FFFFFF',
            heading: '#F4F4F5', nav: '#CFD4DA', navHover: '#F87171', teks: '#E4E4E7' },
  sage:   { mode: 'light', bg: '#EAF0E6', surface: '#F8FBF5', fill: '#DCE8D6', line: '#C7D8C0', lineSoft: '#D6E3CF',
            accent: '#059669', accentStrong: '#047857', accentBright: '#10B981', accentSoft: '#D1FAE5',
            accentText: '#047857', accentTextSoft: '#059669', onAccent: '#FFFFFF',
            heading: '#16301F', nav: '#44584A', navHover: '#14532D', teks: '#1F2937' },
  biru:   { mode: 'light', bg: '#EFF4F8', surface: '#FBFDFF', fill: '#E2EBF3', line: '#CBDCEA', lineSoft: '#DCE8F2',
            accent: '#0369A1', accentStrong: '#075985', accentBright: '#0EA5E9', accentSoft: '#E0F2FE',
            accentText: '#0369A1', accentTextSoft: '#0284C7', onAccent: '#FFFFFF',
            heading: '#0C2A3D', nav: '#3D566B', navHover: '#075985', teks: '#1F2937' },
  krem:   { mode: 'light', bg: '#FAF6EE', surface: '#FFFCF7', fill: '#F1EADD', line: '#E4D9C3', lineSoft: '#EDE4D2',
            accent: '#B45309', accentStrong: '#92400E', accentBright: '#D97706', accentSoft: '#F7E7C8',
            accentText: '#92400E', accentTextSoft: '#B45309', onAccent: '#FFFFFF',
            heading: '#3B2F1E', nav: '#5B4A32', navHover: '#92400E', teks: '#1F2937' }
};

function terapkanTema(t) {
  let p = PRESET_TEMA.garuda;
  if (t) {
    if (t.preset === 'custom') p = Object.assign({}, PRESET_TEMA.garuda, t.custom || {});
    else if (PRESET_TEMA[t.preset]) p = PRESET_TEMA[t.preset];
  }
  const r = document.documentElement;
  r.dataset.mode = p.mode || 'dark';
  const map = {
    '--bg': p.bg, '--surface': p.surface, '--fill': p.fill, '--line': p.line, '--line-soft': p.lineSoft,
    '--accent': p.accent, '--accent-strong': p.accentStrong, '--accent-bright': p.accentBright,
    '--accent-soft': p.accentSoft, '--accent-text': p.accentText, '--accent-text-soft': p.accentTextSoft,
    '--on-accent': p.onAccent, '--heading': p.heading, '--nav': p.nav, '--nav-hover': p.navHover, '--teks': p.teks
  };
  Object.entries(map).forEach(([k, v]) => r.style.setProperty(k, v));
}

/* ---------- RONDA ---------- */
const isoLokal = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/* Tim ronda satu tanggal: cari di jadwal tersimpan,
   bila tak ada hitung rumus blok (polahari berselang). */
function hitungTimRonda(r, iso) {
  if (!r || !(r.tim || []).length) return null;
  if (Array.isArray(r.jadwal) && r.jadwal.length) {
    const hit = r.jadwal.find((j) => j.tanggal === iso);
    if (hit) return r.tim.find((t) => t.nama === hit.tim) || { nama: hit.tim, anggota: [] };
  }
  const mulai = new Date((r.mulai || '2026-07-30') + 'T00:00:00');
  const now = new Date(iso + 'T00:00:00');
  const d = Math.floor((now - mulai) / 86400000);
  const pol = Math.max(1, r.polahari || 3);
  const block = Math.floor(d / pol);
  const idx = ((block % r.tim.length) + r.tim.length) % r.tim.length;
  return r.tim[idx];
}

/* Generate jadwal N hari ke depan (disimpan via admin) */
function buatJadwalRonda(r, hari = 365) {
  const tim = r.tim || [];
  if (!tim.length) return [];
  const pol = Math.max(1, r.polahari || 3);
  const t0 = new Date((r.mulai || '2026-07-30') + 'T00:00:00');
  const out = [];
  for (let i = 0; i < hari; i++) {
    const t = new Date(t0.getTime() + i * 86400000);
    out.push({ tanggal: isoLokal(t), tim: tim[Math.floor(i / pol) % tim.length].nama });
  }
  return out;
}

/* ---------- DATA BERSIH: pangkas spasi key & value ---------- */
function rapikan(x) {
  if (Array.isArray(x)) return x.map(rapikan);
  if (x && typeof x === 'object') {
    const o = {};
    for (const [k, v] of Object.entries(x)) o[String(k).trim()] = rapikan(v);
    return o;
  }
  if (typeof x === 'string') return x.trim();
  return x;
}

/* ---------- Judul section editorial (sub opsional) ---------- */
const judulSeksi = (nomor, judul, sub = '') => `
  <div class="reveal mb-10 md:mb-14">
    <div class="flex items-center gap-4" style="color:var(--accent-text)">
      <span class="font-mono text-sm font-bold tracking-[0.3em]">${nomor}</span>
      <span class="h-px flex-1" style="background:color-mix(in srgb, var(--accent) 35%, transparent)"></span>
      <span class="text-xs uppercase tracking-[0.3em]">RW 013</span>
    </div>
    <h2 class="mt-4 text-4xl font-extrabold uppercase tracking-tight md:text-5xl" style="color:var(--heading)">
      <span class="mask"><span class="mask-line">${judul}</span></span>
    </h2>
    ${sub ? `<p class="mt-3 max-w-2xl text-base md:text-lg" style="color:var(--teks); opacity:.75">${sub}</p>` : ''}
  </div>`;