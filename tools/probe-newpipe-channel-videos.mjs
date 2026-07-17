import { fetchYoutubeChannelVideosPage } from "../public/youtube-channel-videos.js";

const channelId = process.argv[2] || "UCBR8-60-B28hp2BmDPdntcQ";
const firstPage = await fetchYoutubeChannelVideosPage({ channelId });

if (!firstPage.videos.length) throw new Error("The initial page contains no videos");

let secondPage = { videos: [], continuation: "" };
if (firstPage.continuation) {
  secondPage = await fetchYoutubeChannelVideosPage({
    channelId,
    continuation: firstPage.continuation
  });
}

const firstIds = new Set(firstPage.videos.map((video) => video.id));
const duplicateIds = secondPage.videos.filter((video) => firstIds.has(video.id)).map((video) => video.id);
if (duplicateIds.length) throw new Error(`Continuation returned duplicate videos: ${duplicateIds.join(", ")}`);

process.stdout.write(JSON.stringify({
  channelId,
  clientVersion: firstPage.clientVersion,
  firstPageCount: firstPage.videos.length,
  hasContinuation: Boolean(firstPage.continuation),
  secondPageCount: secondPage.videos.length,
  hasSecondContinuation: Boolean(secondPage.continuation),
  sample: [...firstPage.videos.slice(0, 3), ...secondPage.videos.slice(0, 2)]
}, null, 2));
