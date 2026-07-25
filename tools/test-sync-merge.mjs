import assert from "node:assert/strict";
import { mergeSynchronizationData, synchronizationContentChanged } from "../public/sync-merge.js";

const time = "2026-07-25T12:00:00.000Z";
const config = (overrides = {}) => ({
  version: 1,
  categories: [],
  favoriteCategories: [],
  channels: [],
  favorites: {},
  seenVideos: {},
  watchLater: {},
  updatedAt: "2026-07-25T10:00:00.000Z",
  ...overrides
});

{
  const remote = config({ channels: [{ id: "full-1", title: "One" }, { id: "full-2", title: "Two" }] });
  const local = config({ channels: [{ id: "old-extra", title: "Extra" }] });
  const merged = mergeSynchronizationData(null, local, remote, time);
  assert.deepEqual(merged.channels.map(({ id }) => id), ["old-extra", "full-1", "full-2"]);
}

{
  const base = config({ channels: [{ id: "one", title: "One" }, { id: "deleted", title: "Delete me" }] });
  const local = config({ ...base, channels: [{ id: "one", title: "One" }] });
  const remote = config({ ...base });
  const merged = mergeSynchronizationData(base, local, remote, time);
  assert.deepEqual(merged.channels.map(({ id }) => id), ["one"]);
}

{
  const base = config({ channels: [{ id: "one", title: "Old", categories: ["base"] }] });
  const local = config({ channels: [{ id: "one", title: "Local", categories: ["base", "local"] }] });
  const remote = config({
    channels: [{ id: "one", title: "Remote", categories: ["base", "remote"] }],
    updatedAt: "2026-07-25T11:00:00.000Z"
  });
  const merged = mergeSynchronizationData(base, local, remote, time);
  assert.equal(merged.channels[0].title, "Remote");
  assert.deepEqual(merged.channels[0].categories, ["base", "local", "remote"]);
}

{
  const base = config({ watchLater: { removed: { title: "Removed" }, kept: { title: "Old" } } });
  const local = config({ watchLater: { kept: { title: "Local" } } });
  const remote = config({ watchLater: { removed: { title: "Removed" }, kept: { title: "Old" } } });
  const merged = mergeSynchronizationData(base, local, remote, time);
  assert.equal(merged.watchLater.removed, undefined);
  assert.equal(merged.watchLater.kept.title, "Local");
}

{
  const base = config({ favorites: { video: { title: "Old", categories: ["one"] } } });
  const local = config({ favorites: {} });
  const remote = config({ favorites: { video: { title: "Edited", categories: ["one", "two"] } } });
  const merged = mergeSynchronizationData(base, local, remote, time);
  assert.equal(merged.favorites.video.title, "Edited");
  assert.deepEqual(merged.favorites.video.categories, ["one", "two"]);
}

assert.equal(
  synchronizationContentChanged(
    config({ updatedAt: "2026-07-25T10:00:00.000Z" }),
    config({ updatedAt: "2026-07-25T11:00:00.000Z" })
  ),
  false
);
assert.equal(
  synchronizationContentChanged(config(), config({ channels: [{ id: "new", title: "New" }] })),
  true
);

console.log("sync merge tests passed");
