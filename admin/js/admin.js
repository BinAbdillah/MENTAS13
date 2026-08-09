/* =========================================================
   admin.js (module) — halaman admin data-driven:
   form dibangun OTOMATIS dari struktur data (tanpa hardcode),
   sehingga field baru di data.json langsung muncul di form.
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
   
   /* ---------- Util kecil ---------- */
   const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
   const escAttr = (s) => esc(s).replace(/"/g, '&quot;');
   const pretty = (k) => String(k).replace(/[_-]/g, ' ');
   const status = (t) => { $('#statusLine').textContent = t; };
   
   /* Template untuk tombol "Tambah" bila array kosong */
   const TEMPLATES = {
     agenda: { tanggal: '2026-01-01', waktu: '', judul: '', tempat: '', kategori: 'Kegiatan', deskripsi: '' }
   };
   const templates = {};   // template per path array (diisi saat render)
   
   /* ---------- Pembangun form otomatis (rekursif) ---------- */
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
     // Daun: string / number / boolean / null
     if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
       const tipe = typeof value === 'boolean' ? 'bool' : typeof value === 'number' ? 'num' : 'str';
       const panjang = tipe === 'str' && (String(value).length > 60 || /sambutan|deskripsi|alamat/i.test(key));
       const ctrl = tipe === 'bool'
         ? `<input type="checkbox" class="h-4 w-4 accent-emerald-600" ${value ? 'checked' : ''}>`
         : tipe === 'num'
         ? `<input type="number" step="any" class="inp" value="${value}">`
         : panjang
         ? `<textarea class="inp">${esc(value)}</textarea>`
         : `<input type="text" class="inp" value="${escAttr(value)}">`;
       return tipe === 'bool'
         ? `<div data-key="${key}" data-tipe="bool" class="leaf"><label class="mt-3 flex items-center gap-2 font-semibold">${ctrl}<span class="capitalize">${pretty(key)}</span></label></div>`
         : `<div data-key="${key}" data-tipe="${tipe}" class="leaf"><label class="lbl">${pretty(key)}</label>${ctrl}</div>`;
     }
   
     // Array
     if (Array.isArray(value)) {
       // Array of array (koordinat polygon) → textarea JSON
       if (value.length && Array.isArray(value[0])) {
         return `<div data-key="${key}" data-tipe="json" class="leaf"><label class="lbl">${pretty(key)} <span class="hint">(JSON — hati-hati saat edit)</span></label><textarea class="inp mono" rows="4">${esc(JSON.stringify(value))}</textarea></div>`;
       }
       // Array primitif (daftar nama, pasangan koordinat) → input koma
       if (!value.length || typeof value[0] !== 'object') {
         const nums = value.length && typeof value[0] === 'number';
         return `<div data-key="${key}" data-tipe="${nums ? 'csvnum' : 'csv'}" class="leaf"><label class="lbl">${pretty(key)} <span class="hint">(pisahkan dengan koma)</span></label><input class="inp" value="${escAttr(value.join(', '))}"></div>`;
       }
       // Array of object → daftar item + tombol tambah
       return `<fieldset data-key="${key}" data-path="${key}" data-tipe="arr" class="arr">
         <legend class="lbl2">${pretty(key)}</legend>
         ${value.map(itemHTML).join('')}
         <button type="button" data-aksi="add" class="btnx mt-3 bg-emerald-100 text-emerald-700">＋ Tambah ${pretty(key)}</button>
       </fieldset>`;
     }
   
     // Object → fieldset bersarang
     const inner = Object.entries(value).map(([k, v]) => buildUI(k, v)).join('');
     return `<fieldset data-key="${key}" data-tipe="obj" class="obj"><legend class="lbl2">${pretty(key)}</legend>${inner}</fieldset>`;
   }
   
   /* ---------- Kumpulkan nilai form kembali jadi objek ---------- */
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
   
   /* ---------- Tambah / hapus item (delegasi) ---------- */
   $('#formRoot').addEventListener('click', (e) => {
     const b = e.target.closest('[data-aksi]');
     if (!b) return;
     if (b.dataset.aksi === 'del') { b.closest('[data-tipe="item"]').remove(); return; }
     if (b.dataset.aksi === 'add') {
       const arr = b.closest('[data-tipe="arr"]');
       const tpl = templates[arr.dataset.path] || templateOf(arr.dataset.key, collect(arr.querySelectorAll(':scope > [data-tipe="item"]')[0] || { dataset: {} }));
       b.insertAdjacentHTML('beforebegin', itemHTML(tpl));
     }
   });
   
   /* ---------- Muat data ke form ---------- */
   async function muatKeForm() {
     let v = null, sumber = '';
     if (db) {
       try { const s = await _fb.get(_fb.ref(db, 'data')); if (s.val()) { v = s.val(); sumber = 'Firebase'; } } catch (e) {}
     }
     if (!v) {
       try { const r = await fetch('../data/data.json'); v = await r.json(); sumber = 'data.json lokal'; } catch (e) {}
     }
     if (!v) { status('❌ Tidak ada data untuk dimuat.'); return; }
   
     // template array untuk tombol "Tambah"
     Object.entries(v).forEach(([k, val]) => {
       if (Array.isArray(val) && val.length && typeof val[0] === 'object') templates[k] = templateOf(k, val[0]);
     });
   
     $('#formRoot').innerHTML = Object.entries(v).map(([k, val]) => buildUI(k, val)).join('');
     status('📂 Data dimuat dari ' + sumber + '. Silakan edit, lalu Simpan.');
   }
   
   /* ---------- Auth & tombol aksi ---------- */
   function tampilEditor() {
     $('#loginCard').classList.add('hidden');
     $('#formRoot').classList.remove('hidden');
     ['btnSimpan', 'btnDownload', 'btnKeluar', 'btnMigrasi'].forEach(id => $('#' + id).classList.remove('hidden'));
     $('#statusAuth').textContent = '✅ Masuk sebagai pengurus';
     muatKeForm();
   }
   function tampilLogin() {
     $('#loginCard').classList.remove('hidden');
     $('#formRoot').classList.add('hidden');
     ['btnSimpan', 'btnDownload', 'btnKeluar', 'btnMigrasi'].forEach(id => $('#' + id).classList.add('hidden'));
     $('#statusAuth').textContent = '';
   }
   
   if (!firebaseSiap) {
     $('#cfgWarn').classList.remove('hidden');
     $('#loginCard').classList.add('hidden');
   } else {
     _au.onAuthStateChanged(auth, (u) => (u ? tampilEditor() : tampilLogin()));
   }
   
   $('#btnMasuk').onclick = async () => {
     $('#loginErr').textContent = '';
     try {
       await _au.signInWithEmailAndPassword(auth, $('#inEmail').value.trim(), $('#inPass').value);
     } catch (e) {
       $('#loginErr').textContent = '❌ Gagal masuk: ' + (e.code || e.message);
     }
   };
   $('#btnKeluar').onclick = () => _au.signOut(auth);
   
   $('#btnSimpan').onclick = async () => {
     if (!confirm('Simpan perubahan ke Firebase? Website warga akan langsung berubah.')) return;
     try {
       await _fb.set(_fb.ref(db, 'data'), collect($('#formRoot')));
       status('✅ Tersimpan ke Firebase — website live sudah ter-update.');
     } catch (e) { status('❌ ' + e.message); }
   };
   
   $('#btnMigrasi').onclick = async () => {
     if (!confirm('Kirim ISI data.json lokal ke Firebase (menimpa data Firebase)? Lakukan sekali saat pertama.')) return;
     try {
       const r = await fetch('../data/data.json');
       await _fb.set(_fb.ref(db, 'data'), await r.json());
       status('✅ data.json lokal berhasil dimigrasikan ke Firebase.');
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