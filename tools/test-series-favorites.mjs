import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { annotateVideoSeries } from "../public/video-series.js";

const source = readFileSync(new URL("../public/app.js", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const start = source.indexOf("function mergeFavoriteSeries(");
const definition = source.slice(start, source.indexOf("\n}\n", start) + 2);
const episode = (n, extra = {}) => ({ title: `Repair | Crane Project | Part ${n}`, channelId: "creator", ...extra });
const favorites = {
  third: episode(3, { videoGroupId: "existing", videoGroupOrder: 1, note: "keep", categories: ["work"] }),
  first: episode(1, { videoGroupId: "existing", videoGroupOrder: 2 }),
  second: episode(2),
  other: { title: "Unrelated", channelId: "creator" }
};
const context = {
  favorites, annotateVideoSeries, crypto: { randomUUID: () => "new" },
  seriesCatalog: () => Object.entries(favorites).map(([id, item]) => ({ ...item, id })),
  normalizeFavoriteVideoGroup: () => {}
};
vm.createContext(context);
vm.runInContext(definition, context);
context.mergeFavoriteSeries({ id: "second" });
assert.deepEqual([favorites.first.videoGroupOrder, favorites.second.videoGroupOrder, favorites.third.videoGroupOrder], [1, 2, 3]);
assert.equal(favorites.second.videoGroupId, "existing");
assert.equal(favorites.third.note, "keep");
assert.deepEqual(favorites.third.categories, ["work"]);
assert.equal(favorites.other.videoGroupId, undefined);
favorites.fourth = episode(4, { videoGroupId: "separate" });
context.mergeFavoriteSeries({ id: "fourth" });
assert.equal(favorites.fourth.videoGroupId, "existing");
assert.equal(favorites.fourth.videoGroupOrder, 4);
context.mergeFavoriteSeries({ id: "fourth" });
assert.equal(Object.keys(favorites).length, 5);
favorites.play1 = { title: "Introduction", playlistId: "PLcourse", playlistIndex: 1 };
favorites.play2 = { title: "Conclusion", playlistId: "PLcourse", playlistIndex: 2 };
context.mergeFavoriteSeries({ id: "play2" });
assert.equal(favorites.play1.videoGroupId, favorites.play2.videoGroupId);
assert.deepEqual([favorites.play1.videoGroupOrder, favorites.play2.videoGroupOrder], [1, 2]);
console.log("Favorite series: merge, episode ordering, metadata preservation and playlists passed");
