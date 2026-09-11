import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { synchronizableConfig } from "../public/sync-schema.js";
import { synchronizationContentChanged } from "../public/sync-merge.js";
import { weeklyVideoSummary } from "../public/weekly-videos.js";
import { createConfigurationStore } from "../public/web-feed-cache.js";

const source = readFileSync(new URL("../public/app.js", import.meta.url), "utf8").replace(/\r\n/g, "\n");
function definition(name) {
  const start = source.search(new RegExp(`^(?:async )?function ${name}\\(`, "m"));
  assert.ok(start >= 0);
  return source.slice(start, source.indexOf("\n}\n", start) + 2);
}

// A slow save (e.g. adding a favorite on the PWA) must not discard feeds that
// finish while the server is responding. Repeat with three different arrivals.
const h = {
  configLoaded: true, config: { channels: [] }, allChannels: [{ id: "channel" }],
  allCategories: [], favoriteCategories: [], favorites: {}, seenVideos: {}, watchLater: {},
  activeChannel: null, synchronizableConfig, synchronizationContentChanged, Date
};
vm.createContext(h);
vm.runInContext(["uniqueChannels", "saveConfig", "replaceChannelSummary"].map(definition).join("\n"), h);
for (let pass = 1; pass <= 3; pass++) {
  let release;
  h.writeStoredConfig = () => new Promise(resolve => { release = resolve; });
  const saving = h.saveConfig();
  const previous = h.allChannels[0];
  h.replaceChannelSummary({ ...previous, ...weeklyVideoSummary(previous, {
    rssVideos: [{ id: `video-${pass}`, published: new Date(Date.now() - pass * 1000).toISOString() }]
  }) });
  release();
  await saving;
  assert.equal(h.allChannels[0].feedVideos?.length, pass, "A completed save erased a concurrently loaded video");
}
console.log("Three refresh arrivals during delayed saves retain every discovered video.");

// PWA saves use the revision returned by the preceding save, even when local
// cache writes finish out of order. Mutating a later favorite cannot alter an
// already queued request's payload.
{
  const requests = [];
  const releases = [];
  let revision = 0;
  const cacheReleases = [];
  const store = createConfigurationStore({ isWeb: true,
    writeConfiguration: async (_, value) => {
      requests.push({ revision, value });
      await new Promise(resolve => releases.push(resolve));
      revision++;
    }
  }, "config", { remember: () => new Promise(resolve => cacheReleases.push(resolve)) });
  const value = { channels: [], favorites: { a: { title: "First" } } };
  const first = store.write(value);
  value.favorites.a.title = "Second";
  const second = store.write(value);
  cacheReleases[1]();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests.length, 0);
  cacheReleases[0]();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests.length, 1);
  assert.equal(requests[0].value.favorites.a.title, "First");
  releases[0]();
  await first;
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests[1].revision, 1);
  assert.equal(requests[1].value.favorites.a.title, "Second");
  releases[1]();
  await second;
}

console.log("PWA saves serialize revisions and retain queued edit snapshots.");
