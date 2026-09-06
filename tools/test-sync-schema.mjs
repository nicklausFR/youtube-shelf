import assert from "node:assert/strict";
import { synchronizableConfig } from "../public/sync-schema.js";

const result = synchronizableConfig({
  categories: [{ id: "science", name: "Science" }],
  favoriteCategories: [],
  channels: [{
    id: "channel",
    title: "Channel",
    feedVideos: [{ id: "video" }],
    feedVideoCount: 1,
    feedLatestPublished: "2026-08-01T00:00:00.000Z",
    feedCheckedAt: "2026-08-01T01:00:00.000Z",
    custom: "kept"
  }],
  favorites: { video: { title: "Favorite" } },
  seenVideos: {
    video: { seenAt: "2026-08-01T02:00:00.000Z", title: "Seen", description: "local cache" }
  },
  watchLater: { later: { title: "Later" } },
  updatedAt: "2026-08-01T03:00:00.000Z"
});

assert.equal(result.channels[0].feedVideos, undefined);
assert.equal(result.channels[0].feedVideoCount, undefined);
assert.equal(result.channels[0].custom, "kept");
assert.deepEqual(result.seenVideos.video, {
  seenAt: "2026-08-01T02:00:00.000Z",
  title: "Seen"
});
assert.equal(result.favorites.video.title, "Favorite");
assert.equal(result.watchLater.later.title, "Later");

console.log("sync schema tests passed");
