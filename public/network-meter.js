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
  const originalFetch = globalThis.fetch.bind(globalThis);
  const listeners = new Set();
  const storage = options.storage;
  // V4 drops totals produced before embedded-player resources were excluded.
  const storageKey = "youtubeChannelShelfYouTubeSessionMetricsV4";
  let persistenceReady = !storage;
  let persistenceTimer = 0;
  const state = {
    startedAt: Date.now(),
    requests: 0,
    failures: 0,
    active: 0,
    receivedBytes: 0,
    sentBytes: 0
  };

  function snapshot() {
    return { ...state, totalBytes: state.receivedBytes + state.sentBytes };
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
  }

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

  globalThis.fetch = async (input, options = {}) => {
    if (!countedYouTubeRequest(input)) return originalFetch(input, options);
    state.requests += 1;
    state.active += 1;
    state.sentBytes += bodyBytes(options.body);
    notify();
    try {
      const response = await originalFetch(input, options);
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
      state.active = Math.max(0, state.active - 1);
      notify();
    }
  };

  return {
    snapshot,
    recordExternal({ requests = 0, failures = 0, activeDelta = 0, receivedBytes = 0, sentBytes = 0 } = {}) {
      state.requests += Math.max(0, Number(requests) || 0);
      state.failures += Math.max(0, Number(failures) || 0);
      state.active = Math.max(0, state.active + (Number(activeDelta) || 0));
      state.receivedBytes += Math.max(0, Number(receivedBytes) || 0);
      state.sentBytes += Math.max(0, Number(sentBytes) || 0);
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(snapshot());
      return () => listeners.delete(listener);
    }
  };
}
