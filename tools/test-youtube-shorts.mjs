import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { createYoutubeShortsLookup, parseYoutubeVideoMetadata, rendererIsShort, rendererRestriction } from "../public/youtube-shorts.js";
import { weeklyVideoSummary } from "../public/weekly-videos.js";

const id = "EJU2nIg7hSE";
const privateId = "uppK-p7ZuR0";
const membersId = "Jr6WhfI1pME";
const html = (videoId = id, isShort = true) => `<script>var ytInitialPlayerResponse = ${JSON.stringify({
  videoDetails: { videoId, title: 'A title with } and "quotes"', lengthSeconds: "30" },
  microformat: { playerMicroformatRenderer: { isShortsEligible: isShort } }
})};</script>`;
const privateHtml = `<script>var ytInitialPlayerResponse = ${JSON.stringify({
  playabilityStatus: { status: "LOGIN_REQUIRED", reason: "Private video", messages: ["This is a private video."] }
})};</script>`;
const membersHtml = `<script>var ytInitialPlayerResponse = ${JSON.stringify({
  playabilityStatus: {
    status: "UNPLAYABLE",
    errorScreen: { playerLegacyDesktopYpcOfferRenderer: { offerId: "sponsors_only_video" } }
  },
  videoDetails: { videoId: membersId, title: "Members upload" }
})};</script>`;
assert.equal(parseYoutubeVideoMetadata(html(), id).isShort, true);
assert.equal(parseYoutubeVideoMetadata(html(id, false), id).isShort, false);
assert.equal(parseYoutubeVideoMetadata(html(id, false), id).restriction, "");
assert.equal(parseYoutubeVideoMetadata(privateHtml, privateId).restriction, "private");
assert.equal(parseYoutubeVideoMetadata(membersHtml, membersId).restriction, "members");
assert.equal(parseYoutubeVideoMetadata(html(id, undefined).replace('"isShortsEligible":true', '"other":true'), id).isShort, undefined);
assert.deepEqual(parseYoutubeVideoMetadata(html("dQw4w9WgXcQ"), id), {});
assert.deepEqual(parseYoutubeVideoMetadata('<p>Consent / blocked</p><script>var ytInitialData = {"isShortsEligible":true};</script>', id), {});
assert.equal(rendererIsShort({ navigationEndpoint: { reelWatchEndpoint: { videoId: id } } }), true);
assert.equal(rendererIsShort({ lengthText: { simpleText: "0:30" } }), false);
assert.equal(rendererRestriction({ metadata: { badges: [{ badgeViewModel: { badgeStyle: "BADGE_MEMBERS_ONLY" } }] } }), "members");
assert.equal(rendererRestriction({ badges: [{ metadataBadgeRenderer: { style: "BADGE_STYLE_TYPE_PRIVATE" } }] }), "private");
assert.equal(rendererRestriction({ badges: [{ metadataBadgeRenderer: { style: "BADGE_STYLE_TYPE_LIVE_NOW" } }] }), "");

const stored = new Map();
const storage = { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) };
let active = 0, peak = 0, calls = 0;
const requestCacheModes = [];
const lookup = createYoutubeShortsLookup({ storage, concurrency: 2, fetchImpl: async (url, options) => {
  requestCacheModes.push(options.cache);
  calls++; active++; peak = Math.max(peak, active);
  await new Promise(resolve => setTimeout(resolve, 2));
  active--;
  const requested = new URL(url).searchParams.get("v");
  const body = requested === privateId ? privateHtml
    : requested === membersId ? membersHtml
    : html(requested, requested === id);
  return { ok: true, text: async () => body };
}});
const first = lookup.metadata(id);
assert.equal(lookup.metadata(id), first, "Duplicate cards share one request");
await Promise.all([first, lookup.metadata("dQw4w9WgXcQ"), lookup.metadata(privateId), lookup.metadata(membersId)]);
assert.equal(calls, 4);
assert.equal(peak, 2);
assert.ok(requestCacheModes.every(mode => mode === "no-store"), "Playability checks bypass the browser HTTP cache");
assert.equal(lookup.known(id), true);
assert.equal(lookup.known("dQw4w9WgXcQ"), false);
assert.equal(lookup.restriction(privateId), "private");
assert.equal(lookup.restriction(membersId), "members");
assert.equal(createYoutubeShortsLookup({ storage }).known(id), true, "Classification survives reopening");
assert.equal(createYoutubeShortsLookup({ storage }).restriction(membersId), "members", "Restrictions survive reopening");
const legacyNow = Date.parse("2026-09-11T12:00:00Z");
const legacyStored = new Map([["youtubeChannelShelfShortsCache", JSON.stringify({
  [privateId]: { isShort: false, restriction: "", checkedAt: legacyNow }
})]]);
const legacyLookup = createYoutubeShortsLookup({
  now: () => legacyNow,
  storage: { getItem: key => legacyStored.get(key), setItem: (key, value) => legacyStored.set(key, value) },
  fetchImpl: async () => ({ ok: true, text: async () => privateHtml })
});
assert.equal(legacyLookup.known(privateId), false, "The legacy Shorts result remains reusable");
assert.equal(legacyLookup.restriction(privateId), undefined, "A legacy public result must be revalidated");
assert.equal((await legacyLookup.metadata(privateId)).restriction, "private");
assert.equal(legacyLookup.restriction(privateId), "private", "A newly private video replaces the stale public result");
const failed = createYoutubeShortsLookup({ fetchImpl: async () => { throw new Error("Offline"); } });
assert.deepEqual(await failed.metadata(id), {});
assert.equal(failed.known(id), undefined, "Failures are not classified as normal videos");
const timeout = createYoutubeShortsLookup({ timeoutMs: 5, fetchImpl: (_, { signal }) => new Promise((_, reject) => {
  signal.addEventListener("abort", () => reject(new Error("Timeout")), { once: true });
}) });
assert.deepEqual(await timeout.metadata(id), {});
const summary = weeklyVideoSummary({ feedVideos: [{ id, isShort: true, restriction: "members" }] }, { rssVideos: [{ id, title: "Updated" }] });
assert.equal(summary.feedVideos[0].isShort, true, "RSS refresh preserves Shorts classification");
assert.equal(summary.feedVideos[0].restriction, "members", "RSS refresh preserves access restrictions");

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
    { id: membersId, isShort: false, restriction: "members", published: "2026-09-03" },
    { id: "unknown", published: "2026-09-02" }
  ] }],
  weeklyShowShorts: true, showRestrictedVideos: true, weeklyGroupByChannel: true, activeView: "youtubeHome",
  youtubeShorts: lookup, channelMatchesWeeklyCategories: () => true, isVideoNewForChannel: () => true,
  videoWithChannel: (video, channel) => ({ ...video, channelId: channel.id }), shouldGroupWeeklyVideos: () => true,
  localStorage: storage, YOUTUBE_WEEKLY_SHOW_SHORTS_KEY: "showShorts", YOUTUBE_SHOW_RESTRICTED_VIDEOS_KEY: "showRestricted",
  refreshSortedView: () => { renders++; },
  toggleExcludedContentEl: {
    setAttribute(name, value) { this[name] = value; }
  },
  uiMessage: key => key, setYoutubeTabHomePreference() {}, resetNewVideoCounters() {}, restoreWeeklyVideoList() {},
  openExcludedNewVideosDialog() {}, openWeeklyCategoryDialog() {}, toggleWeeklyGroupByChannel() {}
};
vm.createContext(harness);
for (const name of ["videoIsExcluded", "collectNewVideos", "syncExcludedContentButton", "filterVisibleContent",
  "toggleShortsExclusion", "toggleRestrictedVideosExclusion", "excludedContentActions", "newVideosContextActions"]) {
  vm.runInContext(definition(name), harness);
}
assert.equal(harness.filterVisibleContent([{ id: privateId }]).length, 1);
assert.equal(harness.collectNewVideos().length, 4);
assert.ok(harness.newVideosContextActions().every(item => !/Shorts/.test(item.label)));
harness.toggleShortsExclusion();
assert.equal(stored.get("showShorts"), "false");
assert.equal(harness.collectNewVideos().length, 3);
assert.equal(harness.collectNewVideos()[0].weeklyChannelGroupSize, 3);
assert.equal(harness.collectNewVideos()[0].weeklyChannelGroupOrder, 1);
harness.toggleRestrictedVideosExclusion();
assert.equal(stored.get("showRestricted"), "false");
assert.equal(harness.filterVisibleContent([{ id: privateId }]).length, 0, "The reported private video is hidden from daily videos");
assert.equal(harness.collectNewVideos().length, 2);
assert.deepEqual(Array.from(harness.excludedContentActions(), item => [item.label, item.checkable, item.checked]), [
  ["shorts", true, true],
  ["privateVideosIncludingMembers", true, true]
]);
assert.equal(harness.toggleExcludedContentEl.title, "excludedContent");
harness.toggleShortsExclusion();
assert.equal(stored.get("showShorts"), "true");
assert.equal(harness.collectNewVideos().length, 3);
harness.toggleRestrictedVideosExclusion();
assert.equal(harness.collectNewVideos().length, 4);
assert.equal(renders, 4);

// Shared renderers cover channels, YouTube search, favorites and watch later.
Object.assign(harness, {
  videosEl: {}, sortVideosForDisplay: videos => videos,
  createVideoCard: video => video,
  createStoredVideoGroup: members => ({ members }),
  setActiveVideoButton() {}, syncVideoLayoutAvailability() {}
});
for (const name of ["renderVideos", "renderStoredVideoResults"]) vm.runInContext(definition(name), harness);
const videos = harness.allChannels[0].feedVideos.map(video => ({ ...video, videoGroupId: "group" }));
const target = { replaceChildren(...items) { this.items = items; } };
for (const [showShorts, showRestricted, visible] of [
  [false, false, 2], [true, false, 3], [false, true, 3], [true, true, 4]
]) {
  harness.weeklyShowShorts = showShorts;
  harness.showRestrictedVideos = showRestricted;
  harness.renderVideos(videos, target);
  assert.equal(target.items.length, visible);
  for (const collection of ["favorites", "watchLater"]) {
    harness.renderStoredVideoResults(videos, target, collection);
    assert.equal(target.items[0].members.length, visible);
  }
}
assert.equal(videos.length, 4, "Filtering must preserve source videos for restoring excluded content");

// Channel ages and date rankings must use the latest video left by the filters.
Object.assign(harness, {
  sortModes: { channels: "date-desc" },
  relativeDateValue: value => {
    const parsed = Date.parse(value || "");
    return Number.isNaN(parsed) ? null : parsed;
  },
  compareOptionalNumbers: (left, right, direction = "desc") => {
    if (left === null && right === null) return 0;
    if (left === null) return 1;
    if (right === null) return -1;
    return direction === "asc" ? left - right : right - left;
  },
  compareTitles: (left, right) => String(left.title || "").localeCompare(String(right.title || "")),
  isWithinNewVideosRange: () => true,
  isNewerThanReset: () => true,
  elapsedShort: value => value
});
for (const name of ["latestVisibleChannelVideo", "latestVisibleChannelPublished", "latestVisibleNewVideo",
  "hasNewVideos", "newVideoAgeLabel", "sortChannelsForDisplay"]) {
  vm.runInContext(definition(name), harness);
}
const shortLedChannel = { title: "Short led", feedLatestPublished: "2026-09-10", feedVideos: [
  { id, isShort: true, published: "2026-09-10" },
  { id: "normal-a", isShort: false, published: "2026-09-08" }
] };
const regularChannel = { title: "Regular", feedLatestPublished: "2026-09-09", feedVideos: [
  { id: "normal-b", isShort: false, published: "2026-09-09" }
] };
harness.weeklyShowShorts = false;
assert.equal(harness.newVideoAgeLabel(shortLedChannel), "2026-09-08");
assert.deepEqual(Array.from(harness.sortChannelsForDisplay([shortLedChannel, regularChannel]), channel => channel.title),
  ["Regular", "Short led"], "Hidden Shorts do not affect channel date rankings");
harness.weeklyShowShorts = true;
assert.deepEqual(Array.from(harness.sortChannelsForDisplay([shortLedChannel, regularChannel]), channel => channel.title),
  ["Short led", "Regular"], "Restoring Shorts restores their rank");
const restrictedOnlyChannel = { title: "Restricted", feedVideos: [
  { id: membersId, restriction: "members", published: "2026-09-10" }
] };
harness.showRestrictedVideos = false;
assert.equal(harness.hasNewVideos(restrictedOnlyChannel), false);
assert.equal(harness.newVideoAgeLabel(restrictedOnlyChannel), "");

// Newly detected Shorts update the current tab, with one render per batch.
let callback;
Object.assign(harness, {
  weeklyShowShorts: true, showRestrictedVideos: false, excludedContentRenderTimer: null, activeView: "favorites",
  window: { setTimeout(fn) { callback = fn; return 1; } },
  document: { querySelectorAll: () => [] }, channelsEl: { scrollTop: 123 }
});
vm.runInContext(definition("scheduleExcludedContentRender"), harness);
harness.scheduleExcludedContentRender();
harness.scheduleExcludedContentRender();
callback();
assert.equal(renders, 5);
assert.equal(harness.channelsEl.scrollTop, 123);
const toolbarHtml = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
assert.ok(toolbarHtml.indexOf('id="toggleExcludedContent"') < toolbarHtml.indexOf('id="channelZoomOut"'));
assert.match(source, /toggleExcludedContentEl\?\.addEventListener\("click"[\s\S]*showContextMenu\(event, excludedContentActions\(\)\)/);
assert.match(source, /className = "contextMenuCheck"/);
assert.doesNotMatch(source, /item\.checked \? "\[x\]"/);
console.log("Shorts and restricted-video detection, caching, filters, channel ages, rankings and async rendering passed");
