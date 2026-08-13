/* struktur.js — penasehat, pengurus RW, bidang (aman data bolong) */
const d = await setupHalaman('Struktur Organisasi');
const s = d.strukturRW || { inti: [], seksi: [] };

$('#rootHal').innerHTML = `
  <h2 class="mb-6 text-2xl font-extrabold" style="color:var(--heading)">Penasehat RW</h2>
  <div class="grid grid-cols-2 gap-4 sm:grid-cols-5">
    ${(d.penasehat || []).map((p, i) => { const o = orangHal(p); return `
    <div class="kartu kartu-hover p-5 text-center">
      <span class="mx-auto block w-fit">${avatarHal(o.nama, o.foto, 'h-14 w-14', 'bg-slate-100 text-slate-500', 'text-lg')}</span>
      <b class="mt-3 block text-base ${ada(o.nama) ? '' : 'nilai-kosong'}">${namaAtau(o.nama)}</b>
      <span class="text-sm" style="opacity:.6">Penasehat ${i + 1}</span>
    </div>`; }).join('')}
  </div>

  <h2 class="mb-6 mt-12 text-2xl font-extrabold" style="color:var(--heading)">Pengurus RW</h2>
  <div class="grid gap-5 sm:grid-cols-3">
    ${(s.inti || []).map((p, i) => `
    <div class="kartu kartu-hover p-6 text-center ${i === 0 ? 'ring-2 ring-emerald-500' : ''}">
      <span class="mx-auto block w-fit">${avatarHal(p.nama, p.foto, 'h-16 w-16', i === 0 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700', 'text-xl')}</span>
      <b class="mt-3 block text-lg" style="color:var(--heading)">${namaAtau(p.nama)}</b>
      <span class="mt-1 block text-sm" style="opacity:.6">${p.jabatan}</span>
    </div>`).join('')}
  </div>

  <h2 class="mb-6 mt-12 text-2xl font-extrabold" style="color:var(--heading)">Bidang-Bidang</h2>
  <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
    ${(s.seksi || []).map((sk) => `
    <div class="kartu kartu-hover p-6">
      <b class="block text-base" style="color:var(--heading)">${sk.nama}</b>
      <div class="mt-3 flex flex-wrap gap-2">
        ${(sk.anggota || []).length
          ? (sk.anggota || []).map((a) => { const o = orangHal(a); return `
            <span class="flex items-center gap-1.5 rounded-full bg-emerald-600/10 py-1 pl-1 pr-3 text-sm font-medium text-emerald-700">
              ${avatarHal(o.nama, o.foto, 'h-6 w-6', 'bg-emerald-600/20 text-emerald-700', 'text-[10px]')}${o.nama}
            </span>`; }).join('')
          : '<span class="nilai-kosong text-sm">Belum diisi</span>'}
      </div>
    </div>`).join('')}
  </div>`;