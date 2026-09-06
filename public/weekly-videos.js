import { fetchYoutubeChannelVideosPage } from "./youtube-channel-videos.js";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// RSS supplies exact publication dates; YouTube supplies uploads missing from RSS.
// Keep a previously observed relative date stable until an exact RSS date arrives.
export function weeklyVideoSummary(channel, { rssVideos = [], youtubeVideos = [] }, now = Date.now()) {
  const byId = new Map();
  for (const video of channel.feedVideos || []) {
    if (video?.id) byId.set(video.id, { ...video });
  }
  for (const [videos, approximate] of [[youtubeVideos, true], [rssVideos, false]]) {
    for (const video of videos) {
      if (!video?.id) continue;
      const previous = byId.get(video.id) || {};
      const keepDate = Number.isFinite(Date.parse(previous.published))
        && (approximate || !Number.isFinite(Date.parse(video.published)));
      byId.set(video.id, {
        id: video.id,
        title: video.title || previous.title || "",
        published: keepDate ? previous.published : video.published || "",
        publishedIsApproximate: keepDate ? Boolean(previous.publishedIsApproximate) : approximate,
        description: video.description || previous.description || "",
        tags: video.tags?.length ? video.tags : previous.tags || [],
        duration: video.duration || previous.duration || "",
        ...(typeof (video.isShort ?? previous.isShort) === "boolean" ? { isShort: video.isShort ?? previous.isShort } : {}),
        views: video.views || video.viewCountText || previous.views || "",
        thumbnail: video.thumbnail || previous.thumbnail || ""
      });
    }
  }
  const videos = [...byId.values()]
    .sort((a, b) => (Date.parse(b.published) || 0) - (Date.parse(a.published) || 0))
    // Retain the week plus a small older history for channel cadence estimates.
    .filter((video, index) => index < 15 || Date.parse(video.published) >= now - WEEK_MS);
  return {
    feedVideos: videos,
    feedVideoCount: videos.length,
    feedLatestPublished: videos[0]?.published || "",
    feedLatestTitle: videos[0]?.title || ""
  };
}

async function withDeadline(work, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await work(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchWeeklyChannelVideos({
  channelId, parseFeed, fetchImpl = fetch, fetchPage = fetchYoutubeChannelVideosPage,
  now = Date.now(), timeoutMs = 15000, maxPages = 10
}) {
  const youtubeVideos = [];
  const [rss, youtube] = await Promise.allSettled([
    withDeadline(async (signal) => {
      const response = await fetchImpl(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`, {
        cache: "no-store", signal
      });
      if (!response.ok) throw new Error(`RSS request failed: HTTP ${response.status}`);
      return parseFeed(await response.text());
    }, timeoutMs),
    (async () => {
      let continuation = "";
      const seenTokens = new Set();
      for (let index = 0; index < maxPages; index++) {
        const page = await withDeadline((signal) => fetchPage({
          channelId, sort: "latest", continuation,
          fetchImpl: (url, options = {}) => fetchImpl(url, { ...options, signal })
        }), timeoutMs);
        youtubeVideos.push(...page.videos);
        continuation = page.continuation || "";
        const datedVideos = page.videos.filter((video) => Number.isFinite(Date.parse(video.published)));
        // An entirely older page establishes the week boundary, even if a recent
        // upload was pinned ahead of older videos on the previous page.
        if (!continuation || (datedVideos.length > 0
          && datedVideos.every((video) => Date.parse(video.published) < now - WEEK_MS))) return;
        if (seenTokens.has(continuation)) throw new Error("YouTube repeated a video page");
        seenTokens.add(continuation);
      }
      throw new Error("The weekly video check reached its page limit");
    })()
  ]);
  if (rss.status === "rejected" && youtube.status === "rejected" && !youtubeVideos.length) {
    throw new AggregateError([rss.reason, youtube.reason], "Neither RSS nor YouTube videos could be checked");
  }
  return {
    rssVideos: rss.status === "fulfilled" ? rss.value : [],
    youtubeVideos,
    complete: rss.status === "fulfilled" && youtube.status === "fulfilled"
  };
}
