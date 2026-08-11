/* =========================================================
   admin.js — v2: MODE DARURAT OFFLINE
   • Login online berhasil → email+hash(SHA-256) di-cache.
   • Tanpa koneksi → login terhadap cache = MODE OFFLINE.
   • Editan offline → draft di localStorage (tahan restart).
   • Online kembali → tombol 🔄 Sinkronkan mengirim draft.
   ========================================================= */

   const $ = (s) => document.querySelector(s);
   const FB = window.FIREBASE_CONFIG || null;
   const firebaseSiap = !!(FB && FB.apiKey && FB.databaseURL);
   
   let db = null, auth = null, _fb = null, _au = null;
   if (firebaseSiap) {
     try {
       const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
       _fb = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
       _au = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
       const app = initializeApp(FB);
       db = _fb.getDatabase(app);
       auth = _au.getAuth(app);
     } catch (e) { console.error('Firebase gagal dimuat:', e); }
   }
   
   /* ---------- State mode & penyimpanan lokal ---------- */
   let MODE = 'online';                       // 'online' | 'offline'
   let DATA_DASAR = null;                     // data terakhir dimuat (basis merge)
   const K_CACHE = 'rw13_admin_cache';
   const K_DRAFT = 'rw13_draft';
   
   const bacaCache = () => { try { return JSON.parse(localStorage.getItem(K_CACHE)); } catch (e) { return null; } };
   const bacaDraft = () => { try { return JSON.parse(localStorage.getItem(K_DRAFT)); } catch (e) { return null; } };
   
   /* Hash sandi (SHA-256; fallback djb2 bila subtle tak tersedia) */
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
   
   /* ---------- Util ---------- */
   const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
   const escAttr = (s) => esc(s).replace(/"/g, '&quot;');
   const pretty = (k) => String(k).replace(/[_-]/g, ' ');
   const status = (t) => { $('#statusLine').textContent = t; };
   
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
   
   const TEMPLATES = {
     agenda:        { tanggal: '2026-01-01', waktu: '', judul: '', tempat: '', kategori: 'Kegiatan', deskripsi: '' },
     pengumuman:    { tanggal: '2026-01-01', judul: '', isi: '', prioritas: 'Biasa', pin: true },
     galeri:        { foto: 'assets/', keterangan: '', tanggal: '2026-01-01', kategori: 'Kegiatan' },
     layanan:       { nama: '', syarat: '', penanggungJawab: '', biaya: 'Gratis', durasi: '' },
     kontakDarurat: { nama: '', nomor: '', jabatan: '' },
     umkm:          { nama: '', jenis: '', kontak: '', rt: '' }
   };
   const templates = {};
   
   /* ---------- Pembangun form otomatis ---------- */
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
   
   function buildUI(key, value) {
     if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
       const tipe = typeof value === 'boolean' ? 'bool' : typeof value === 'number' ? 'num' : 'str';
       const v = value === null ? '' : value;
       const panjang = tipe === 'str' && (String(v).length > 60 || /sambutan|deskripsi|alamat|syarat|isi/i.test(key));
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
     if (t === 'str')  return el.querySelector('input,textarea').value;
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
   
   /* =========================================================
      MANAJER TEMA (preset + picker + live preview)
      ========================================================= */
   let temaAktif = { preset: 'garuda', custom: {} };
   
   function panelTemaHTML() {
     const p = Object.keys(PRESET_TEMA);
     const sumber = (temaAktif.preset === 'custom')
       ? Object.assign({}, PRESET_TEMA.garuda, temaAktif.custom)
       : (PRESET_TEMA[temaAktif.preset] || PRESET_TEMA.garuda);
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
       </div>`;
   }
   
   function pasangPanelTema() {
     const host = $('#temaHost');
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
         const draft = Object.assign({}, DATA_DASAR || {}, collect($('#formRoot')), { tema: temaAktif });
         localStorage.setItem(K_DRAFT, JSON.stringify(draft));
         status('🟠 MODE OFFLINE: tema masuk draft perangkat. Sinkronkan saat online.');
         perbaruiBadge();
         return;
       }
       if (!confirm('Simpan tema ke Firebase? Beranda warga langsung berubah.')) return;
       try {
         await _fb.set(_fb.ref(db, 'data/tema'), temaAktif);
         status('✅ Tema tersimpan & diterapkan real-time ke beranda.');
       } catch (e) { status('❌ ' + e.message); }
     });
   }
   
   /* =========================================================
      MODE OFFLINE: badge, tombol sync, draft
      ========================================================= */
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
     if (MODE === 'offline') {
       el.textContent = navigator.onLine
         ? '🟠 MODE OFFLINE — koneksi kembali, siap sinkron'
         : '🟠 MODE OFFLINE — editan tersimpan di perangkat';
     } else {
       el.textContent = '✅ Masuk sebagai pengurus';
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
       await _fb.set(_fb.ref(db, 'data'), draft);
       localStorage.removeItem(K_DRAFT);
       MODE = 'online';
       status('✅ Draft tersinkron ke Firebase — website live ter-update.');
       perbaruiBadge();
       muatKeForm();
     } catch (e) { status('❌ Gagal sinkron: ' + e.message); }
   }
   
   /* ---------- Muat data ke form (prioritas sesuai mode) ---------- */
   async function muatKeForm() {
     let lokal = null;
     try { const r = await fetch('../data/data.json'); lokal = await r.json(); } catch (e) {}
   
     let v = null, sumber = '';
     if (MODE === 'online' && db) {
       try { const s = await _fb.get(_fb.ref(db, 'data')); if (s.val()) { v = s.val(); sumber = 'Firebase'; } } catch (e) {}
     }
     if (!v && MODE === 'offline' && bacaDraft()) { v = bacaDraft(); sumber = 'draft offline'; }
     if (!v && lokal) { v = lokal; sumber = 'data.json lokal'; }
     if (!v) { status('❌ Tidak ada data untuk dimuat.'); return; }
     if (lokal && sumber !== 'draft offline') v = mergeDeep(lokal, v);
     if (sumber === 'draft offline' && lokal) v = mergeDeep(lokal, v);
   
     DATA_DASAR = v;
     temaAktif = v.tema || { preset: 'garuda', custom: {} };
     terapkanTema(temaAktif);
     pasangPanelTema();
   
     Object.entries(v).forEach(([k, val]) => {
       if (Array.isArray(val) && val.length && typeof val[0] === 'object') templates[k] = templateOf(k, val[0]);
     });
   
     $('#formRoot').innerHTML = Object.entries(v)
       .filter(([k]) => k !== 'tema')
       .map(([k, val]) => buildUI(k, val)).join('');
     status('📂 Dimuat dari ' + sumber + '.');
   }
   
   /* ---------- Tampil login / editor ---------- */
   function tampilEditor() {
     $('#loginCard').classList.add('hidden');
     $('#temaHost').classList.remove('hidden');
     $('#formRoot').classList.remove('hidden');
     ['btnSimpan', 'btnDownload', 'btnKeluar', 'btnMigrasi'].forEach(id => $('#' + id).classList.remove('hidden'));
     pasangTombolSync();
     perbaruiBadge();
     muatKeForm();
   }
   function tampilLogin() {
     $('#loginCard').classList.remove('hidden');
     $('#temaHost').classList.add('hidden');
     $('#formRoot').classList.add('hidden');
     ['btnSimpan', 'btnDownload', 'btnKeluar', 'btnMigrasi', 'btnSync'].forEach(id => { const b = $('#' + id); if (b) b.classList.add('hidden'); });
     $('#statusAuth').textContent = '';
   }
   
   if (!firebaseSiap) {
     if (bacaCache()) { /* tetap tampilkan login untuk mode offline */ }
     else { $('#cfgWarn').classList.remove('hidden'); $('#loginCard').classList.add('hidden'); }
   } else {
     _au.onAuthStateChanged(auth, (u) => {
       if (u) { MODE = 'online'; tampilEditor(); } else if (MODE === 'online') tampilLogin();
     });
   }
   
   /* ---------- Login: online dulu, fallback offline ---------- */
   $('#btnMasuk').onclick = async () => {
     $('#loginErr').textContent = '';
     const email = $('#inEmail').value.trim(), pass = $('#inPass').value;
   
     // 1) coba online
     if (firebaseSiap && navigator.onLine) {
       try {
         await _au.signInWithEmailAndPassword(auth, email, pass);
         localStorage.setItem(K_CACHE, JSON.stringify({ email, hash: await hashTeks(pass) }));
         MODE = 'online';
         return;   // onAuthStateChanged menampilkan editor
       } catch (e) { /* jatuh ke fallback offline */ }
     }
   
     // 2) fallback offline terhadap cache
     const cache = bacaCache();
     const h = await hashTeks(pass);
     if (cache && cache.email === email && cache.hash === h) {
       MODE = 'offline';
       tampilEditor();
     } else {
       $('#loginErr').textContent = '❌ Gagal masuk. Bila offline, gunakan akun yang pernah login di perangkat ini.';
     }
   };
   
   $('#btnKeluar').onclick = () => { MODE = 'online'; if (_au) _au.signOut(auth); else tampilLogin(); };
   
   /* ---------- Simpan: online → Firebase; offline → draft ---------- */
   $('#btnSimpan').onclick = async () => {
     const data = collect($('#formRoot'));
     if (MODE === 'offline' || !navigator.onLine || !(auth && auth.currentUser)) {
       const draft = Object.assign({}, DATA_DASAR || {}, data, { tema: temaAktif });
       localStorage.setItem(K_DRAFT, JSON.stringify(draft));
       status('🟠 MODE OFFLINE: draft tersimpan di perangkat. Klik 🔄 Sinkronkan saat online.');
       perbaruiBadge();
       return;
     }
     if (!confirm('Simpan perubahan ke Firebase? Website warga akan langsung berubah.')) return;
     try {
       await _fb.set(_fb.ref(db, 'data'), data);
       status('✅ Tersimpan ke Firebase — website live ter-update.');
     } catch (e) { status('❌ ' + e.message); }
   };
   
   $('#btnMigrasi').onclick = async () => {
     if (MODE === 'offline' || !navigator.onLine) { status('❌ Migrasi butuh koneksi internet.'); return; }
     if (!confirm('Kirim ISI data.json lokal ke Firebase (menimpa)? Lakukan sekali saat pertama.')) return;
     try {
       const r = await fetch('../data/data.json');
       await _fb.set(_fb.ref(db, 'data'), await r.json());
       status('✅ data.json lokal dimigrasikan ke Firebase.');
       muatKeForm();
     } catch (e) { status('❌ ' + e.message); }
   };
   
   $('#btnDownload').onclick = () => {
     const blob = new Blob([JSON.stringify(collect($('#formRoot')), null, 2)], { type: 'application/json' });
     const a = document.createElement('a');
     a.href = URL.createObjectURL(blob);
     a.download = 'data.json';
     a.click();
     status('💾 data.json diunduh — bisa di-push ke GitHub sebagai cadangan.');
   };