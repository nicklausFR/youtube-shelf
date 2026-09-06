import assert from "node:assert/strict";
import { fetchYoutubePlaylistPage } from "../public/youtube-channel-videos.js";
import { annotateVideoSeries } from "../public/video-series.js";
const item = (id, index) => ({ playlistVideoRenderer: {
  videoId: id, title: { simpleText: `Episode ${index}` }, index: { simpleText: String(index) },
  shortBylineText: { runs: [{ text: "Creator", navigationEndpoint: { browseEndpoint: { browseId: "UCcreator" } } }] }
} });
const requests = [];
const fetchImpl = async (url, options) => {
  if (!options?.body) return { ok: true, text: async () => '"INNERTUBE_CONTEXT_CLIENT_VERSION":"2.20260901.00.00"' };
  const body = JSON.parse(options.body); requests.push(body);
  return { ok: true, json: async () => body.continuation ? {
    onResponseReceivedActions: [{ appendContinuationItemsAction: { continuationItems: [item("b", 2)] } }]
  } : {
    metadata: { playlistMetadataRenderer: { title: "My course" } },
    contents: { twoColumnBrowseResultsRenderer: { tabs: [{ tabRenderer: { selected: true, content: {
      playlistVideoListRenderer: { contents: [item("a", 1), { continuationItemRenderer: {
        continuationEndpoint: { continuationCommand: { token: "next" } }
      } }] }
    } } }] } }
  } };
};
const first = await fetchYoutubePlaylistPage({ playlistId: "PLcourse", fetchImpl });
assert.equal(first.playlistTitle, "My course");
assert.equal(first.videos[0].playlistIndex, 1);
assert.equal(first.videos[0].channelId, "UCcreator");
assert.equal(first.videos[0].playlistId, "PLcourse");
assert.equal(first.continuation, "next");
assert.equal(requests[0].browseId, "VLPLcourse");
assert.equal(requests[0].params, undefined);
const second = await fetchYoutubePlaylistPage({ playlistId: "PLcourse", continuation: first.continuation, fetchImpl });
assert.equal(second.videos[0].id, "b");
assert.equal(second.videos[0].playlistIndex, 2);
assert.equal(second.continuation, "");
assert.equal(requests[1].continuation, "next");
await assert.rejects(fetchYoutubePlaylistPage({ playlistId: "invalid/id", fetchImpl }));
await assert.rejects(fetchYoutubePlaylistPage({ playlistId: "PLprivate", fetchImpl: async () => ({ ok: true, json: async () => ({}) }) }), /unavailable/);
const seed = { id: "one", channelId: "creator", title: "Building a workshop | Part 1" };
const episodes = [seed, { id: "two", channelId: "creator", title: "Building a workshop | Part 2" }];
assert.equal(annotateVideoSeries([seed], episodes)[0].seriesSize, 2);
episodes.push({ id: "three", channelId: "creator", title: "Building a workshop | Part 3" });
assert.equal(annotateVideoSeries([seed], episodes)[0].seriesSize, 3);
assert.equal(annotateVideoSeries([{ id: "unknown", title: seed.title }])[0].seriesId, undefined);
assert.notEqual(annotateVideoSeries([{ ...seed, channelId: "another" }])[0].seriesId, annotateVideoSeries([seed])[0].seriesId);
console.log("playlist pagination, metadata, failures and evolving series passed");

// User examples: the first episode can lack a part number entirely.
const hammer = { id: "K_i1TUp0xrM", title: "I've Dreamt of Owning This Hammer Since I Was 11", channelId: "alec" };
const hammerCatalog = [hammer, { id: "hammer2", title: "My Dream Power Hammer Restoration! Part 2", channelId: "alec" }];
assert.equal(annotateVideoSeries([hammer], hammerCatalog)[0].seriesPosition, 1);
const blade = { id: "GHNwchzyx0c", title: "Massive Repair on BROKEN Bulldozer Blade | Part 1 | Gouging & Welding", channelId: "cutting" };
assert.equal(annotateVideoSeries([blade])[0].seriesPosition, 1);
