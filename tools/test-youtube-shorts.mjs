import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { createYoutubeShortsLookup, parseYoutubeVideoMetadata, rendererIsShort } from "../public/youtube-shorts.js";
import { weeklyVideoSummary } from "../public/weekly-videos.js";

const id = "EJU2nIg7hSE";
const html = (videoId = id, isShort = true) => `<script>var ytInitialPlayerResponse = ${JSON.stringify({
  videoDetails: { videoId, title: 'A title with } and "quotes"', lengthSeconds: "30" },
  microformat: { playerMicroformatRenderer: { isShortsEligible: isShort } }
})};</script>`;
assert.equal(parseYoutubeVideoMetadata(html(), id).isShort, true);
assert.equal(parseYoutubeVideoMetadata(html(id, false), id).isShort, false);
assert.equal(parseYoutubeVideoMetadata(html(id, undefined).replace('"isShortsEligible":true', '"other":true'), id).isShort, undefined);
assert.deepEqual(parseYoutubeVideoMetadata(html("dQw4w9WgXcQ"), id), {});
assert.deepEqual(parseYoutubeVideoMetadata('<p>Consent / blocked</p><script>var ytInitialData = {"isShortsEligible":true};</script>', id), {});
assert.equal(rendererIsShort({ navigationEndpoint: { reelWatchEndpoint: { videoId: id } } }), true);
assert.equal(rendererIsShort({ lengthText: { simpleText: "0:30" } }), false);

const stored = new Map();
const storage = { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) };
let active = 0, peak = 0, calls = 0;
const lookup = createYoutubeShortsLookup({ storage, concurrency: 2, fetchImpl: async url => {
  calls++; active++; peak = Math.max(peak, active);
  await new Promise(resolve => setTimeout(resolve, 2));
  active--;
  const requested = new URL(url).searchParams.get("v");
  return { ok: true, text: async () => html(requested, requested === id) };
}});
const first = lookup.metadata(id);
assert.equal(lookup.metadata(id), first, "Duplicate cards share one request");
await Promise.all([first, lookup.metadata("dQw4w9WgXcQ"), lookup.metadata("aaaaaaaaaaa"), lookup.metadata("bbbbbbbbbbb")]);
assert.equal(calls, 4);
assert.equal(peak, 2);
assert.equal(lookup.known(id), true);
assert.equal(lookup.known("dQw4w9WgXcQ"), false);
assert.equal(createYoutubeShortsLookup({ storage }).known(id), true, "Classification survives reopening");
const failed = createYoutubeShortsLookup({ fetchImpl: async () => { throw new Error("Offline"); } });
assert.deepEqual(await failed.metadata(id), {});
assert.equal(failed.known(id), undefined, "Failures are not classified as normal videos");
const timeout = createYoutubeShortsLookup({ timeoutMs: 5, fetchImpl: (_, { signal }) => new Promise((_, reject) => {
  signal.addEventListener("abort", () => reject(new Error("Timeout")), { once: true });
}) });
assert.deepEqual(await timeout.metadata(id), {});
const summary = weeklyVideoSummary({ feedVideos: [{ id, isShort: true }] }, { rssVideos: [{ id, title: "Updated" }] });
assert.equal(summary.feedVideos[0].isShort, true, "RSS refresh preserves Shorts classification");

// Exercise the real app functions: filter before grouping, then restore every video.
const source = readFileSync(new URL("../public/app.js", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const definition = name => {
  const start = source.search(new RegExp(`^function ${name}\\(`, "m"));
  assert.ok(start >= 0);
  return source.slice(start, source.indexOf("\n}\n", start) + 2);
};
let renders = 0;
const harness = {
  allChannels: [{ id: "channel", feedVideos: [
    { id, isShort: true, published: "2026-09-05" },
    { id: "dQw4w9WgXcQ", isShort: false, published: "2026-09-04" },
    { id: "unknown", published: "2026-09-03" }
  ] }],
  weeklyShowShorts: true, weeklyGroupByChannel: true, activeView: "youtubeHome",
  youtubeShorts: lookup, channelMatchesWeeklyCategories: () => true, isVideoNewForChannel: () => true,
  videoWithChannel: (video, channel) => ({ ...video, channelId: channel.id }), shouldGroupWeeklyVideos: () => true,
  localStorage: storage, YOUTUBE_WEEKLY_SHOW_SHORTS_KEY: "showShorts", renderNewVideos: () => { renders++; },
  uiMessage: key => key, setYoutubeTabHomePreference() {}, resetNewVideoCounters() {}, restoreWeeklyVideoList() {},
  openExcludedNewVideosDialog() {}, openWeeklyCategoryDialog() {}, toggleWeeklyGroupByChannel() {}
};
vm.createContext(harness);
for (const name of ["collectNewVideos", "toggleWeeklyShorts", "newVideosContextActions"]) vm.runInContext(definition(name), harness);
assert.equal(harness.collectNewVideos().length, 3);
assert.equal(harness.newVideosContextActions().at(-1).label, "hideWeeklyShorts");
harness.newVideosContextActions().at(-1).action();
assert.equal(stored.get("showShorts"), "false");
assert.equal(harness.collectNewVideos().length, 2);
assert.equal(harness.collectNewVideos()[0].weeklyChannelGroupSize, 2);
assert.equal(harness.collectNewVideos()[0].weeklyChannelGroupOrder, 1);
assert.equal(harness.newVideosContextActions().at(-1).label, "showWeeklyShorts");
harness.toggleWeeklyShorts();
assert.equal(stored.get("showShorts"), "true");
assert.equal(harness.collectNewVideos().length, 3);
assert.equal(renders, 2);
console.log("Shorts detection, caching, request limits and weekly filter tests passed");
