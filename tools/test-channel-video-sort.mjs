import assert from "node:assert/strict";
import { fetchYoutubeChannelVideosPage } from "../public/youtube-channel-videos.js";

const channelId = "UC1234567890123456789012";
const requests = [];

const initialResponse = {
  contents: {
    twoColumnBrowseResultsRenderer: {
      tabs: [{
        tabRenderer: {
          selected: true,
          endpoint: { commandMetadata: { webCommandMetadata: { url: "/@example/videos" } } },
          content: {
            richGridRenderer: {
              header: {
                chipBarViewModel: {
                  chips: [{
                    chipViewModel: {
                      text: "Oldest",
                      tapCommand: {
                        innertubeCommand: {
                          continuationCommand: { token: "oldest-sort-token" }
                        }
                      }
                    }
                  }]
                }
              }
            }
          }
        }
      }]
    }
  }
};

const oldestResponse = {
  onResponseReceivedActions: [{
    appendContinuationItemsAction: {
      continuationItems: [
        {
          videoRenderer: {
            videoId: "oldest-video",
            title: { simpleText: "First upload" },
            publishedTimeText: { simpleText: "10 years ago" }
          }
        },
        {
          continuationItemRenderer: {
            continuationEndpoint: { continuationCommand: { token: "oldest-page-2" } }
          }
        }
      ]
    }
  }]
};

async function fetchImpl(url, options = {}) {
  if (String(url).includes("/results?")) {
    return { ok: true, text: async () => '"INNERTUBE_CONTEXT_CLIENT_VERSION":"test-version"' };
  }
  const body = JSON.parse(options.body || "{}");
  requests.push(body);
  return {
    ok: true,
    json: async () => body.continuation === "oldest-sort-token" ? oldestResponse : initialResponse
  };
}

const page = await fetchYoutubeChannelVideosPage({ channelId, sort: "oldest", fetchImpl });

assert.equal(requests.length, 2);
assert.equal(requests[0].browseId, channelId);
assert.equal(requests[1].continuation, "oldest-sort-token");
assert.equal(page.sort, "oldest");
assert.equal(page.videos[0].id, "oldest-video");
assert.equal(page.continuation, "oldest-page-2");

console.log("channel oldest-sort tests passed");
