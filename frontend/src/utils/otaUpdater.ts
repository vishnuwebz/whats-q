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

  // 3. Clear any update snooze or dismiss flags from localStorage
  try {
    localStorage.removeItem('whatsq_update_snooze');
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('whatsq_update_dismissed_') || key.startsWith('whatsq_ota_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.warn('[OTA Update] LocalStorage cleanup warning:', err);
  }

  // 4. Force browser navigation with unique cache-busting query parameter
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
  }, 250);
}

// Module-level tracking variables
let initialScriptSrc: string | null = null;
let initialBuildCommit: string | null = null;
let initialBuildTimestamp: number | null = null;
let otaIntervalTimer: any = null;
let countdownIntervalTimer: any = null;
let isUpdaterInitialized = false;

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

  // Strategy 1: Check /version.json generated during build / deploy
  try {
    const res = await fetch(`/version.json?${cacheBuster}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && (data.commit || data.timestamp)) {
        if (!initialBuildCommit && data.commit) {
          initialBuildCommit = data.commit;
        }
        if (!initialBuildTimestamp && data.timestamp) {
          initialBuildTimestamp = data.timestamp;
        }

        // Check if commit changed
        const currentRunningCommit = store.versionInfo?.current_commit || initialBuildCommit;
        const isNewCommit = data.commit && currentRunningCommit && data.commit !== currentRunningCommit;
        const isNewTimestamp = data.timestamp && initialBuildTimestamp && (data.timestamp > initialBuildTimestamp + 5000);

        if (isNewCommit || isNewTimestamp) {
          console.log(`[OTA Update] New deployment detected via /version.json! Active: ${currentRunningCommit} -> Remote: ${data.commit}`);
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
      const match = htmlText.match(/<script[^>]+src=["']([^"']+\/assets\/index-[^"']+\.js)["']/i);
      if (match && match[1]) {
        const remoteScriptSrc = match[1];
        if (initialScriptSrc && remoteScriptSrc !== initialScriptSrc) {
          console.log(`[OTA Update] New deployment detected via index.html bundle hash! Current: ${initialScriptSrc} -> New: ${remoteScriptSrc}`);
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

  // 1. Capture initial script src from DOM
  initialScriptSrc = getCurrentScriptSrc();

  // 2. Read initial version.json if available
  fetch(`/version.json?_init=${Date.now()}`, { cache: 'no-store' })
    .then((r) => r.ok ? r.json() : null)
    .then((data) => {
      if (data) {
        initialBuildCommit = data.commit || null;
        initialBuildTimestamp = data.timestamp || null;
      }
    })
    .catch(() => {});

  // 3. Setup window event listeners (visibilitychange & focus)
  const onWindowFocusOrVisible = () => {
    if (document.visibilityState === 'visible') {
      checkForDeploymentUpdate();
    }
  };

  window.addEventListener('visibilitychange', onWindowFocusOrVisible);
  window.addEventListener('focus', onWindowFocusOrVisible);

  // 4. Periodic polling every 20 seconds
  otaIntervalTimer = setInterval(() => {
    checkForDeploymentUpdate();
  }, 20000);

  // 5. Initial check after 3 seconds of bootup
  setTimeout(() => {
    checkForDeploymentUpdate();
  }, 3000);

  // Cleanup handler
  return () => {
    isUpdaterInitialized = false;
    window.removeEventListener('visibilitychange', onWindowFocusOrVisible);
    window.removeEventListener('focus', onWindowFocusOrVisible);
    if (otaIntervalTimer) clearInterval(otaIntervalTimer);
    if (countdownIntervalTimer) clearInterval(countdownIntervalTimer);
  };
}
