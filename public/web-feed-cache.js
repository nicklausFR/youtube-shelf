import { synchronizableConfig } from "./sync-schema.js";

// Only derived channel data belongs here. The authenticated server remains the
// authority for subscriptions, favorites and other user edits.
const FIELDS = ["feedVideos", "feedVideoCount", "feedLatestPublished",
  "feedLatestTitle", "feedCheckedAt", "channelVideoCount"];

export function createWebFeedCache({ databaseName = "youtube-shelf-web-feeds" } = {}) {
  async function transaction(mode, work) {
    let db;
    try {
      db = await new Promise((resolve, reject) => {
        const request = globalThis.indexedDB.open(databaseName, 1);
        request.onupgradeneeded = () => request.result.createObjectStore("channels", { keyPath: "id" });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      return await new Promise((resolve, reject) => {
        const tx = db.transaction("channels", mode);
        const result = work(tx.objectStore("channels"));
        tx.oncomplete = () => resolve(result?.result);
        tx.onerror = tx.onabort = () => reject(tx.error);
      });
    } catch {
      // Private browsing, quota or unavailable storage must not block the app.
      return undefined;
    } finally {
      db?.close();
    }
  }

  async function remember(channels = []) {
    await transaction("readwrite", (store) => {
      for (const channel of channels) {
        if (!channel.id || !Array.isArray(channel.feedVideos)) continue;
        store.put(Object.fromEntries(["id", ...FIELDS]
          .filter((key) => channel[key] !== undefined).map((key) => [key, channel[key]])));
      }
    });
  }

  async function restore(config) {
    if (!Array.isArray(config?.channels)) return config;
    const records = await transaction("readonly", (store) => store.getAll());
    const byId = new Map((records || []).map((record) => [record.id, record]));
    const ids = new Set(config.channels.map((channel) => channel.id));
    await transaction("readwrite", (store) => {
      for (const id of byId.keys()) if (!ids.has(id)) store.delete(id);
    });
    return { ...config, channels: config.channels.map((channel) => ({
      ...channel, ...byId.get(channel.id)
    })) };
  }
  return { remember, restore };
}

export function createConfigurationStore(platform, storageKey, cache = createWebFeedCache()) {
  let remoteContent;
  let pendingWrite = Promise.resolve();
  return {
    rememberChannels: (channels) => platform.isWeb ? cache.remember(channels) : Promise.resolve(),
    async read() {
      const config = await platform.readConfiguration(storageKey);
      if (!platform.isWeb) return config;
      remoteContent = config ? JSON.stringify(synchronizableConfig(config)) : undefined;
      return cache.restore(config);
    },
    async write(value) {
      if (!platform.isWeb) return platform.writeConfiguration(storageKey, value);
      const cached = cache.remember(value.channels);
      const serialized = JSON.stringify(synchronizableConfig(value));
      const content = JSON.parse(serialized);
      // Refreshing derived data should neither upload the feeds nor rewrite the library.
      // The web adapter updates its revision after each response. Sending two
      // saves together would use the same revision and reject the second edit.
      const write = pendingWrite.then(async () => {
        await cached;
        if (serialized === remoteContent) return;
        await platform.writeConfiguration(storageKey, content);
        remoteContent = serialized;
      });
      pendingWrite = write.catch(() => {});
      await write;
    }
  };
}
