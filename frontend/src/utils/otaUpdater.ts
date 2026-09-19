import { useQiyamStore, VersionInfo } from '../store/useQiyamStore';

/**
 * Forcefully hard-refreshes the application:
 * 1. Purges all browser CacheStorage
 * 2. Unregisters all active ServiceWorkers
 * 3. Clears stale update snooze and dismiss keys from localStorage
 * 4. Busts browser HTTP/disk cache via query param and window.location.replace
 */
export async function forceHardRefresh(reason = 'OTA Deployment Update'): Promise<void> {
  console.log(`[OTA Update] Initiating forceful hard refresh. Reason: ${reason}`);

  // 1. Purge all browser CacheStorage
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      console.log(`[OTA Update] Cleared ${keys.length} CacheStorage entries.`);
    } catch (err) {
      console.warn('[OTA Update] CacheStorage clearing error:', err);
    }
  }

  // 2. Unregister all active Service Workers
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
      console.log(`[OTA Update] Unregistered ${registrations.length} ServiceWorker instances.`);
    } catch (err) {
      console.warn('[OTA Update] ServiceWorker unregister error:', err);
    }
  }

  // 3. Clear temporary update snooze or dismiss flags from localStorage
  //    IMPORTANT: Do NOT delete whatsq_acknowledged_commit or whatsq_last_hard_refresh_time!
  try {
    localStorage.removeItem('whatsq_update_snooze');
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('whatsq_update_dismissed_') ||
          (key.startsWith('whatsq_ota_') && key !== 'whatsq_ota_just_refreshed'))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.warn('[OTA Update] LocalStorage cleanup warning:', err);
  }

  // 4. Stamp acknowledged commit and just-refreshed marker so the reloaded page suppresses
  //    spurious re-detection of the release the user just hard-refreshed for.
  try {
    const store = useQiyamStore.getState();
    const targetCommit =
      store.versionInfo?.latest_commit ||
      store.versionInfo?.current_commit ||
      getInitialBuildCommit() ||
      '';
    if (store.activeTab) {
      localStorage.setItem('whatsq_last_active_tab', store.activeTab);
    }
    if (targetCommit) {
      localStorage.setItem('whatsq_acknowledged_commit', targetCommit);
    }
    localStorage.setItem('whatsq_last_hard_refresh_time', Date.now().toString());
    localStorage.setItem(
      'whatsq_ota_just_refreshed',
      JSON.stringify({
        ts: Date.now(),
        commit: targetCommit,
      })
    );
  } catch { /* non-fatal */ }

  // 5. Force browser navigation with unique cache-busting query parameter
  try {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('_ota_refresh', Date.now().toString());
    window.location.replace(currentUrl.toString());
  } catch {
    window.location.reload();
  }

  // Fallback in case location.replace does not trigger an immediate hard document reload
  setTimeout(() => {
    window.location.reload();
  }, 1500);
}

// Module-level tracking variables
let initialScriptSrc: string | null = null;
let initialBuildCommit: string | null = null;
let initialBuildTimestamp: number | null = null;
let otaIntervalTimer: any = null;
let countdownIntervalTimer: any = null;
let isUpdaterInitialized = false;
/** Set to true once we've already triggered the update modal this session */
let updateAlreadyTriggered = false;

/** Returns the commit hash embedded in this page's loaded JS bundle. */
export function getInitialBuildCommit(): string | null {
  return initialBuildCommit;
}

/**
 * Extracts the primary entry bundle script src from the document
 */
function getCurrentScriptSrc(): string | null {
  if (typeof document === 'undefined') return null;
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  for (const script of scripts) {
    const src = script.getAttribute('src') || '';
    if (src.includes('/assets/index-') || src.includes('/src/main.tsx') || src.includes('index')) {
      return src;
    }
  }
  return null;
}

/**
 * Checks /version.json and /index.html for deployment changes
 */
export async function checkForDeploymentUpdate(): Promise<boolean> {
  const store = useQiyamStore.getState();
  const cacheBuster = `_ota=${Date.now()}`;

  // ── Guard: do not re-trigger if the update modal is already showing ──
  if (store.isUpdateModalOpen) {
    return true; // Update already detected and displayed
  }

  const acknowledgedCommit = typeof window !== 'undefined' ? localStorage.getItem('whatsq_acknowledged_commit') : null;
  const lastRefreshTime = typeof window !== 'undefined' ? Number(localStorage.getItem('whatsq_last_hard_refresh_time') || '0') : 0;
  const justRefreshedRecently = Date.now() - lastRefreshTime < 180000;

  // Strategy 1: Check /version.json generated during build / deploy
  try {
    const res = await fetch(`/version.json?${cacheBuster}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && (data.commit || data.timestamp)) {
        // Capture the running commit on first successful read (page boot baseline)
        if (!initialBuildCommit && data.commit) {
          initialBuildCommit = data.commit;
        }
        if (!initialBuildTimestamp && data.timestamp) {
          initialBuildTimestamp = data.timestamp;
        }

        const isAcknowledged = !!(
          data.commit &&
          acknowledgedCommit &&
          (data.commit === acknowledgedCommit ||
            acknowledgedCommit.startsWith(data.commit) ||
            data.commit.startsWith(acknowledgedCommit))
        );

        if (isAcknowledged || (justRefreshedRecently && acknowledgedCommit)) {
          return false;
        }

        // ── Always compare against the module-level initialBuildCommit ──
        const currentRunningCommit = initialBuildCommit;
        const isNewCommit = !!(data.commit && currentRunningCommit && data.commit !== currentRunningCommit);
        const isNewTimestamp =
          !!(data.timestamp && initialBuildTimestamp && data.timestamp > initialBuildTimestamp + 5000);

        if (isNewCommit || isNewTimestamp) {
          if (updateAlreadyTriggered) {
            // Already triggered once this session; skip re-trigger
            return true;
          }
          console.log(`[OTA Update] New deployment detected via /version.json! Active: ${currentRunningCommit} -> Remote: ${data.commit}`);
          updateAlreadyTriggered = true;
          store.triggerOtaDeploymentUpdate({
            latest_commit: data.commit || 'latest',
            latest_message: data.message || 'New production release deployed to origin/main',
            latest_author: data.author || 'WhatsQ Core Team',
            latest_date: data.date || 'Just now',
            update_available: true,
          });
          return true;
        }
      }
    }
  } catch (err) {
    // Non-fatal, proceed to next strategies
  }

  // Strategy 2: Check /index.html bundle chunk hash
  try {
    const htmlRes = await fetch(`/index.html?${cacheBuster}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    });

    if (htmlRes.ok) {
      const htmlText = await htmlRes.text();
      // Match <script ... src="(/assets/index-[a-zA-Z0-9_-]+\.js)">
      const match = htmlText.match(/<script[^>]+src=["']([^"']+\/assets\/index-[^"']+\.js)['"]/i);
      if (match && match[1]) {
        const remoteScriptSrc = match[1];
        if (initialScriptSrc && remoteScriptSrc !== initialScriptSrc && !updateAlreadyTriggered) {
          console.log(`[OTA Update] New deployment detected via index.html bundle hash! Current: ${initialScriptSrc} -> New: ${remoteScriptSrc}`);
          updateAlreadyTriggered = true;
          store.triggerOtaDeploymentUpdate({
            latest_commit: 'new',
            latest_message: 'New production build bundle compiled and deployed',
            update_available: true,
          });
          return true;
        }
      }
    }
  } catch (err) {
    // Non-fatal
  }

  // Strategy 3: Check backend system-version endpoint with force=true
  try {
    await store.fetchVersionInfo(true);
  } catch {}

  return false;
}

/**
 * Starts the countdown timer for automatic forceful hard-refresh
 */
export function startOtaCountdown(durationSeconds = 5): void {
  const store = useQiyamStore.getState();

  // If countdown already active, don't restart unless requested
  if (countdownIntervalTimer) {
    clearInterval(countdownIntervalTimer);
    countdownIntervalTimer = null;
  }

  store.setOtaCountdown(durationSeconds);

  countdownIntervalTimer = setInterval(() => {
    const current = useQiyamStore.getState().otaCountdown;
    if (current === null || current <= 1) {
      clearInterval(countdownIntervalTimer);
      countdownIntervalTimer = null;
      useQiyamStore.getState().setOtaCountdown(0);
      // Auto-trigger forceful hard refresh
      forceHardRefresh('Automatic countdown timer expired');
    } else {
      useQiyamStore.getState().setOtaCountdown(current - 1);
    }
  }, 1000);
}

/**
 * Pauses or cancels the automatic countdown timer
 */
export function stopOtaCountdown(): void {
  if (countdownIntervalTimer) {
    clearInterval(countdownIntervalTimer);
    countdownIntervalTimer = null;
  }
  useQiyamStore.getState().setOtaCountdown(null);
}

/**
 * Initializes the OTA deployment listener & polling daemon
 */
export function initOtaUpdater(): () => void {
  if (typeof window === 'undefined' || isUpdaterInitialized) {
    return () => {};
  }
  isUpdaterInitialized = true;
  updateAlreadyTriggered = false;

  // 0. Clean up any _ota_refresh query parameter from the URL cleanly
  if (typeof window !== 'undefined' && window.location.search.includes('_ota_refresh')) {
    try {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('_ota_refresh');
      window.history.replaceState(null, '', cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : '') + cleanUrl.hash);
    } catch {}
  }

  // 1. Capture initial script src from DOM
  initialScriptSrc = getCurrentScriptSrc();

  // 2. Read initial version.json if available — establishes the page's baseline commit
  fetch(`/version.json?_init=${Date.now()}`, { cache: 'no-store' })
    .then((r) => r.ok ? r.json() : null)
    .then((data) => {
      if (data) {
        initialBuildCommit = data.commit || null;
        initialBuildTimestamp = data.timestamp || null;
        console.log(`[OTA Update] Baseline commit set from version.json: ${initialBuildCommit}`);
      }
    })
    .catch(() => {});

  // 3. Check for the "just-refreshed" marker set by forceHardRefresh().
  //    If present and recent (<30s), delay the first check to let version.json
  //    settle and to avoid spuriously re-detecting the update we just applied.
  let initialCheckDelay = 3000; // default: check after 3s
  try {
    const raw = localStorage.getItem('whatsq_ota_just_refreshed');
    if (raw) {
      const parsed = JSON.parse(raw);
      const age = Date.now() - (parsed.ts || 0);
      if (age < 30000) {
        // We refreshed less than 30 seconds ago — give the new build time to settle
        initialCheckDelay = Math.max(6000, 30000 - age);
        console.log(`[OTA Update] Just-refreshed marker found (${age}ms ago). Delaying first check by ${initialCheckDelay}ms.`);
      }
      // Only remove if older than 60 seconds so ongoing boot cycles can read it
      if (age > 60000) {
        localStorage.removeItem('whatsq_ota_just_refreshed');
      }
    }
  } catch { /* non-fatal */ }

  // 4. Setup window event listeners (visibilitychange & focus)
  const onWindowFocusOrVisible = () => {
    if (document.visibilityState === 'visible') {
      checkForDeploymentUpdate();
    }
  };

  window.addEventListener('visibilitychange', onWindowFocusOrVisible);
  window.addEventListener('focus', onWindowFocusOrVisible);

  // 5. Periodic polling every 20 seconds
  otaIntervalTimer = setInterval(() => {
    checkForDeploymentUpdate();
  }, 20000);

  // 6. Initial check after delay (3s normally, up to 20s after a fresh OTA refresh)
  setTimeout(() => {
    checkForDeploymentUpdate();
  }, initialCheckDelay);

  // Cleanup handler
  return () => {
    isUpdaterInitialized = false;
    window.removeEventListener('visibilitychange', onWindowFocusOrVisible);
    window.removeEventListener('focus', onWindowFocusOrVisible);
    if (otaIntervalTimer) clearInterval(otaIntervalTimer);
    if (countdownIntervalTimer) clearInterval(countdownIntervalTimer);
  };
}
