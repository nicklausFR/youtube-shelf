function bodyBytes(body) {
  if (typeof body === "string") return new TextEncoder().encode(body).byteLength;
  if (body instanceof Blob) return body.size;
  if (body instanceof ArrayBuffer) return body.byteLength;
  if (ArrayBuffer.isView(body)) return body.byteLength;
  if (body instanceof URLSearchParams) return new TextEncoder().encode(body.toString()).byteLength;
  return 0;
}

function countedYouTubeRequest(input) {
  try {
    const rawUrl = input instanceof Request ? input.url : String(input);
    const url = new URL(rawUrl, globalThis.location?.href);
    return (url.protocol === "https:" || url.protocol === "http:")
      && (url.hostname === "youtube.com" || url.hostname.endsWith(".youtube.com"))
      && !/^\/(?:embed|videoplayback)(?:\/|$)/.test(url.pathname);
  } catch {
    return false;
  }
}

export function formatNetworkBytes(bytes, compact = false, locale = "en") {
  const value = Math.max(0, Number(bytes) || 0);
  const french = String(locale).toLowerCase().startsWith("fr");
  const units = compact
    ? french ? ["o", "K", "M", "G"] : ["B", "K", "M", "G"]
    : french ? ["o", "Ko", "Mo", "Go"] : ["B", "KB", "MB", "GB"];
  let amount = value;
  let unit = 0;
  while (amount >= 1024 && unit < units.length - 1) {
    amount /= 1024;
    unit += 1;
  }
  const digits = unit === 0 || amount >= 100 ? 0 : amount >= 10 ? 1 : 2;
  return `${amount.toFixed(digits).replace(/\.0+$|(\.\d*[1-9])0+$/, "$1")}${compact ? "" : " "}${units[unit]}`;
}

export function installNetworkMeter(options = {}) {
  const previousFetch = globalThis.fetch;
  const originalFetch = previousFetch.bind(globalThis);
  const youtubeFetch = typeof options.youtubeFetch === "function" ? options.youtubeFetch : originalFetch;
  const listeners = new Set();
  const storage = options.storage;
  const diagnosticsStorage = options.diagnosticsStorage;
  const diagnosticsKey = options.diagnosticsKey || "youtubeChannelShelfNetworkDiagnosticsV1";
  const diagnosticsDelayMs = Math.max(0, Number(options.diagnosticsDelayMs) || 1000);
  const diagnosticsHeartbeatMs = Math.max(1, Number(options.diagnosticsHeartbeatMs) || 30000);
  const externalActiveTimeoutMs = Math.max(1, Number(options.externalActiveTimeoutMs) || 120000);
  // V6 starts a clean baseline after making idle diagnostics time-based.
  const storageKey = "youtubeChannelShelfYouTubeSessionMetricsV6";
  let persistenceReady = !storage;
  let persistenceTimer = 0;
  let diagnosticsTimer = 0;
  let directActive = 0;
  let externalActive = 0;
  let externalActiveUpdatedAt = 0;
  const state = {
    startedAt: Date.now(),
    requests: 0,
    failures: 0,
    receivedBytes: 0,
    sentBytes: 0
  };

  function snapshot() {
    return {
      ...state,
      active: directActive + externalActive,
      totalBytes: state.receivedBytes + state.sentBytes
    };
  }

  function persistDiagnostics() {
    if (!diagnosticsStorage) return;
    Promise.resolve(diagnosticsStorage.set({
      [diagnosticsKey]: { ...snapshot(), savedAt: Date.now() }
    })).catch(() => {});
  }

  function expireStaleExternalActivity() {
    if (!externalActive || Date.now() - externalActiveUpdatedAt < externalActiveTimeoutMs) return false;
    externalActive = 0;
    externalActiveUpdatedAt = 0;
    return true;
  }

  function notify() {
    const value = snapshot();
    for (const listener of listeners) listener(value);
    if (persistenceReady && storage) {
      clearTimeout(persistenceTimer);
      persistenceTimer = setTimeout(() => {
        storage.set({
          [storageKey]: {
            startedAt: state.startedAt,
            requests: state.requests,
            failures: state.failures,
            receivedBytes: state.receivedBytes,
            sentBytes: state.sentBytes
          }
        });
      }, 200);
    }
    if (diagnosticsStorage) {
      clearTimeout(diagnosticsTimer);
      diagnosticsTimer = setTimeout(persistDiagnostics, diagnosticsDelayMs);
    }
  }

  const diagnosticsHeartbeatTimer = diagnosticsStorage ? setInterval(() => {
    if (expireStaleExternalActivity()) {
      const value = snapshot();
      for (const listener of listeners) listener(value);
    }
    persistDiagnostics();
  }, diagnosticsHeartbeatMs) : 0;
  diagnosticsHeartbeatTimer?.unref?.();

  if (storage) {
    storage.get(storageKey, (result) => {
      const saved = result?.[storageKey];
      if (saved && typeof saved === "object") {
        state.startedAt = Number(saved.startedAt) || state.startedAt;
        state.requests += Number(saved.requests) || 0;
        state.failures += Number(saved.failures) || 0;
        state.receivedBytes += Number(saved.receivedBytes) || 0;
        state.sentBytes += Number(saved.sentBytes) || 0;
      }
      persistenceReady = true;
      notify();
    });
  }

  const meteredFetch = async (input, options = {}) => {
    if (!countedYouTubeRequest(input)) return originalFetch(input, options);
    state.requests += 1;
    directActive += 1;
    state.sentBytes += bodyBytes(options.body);
    notify();
    try {
      const response = await youtubeFetch(input, options);
      const contentLength = Number.parseInt(response.headers.get("Content-Length") || "", 10);
      if (Number.isFinite(contentLength) && contentLength >= 0) {
        state.receivedBytes += contentLength;
        notify();
      } else {
        response.clone().arrayBuffer()
          .then((buffer) => {
            state.receivedBytes += buffer.byteLength;
            notify();
          })
          .catch(() => {});
      }
      return response;
    } catch (error) {
      state.failures += 1;
      throw error;
    } finally {
      directActive = Math.max(0, directActive - 1);
      notify();
    }
  };
  globalThis.fetch = meteredFetch;

  if (!storage) notify();

  return {
    snapshot,
    recordExternal(event = {}) {
      const { requests = 0, failures = 0, activeDelta = 0, receivedBytes = 0, sentBytes = 0 } = event;
      state.requests += Math.max(0, Number(requests) || 0);
      state.failures += Math.max(0, Number(failures) || 0);
      if (Object.hasOwn(event, "active") && Number.isFinite(Number(event.active))) {
        externalActive = Math.max(0, Number(event.active));
      } else {
        externalActive = Math.max(0, externalActive + (Number(activeDelta) || 0));
      }
      if (externalActive) externalActiveUpdatedAt = Date.now();
      else externalActiveUpdatedAt = 0;
      state.receivedBytes += Math.max(0, Number(receivedBytes) || 0);
      state.sentBytes += Math.max(0, Number(sentBytes) || 0);
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(snapshot());
      return () => listeners.delete(listener);
    },
    dispose() {
      clearTimeout(persistenceTimer);
      clearTimeout(diagnosticsTimer);
      clearInterval(diagnosticsHeartbeatTimer);
      listeners.clear();
      if (globalThis.fetch === meteredFetch) globalThis.fetch = previousFetch;
    }
  };
}
