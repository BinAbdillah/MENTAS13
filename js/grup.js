const JUDUL = { 'pkk.html': ['TP PKK RW 013', 0], 'karangtaruna.html': ['Karang Taruna Unit 13', 1], 'lmk.html': ['LMK', 2] };
const cur = (location.pathname.split('/').pop() || '').toLowerCase();
const [judul, idx] = JUDUL[cur] || ['Mitra', 0];
const d = await setupHalaman(judul);
const m = (d.mitra || [])[idx] || {};
const linkKontak = (k) => k ? (/^08/.test(k) ? `https://wa.me/62${k.replace(/^0/, '')}` : `tel:${k}`) : '';
$('#rootHal').innerHTML = `
  ${m.foto ? `<img src="${m.foto}" alt="${m.nama}" class="mb-8 w-full rounded-2xl object-cover" style="max-height:340px" onerror="this.remove()">` : ''}
  <p class="max-w-3xl text-base md:text-lg" style="opacity:.8">${m.deskripsi || ''}</p>
  <div class="mt-10 grid gap-10 md:grid-cols-2">
    <div>
      <h2 class="mb-4 text-2xl font-extrabold" style="color:var(--heading)">Program Kerja</h2>
      <div class="flex flex-wrap gap-2">
        ${(m.program || []).length ? m.program.map((p) => `<span class="rounded-full px-4 py-2 text-sm font-semibold"
          style="background:color-mix(in srgb, var(--accent) 14%, transparent); color:var(--accent-text)">${p}</span>`).join('')
          : '<span class="nilai-kosong">Belum diisi</span>'}
      </div>
      ${m.kontak ? `<a href="${linkKontak(m.kontak)}" class="mt-6 inline-block rounded-full px-6 py-3 text-sm font-bold"
         style="background:var(--accent); color:var(--on-accent)">Hubungi ${m.nama}</a>` : ''}
    </div>
    <div>
      <h2 class="mb-4 text-2xl font-extrabold" style="color:var(--heading)">Susunan Pengurus</h2>
      ${(m.struktur || []).map((p) => { const o = orangHal(p); return `
        <div class="flex items-center justify-between border-b py-3 text-base last:border-0" style="border-color:var(--line-soft)">
          <span style="opacity:.7">${p.jabatan}</span>
          <b class="flex items-center gap-2.5 ${ada(o.nama) ? '' : 'nilai-kosong'}">${namaAtau(o.nama)} ${avatarHal(o.nama, o.foto)}</b>
        </div>`; }).join('')}
    </div>
  </div>`;