const CACHE_KEY = "youtubeChannelShelfShortsCache";
const CACHE_AGE = 7 * 24 * 60 * 60 * 1000;
const VALID_ID = /^[a-zA-Z0-9_-]{11}$/;

function jsonObjectAfter(html, marker) {
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) return null;
  const start = html.indexOf("{", markerIndex + marker.length);
  if (start < 0) return null;
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = start; index < html.length; index++) {
    const char = html[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === "{") depth++;
    else if (char === "}" && --depth === 0) {
      try { return JSON.parse(html.slice(start, index + 1)); } catch { return null; }
    }
  }
  return null;
}

export function parseYoutubeVideoMetadata(html, videoId) {
  const player = jsonObjectAfter(html, "var ytInitialPlayerResponse =")
    || jsonObjectAfter(html, "ytInitialPlayerResponse =")
    || jsonObjectAfter(html, '"ytInitialPlayerResponse":');
  // Never classify using a recommended video's metadata or a duration heuristic.
  if (player?.videoDetails?.videoId !== videoId) return {};
  const microformat = player.microformat?.playerMicroformatRenderer;
  return {
    title: String(player.videoDetails.title || "").trim(),
    ...(typeof microformat?.isShortsEligible === "boolean" ? { isShort: microformat.isShortsEligible } : {})
  };
}

export function rendererIsShort(renderer = {}) {
  const endpoint = renderer.navigationEndpoint || renderer.rendererContext?.commandContext?.onTap?.innertubeCommand;
  const url = endpoint?.commandMetadata?.webCommandMetadata?.url || "";
  return Boolean(endpoint?.reelWatchEndpoint || /^\/shorts\//.test(url)
    || renderer.thumbnailOverlays?.some((overlay) => overlay.thumbnailOverlayTimeStatusRenderer?.style === "SHORTS"));
}

export function createYoutubeShortsLookup({ fetchImpl = fetch, storage, now = Date.now, concurrency = 3, timeoutMs = 10000 } = {}) {
  let stored = {};
  try { stored = JSON.parse(storage?.getItem(CACHE_KEY) || "{}"); } catch { /* Optional cache. */ }
  const cache = new Map(Object.entries(stored || {}).filter(([id, item]) => VALID_ID.test(id)
    && typeof item?.isShort === "boolean" && now() - item.checkedAt < CACHE_AGE));
  const requests = new Map();
  const queue = [];
  let running = 0;

  function known(video) {
    if (typeof video?.isShort === "boolean") return video.isShort;
    const id = typeof video === "string" ? video : video?.id;
    const item = cache.get(id);
    return item && now() - item.checkedAt < CACHE_AGE ? item.isShort : undefined;
  }

  function remember(id, isShort) {
    if (!VALID_ID.test(id) || typeof isShort !== "boolean") return;
    cache.delete(id);
    cache.set(id, { isShort, checkedAt: now() });
    while (cache.size > 2000) cache.delete(cache.keys().next().value);
    try { storage?.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(cache))); } catch { /* Keep the in-memory result. */ }
  }

  function pump() {
    while (running < concurrency && queue.length) {
      const { id, resolve } = queue.shift();
      running++;
      (async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const response = await fetchImpl(`https://www.youtube.com/watch?v=${id}&hl=en`, {
            credentials: "omit", cache: "force-cache", signal: controller.signal
          });
          const metadata = response.ok ? parseYoutubeVideoMetadata(await response.text(), id) : {};
          remember(id, metadata.isShort);
          return metadata;
        } catch { return {}; }
        finally { clearTimeout(timer); }
      })().then((result) => {
        requests.set(id, { promise: Promise.resolve(result), expiresAt: now() + (typeof result.isShort === "boolean" ? CACHE_AGE : 60000) });
        resolve(result);
      }).finally(() => { running--; pump(); });
    }
  }

  function metadata(id) {
    if (!VALID_ID.test(id)) return Promise.resolve({});
    const previous = requests.get(id);
    if (previous && previous.expiresAt > now()) return previous.promise;
    let resolve;
    const promise = new Promise((done) => { resolve = done; });
    requests.set(id, { promise, expiresAt: Infinity });
    queue.push({ id, resolve });
    pump();
    return promise;
  }

  return { known, remember, metadata };
}
