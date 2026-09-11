const CACHE_KEY = "youtubeChannelShelfShortsCache";
const SHORT_CACHE_AGE = 7 * 24 * 60 * 60 * 1000;
const RESTRICTION_CACHE_AGE = 5 * 60 * 1000;
const VALID_ID = /^[a-zA-Z0-9_-]{11}$/;
const VALID_RESTRICTIONS = new Set(["", "private", "members"]);

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
  if (!player) return {};
  if (player.videoDetails?.videoId && player.videoDetails.videoId !== videoId) return {};
  const playability = player.playabilityStatus || {};
  const offer = playability.errorScreen?.playerLegacyDesktopYpcOfferRenderer;
  const privateText = [
    playability.reason,
    ...(playability.messages || []),
    playability.errorScreen?.playerInterstitialRenderer?.content?.interstitialViewModel?.title?.content
  ].filter(Boolean).join(" ");
  const restriction = offer?.offerId === "sponsors_only_video"
    ? "members"
    : playability.status === "LOGIN_REQUIRED" && /\bprivate video\b/i.test(privateText)
      ? "private"
      : "";
  if (!player.videoDetails?.videoId && !restriction) return {};
  const microformat = player.microformat?.playerMicroformatRenderer;
  return {
    title: String(player.videoDetails?.title || "").trim(),
    restriction,
    ...(typeof microformat?.isShortsEligible === "boolean" ? { isShort: microformat.isShortsEligible } : {})
  };
}

export function rendererIsShort(renderer = {}) {
  const endpoint = renderer.navigationEndpoint || renderer.rendererContext?.commandContext?.onTap?.innertubeCommand;
  const url = endpoint?.commandMetadata?.webCommandMetadata?.url || "";
  return Boolean(endpoint?.reelWatchEndpoint || /^\/shorts\//.test(url)
    || renderer.thumbnailOverlays?.some((overlay) => overlay.thumbnailOverlayTimeStatusRenderer?.style === "SHORTS"));
}

export function rendererRestriction(renderer = {}) {
  let membersOnly = false;
  let privateVideo = false;
  const visit = (node) => {
    if (!node || typeof node !== "object" || membersOnly) return;
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === "string") {
        const token = value.toUpperCase();
        if (((key === "badgeStyle" || key === "style") && token.includes("MEMBERS_ONLY"))
          || (key === "iconName" && token === "SPONSORSHIP_STAR")) membersOnly = true;
        else if ((key === "badgeStyle" || key === "style") && token.includes("PRIVATE")) privateVideo = true;
      } else visit(value);
    }
  };
  visit(renderer);
  return membersOnly ? "members" : privateVideo ? "private" : "";
}

export function createYoutubeShortsLookup({ fetchImpl = fetch, storage, now = Date.now, concurrency = 3, timeoutMs = 10000 } = {}) {
  let stored = {};
  try { stored = JSON.parse(storage?.getItem(CACHE_KEY) || "{}"); } catch { /* Optional cache. */ }
  const isRecent = (timestamp, maxAge) => Number.isFinite(Number(timestamp)) && now() - Number(timestamp) < maxAge;
  const cache = new Map(Object.entries(stored || {}).filter(([id, item]) => VALID_ID.test(id)
    && ((typeof item?.isShort === "boolean" && isRecent(item.shortCheckedAt ?? item.checkedAt, SHORT_CACHE_AGE))
      || (VALID_RESTRICTIONS.has(item?.restriction) && isRecent(item.restrictionCheckedAt, RESTRICTION_CACHE_AGE)))));
  const requests = new Map();
  const queue = [];
  let running = 0;

  function known(video) {
    if (typeof video?.isShort === "boolean") return video.isShort;
    const id = typeof video === "string" ? video : video?.id;
    const item = cache.get(id);
    return item && isRecent(item.shortCheckedAt ?? item.checkedAt, SHORT_CACHE_AGE) ? item.isShort : undefined;
  }

  function restriction(video) {
    if (VALID_RESTRICTIONS.has(video?.restriction)
      && isRecent(video.restrictionCheckedAt, RESTRICTION_CACHE_AGE)) return video.restriction;
    const id = typeof video === "string" ? video : video?.id;
    const item = cache.get(id);
    return item && isRecent(item.restrictionCheckedAt, RESTRICTION_CACHE_AGE)
      && VALID_RESTRICTIONS.has(item.restriction)
      ? item.restriction
      : undefined;
  }

  function remember(id, isShort, videoRestriction) {
    if (!VALID_ID.test(id)) return;
    const previous = cache.get(id) || {};
    const next = { ...previous };
    let changed = false;
    if (typeof isShort === "boolean") {
      next.isShort = isShort;
      next.shortCheckedAt = now();
      changed = true;
    }
    if (VALID_RESTRICTIONS.has(videoRestriction)) {
      next.restriction = videoRestriction;
      next.restrictionCheckedAt = now();
      changed = true;
    }
    if (!changed) return;
    if (typeof next.isShort === "boolean" && !Number.isFinite(Number(next.shortCheckedAt))) {
      next.shortCheckedAt = Number(next.checkedAt) || now();
    }
    delete next.checkedAt;
    cache.delete(id);
    cache.set(id, next);
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
            credentials: "omit", cache: "no-store", signal: controller.signal
          });
          const metadata = response.ok ? parseYoutubeVideoMetadata(await response.text(), id) : {};
          remember(id, metadata.isShort, metadata.restriction);
          return metadata;
        } catch { return {}; }
        finally { clearTimeout(timer); }
      })().then((result) => {
        const cacheAge = VALID_RESTRICTIONS.has(result.restriction)
          ? RESTRICTION_CACHE_AGE
          : typeof result.isShort === "boolean" ? SHORT_CACHE_AGE : 60000;
        requests.set(id, { promise: Promise.resolve(result), expiresAt: now() + cacheAge });
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

  return { known, restriction, remember, metadata };
}
