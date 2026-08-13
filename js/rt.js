const d = await setupHalaman('Pengurus RT 001–009');
const URUTAN = ['Ketua', 'Sekretaris', 'Bendahara', 'Bank Sampah'];
$('#rootHal').innerHTML = `
  <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    ${(d.rt || []).map((r) => {
      const keys = Object.keys(r.pengurus || {});
      const urut = URUTAN.filter((k) => keys.includes(k)).concat(keys.filter((k) => !URUTAN.includes(k)));
      const s = r.statistik || {};
      return `
      <div class="kartu p-6">
        <div class="flex items-center justify-between">
          <span class="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white">RT ${r.no}</span>
          <span class="text-sm" style="opacity:.6">${s.jiwa ? s.jiwa + ' jiwa • ' + s.kk + ' KK' : ''}</span>
        </div>
        <div class="mt-4">
          ${urut.map((jab) => { const o = orangHal(r.pengurus[jab]); return `
          <div class="flex items-center justify-between gap-3 border-b py-2.5 text-base last:border-0" style="border-color:var(--line-soft)">
            <span style="opacity:.6">${jab}</span>
            <b class="flex items-center gap-2.5 ${ada(o.nama) ? '' : 'nilai-kosong'}">${namaAtau(o.nama)} ${avatarHal(o.nama, o.foto)}</b>
          </div>`; }).join('')}
        </div>
      </div>`;
    }).join('')}
  </div>`;