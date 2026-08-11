/* =========================================================
   app.js — pin ronda MANDIRI (tak bergantung utils) +
   default tim TEBO/MONCOS bila data belum ada
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

/* ---------- RONDA mandiri (default sesuai jadwal AGST'26) ---------- */
const RONDA_DEFAULT = {
  aktif: true, mulai: '2026-07-30', polahari: 3,
  tim: [ { nama: 'TEBO', anggota: [] }, { nama: 'MONCOS', anggota: [] } ],
  jadwal: []
};
const isoL = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function timRonda(r, iso) {
  if (!r || !(r.tim || []).length) return null;
  if (Array.isArray(r.jadwal) && r.jadwal.length) {
    const hit = r.jadwal.find((j) => j.tanggal === iso);
    if (hit) return r.tim.find((t) => t.nama === hit.tim) || { nama: hit.tim, anggota: [] };
  }
  const mulai = new Date((r.mulai || '2026-07-30') + 'T00:00:00');
  const now = new Date(iso + 'T00:00:00');
  const d = Math.floor((now - mulai) / 86400000);
  const pol = Math.max(1, r.polahari || 3);
  const idx = ((Math.floor(d / pol) % r.tim.length) + r.tim.length) % r.tim.length;
  return r.tim[idx];
}

function jalankanReveal() {
  const els = document.querySelectorAll('.reveal');
  if (REDUCED || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('on'));
    return;
  }
  document.documentElement.classList.add('fx');
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
  }), { threshold: .12 });
  els.forEach((el) => io.observe(el));
}

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

    if (document.querySelector('#hero .huruf')) {
      gsap.from('#hero .huruf', { yPercent: 120, opacity: 0, stagger: .03, duration: .9, ease: 'power4.out', delay: .1 });
    }

    gsap.utils.toArray('.mask-line').forEach((el) => {
      gsap.fromTo(el, { yPercent: 115 }, {
        yPercent: 0, duration: 1, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    const wrap = $('#fasWrap'), track = $('#fasTrack');
    if (wrap && track && window.matchMedia('(min-width: 1024px)').matches) {
      const jarak = () => Math.max(0, track.scrollWidth - window.innerWidth);
      gsap.to(track, {
        x: () => -jarak(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrap, start: 'top 110', end: () => '+=' + jarak(),
          pin: true, scrub: 1, invalidateOnRefresh: true,
          onUpdate: (self) => {
            const v = self.getVelocity();
            gsap.to(track, { skewY: gsap.utils.clamp(-4, 4, v / 400), duration: .4, ease: 'power2.out', overwrite: 'auto' });
          }
        }
      });
      gsap.from(track.children, {
        y: 60, opacity: 0, stagger: .08, duration: .8, ease: 'power3.out',
        scrollTrigger: { trigger: wrap, start: 'top 70%' }
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
    console.warn('Efek scroll dinonaktifkan:', e);
  }
}

function normalisasi(d) {
  d = d || {};
  d.identitas = d.identitas || {};
  d.identitas.sosmed = d.identitas.sosmed || {};
  d.tema = d.tema || { preset: 'garuda', custom: {} };

  // ronda: bila belum ada / tim kosong → pakai default AGST'26
  d.ronda = d.ronda || {};
  d.ronda.aktif = d.ronda.aktif !== false;
  d.ronda.mulai = d.ronda.mulai || RONDA_DEFAULT.mulai;
  d.ronda.polahari = d.ronda.polahari || RONDA_DEFAULT.polahari;
  d.ronda.tim = (d.ronda.tim && d.ronda.tim.length) ? d.ronda.tim : RONDA_DEFAULT.tim;
  d.ronda.jadwal = d.ronda.jadwal || [];

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
  d.mitra.forEach((m) => { m.struktur = m.struktur || []; m.program = m.program || []; });
  d.agenda = d.agenda || [];
  d.pengumuman = d.pengumuman || [];
  d.galeri = d.galeri || [];
  d.layanan = d.layanan || [];
  d.kontakDarurat = d.kontakDarurat || [];
  d.umkm = d.umkm || [];
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

/* ---------- PIN RONDA kiri-bawah ---------- */
function renderPinRonda(d) {
  let host = $('#pin-ronda');
  const r = d.ronda;
  if (!r || r.aktif === false) { if (host) host.remove(); return; }

  const tim = timRonda(r, isoL(new Date()));
  if (!tim) { if (host) host.remove(); return; }

  const nama = (tim.anggota || []).filter(Boolean).join(', ');
  const tgl = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  if (!host) {
    host = document.createElement('div');
    host.id = 'pin-ronda';
    document.body.appendChild(host);
  }
  host.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="grid h-10 w-10 flex-none place-items-center rounded-full text-xl" style="background:var(--accent-soft)">🌙</span>
      <div class="min-w-0">
        <span class="block text-[11px] uppercase tracking-widest" style="opacity:.65">Petugas Ronda Hari Ini</span>
        <b class="block text-sm" style="color:var(--heading)">${nama || ('Tim ' + tim.nama)}</b>
        <span class="block text-[11px]" style="opacity:.6">${tgl} • giliran ${tim.nama}</span>
      </div>
    </div>`;
}

function renderSemua(input) {
  const DATA = normalisasi(input);
  window.DATA = DATA;
  terapkanTema(DATA.tema);
  document.title = DATA.identitas.namaRW + ' — Website Resmi';
  renderBanner(DATA);
  renderPengumuman(DATA);
  renderHeader(DATA);
  renderHero(DATA);
  renderProfil(DATA);
  renderStruktur(DATA);
  renderAgenda(DATA);
  renderFasilitas(DATA);
  renderGaleri(DATA);
  renderLayanan(DATA);
  renderUMKM(DATA);
  renderPetaCuaca(DATA);
  renderFooter(DATA);
  renderPinRonda(DATA);
  jalankanReveal();
  jalankanCounter();
  initEfek();
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

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id.length < 2) return;
  const target = document.querySelector(id);
  if (!target) return;
  e.preventDefault();
  if (lenis) lenis.scrollTo(target, { offset: -110 });
  else target.scrollIntoView({ behavior: 'smooth' });
});

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
          <b class="mt-3 block text-lg" style="color:var(--heading)">Gagal memuat data</b>
          <p class="mt-2 text-base" style="color:var(--teks)">
            Periksa koneksi, isi <code>js/firebase-config.js</code>,
            atau pastikan <code>data/data.json</code> ada.
          </p>
        </div>
      </section>`;
  }
})();
