const d = await setupHalaman('Fasilitas Warga');
$('#rootHal').innerHTML = `
  <iframe src="https://www.google.com/maps/d/u/0/embed?mid=1_opObY1kFOyctMgN6jrozmqhc3j5bLg&ehbc=2E312F"
          title="Peta Wilayah & Fasilitas RW 013 (My Maps)" class="mb-10 h-[420px] w-full rounded-2xl border md:h-[520px]"
          style="border-color:var(--line)" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
  <p class="mb-6 text-sm" style="opacity:.6">Batas wilayah & titik fasilitas terintegrasi dalam peta My Maps di atas.</p>
  <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    ${(d.fasilitas || []).map((f) => `
    <div class="kartu kartu-hover p-6">
      <b class="block text-lg" style="color:var(--heading)">${f.nama}</b>
      <span class="mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
            style="background:color-mix(in srgb, var(--accent) 14%, transparent); color:var(--accent-text)">${f.jenis}</span>
      <p class="mt-2 text-sm" style="opacity:.7">${f.alamat}</p>
    </div>`).join('')}
  </div>`;