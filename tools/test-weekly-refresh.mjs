import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { fetchWeeklyChannelVideos, weeklyVideoSummary } from "../public/weekly-videos.js";

const source = readFileSync(new URL("../public/app.js", import.meta.url), "utf8").replace(/\r\n/g, "\n");
function definition(name) {
  const start = source.search(new RegExp(`^(?:async )?function ${name}\\(`, "m"));
  assert.ok(start >= 0, `Missing function ${name}`);
  const end = source.indexOf("\n}\n", start);
  return source.slice(start, end + 2);
}
const functions = ["checkIsDue", "channelFeedCacheMissing", "runConcurrent", "feedSummaryChanged",
  "replaceChannelSummary", "latestWeeklyRefreshAt", "weeklyFeedFailureText", "weeklyRefreshStatusText",
  "refreshDueChannelFeeds", "refreshChannelSummaries", "performChannelSummaryRefresh"];
const noop = () => {};
function harness() {
  const state = {
    configLoaded: true, allChannels: [], activeChannel: null, activePrimarySection: "youtube",
    activeView: "youtubeHome", feedCheckIntervalMinutes: 30, metadataCheckIntervalDays: 7,
    feedCheckConcurrency: 2, newVideosRefreshPending: false, channelSummaryRefreshPromise: null,
    weeklyFeedFailures: new Set(), document: { visibilityState: "visible" }, navigator: { onLine: true },
    AbortController, setTimeout, clearTimeout, Date, Intl, interfaceI18n: { locale: "en" },
    weeklyVideoSummary,
    fetchWeeklyChannelVideos: (options) => fetchWeeklyChannelVideos({
      ...options, fetchImpl: (...args) => state.fetch(...args),
      fetchPage: async () => ({ videos: [], continuation: "" }), timeoutMs: 20
    }),
    parseFeed: JSON.parse, videoWithChannel: (video) => video, renderCategories: noop,
    renderSidePanelPath: noop, syncYoutubeThisWeekButton: noop, renderChannels: noop,
    channelsForActiveCategory: () => [], setActiveChannelButton: noop, renderCount: 0,
    renderNewVideos: () => { state.renderCount++; }, saveConfig: async () => {}, setStatus: noop,
    uiMessage: (key, values = []) => `${key}:${values.join(",")}`,
    prioritizedChannelsForRefresh: () => [...state.allChannels],
    fetchChannelVideoCount: async () => 1, fetchChannelMetadata: async () => ({})
  };
  vm.createContext(state);
  vm.runInContext(functions.map(definition).join("\n"), state);
  return state;
}
const oldDate = new Date(Date.now() - 3600000).toISOString();
const channel = (id) => ({ id, title: id, feedCheckedAt: oldDate,
  feedLatestPublished: oldDate, feedVideos: [{ id: `cached-${id}`, published: oldDate }] });
const response = (videos) => ({ ok: true, text: async () => JSON.stringify(videos) });

// A due channel is updated without touching a fresh one, then becomes ineligible.
{
  const h = harness();
  h.allChannels = [channel("due"), { ...channel("fresh"), feedCheckedAt: new Date().toISOString() }];
  const calls = [];
  h.fetch = async (url, options) => {
    calls.push(url);
    assert.equal(options.cache, "no-store");
    assert.ok(options.signal);
    return response([{ id: "older", published: oldDate }, { id: "latest", published: new Date().toISOString() }]);
  };
  await h.refreshChannelSummaries({ feedsOnly: true });
  assert.equal(calls.length, 1);
  assert.equal(h.allChannels[0].feedVideos[0].id, "latest");
  await h.refreshChannelSummaries({ feedsOnly: true });
  assert.equal(calls.length, 1);
  assert.equal(h.checkIsDue("2099-01-01", 1800000), true);
}
// Concurrent automatic callers share work; manual refresh bypasses the fresh cache afterwards.
{
  const h = harness();
  h.allChannels = [channel("one")];
  let release;
  let calls = 0;
  h.fetch = async () => {
    calls++;
    if (calls === 1) await new Promise((resolve) => { release = resolve; });
    return response([{ id: "latest", published: oldDate }]);
  };
  const first = h.refreshChannelSummaries({ feedsOnly: true });
  const second = h.refreshChannelSummaries({ feedsOnly: true });
  const forced = h.refreshChannelSummaries({ forceFeeds: true, feedsOnly: true });
  assert.equal(calls, 1);
  release();
  await Promise.all([first, second, forced]);
  assert.equal(calls, 2);
  assert.equal(h.newVideosRefreshPending, false);
}
// Partial failures preserve cache/date, remain due, and cannot claim a full recent refresh.
{
  const h = harness();
  h.allChannels = [channel("failed"), channel("ok")];
  h.fetch = async (url) => {
    if (url.includes("failed")) throw new Error("offline");
    return response([{ id: "new", published: new Date().toISOString() }]);
  };
  await h.refreshChannelSummaries({ feedsOnly: true });
  assert.equal(h.allChannels[0].feedVideos[0].id, "cached-failed");
  assert.equal(h.allChannels[0].feedCheckedAt, oldDate);
  assert.equal(h.latestWeeklyRefreshAt(), Date.parse(oldDate));
  assert.equal(h.weeklyRefreshStatusText(), "weeklyFeedRefreshFailed:1");
  h.fetch = async () => response([{ id: "recovered", published: oldDate }]);
  await h.refreshChannelSummaries({ feedsOnly: true });
  assert.equal(h.weeklyFeedFailures.size, 0);
  assert.ok(h.allChannels[0].feedVideos.some((video) => video.id === "recovered"));
}
// A stalled request aborts, releases the refresh, and preserves its last good feed.
{
  const h = harness();
  h.allChannels = [channel("slow")];
  h.setTimeout = (callback, delay) => {
    assert.equal(delay, 15000);
    return setTimeout(callback, 5);
  };
  h.fetch = async (_, { signal }) => new Promise((_, reject) => {
    signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
  });
  await h.refreshChannelSummaries({ feedsOnly: true });
  assert.equal(h.newVideosRefreshPending, false);
  assert.equal(h.allChannels[0].feedCheckedAt, oldDate);
  assert.equal(h.weeklyFeedFailures.size, 1);
}
// Both weekly views receive updates, and edits made while fetching survive.
{
  const h = harness();
  h.activeView = "newVideos";
  h.activePrimarySection = "channels";
  h.allChannels = [channel("one")];
  h.fetch = async () => {
    h.allChannels[0] = { ...h.allChannels[0], title: "Renamed while loading" };
    return response([{ id: "new", published: oldDate }]);
  };
  await h.refreshChannelSummaries({ feedsOnly: true });
  assert.ok(h.renderCount > 0);
  assert.equal(h.allChannels[0].title, "Renamed while loading");
}
// Exercise the actual timer and resume/reconnect handlers with a deterministic clock.
{
  const h = harness();
  const events = {};
  const timers = [];
  let checks = 0;
  h.refreshChannelSummaries = async () => { checks++; };
  h.syncPanelVisibilityState = noop;
  h.synchronizeWebDavConfig = async () => {};
  h.document.addEventListener = (name, callback) => { events[name] = callback; };
  h.window = {
    addEventListener: (name, callback) => { events[name] = callback; },
    setInterval: (callback, delay) => timers.push({ callback, delay })
  };
  const start = source.indexOf('document.addEventListener("visibilitychange",');
  const end = source.indexOf('window.addEventListener("resize", scheduleCategoryOverflowSync);', start);
  vm.runInContext(source.slice(start, end), h);
  assert.equal(timers[0].delay, 60000);
  timers[0].callback();
  events.visibilitychange();
  events.online();
  assert.equal(checks, 3);
  h.document.visibilityState = "hidden";
  timers[0].callback();
  events.visibilitychange();
  assert.equal(checks, 3);
  h.document.visibilityState = "visible";
  h.navigator.onLine = false;
  timers[0].callback();
  assert.equal(checks, 3);
  assert.match(definition("showNewVideos"), /refreshDueChannelFeeds\(\)/);
  assert.match(definition("showYoutubeSearchHome"), /refreshDueChannelFeeds\(\)/);
}
// Invalid XML/HTML is rejected; a genuinely empty Atom feed remains valid.
{
  const h = harness();
  vm.runInContext(definition("parseFeed"), h);
  for (const [localName, parserError, valid] of [["html", false, false], ["feed", true, false], ["feed", false, true]]) {
    h.DOMParser = class {
      parseFromString() { return { documentElement: { localName }, querySelector: () => parserError, querySelectorAll: () => [] }; }
    };
    if (valid) assert.equal(h.parseFeed("xml").length, 0);
    else assert.throws(() => h.parseFeed("xml"), /invalid video feed/);
  }
}
// A failed forced refresh of a fresh channel is retried on the next automatic check.
{
  const h = harness();
  h.allChannels = [{ ...channel("one"), feedCheckedAt: new Date().toISOString() }];
  h.fetch = async () => ({ ok: false, status: 503 });
  await h.refreshChannelSummaries({ forceFeeds: true, feedsOnly: true });
  assert.equal(h.weeklyFeedFailures.size, 1);
  h.fetch = async () => response([{ id: "retried", published: oldDate }]);
  await h.refreshChannelSummaries({ feedsOnly: true });
  assert.equal(h.weeklyFeedFailures.size, 0);
  assert.ok(h.allChannels[0].feedVideos.some((video) => video.id === "retried"));
}
// Slow metadata cannot leave the global refresh locked after feeds have completed.
{
  const h = harness();
  h.allChannels = [channel("one")];
  h.fetch = async () => response([{ id: "new", published: oldDate }]);
  h.setTimeout = (callback) => setTimeout(callback, 5);
  h.fetchChannelMetadata = h.fetchChannelVideoCount = async (_, signal) => new Promise((_, reject) => {
    signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
  });
  await h.refreshChannelSummaries();
  assert.equal(h.newVideosRefreshPending, false);
  assert.equal(h.channelSummaryRefreshPromise, null);
  assert.ok(h.allChannels[0].feedVideos.some((video) => video.id === "new"));
}
console.log("weekly refresh regression tests passed");
