import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../public/app.js", import.meta.url), "utf8").replace(/\r\n/g, "\n");
function definition(name) {
  const start = source.search(new RegExp(`^(?:async )?function ${name}\\(`, "m"));
  assert.ok(start >= 0, `Missing ${name}`);
  return source.slice(start, source.indexOf("\n}\n", start) + 2);
}
const noop = () => {};
const classes = new Set();
const attributes = {};
const button = {
  classList: { toggle(name, active) { active ? classes.add(name) : classes.delete(name); } },
  setAttribute(name, value) { attributes[name] = value; }
};
const h = vm.createContext({
  youtubeThisWeekRefreshEl: button, activePrimarySection: "channels", activeView: "channels",
  activeChannel: { id: "one" }, channelListLoading: null, channelVideoSearchLoading: false,
  newVideosRefreshPending: false, channelVideoLoadRequestId: 0, channelVideosContinuation: "",
  channelVideosLoadingMore: false, channelVideosInnertubeFailed: false,
  channelVideosLoadedSort: "local", currentVideos: [], channelSearchQuery: "",
  refreshEl: {}, uiMessage: key => key, weeklyRefreshStatusText: () => "Last refresh",
  setStatus: noop, renderChannelVideos: noop,
  innertubeVideosWithChannel: videos => videos,
  mergeChannelVideoLists: (current, added) => [...current, ...added],
  rememberChannelWeeklyVideos: async () => {},
  networkMeter: { snapshot() { throw new Error("Network traffic must not control loading"); } }
});
vm.runInContext([
  "beginChannelListLoading", "syncListRefreshButton",
  "loadChannelVideosForYoutubeOrder", "loadMoreChannelVideos"
].map(definition).join("\n"), h);
function busy(expected) {
  assert.equal(classes.has("is-loading"), expected);
  assert.equal(attributes["aria-busy"], String(expected));
  if (expected) assert.equal(button.disabled, true);
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

// Network traffic is irrelevant; the full operation includes saving its results.
h.syncListRefreshButton();
busy(false);
const page = deferred(), save = deferred();
h.fetchYoutubeChannelVideosPage = () => page.promise;
h.rememberChannelWeeklyVideos = () => save.promise;
const loading = h.loadChannelVideosForYoutubeOrder("latest");
busy(true);
page.resolve({ videos: [], continuation: "next" });
await new Promise(resolve => setImmediate(resolve));
h.syncListRefreshButton();
busy(true);
save.resolve();
await loading;
busy(false);

// A superseded request finishing cannot stop a newer request.
const oldPage = deferred(), newPage = deferred();
h.fetchYoutubeChannelVideosPage = () => oldPage.promise;
const oldLoading = h.loadChannelVideosForYoutubeOrder("latest");
h.fetchYoutubeChannelVideosPage = () => newPage.promise;
const newLoading = h.loadChannelVideosForYoutubeOrder("popular");
oldPage.resolve({ videos: [] });
await oldLoading;
busy(true);
newPage.reject(new Error("offline"));
await newLoading;
busy(false);

// Pagination stays busy until completion, including failures.
h.channelVideosContinuation = "next";
const more = deferred();
h.fetchYoutubeChannelVideosPage = () => more.promise;
const pagination = h.loadMoreChannelVideos();
busy(true);
more.reject(new Error("offline"));
await pagination;
busy(false);

// Only the visible list owns its indicator; searches and weekly refreshes count.
const finish = h.beginChannelListLoading(h.activeChannel);
h.activeChannel = { id: "two" };
h.syncListRefreshButton();
busy(false);
finish();
h.channelVideoSearchLoading = true;
h.syncListRefreshButton();
busy(true);
h.activePrimarySection = "youtube";
h.activeView = "youtubeHome";
h.syncListRefreshButton();
busy(false);
h.newVideosRefreshPending = true;
h.syncListRefreshButton();
busy(true);
h.newVideosRefreshPending = false;
h.syncListRefreshButton();
busy(false);
console.log("List loading: complete operations, stale requests, failures, pagination and view scoping passed");
