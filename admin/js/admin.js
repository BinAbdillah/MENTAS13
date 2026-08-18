/* =========================================================
   admin.js — REFACTOR v5.2 (Perbaikan ReferenceError global)
   Mengekspos fungsi kunci ke window agar modul ES6 membacanya.
   ========================================================= */

const $ = (s) => document.querySelector(s);
const FB = window.FIREBASE_CONFIG || null;
const firebaseSiap = !!(FB && FB.apiKey && FB.databaseURL);

const GH_REPO = 'BinAbdillah/MENTAS13';
const GH_PAGES = 'https://binabdillah.github.io/MENTAS13/';
const K_TOKEN = 'rw13_gh_token';
const K_PREVIEW = 'rw13_preview_data';

let db = null, auth = null, _fb = null, _au = null, fapp = null;
let firebaseInitialized = false;

if (firebaseSiap && navigator.onLine) {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    _fb = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
    _au = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
    fapp = initializeApp(FB);
    db = _fb.getDatabase(fapp);
    auth = _au.getAuth(fapp);
    firebaseInitialized = true;
  } catch (e) { 
    console.warn('Firebase gagal dimuat (mungkin offline):', e); 
    firebaseInitialized = false;
  }
}

let MODE = 'online';
let DATA_DASAR = null;
let JADWAL_TERSIMPAN = null;
let DATA_PUBLIK = null; 
let DRAFT_TERSIMPAN = null;
const K_CACHE = 'rw13_admin_cache';
const K_DRAFT = 'rw13_draft';

const bacaCache = () => { try { return JSON.parse(localStorage.getItem(K_CACHE)); } catch (e) { return null; } };
const bacaDraft = () => { try { return JSON.parse(localStorage.getItem(K_DRAFT)); } catch (e) { return null; } };

async function hashTeks(t) {
  try {
    if (crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {}
  let h = 5381;
  for (const c of t) h = ((h << 5) + h + c.charCodeAt(0)) | 0;
  return 'x' + (h >>> 0).toString(16);
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => esc(s).replace(/"/g, '&quot;');
const pretty = (k) => String(k).replace(/[_-]/g, ' ');
const status = (t) => { const el = $('#statusLine'); if (el) { if (t && t.includes('<')) el.innerHTML = t; else el.textContent = t; } };

function mergeDeep(base, extra) {
  if (Array.isArray(extra)) return extra;
  if (extra && typeof extra === 'object' && base && typeof base === 'object' && !Array.isArray(base)) {
    const out = { ...base };
    for (const [k, v] of Object.entries(extra)) {
      out[k] = (typeof base[k] !== 'undefined') ? mergeDeep(base[k], v) : v;
    }
    return out;
  }
  return (typeof extra === 'undefined') ? base : extra;
}

/* ---------- UPLOAD FOTO ---------- */
function kompresGambar(file, maxSisi = 1600, kualitas = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const skala = Math.min(1, maxSisi / Math.max(img.width, img.height));
      const w = Math.round(img.width * skala), h = Math.round(img.height * skala);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      c.toBlob((b) => {
        URL.revokeObjectURL(url);
        b ? resolve(b) : reject(new Error('Gagal mengompres gambar.'));
      }, 'image/jpeg', kualitas);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('File bukan gambar valid.')); };
    img.src = url;
  });
}

async function uploadFoto(file) {
  const token = (localStorage.getItem(K_TOKEN) || '').trim();
  if (!token) throw new Error('isi dulu 🔑 Token GitHub di panel Upload.');
  
  status(`
    <div class="mx-auto max-w-md text-left">
      <span>📤 Mengompres gambar...</span>
      <div class="mt-1 h-1.5 w-full rounded-full bg-slate-700">
        <div class="h-full w-1/3 rounded-full bg-emerald-500 transition-all"></div>
      </div>
    </div>
  `);

  const blob = await kompresGambar(file);
  
  status(`
    <div class="mx-auto max-w-md text-left">
      <span>📤 Mengunggah ke GitHub (memakan waktu ±1 menit)...</span>
      <div class="mt-1 h-1.5 w-full rounded-full bg-slate-700">
        <div class="h-full w-2/3 rounded-full bg-amber-500 transition-all"></div>
      </div>
    </div>
  `);

  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const b64 = btoa(bin);
  const nama = `assets/uploads/${Date.now()}-${file.name.replace(/[^\w.-]+/g, '_')}.jpg`;

  const r = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${nama}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github+json' },
    body: JSON.stringify({ message: `📷 foto admin: ${nama}`, content: b64 })
  });
  
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error('GitHub ' + r.status + (j.message ? ': ' + j.message : ''));
  }
  status('✅ Foto ter-commit!');
  return GH_PAGES + nama;
}

/* ---------- FORM OTOMATIS ---------- */
const TEMPLATES = {
  agenda:        { tanggal: '2026-01-01', waktu: '', judul: '', tempat: '', kategori: 'Kegiatan', deskripsi: '' },
  pengumuman:    { tanggal: '2026-01-01', judul: '', isi: '', prioritas: 'Biasa', pin: true },
  galeri:        { foto: 'assets/', keterangan: '', tanggal: '2026-01-01', kategori: 'Kegiatan' },
  layanan:       { nama: '', syarat: '', penanggungJawab: '', biaya: 'Gratis', durasi: '' },
  kontakDarurat: { nama: '', nomor: '', jabatan: '' },
  umkm:          { nama: '', jenis: '', kontak: '', rt: '' },
  anggota:       { nama: '', foto: '' }
};
const templates = {};

function templateOf(key, sample) {
  if (TEMPLATES[key]) return JSON.parse(JSON.stringify(TEMPLATES[key]));
  const z = (v) => typeof v === 'number' ? 0
    : typeof v === 'boolean' ? false
    : Array.isArray(v) ? []
    : (v && typeof v === 'object') ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, z(x)]))
    : '';
  return z(sample);
}

function itemHTML(item) {
  const inner = Object.entries(item).map(([k, v]) => buildUI(k, v)).join('');
  return `<fieldset data-tipe="item" class="item">${inner}
    <button type="button" data-aksi="del" class="btnx absolute right-2 top-2 bg-red-100 text-red-600">✕ Hapus</button>
  </fieldset>`;
}

const ADA_FOTO = /foto|gambar|logo/i;

function buildUI(key, value) {
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
    const tipe = typeof value === 'boolean' ? 'bool' : typeof value === 'number' ? 'num' : 'str';
    const v = value === null ? '' : value;
    const panjang = tipe === 'str' && (String(v).length > 60 || /sambutan|deskripsi|alamat|syarat|isi/i.test(key));

    if (tipe === 'str' && ADA_FOTO.test(key)) {
      return `<div data-key="${key}" data-tipe="str" class="leaf">
        <label class="lbl">${pretty(key)}</label>
        <div class="flex flex-wrap items-center gap-3">
          <img class="foto-prev h-14 w-14 rounded-lg object-cover" src="${escAttr(v)}" alt=""
               onerror="this.style.visibility='hidden'" onload="this.style.visibility='visible'">
          <input type="text" class="inp" style="flex:1; min-width:180px" value="${escAttr(v)}">
          <label class="btnx cursor-pointer bg-slate-600 text-white">📷 Upload
            <input type="file" accept="image/*" class="foto-file hidden">
          </label>
        </div>
      </div>`;
    }

    const ctrl = tipe === 'bool'
      ? `<input type="checkbox" class="h-4 w-4 accent-emerald-600" ${v ? 'checked' : ''}>`
      : tipe === 'num'
      ? `<input type="number" step="any" class="inp" value="${v}">`
      : panjang
      ? `<textarea class="inp">${esc(v)}</textarea>`
      : `<input type="text" class="inp" value="${escAttr(v)}">`;
    return tipe === 'bool'
      ? `<div data-key="${key}" data-tipe="bool" class="leaf"><label class="mt-3 flex items-center gap-2 font-semibold">${ctrl}<span class="capitalize">${pretty(key)}</span></label></div>`
      : `<div data-key="${key}" data-tipe="${tipe}" class="leaf"><label class="lbl">${pretty(key)}</label>${ctrl}</div>`;
  }

  if (Array.isArray(value)) {
    if (value.length && Array.isArray(value[0])) {
      return `<div data-key="${key}" data-tipe="json" class="leaf"><label class="lbl">${pretty(key)} <span class="hint">(JSON — hati-hati)</span></label><textarea class="inp mono" rows="4">${esc(JSON.stringify(value))}</textarea></div>`;
    }
    if (!value.length || typeof value[0] !== 'object') {
      const nums = value.length && typeof value[0] === 'number';
      return `<div data-key="${key}" data-tipe="${nums ? 'csvnum' : 'csv'}" class="leaf"><label class="lbl">${pretty(key)} <span class="hint">(pisahkan dengan koma)</span></label><input class="inp" value="${escAttr(value.join(', '))}"></div>`;
    }
    return `<fieldset data-key="${key}" data-path="${key}" data-tipe="arr" class="arr">
      <legend class="lbl2">${pretty(key)}</legend>
      ${value.map(itemHTML).join('')}
      <button type="button" data-aksi="add" class="btnx mt-3 bg-emerald-100 text-emerald-700">＋ Tambah ${pretty(key)}</button>
    </fieldset>`;
  }

  const inner = Object.entries(value).map(([k, v]) => buildUI(k, v)).join('');
  return `<fieldset data-key="${key}" data-tipe="obj" class="obj"><legend class="lbl2">${pretty(key)}</legend>${inner}</fieldset>`;
}

function collect(el) {
  const t = el.dataset.tipe;
  if (t === 'str')  return el.querySelector('input[type="text"],textarea').value;
  if (t === 'num')  { const v = parseFloat(el.querySelector('input').value); return isNaN(v) ? 0 : v; }
  if (t === 'bool') return el.querySelector('input').checked;
  if (t === 'csv')  return el.querySelector('input').value.split(',').map(s => s.trim()).filter(Boolean);
  if (t === 'csvnum') return el.querySelector('input').value.split(',').map(s => parseFloat(s.trim())).filter(v => !isNaN(v));
  if (t === 'json') { try { return JSON.parse(el.querySelector('textarea').value); } catch (e) { return []; } }
  if (t === 'obj' || t === 'item') {
    const o = {};
    el.querySelectorAll(':scope > [data-key]').forEach(ch => { o[ch.dataset.key] = collect(ch); });
    return o;
  }
  if (t === 'arr') return [...el.querySelectorAll(':scope > [data-tipe="item"]')].map(it => collect(it));
  return null;
}

$('#formRoot').addEventListener('click', (e) => {
  const b = e.target.closest('[data-aksi]');
  if (!b) return;
  if (b.dataset.aksi === 'del') { b.closest('[data-tipe="item"]').remove(); return; }
  if (b.dataset.aksi === 'add') {
    const arr = b.closest('[data-tipe="arr"]');
    const first = arr.querySelector(':scope > [data-tipe="item"]');
    const tpl = templates[arr.dataset.path] || (first ? templateOf(arr.dataset.key, collect(first)) : {});
    b.insertAdjacentHTML('beforebegin', itemHTML(tpl));
  }
});

/* ---------- Upload foto (delegasi) ---------- */
$('#formRoot').addEventListener('change', async (e) => {
  const f = e.target.closest('.foto-file');
  if (!f || !f.files || !f.files.length) return;
  const wrap = f.closest('[data-tipe="str"]');
  const inp = wrap.querySelector('input[type="text"]');
  const prev = wrap.querySelector('.foto-prev');
  try {
    const url = await uploadFoto(f.files[0]);
    inp.value = url;
    if (prev) { prev.src = url; prev.style.visibility = 'visible'; }
  } catch (err) {
    status('❌ Upload gagal: ' + err.message);
  }
  f.value = '';
});

/* ---------- PANEL: TEMA + RONDA + UPLOAD ---------- */
let temaAktif = { preset: 'garuda', custom: {} };

function panelTemaHTML() {
  const p = Object.keys(PRESET_TEMA);
  const sumber = (temaAktif.preset === 'custom')
    ? Object.assign({}, PRESET_TEMA.garuda, temaAktif.custom)
    : (PRESET_TEMA[temaAktif.preset] || PRESET_TEMA.garuda);
    
  const cursorStatus = localStorage.getItem('rw13_cursor_active') === 'true';

  return `
    <div class="kartu mb-6 p-5">
      <b class="block text-lg" style="color:var(--heading)">🎨 Manajer Tema</b>
      <p class="mb-4 text-sm" style="color:var(--teks); opacity:.7">Ganti suasana website dari sini — tersimpan & diterapkan real-time ke beranda.</p>
      <div class="flex flex-wrap items-center gap-3">
        <label class="text-sm font-bold">Preset
          <select id="temaPreset" class="inp" style="width:auto">
            ${p.map((k) => `<option value="${k}" ${temaAktif.preset === k ? 'selected' : ''}>${k[0].toUpperCase() + k.slice(1)}</option>`).join('')}
            <option value="custom" ${temaAktif.preset === 'custom' ? 'selected' : ''}>Custom</option>
          </select>
        </label>
        ${[['bg', 'Latar'], ['surface', 'Kartu'], ['accent', 'Aksen'], ['accentText', 'Teks aksen'], ['heading', 'Judul']]
          .map(([k, l]) => `
          <label class="text-sm font-bold">${l}
            <input type="color" data-warna="${k}" class="h-9 w-12 cursor-pointer rounded border-0 bg-transparent p-0" value="${sumber[k] || '#000000'}">
          </label>`).join('')}
        <button id="btnSimpanTema" class="btnx bg-emerald-600 text-white">🎨 Simpan Tema</button>
      </div>
      <div class="mt-4 flex items-center gap-3 border-t pt-4" style="border-color:var(--line)">
        <label class="flex items-center gap-2 text-sm font-bold cursor-pointer">
          <input type="checkbox" id="toggleCursor" ${cursorStatus ? 'checked' : ''}>
          🖱️ Aktifkan Kursor Halus (Custom Cursor)
        </label>
      </div>
    </div>
    <div class="kartu mb-6 p-5">
      <b class="block text-lg" style="color:var(--heading)">🌙 Jadwal Ronda</b>
      <p class="mb-3 text-sm" style="color:var(--teks); opacity:.7">
        Pola <b>${sumber.polahari || 3} hari</b> berselang mulai <b>${sumber.mulai || '2026-07-30'}</b> (TEBO ↔ MONCOS).
        Jadwal 1 tahun disimpan di data — hanya pin kanan-bawah yang tampil.
      </p>
      <div class="flex flex-wrap items-center gap-3">
        <button id="btnGenRonda" class="btnx bg-emerald-600 text-white">⚙️ Generate 1 Tahun</button>
        <span id="roInfo" class="text-sm" style="opacity:.7"></span>
      </div>
    </div>
    <div class="kartu mb-6 p-5">
      <b class="block text-lg" style="color:var(--heading)">📷 Upload Foto (via GitHub — gratis)</b>
      <p class="mb-3 text-sm" style="color:var(--teks); opacity:.7">
        Foto dikompresi otomatis lalu di-commit ke <code>assets/uploads/</code> dan tayang via GitHub Pages.
        Butuh <b>fine-grained token</b> (repo MENTAS13 saja, izin <i>Contents: read & write</i>), tersimpan hanya di browser ini.
        Status: ${localStorage.getItem(K_TOKEN) ? '🟢 token tersimpan' : '🔴 belum ada token'}.
      </p>
      <div class="flex flex-wrap items-center gap-3">
        <input id="inToken" type="password" class="inp" style="flex:1; min-width:220px"
               placeholder="github_pat_… (tempel token)" value="${escAttr(localStorage.getItem(K_TOKEN) || '')}">
        <button id="btnSimpanToken" class="btnx bg-slate-600 text-white">🔑 Simpan Token</button>
      </div>
    </div>`;
}

function pasangPanelTema() {
  const host = $('#temaHost');
  if (!host) return;
  host.innerHTML = panelTemaHTML();

  host.querySelector('#temaPreset').addEventListener('change', (e) => {
    temaAktif = { preset: e.target.value, custom: {} };
    terapkanTema(temaAktif);
    host.innerHTML = panelTemaHTML();
    pasangPanelTema();
  });

  host.querySelectorAll('input[data-warna]').forEach((inp) => {
    inp.addEventListener('input', () => {
      const base = PRESET_TEMA[temaAktif.preset] || PRESET_TEMA.garuda;
      const custom = Object.assign({}, base, temaAktif.custom);
      custom[inp.dataset.warna] = inp.value;
      temaAktif = { preset: 'custom', custom };
      terapkanTema(temaAktif);
    });
  });

  host.querySelector('#btnSimpanTema').addEventListener('click', async () => {
    if (MODE === 'offline' || !navigator.onLine || !(auth && auth.currentUser)) {
      const draft = rapikan(rekatkanJadwal(Object.assign({}, DATA_DASAR || {}, collect($('#formRoot')), { tema: temaAktif })));
      localStorage.setItem(K_DRAFT, JSON.stringify(draft));
      status('🟠 MODE OFFLINE: tema masuk draft perangkat.');
      perbaruiBadge();
      return;
    }
    if (!confirm('Simpan tema ke Firebase? Beranda warga langsung berubah.')) return;
    try {
      await _fb.set(_fb.ref(db, 'data/tema'), temaAktif);
      status('✅ Tema tersimpan & diterapkan real-time ke beranda.');
    } catch (e) { status('❌ ' + e.message); }
  });

  // PERBAIKAN: Tambahkan pengecekan eksistensi window.toggleCursor
  const toggleCursor = host.querySelector('#toggleCursor');
  if (toggleCursor) {
    toggleCursor.addEventListener('change', () => {
      if (typeof window.toggleCursor === 'function') {
        window.toggleCursor(toggleCursor.checked);
      } else {
        console.warn('⚠️ cursor.js belum dimuat, fitur kursor nonaktif.');
      }
    });
  }

  const info = host.querySelector('#roInfo');
  info.textContent = JADWAL_TERSIMPAN && JADWAL_TERSIMPAN.length
    ? `${JADWAL_TERSIMPAN.length} entri tersimpan (s/d ${JADWAL_TERSIMPAN[JADWAL_TERSIMPAN.length - 1].tanggal})`
    : 'belum digenerate — pin beranda tetap jalan via rumus otomatis.';

  host.querySelector('#btnGenRonda').addEventListener('click', async () => {
    const r = (collect($('#formRoot')).ronda) || {};
    const jadwal = buatJadwalRonda(r, 365);
    if (!jadwal.length) { status('❌ Isi minimal 1 tim ronda dulu.'); return; }
    if (!confirm(`Generate ${jadwal.length} entri jadwal (mulai ${r.mulai}, pola ${r.polahari} hari) dan simpan ke data?`)) return;
    JADWAL_TERSIMPAN = jadwal;
    const lengkap = Object.assign({}, r, { jadwal });
    if (MODE === 'offline' || !navigator.onLine || !(auth && auth.currentUser)) {
      const draft = rapikan(Object.assign({}, DATA_DASAR || {}, collect($('#formRoot')), { tema: temaAktif, ronda: lengkap }));
      localStorage.setItem(K_DRAFT, JSON.stringify(draft));
      status('🟠 OFFLINE: jadwal masuk draft perangkat.');
    } else {
      try {
        await _fb.set(_fb.ref(db, 'data/ronda'), lengkap);
        status('✅ Jadwal 1 tahun tersimpan di Firebase.');
      } catch (e) { status('❌ ' + e.message); return; }
    }
    info.textContent = `${jadwal.length} entri tersimpan (s/d ${jadwal[jadwal.length - 1].tanggal})`;
  });

  host.querySelector('#btnSimpanToken').addEventListener('click', () => {
    const t = host.querySelector('#inToken').value.trim();
    if (t) localStorage.setItem(K_TOKEN, t); else localStorage.removeItem(K_TOKEN);
    status(t ? '🔑 Token tersimpan di browser ini.' : '🔑 Token dihapus.');
    host.innerHTML = panelTemaHTML();
    pasangPanelTema();
  });
}

/* ---------- MODE OFFLINE ---------- */
function pasangTombolSync() {
  if ($('#btnSync')) return;
  $('#btnKeluar').insertAdjacentHTML('afterend',
    `<button id="btnSync" class="btnx bg-sky-600 text-white hidden">🔄 Sinkronkan</button>`);
  $('#btnSync').onclick = sinkronkan;
  addEventListener('online', perbaruiBadge);
  addEventListener('offline', perbaruiBadge);
}

function perbaruiBadge() {
  const el = $('#statusAuth');
  if (el) {
    el.textContent = MODE === 'offline'
      ? (navigator.onLine ? '🟠 MODE OFFLINE — koneksi kembali, siap sinkron' : '🟠 MODE OFFLINE — editan tersimpan di perangkat')
      : '✅ Masuk sebagai pengurus';
  }
  const b = $('#btnSync');
  if (b) b.classList.toggle('hidden', !(MODE === 'offline' && navigator.onLine && bacaDraft()));
}

async function sinkronkan() {
  const draft = bacaDraft();
  if (!draft) { status('Tidak ada draft untuk disinkronkan.'); return; }
  if (!navigator.onLine) { status('❌ Masih offline.'); return; }
  try {
    if (!(auth && auth.currentUser)) {
      const pass = prompt('Masukkan kata sandi Firebase untuk sinkronisasi:');
      if (!pass) return;
      await _au.signInWithEmailAndPassword(auth, (bacaCache() || {}).email || '', pass);
    }
    await _fb.set(_fb.ref(db, 'drafts/' + auth.currentUser.uid), rapikan(draft));
    localStorage.removeItem(K_DRAFT);
    MODE = 'online';
    status('✅ Draft tersinkron ke server.');
    perbaruiBadge();
    muatKeForm();
  } catch (e) { status('❌ Gagal sinkron: ' + e.message); }
}

/* ---------- MUAT DATA ---------- */
async function muatKeForm() {
  let lokal = null;
  try { const r = await fetch('../data/data.json'); lokal = await r.json(); } catch (e) {}

  let v = null, sumber = '';
  
  if (MODE === 'online' && db) {
    try { const s = await _fb.get(_fb.ref(db, 'data')); if (s.val()) { DATA_PUBLIK = s.val(); v = DATA_PUBLIK; sumber = 'Firebase (Publik)'; } } catch (e) {}
  }
  
  if (!v && MODE === 'offline' && bacaDraft()) { v = bacaDraft(); sumber = 'draft offline'; }
  
  if (!v && MODE === 'online' && auth && auth.currentUser) {
    try {
      const s = await _fb.get(_fb.ref(db, 'drafts/' + auth.currentUser.uid));
      if (s.val()) { v = s.val(); sumber = 'draft server'; }
    } catch (e) {}
  }
  
  if (!v && lokal) { v = lokal; sumber = 'data.json lokal'; }
  if (!v) { status('❌ Tidak ada data untuk dimuat.'); return; }
  if (lokal) v = mergeDeep(lokal, v);
  v = rapikan(v);

  DATA_DASAR = v;
  JADWAL_TERSIMPAN = (v.ronda && v.ronda.jadwal) || null;

  temaAktif = v.tema || { preset: 'garuda', custom: {} };
  terapkanTema(temaAktif);
  pasangPanelTema();

  Object.entries(v).forEach(([k, val]) => {
    if (Array.isArray(val) && val.length && typeof val[0] === 'object') templates[k] = templateOf(k, val[0]);
  });

  const vForm = JSON.parse(JSON.stringify(v));
  if (vForm.ronda) delete vForm.ronda.jadwal;

  $('#formRoot').innerHTML = `
    <div class="mb-6 flex flex-wrap gap-2 border-b pb-4" style="border-color:var(--line)" id="adminTabs">
      <button class="btnx tab-btn bg-emerald-600 text-white" data-tab="umum">🏛️ Umum</button>
      <button class="btnx tab-btn bg-slate-600 text-white" data-tab="struktur">👥 Struktur & RT</button>
      <button class="btnx tab-btn bg-slate-600 text-white" data-tab="konten">📅 Konten & Galeri</button>
      <button class="btnx tab-btn bg-slate-600 text-white" data-tab="layanan">📞 Layanan & Mitra</button>
    </div>
    <div id="adminContent"></div>
  `;

  const grupTab = {
    umum: ['identitas', 'hero', 'banner', 'peta', 'wilayah'],
    struktur: ['penasehat', 'strukturRW', 'rt', 'ronda'],
    konten: ['agenda', 'pengumuman', 'galeri'],
    layanan: ['layanan', 'kontakDarurat', 'umkm', 'mitra', 'fasilitas']
  };

  const contentEl = $('#adminContent');
  for (const [tab, keys] of Object.entries(grupTab)) {
    const el = document.createElement('div');
    el.id = `tab-${tab}`;
    el.className = tab === 'umum' ? 'block' : 'hidden';
    el.innerHTML = Object.entries(vForm)
      .filter(([k]) => keys.includes(k))
      .map(([k, val]) => buildUI(k, val)).join('');
    contentEl.appendChild(el);
  }

  $('#adminTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    $('#adminTabs').querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('bg-emerald-600', 'text-white');
      b.classList.add('bg-slate-600', 'text-white');
    });
    btn.classList.remove('bg-slate-600');
    btn.classList.add('bg-emerald-600');
    
    $('#adminContent').querySelectorAll('div[id^="tab-"]').forEach(d => d.classList.add('hidden'));
    document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
  });

  const statusBar = `
    <div class="mt-4 flex items-center gap-4 rounded-lg border bg-slate-800/30 p-3 text-sm" style="border-color:var(--line)">
      <span>📂 Sumber Data: <b>${sumber}</b></span>
      ${DATA_PUBLIK ? `<span class="opacity-50">|</span> <span>✅ Publik terakhir: ${new Date().toLocaleDateString()}</span>` : ''}
    </div>
  `;
  contentEl.parentElement.insertAdjacentHTML('afterbegin', statusBar);

  status('📂 Dimuat dari ' + sumber + ' (gunakan tab untuk navigasi).');
}

/* ---------- TAMPIL LOGIN / EDITOR ---------- */
function tampilEditor() {
  $('#loginCard').classList.add('hidden');
  $('#temaHost').classList.remove('hidden');
  $('#formRoot').classList.remove('hidden');
  
  $('#btnSimpan').classList.add('hidden');
  ['btnDownload', 'btnKeluar', 'btnMigrasi'].forEach(id => $('#' + id).classList.remove('hidden'));
  $('#btnSimpanDraft').classList.remove('hidden');
  $('#btnPreview').classList.remove('hidden');
  $('#btnTerbitkan').classList.remove('hidden');
  
  pasangTombolSync();
  perbaruiBadge();
  muatKeForm();
}

function tampilLogin() {
  $('#loginCard').classList.remove('hidden');
  $('#temaHost').classList.add('hidden');
  $('#formRoot').classList.add('hidden');
  ['btnSimpanDraft', 'btnPreview', 'btnTerbitkan', 'btnDownload', 'btnKeluar', 'btnMigrasi', 'btnSync'].forEach(id => { const b = $('#' + id); if (b) b.classList.add('hidden'); });
  $('#btnSimpan').classList.remove('hidden');
  const el = $('#statusAuth'); if (el) el.textContent = '';
}

if (!firebaseSiap) {
  if (bacaCache()) { /* login offline tersedia */ }
  else { $('#cfgWarn').classList.remove('hidden'); $('#loginCard').classList.add('hidden'); }
} else {
  if (firebaseInitialized && auth) {
    _au.onAuthStateChanged(auth, (u) => {
      if (u && MODE !== 'offline') { 
        MODE = 'online'; 
        tampilEditor(); 
      } else if (!u && MODE === 'online') {
        tampilLogin();
      }
    });
  }
}

$('#btnMasuk').onclick = async () => {
  $('#loginErr').textContent = '';
  const email = $('#inEmail').value.trim(), pass = $('#inPass').value;
  if (!email || !pass) { $('#loginErr').textContent = '❌ Email dan password wajib diisi.'; return; }

  const cache = bacaCache();
  const h = await hashTeks(pass);

  if (cache && cache.email === email && cache.hash === h) {
    MODE = 'offline';
    tampilEditor();
    return;
  }

  if (firebaseInitialized && navigator.onLine) {
    try {
      await _au.signInWithEmailAndPassword(auth, email, pass);
      localStorage.setItem(K_CACHE, JSON.stringify({ email, hash: h }));
      MODE = 'online';
    } catch (e) {
      $('#loginErr').textContent = '❌ Login Firebase gagal. Periksa email/password atau koneksi internet.';
    }
  } else {
    $('#loginErr').textContent = '❌ Tidak ada koneksi & tidak ada data login tersimpan di browser ini. Harap login online terlebih dahulu.';
  }
};

$('#btnKeluar').onclick = () => { 
  MODE = 'online'; 
  if (firebaseInitialized && _au) _au.signOut(auth); 
  else tampilLogin(); 
};

/* ---------- PERBAIKAN: Ekspor Fungsi ke Global Window ---------- */
function rekatkanJadwal(data) {
  data.ronda = data.ronda || {};
  data.ronda.jadwal = JADWAL_TERSIMPAN ||
    (DATA_DASAR && DATA_DASAR.ronda && DATA_DASAR.ronda.jadwal) || data.ronda.jadwal || [];
  return data;
}
// Binding ke window untuk mencegah ReferenceError di lingkungan ES Module
window.rekatkanJadwal = rekatkanJadwal;


/* ---------- FITUR UTAMA: DRAFT & PUBLISH + PREVIEW ---------- */
const headerActions = document.querySelector('header .ml-auto');

if (headerActions) {
  if (!$('#btnPreview')) {
    const previewBtn = document.createElement('button');
    previewBtn.id = 'btnPreview';
    previewBtn.className = 'btnx bg-indigo-600 text-white hidden';
    previewBtn.textContent = '👁️ Pratinjau';
    headerActions.prepend(previewBtn);
  }
  
  if (!$('#btnSimpanDraft')) {
    const draftBtn = document.createElement('button');
    draftBtn.id = 'btnSimpanDraft';
    draftBtn.className = 'btnx bg-amber-500 text-white hidden';
    draftBtn.textContent = '💾 Simpan Draft';
    const simpanBtn = $('#btnSimpan');
    if (simpanBtn) {
      simpanBtn.parentElement.insertBefore(draftBtn, simpanBtn);
    }
  }
  
  if (!$('#btnTerbitkan')) {
    const publishBtn = document.createElement('button');
    publishBtn.id = 'btnTerbitkan';
    publishBtn.className = 'btnx bg-emerald-600 text-white hidden';
    publishBtn.textContent = '🚀 Terbitkan';
    const simpanBtn = $('#btnSimpan');
    if (simpanBtn) {
      simpanBtn.parentElement.insertBefore(publishBtn, simpanBtn);
    }
  }
}

$('#btnSimpanDraft').onclick = async () => {
  const data = rapikan(window.rekatkanJadwal(collect($('#formRoot')))); // Gunakan window.rekatkanJadwal
  
  const draftData = Object.assign({}, DATA_DASAR || {}, data, { tema: temaAktif, _lastSaved: new Date().toISOString() });
  localStorage.setItem(K_DRAFT, JSON.stringify(draftData));
  status('💾 Draft tersimpan di perangkat.');

  if (MODE === 'online' && auth && auth.currentUser && navigator.onLine) {
    try {
      await _fb.set(_fb.ref(db, 'drafts/' + auth.currentUser.uid), rapikan(draftData));
      status('💾 Draft tersimpan di perangkat & server.');
    } catch (e) {
      status('⚠️ Draft lokal tersimpan, tetapi gagal menyimpan ke server: ' + e.message);
    }
  }
  perbaruiBadge();
};

$('#btnTerbitkan').onclick = async () => {
  if (MODE === 'offline' || !navigator.onLine || !(auth && auth.currentUser)) {
    status('❌ Untuk menerbitkan, Anda harus online dan login.');
    return;
  }
  
  if (!confirm('⚠️ Yakin ingin menerbitkan perubahan ini ke website publik?')) return;
  
  const data = rapikan(window.rekatkanJadwal(collect($('#formRoot')))); // Gunakan window.rekatkanJadwal
  try {
    await _fb.set(_fb.ref(db, 'data'), data);
    await _fb.set(_fb.ref(db, 'drafts/' + auth.currentUser.uid), null);
    localStorage.removeItem(K_DRAFT);
    DATA_PUBLIK = data;
    status('🚀 Berhasil diterbitkan ke publik!');
    muatKeForm();
  } catch (e) {
    status('❌ Gagal menerbitkan: ' + e.message);
  }
};

$('#btnPreview').onclick = () => {
  const data = collect($('#formRoot'));
  const fullData = Object.assign({}, DATA_DASAR || {}, data, { tema: temaAktif });
  localStorage.setItem(K_PREVIEW, JSON.stringify(fullData));
  window.open('index.html?preview=1', 'Preview RW 013', 'width=1200,height=800,scrollbars=yes');
  status('✅ Jendela pratinjau dibuka.');
};
