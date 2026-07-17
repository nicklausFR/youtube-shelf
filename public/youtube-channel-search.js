import { fetchYoutubeChannelVideosPage } from "./youtube-channel-videos.js";

function normalizedSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function videoMatchesQuery(video, queryWords) {
  const searchable = normalizedSearchText([
    video.id,
    video.title,
    video.publishedText,
    video.duration,
    video.viewCountText,
    video.live ? "live direct" : ""
  ].filter(Boolean).join(" "));
  return queryWords.every((word) => searchable.includes(word));
}

export async function searchYoutubeChannelVideos({
  channelId,
  query,
  fetchImpl = fetch,
  signal,
  onPage
} = {}) {
  const normalizedChannelId = String(channelId || "").trim();
  const queryWords = normalizedSearchText(query).split(" ").filter(Boolean);
  if (!/^UC[-_a-zA-Z0-9]{20,}$/.test(normalizedChannelId)) {
    throw new Error("A valid YouTube UC channel identifier is required");
  }
  if (!queryWords.length) return { videos: [], pageCount: 0 };

  const fetchWithSignal = (url, options = {}) => fetchImpl(url, { ...options, signal });
  const matchingVideos = new Map();
  const seenContinuations = new Set();
  let continuation = "";
  let pageCount = 0;

  do {
    let page;
    try {
      page = await fetchYoutubeChannelVideosPage({
        channelId: normalizedChannelId,
        continuation,
        fetchImpl: fetchWithSignal
      });
    } catch (error) {
      if (error?.name === "AbortError") throw error;
      throw new Error(`YouTube channel video page ${pageCount + 1} failed: ${error.message}`);
    }

    pageCount += 1;
    for (const video of page.videos) {
      if (videoMatchesQuery(video, queryWords)) matchingVideos.set(video.id, video);
    }

    continuation = page.continuation || "";
    const complete = !continuation || seenContinuations.has(continuation);
    onPage?.({ videos: [...matchingVideos.values()], pageCount, complete });
    if (complete) break;
    seenContinuations.add(continuation);
  } while (continuation);

  return { videos: [...matchingVideos.values()], pageCount };
}
