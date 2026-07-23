const YOUTUBE_ORIGIN = "https://www.youtube.com";
const BROWSE_URL = `${YOUTUBE_ORIGIN}/youtubei/v1/browse?prettyPrint=false`;

// Values and request flow follow NewPipeExtractor's WEB channel Videos tab implementation:
// https://github.com/TeamNewPipe/NewPipeExtractor/blob/dev/extractor/src/main/java/org/schabi/newpipe/extractor/services/youtube/extractors/YoutubeChannelTabExtractor.java
const WEB_CLIENT_NAME = "WEB";
const WEB_CLIENT_ID = "1";
const WEB_CLIENT_VERSION_FALLBACK = "2.20260120.01.00";
const VIDEOS_TAB_PARAMS = "EgZ2aWRlb3PyBgQKAjoA";
const VIDEO_SORTS = new Set(["latest", "popular"]);

let cachedClientVersion = "";

function textFrom(value) {
  if (!value || typeof value !== "object") return "";
  if (typeof value.simpleText === "string") return value.simpleText.trim();
  if (typeof value.content === "string") return value.content.trim();
  if (Array.isArray(value.runs)) return value.runs.map((run) => run?.text || "").join("").trim();
  return "";
}

function largestThumbnail(thumbnails = []) {
  const candidates = Array.isArray(thumbnails) ? thumbnails : [];
  return candidates.reduce((largest, candidate) => {
    if (!candidate?.url) return largest;
    const area = Number(candidate.width || 0) * Number(candidate.height || 0);
    const largestArea = Number(largest?.width || 0) * Number(largest?.height || 0);
    return !largest?.url || area >= largestArea ? candidate : largest;
  }, null)?.url || "";
}

function normalizeThumbnailUrl(url = "") {
  return String(url).startsWith("//") ? `https:${url}` : String(url);
}

function relativeDateToIso(value = "") {
  const normalized = String(value).trim().replace(/^(streamed|premiered)\s+/i, "");
  const match = normalized.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i);
  if (!match) return "";
  const amount = Number(match[1]);
  const multipliers = {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000
  };
  return new Date(Date.now() - amount * multipliers[match[2].toLowerCase()]).toISOString();
}

function metadataContentStrings(node, output = []) {
  if (!node || typeof node !== "object") return output;
  if (typeof node.content === "string" && node.content.trim()) output.push(node.content.trim());
  if (Array.isArray(node)) {
    for (const value of node) metadataContentStrings(value, output);
  } else {
    for (const value of Object.values(node)) metadataContentStrings(value, output);
  }
  return output;
}

function videoFromRenderer(renderer) {
  const id = String(renderer?.videoId || "").trim();
  if (!id) return null;
  const publishedText = textFrom(renderer.publishedTimeText);
  const thumbnails = renderer.thumbnail?.thumbnails || [];
  const duration = textFrom(renderer.lengthText) || renderer.thumbnailOverlays
    ?.map((overlay) => textFrom(overlay?.thumbnailOverlayTimeStatusRenderer?.text))
    .find(Boolean) || "";
  return {
    id,
    title: textFrom(renderer.title),
    published: relativeDateToIso(publishedText),
    publishedText,
    duration,
    viewCountText: textFrom(renderer.viewCountText) || textFrom(renderer.shortViewCountText),
    thumbnail: normalizeThumbnailUrl(largestThumbnail(thumbnails) || `https://i.ytimg.com/vi/${id}/mqdefault.jpg`),
    live: renderer.badges?.some((badge) => badge?.metadataBadgeRenderer?.style === "BADGE_STYLE_TYPE_LIVE_NOW") || false
  };
}

function videoFromLockup(lockup) {
  if (lockup?.contentType !== "LOCKUP_CONTENT_TYPE_VIDEO") return null;
  const id = String(lockup.contentId || lockup.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId || "").trim();
  if (!id) return null;
  const metadataStrings = [...new Set(metadataContentStrings(lockup.metadata))];
  const publishedText = metadataStrings.find((value) => /(?:ago|streamed|premiered)/i.test(value)) || "";
  const badges = lockup.contentImage?.thumbnailViewModel?.overlays
    ?.flatMap((overlay) => overlay?.thumbnailBottomOverlayViewModel?.badges || []) || [];
  const duration = badges.map((badge) => badge?.thumbnailBadgeViewModel?.text || "").find((value) => /\d/.test(value)) || "";
  const sources = lockup.contentImage?.thumbnailViewModel?.image?.sources || [];
  return {
    id,
    title: String(lockup.metadata?.lockupMetadataViewModel?.title?.content || "").trim(),
    published: relativeDateToIso(publishedText),
    publishedText,
    duration,
    viewCountText: metadataStrings.find((value) => /views?|watching/i.test(value)) || "",
    thumbnail: normalizeThumbnailUrl(largestThumbnail(sources) || `https://i.ytimg.com/vi/${id}/mqdefault.jpg`),
    live: badges.some((badge) => badge?.thumbnailBadgeViewModel?.badgeStyle === "THUMBNAIL_OVERLAY_BADGE_STYLE_LIVE")
  };
}

function collectPageData(node, state = { videos: [], ids: new Set(), continuation: "" }) {
  if (!node || typeof node !== "object") return state;

  const renderer = node.videoRenderer || node.gridVideoRenderer;
  const video = renderer ? videoFromRenderer(renderer) : node.lockupViewModel ? videoFromLockup(node.lockupViewModel) : null;
  if (video?.id && !state.ids.has(video.id)) {
    state.ids.add(video.id);
    state.videos.push(video);
  }

  const token = node.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
  if (token) state.continuation = token;

  if (Array.isArray(node)) {
    for (const value of node) collectPageData(value, state);
  } else {
    for (const value of Object.values(node)) collectPageData(value, state);
  }
  return state;
}

export function extractYoutubeVideosFromData(data) {
  const collected = collectPageData(data);
  return {
    videos: collected.videos,
    continuation: collected.continuation
  };
}

function videosTabContent(response) {
  const tabs = response?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
  const videosTab = tabs
    .map((tab) => tab?.tabRenderer)
    .find((tab) => tab?.endpoint?.commandMetadata?.webCommandMetadata?.url?.endsWith("/videos"))
    || tabs.map((tab) => tab?.tabRenderer).find((tab) => tab?.selected);
  return videosTab?.content || null;
}

function continuationContent(response) {
  const actions = [
    ...(response?.onResponseReceivedActions || []),
    ...(response?.onResponseReceivedCommands || [])
  ];
  const itemGroups = actions
    .map((action) => action?.appendContinuationItemsAction?.continuationItems
      || action?.reloadContinuationItemsCommand?.continuationItems)
    .filter(Array.isArray);
  return itemGroups.length ? itemGroups.flat() : response?.continuationContents || null;
}

function sortContinuation(response, sort) {
  if (sort === "latest") return "";
  // Follow YouTube's server-provided command, as NewPipe does for channel pagination,
  // instead of guessing an undocumented browse parameter for each sort order.
  const chips = videosTabContent(response)?.richGridRenderer?.header?.chipBarViewModel?.chips || [];
  const selectedChip = chips
    .map((item) => item?.chipViewModel)
    .find((chip) => String(chip?.text || chip?.accessibilityLabel || "").trim().toLocaleLowerCase() === sort);
  return selectedChip?.tapCommand?.innertubeCommand?.continuationCommand?.token || "";
}

async function youtubeClientVersion(fetchImpl) {
  if (cachedClientVersion) return cachedClientVersion;
  try {
    const response = await fetchImpl(`${YOUTUBE_ORIGIN}/results?search_query=`, { cache: "no-store", credentials: "omit" });
    if (response.ok) {
      const html = await response.text();
      cachedClientVersion = html.match(/"INNERTUBE_CONTEXT_CLIENT_VERSION"\s*:\s*"([0-9.]+)"/)?.[1]
        || html.match(/innertube_context_client_version"\s*:\s*"([0-9.]+)"/i)?.[1]
        || "";
    }
  } catch {
    // NewPipe also keeps a known-good hardcoded version as its final fallback.
  }
  cachedClientVersion ||= WEB_CLIENT_VERSION_FALLBACK;
  return cachedClientVersion;
}

function requestBody(clientVersion, channelId, continuation) {
  return {
    context: {
      client: {
        hl: "en-GB",
        gl: "FR",
        clientName: WEB_CLIENT_NAME,
        clientVersion,
        originalUrl: YOUTUBE_ORIGIN,
        platform: "DESKTOP",
        utcOffsetMinutes: 0
      },
      request: { internalExperimentFlags: [], useSsl: true },
      user: { lockedSafetyMode: false }
    },
    ...(continuation ? { continuation } : { browseId: channelId, params: VIDEOS_TAB_PARAMS })
  };
}

async function postBrowse(fetchImpl, body, clientVersion) {
  const response = await fetchImpl(BROWSE_URL, {
    method: "POST",
    cache: "no-store",
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
      "X-YouTube-Client-Name": WEB_CLIENT_ID,
      "X-YouTube-Client-Version": clientVersion
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`YouTube browse request failed: HTTP ${response.status}`);
  const data = await response.json();
  if (data?.error) throw new Error(data.error.message || "YouTube browse request failed");
  return data;
}

export async function fetchYoutubeChannelVideosPage({
  channelId,
  continuation = "",
  sort = "latest",
  fetchImpl = fetch
} = {}) {
  const normalizedId = String(channelId || "").trim();
  if (!continuation && !/^UC[-_a-zA-Z0-9]{20,}$/.test(normalizedId)) {
    throw new Error("A valid YouTube UC channel identifier is required");
  }

  const clientVersion = await youtubeClientVersion(fetchImpl);
  const normalizedSort = VIDEO_SORTS.has(sort) ? sort : "latest";
  let resolvedChannelId = normalizedId;
  let response;
  let responseIsContinuation = Boolean(continuation);
  if (continuation) {
    response = await postBrowse(fetchImpl, requestBody(clientVersion, resolvedChannelId, continuation), clientVersion);
  } else {
    for (let redirectCount = 0; redirectCount < 3; redirectCount += 1) {
      response = await postBrowse(fetchImpl, requestBody(clientVersion, resolvedChannelId, ""), clientVersion);
      const redirectId = response?.onResponseReceivedActions?.[0]?.navigateAction?.endpoint?.browseEndpoint?.browseId || "";
      if (!redirectId) break;
      if (!redirectId.startsWith("UC")) throw new Error("YouTube redirected to something other than a channel");
      resolvedChannelId = redirectId;
    }
    if (normalizedSort !== "latest") {
      const sortToken = sortContinuation(response, normalizedSort);
      if (!sortToken) throw new Error(`YouTube returned no ${normalizedSort} video filter`);
      response = await postBrowse(fetchImpl, requestBody(clientVersion, resolvedChannelId, sortToken), clientVersion);
      responseIsContinuation = true;
    }
  }
  const pageContent = responseIsContinuation ? continuationContent(response) || response : videosTabContent(response);
  if (!pageContent) throw new Error("YouTube returned no Videos tab content");
  const collected = collectPageData(pageContent);

  return {
    videos: collected.videos,
    continuation: collected.continuation,
    clientVersion,
    resolvedChannelId,
    sort: normalizedSort
  };
}
