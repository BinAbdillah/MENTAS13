/* =========================================================
   grup.js — REFACTOR v1: PKK / Karang Taruna / LMK
   LMK 1 orang = kartu tunggal • linkKontak dari utils
   ========================================================= */
   const JUDUL = {
    'pkk.html': ['TP PKK RW 013', 0],
    'karangtaruna.html': ['Karang Taruna Unit 13', 1],
    'lmk.html': ['LMK', 2]
  };
  const cur = (location.pathname.split('/').pop() || '').toLowerCase();
  const [judul, idx] = JUDUL[cur] || ['Mitra', 0];
  const d = await setupHalaman(judul);
  const m = (d.mitra || [])[idx];
  
  if (!m) {
    $('#rootHal').innerHTML = `
      <div class="kartu mx-auto max-w-md p-10 text-center">
        <b class="block text-lg" style="color:var(--heading)">Data belum tersedia</b>
        <p class="mt-2 text-base" style="opacity:.7">Lengkapi lewat halaman admin.</p>
      </div>`;
  } else {
    const struktur = m.struktur || [];
    const tunggal = struktur.length <= 1;
    const satu = tunggal ? orangHal(struktur[0]) : null;
  
    $('#rootHal').innerHTML = `
      ${m.foto ? `<img src="${m.foto}" alt="${m.nama}" class="mb-8 w-full rounded-2xl object-cover" style="max-height:340px" onerror="this.remove()">` : ''}
      <p class="max-w-3xl text-base md:text-lg" style="opacity:.8">${m.deskripsi || ''}</p>
  
      <div class="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <h2 class="mb-4 text-2xl font-extrabold" style="color:var(--heading)">Program Kerja</h2>
          <div class="flex flex-wrap gap-2">
            ${(m.program || []).length
              ? (m.program || []).map((p) => `<span class="rounded-full px-4 py-2 text-sm font-semibold"
                 style="background:color-mix(in srgb, var(--accent) 14%, transparent); color:var(--accent-text)">${p}</span>`).join('')
              : '<span class="nilai-kosong">Belum diisi</span>'}
          </div>
          ${m.kontak ? `<a href="${linkKontak(m.kontak)}" class="mt-6 inline-block rounded-full px-6 py-3 text-sm font-bold"
             style="background:var(--accent); color:var(--on-accent)">Hubungi ${m.nama}</a>` : ''}
        </div>
  
        ${tunggal ? `
        <div>
          <div class="kartu p-8 text-center">
            ${avatarHal(satu.nama, satu.foto, 'h-24 w-24', 'bg-slate-100 text-slate-500', 'text-3xl')}
            <b class="mt-4 block text-xl" style="color:var(--heading)">${namaAtau(satu.nama)}</b>
            <span class="text-sm" style="opacity:.7">${struktur[0] ? struktur[0].jabatan : 'Penanggung jawab'}</span>
          </div>
        </div>` : `
        <div>
          <h2 class="mb-4 text-2xl font-extrabold" style="color:var(--heading)">Susunan Pengurus</h2>
          ${struktur.map((p) => {
            const o = orangHal(p);
            return `
            <div class="flex items-center justify-between border-b py-3 text-base last:border-0" style="border-color:var(--line-soft)">
              <span style="opacity:.7">${p.jabatan || ''}</span>
              <b class="flex items-center gap-2.5 ${ada(o.nama) ? '' : 'nilai-kosong'}">
                ${namaAtau(o.nama)} ${avatarHal(o.nama, o.foto)}
              </b>
            </div>`;
          }).join('')}
        </div>`}
      </div>`;
  }