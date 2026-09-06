import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../public/app.js", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const definition = (name) => {
  const start = source.search(new RegExp(`^(?:async )?function ${name}\\(`, "m"));
  assert.ok(start >= 0, `${name} must exist`);
  return source.slice(start, source.indexOf("\n}\n", start) + 2);
};

let saves = 0;
let favoriteRenders = 0;
let watchLaterRenders = 0;
const h = {
  favorites: {},
  watchLater: {
    first: { title: "Part 1", savedAt: "2026-09-01" },
    second: { title: "Part 2", savedAt: "2026-09-02" },
    third: { title: "Part 3", savedAt: "2026-09-03" }
  },
  expandedFavoriteVideoGroups: new Set(),
  expandedWatchLaterVideoGroups: new Set(),
  crypto: { randomUUID: () => "series-id" },
  Date,
  saveConfig: async () => { saves += 1; },
  renderFavoritesHome: () => { favoriteRenders += 1; },
  renderWatchLater: () => { watchLaterRenders += 1; }
};
vm.createContext(h);
for (const name of [
  "storedVideoGroupSource",
  "expandedStoredVideoGroups",
  "storedVideoGroupIds",
  "normalizeStoredVideoGroup",
  "groupStoredVideos",
  "ungroupStoredVideo"
]) vm.runInContext(definition(name), h);

await h.groupStoredVideos("watchLater", "first", "second");
assert.deepEqual(Array.from(h.storedVideoGroupIds("watchLater", "watchLater-video-group-series-id")), ["second", "first"]);
assert.equal(h.watchLater.second.videoGroupOrder, 1);
assert.equal(h.watchLater.first.videoGroupOrder, 2);

// A later episode can extend the same persistent series; its current size is
// derived from the collection when rendered rather than frozen in storage.
await h.groupStoredVideos("watchLater", "third", "first", "after");
assert.deepEqual(Array.from(h.storedVideoGroupIds("watchLater", "watchLater-video-group-series-id")), ["second", "first", "third"]);
assert.equal(h.watchLater.third.videoGroupOrder, 3);

await h.groupStoredVideos("watchLater", "third", "second", "before");
assert.deepEqual(Array.from(h.storedVideoGroupIds("watchLater", "watchLater-video-group-series-id")), ["third", "second", "first"]);
assert.equal(h.expandedWatchLaterVideoGroups.has("watchLater-video-group-series-id"), true);

delete h.watchLater.second;
h.normalizeStoredVideoGroup("watchLater", "watchLater-video-group-series-id");
assert.equal(h.watchLater.third.videoGroupOrder, 1);
assert.equal(h.watchLater.first.videoGroupOrder, 2);
delete h.watchLater.first;
h.normalizeStoredVideoGroup("watchLater", "watchLater-video-group-series-id");
assert.equal(h.watchLater.third.videoGroupId, undefined);
assert.equal(h.watchLater.third.videoGroupOrder, undefined);

h.watchLater.first = { title: "Part 1" };
await h.groupStoredVideos("watchLater", "first", "third");
await h.ungroupStoredVideo("watchLater", "first");
assert.equal(h.watchLater.first.videoGroupId, undefined);
assert.equal(h.watchLater.third.videoGroupId, undefined);
assert.equal(saves, 5);
assert.equal(watchLaterRenders, 5);
assert.equal(favoriteRenders, 0);

assert.match(source, /WATCH_LATER_VIDEO_GROUP_DRAG_TYPE/);
assert.match(source, /videoGroupSize: watchLaterVideoGroupSizes\.get/);
assert.match(source, /renderStoredVideoResults\(videos, watchLaterList, "watchLater"\)/);

console.log("Watch later evolving video group regression tests passed");
