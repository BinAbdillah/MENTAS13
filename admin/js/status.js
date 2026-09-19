(() => {
  const DRAFT_KEY = 'rw13_draft';
  const byId = (id) => document.getElementById(id);
  const hasFirebaseConfig = () => {
    const cfg = window.FIREBASE_CONFIG;
    return !!(cfg && cfg.apiKey && cfg.databaseURL);
  };

  const state = {
    online: navigator.onLine,
    firebaseReady: hasFirebaseConfig(),
    syncing: false,
  };

  function hasDraft() {
    try { return !!localStorage.getItem(DRAFT_KEY); } catch (_) { return false; }
  }

  function setButton(id, enabled) {
    const button = byId(id);
    if (!button) return;
    button.disabled = !enabled;
    button.setAttribute('aria-disabled', String(!enabled));
  }

  function refresh() {
    const status = byId('statusAuth');
    if (!status) return;

    state.online = navigator.onLine;
    state.firebaseReady = hasFirebaseConfig();
    const draftPending = hasDraft();

    if (!state.online) {
      status.textContent = '🔴 Offline — draft lokal aktif';
      status.dataset.state = 'offline';
      setButton('btnSync', false);
      setButton('btnTerbitkan', false);
      setButton('btnSimpan', false);
      setButton('btnMigrasi', false);
      setButton('btnSimpanDraft', true);
      setButton('btnPreview', true);
      return;
    }

    if (!state.firebaseReady) {
      status.textContent = '🟡 Online — Firebase belum siap';
      status.dataset.state = 'warning';
      setButton('btnSync', false);
      setButton('btnTerbitkan', false);
      setButton('btnSimpan', false);
      setButton('btnMigrasi', false);
      setButton('btnSimpanDraft', true);
      setButton('btnPreview', true);
      return;
    }

    if (state.syncing) {
      status.textContent = '🔄 Online — sedang menyinkronkan';
      status.dataset.state = 'syncing';
    } else if (draftPending) {
      status.textContent = '🟠 Online — sinkronisasi pending';
      status.dataset.state = 'pending';
    } else {
      status.textContent = '🟢 Online — siap sinkron';
      status.dataset.state = 'online';
    }

    // The actual auth handler in admin.js remains the final security gate.
    setButton('btnSync', !state.syncing && draftPending);
    setButton('btnTerbitkan', !state.syncing);
    setButton('btnSimpan', !state.syncing);
    setButton('btnMigrasi', !state.syncing);
    setButton('btnSimpanDraft', true);
    setButton('btnPreview', true);
  }

  function setSyncing(value) {
    state.syncing = !!value;
    refresh();
  }

  window.__adminStatus = { state, refresh, setSyncing };

  addEventListener('online', refresh);
  addEventListener('offline', refresh);
  addEventListener('focus', refresh);
  document.addEventListener('visibilitychange', refresh);
  addEventListener('storage', (event) => {
    if (event.key === DRAFT_KEY) refresh();
  });

  // Observe dynamically-created action buttons without polling.
  new MutationObserver(refresh).observe(document.body, { childList: true, subtree: true });

  refresh();
})();
