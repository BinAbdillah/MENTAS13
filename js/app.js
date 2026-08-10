/* =========================================================
   app.js — Firebase + Lenis + GSAP + reveal (diperbaiki)
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
   
   /* ---------- Setup efek ---------- */
   const ADA_GSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
   const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   const EFEK_AKTIF = ADA_GSAP && !REDUCED;
   
   let lenis = null;
   if (window.Lenis && !REDUCED) {
     lenis = new Lenis({ duration: 1.15 });
     if (ADA_GSAP) {
       lenis.on('scroll', ScrollTrigger.update);
       gsap.ticker.add((t) => lenis.raf(t * 1000));
       gsap.ticker.lagSmoothing(0);
     } else {
       (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
     }
   }
   
   /* ---------- Reveal AMAN (gating .fx) ---------- */
   function jalankanReveal() {
     const els = document.querySelectorAll('.reveal');
     if (REDUCED || !('IntersectionObserver' in window)) {
       els.forEach((el) => el.classList.add('on'));   // tanpa efek: tampilkan semua
       return;
     }
     document.documentElement.classList.add('fx');    // baru boleh sembunyi
     const io = new IntersectionObserver((es) => es.forEach((e) => {
       if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
     }), { threshold: .12 });
     els.forEach((el) => io.observe(el));
   }
   
   /* ---------- Efek GSAP (dibungkus try/catch: efek boleh gagal,
                 konten tidak boleh) ---------- */
   function initEfek() {
     if (!EFEK_AKTIF) return;
     try {
       gsap.registerPlugin(ScrollTrigger);
       ScrollTrigger.getAll().forEach((t) => t.kill());
   
       if ($('#hero .hero-foto')) {
         gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } })
           .to('#hero .hero-foto', { yPercent: 16, ease: 'none' }, 0)
           .to('#hero .hero-judul', { yPercent: -10, autoAlpha: .3, ease: 'none' }, 0);
       }
   
       gsap.utils.toArray('.mask-line').forEach((el) => {
         gsap.fromTo(el, { yPercent: 115 }, {
           yPercent: 0, duration: 1, ease: 'power4.out',
           scrollTrigger: { trigger: el, start: 'top 88%' }
         });
       });
   
       const wrap = $('#fasWrap'), track = $('#fasTrack');
       if (wrap && track && window.matchMedia('(min-width: 1024px)').matches) {
         const jarak = () => Math.max(0, track.scrollWidth - wrap.clientWidth);
         gsap.to(track, {
           x: () => -jarak(),
           ease: 'none',
           scrollTrigger: {
             trigger: wrap, start: 'top 15%', end: () => '+=' + jarak(),
             pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true
           }
         });
       }
   
       const mq = document.querySelector('.marquee-track');
       if (mq && lenis) {
         lenis.on('scroll', ({ velocity }) => {
           mq.style.animationDuration = Math.max(9, 26 - Math.min(14, Math.abs(velocity) * 1.6)) + 's';
         });
       }
   
       ScrollTrigger.refresh();
     } catch (e) {
       console.warn('Efek scroll dinonaktifkan:', e);   // konten tetap aman
     }
   }
   
   /* ---------- Normalisasi data ---------- */
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
   
   /* ---------- Render semua (reveal & counter DIPASTIKAN jalan) ---------- */
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
     jalankanReveal();    // ← perbaikan utama
     jalankanCounter();
     initEfek();          // boleh gagal, konten tetap aman
   }
   
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
   
   /* ---------- Anchor mulus ---------- */
   document.addEventListener('click', (e) => {
     const a = e.target.closest('a[href^="#"]');
     if (!a) return;
     const id = a.getAttribute('href');
     if (id.length < 2) return;
     const target = document.querySelector(id);
     if (!target) return;
     e.preventDefault();
     if (lenis) lenis.scrollTo(target, { offset: -76 });
     else target.scrollIntoView({ behavior: 'smooth' });
   });
   
   /* ---------- Inisialisasi ---------- */
   (async function main() {
     try {
       addEventListener('scroll', () => {
         const h = $('#header');
         if (h) h.classList.toggle('scrolled', scrollY > 8);
       }, { passive: true });
   
       let rT;
       addEventListener('resize', () => {
         clearTimeout(rT);
         rT = setTimeout(() => ADA_GSAP && ScrollTrigger.refresh(), 250);
       });
   
       const DATA = await muatData();
       window._lastJson = JSON.stringify(DATA);
       renderSemua(DATA);
   
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
