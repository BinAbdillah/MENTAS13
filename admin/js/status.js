(() => {
  const state = {
    online: navigator.onLine,
    firebaseReady: !!(window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey && window.FIREBASE_CONFIG.databaseURL),
    syncPending: false,
  };

  const byId = (id) => document.getElementById(id);

  function refresh() {
    const auth = byId('statusAuth');
    const btnSync = byId('btnSync');
    const btnTerbitkan = byId('btnTerbitkan');
    const btnSimpan = byId('btnSimpan');
    const btnMigrasi = byId('btnMigrasi');
    const btnPreview = byId('btnPreview');
    const btnSimpanDraft = byId('btnSimpanDraft');

    if (!auth) return;

    const localDraftExists = !!localStorage.getItem('rw13_draft');

    if (!state.online) {
      auth.textContent = 'Offline — draft lokal aktif';
      auth.dataset.state = 'offline';
      if (btnSync) btnSync.disabled = true;
      if (btnTerbitkan) btnTerbitkan.disabled = true;
      if (btnSimpan) btnSimpan.disabled = true;
      if (btnMigrasi) btnMigrasi.disabled = true;
      if (btnPreview) btnPreview.disabled = false;
      if (btnSimpanDraft) btnSimpanDraft.disabled = false;
      return;
    }

    if (!state.firebaseReady) {
      auth.textContent = 'Online — Firebase belum siap';
      auth.dataset.state = 'warning';
      if (btnSync) btnSync.disabled = true;
      if (btnTerbitkan) btnTerbitkan.disabled = true;
      if (btnSimpan) btnSimpan.disabled = true;
      if (btnMigrasi) btnMigrasi.disabled = true;
      if (btnPreview) btnPreview.disabled = false;
      if (btnSimpanDraft) btnSimpanDraft.disabled = false;
      return;
    }

    if (state.syncPending || localDraftExists) {
      auth.textContent = 'Online — sinkronisasi pending';
      auth.dataset.state = 'sync';
    } else {
      auth.textContent = 'Online — siap sinkron';
      auth.dataset.state = 'online';
    }

    if (btnSync) btnSync.disabled = false;
    if (btnTerbitkan) btnTerbitkan.disabled = false;
    if (btnSimpan) btnSimpan.disabled = false;
    if (btnMigrasi) btnMigrasi.disabled = false;
    if (btnPreview) btnPreview.disabled = false;
    if (btnSimpanDraft) btnSimpanDraft.disabled = false;
  }

  function setSyncPending(value) {
    state.syncPending = !!value;
    refresh();
  }

  window.__adminStatus = {
    state,
    refresh,
    setSyncPending,
    setFirebaseReady(value) {
      state.firebaseReady = !!value;
      refresh();
    },
  };

  window.addEventListener('online', refresh);
  window.addEventListener('offline', refresh);
  window.addEventListener('storage', (event) => {
    if (event.key === 'rw13_draft') {
      state.syncPending = !!localStorage.getItem('rw13_draft');
      refresh();
    }
  });
  document.addEventListener('visibilitychange', refresh);
  document.addEventListener('DOMContentLoaded', refresh, { once: true });

  state.syncPending = !!localStorage.getItem('rw13_draft');
  refresh();
})();
