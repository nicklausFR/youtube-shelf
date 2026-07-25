import { fetchYoutubeChannelVideosPage } from "./youtube-channel-videos.js";

function normalizedSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function requiredSearchWordCount(queryWords) {
  if (queryWords.length <= 2) return queryWords.length;
  return Math.ceil(queryWords.length * 2 / 3);
}

function searchWordMatchCount(searchable, queryWords) {
  return queryWords.reduce((count, word) => count + (searchable.includes(word) ? 1 : 0), 0);
}

export function searchTextMatchesQuery(value, query) {
  const queryWords = normalizedSearchText(query).split(" ").filter(Boolean);
  if (!queryWords.length) return false;
  const searchable = normalizedSearchText(value);
  return searchWordMatchCount(searchable, queryWords) >= requiredSearchWordCount(queryWords);
}

function videoSearchScore(video, queryWords) {
  const searchable = normalizedSearchText([
    video.id,
    video.title,
    video.publishedText,
    video.duration,
    video.viewCountText,
    video.live ? "live direct" : ""
  ].filter(Boolean).join(" "));
  return searchWordMatchCount(searchable, queryWords);
}

function sortedVideoMatches(videos, queryWords) {
  return [...videos].sort((left, right) => (
    videoSearchScore(right, queryWords) - videoSearchScore(left, queryWords)
  ));
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
      if (videoSearchScore(video, queryWords) >= requiredSearchWordCount(queryWords)) {
        matchingVideos.set(video.id, video);
      }
    }

    continuation = page.continuation || "";
    const complete = !continuation || seenContinuations.has(continuation);
    onPage?.({ videos: sortedVideoMatches(matchingVideos.values(), queryWords), pageCount, complete });
    if (complete) break;
    seenContinuations.add(continuation);
  } while (continuation);

  return { videos: sortedVideoMatches(matchingVideos.values(), queryWords), pageCount };
}
