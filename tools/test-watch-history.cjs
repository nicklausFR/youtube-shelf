const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("public/watch-history.js", "utf8");
const context = { globalThis: {} };
vm.runInNewContext(source, context, { filename: "public/watch-history.js" });
const historyApi = context.globalThis.YouTubeShelfWatchHistory;

assert.ok(historyApi, "watch-history API is exposed");

const base = {
  videoId: "abcdefghijk",
  title: "A video",
  channel: "A channel",
  startedAt: "2026-09-11T10:00:00.000Z",
  updatedAt: "2026-09-11T10:00:20.000Z",
  duration: 100,
  lastPosition: 12,
  ranges: [[0, 12]]
};

assert.deepEqual(
  historyApi.updateHistory([], { ...base, sessionId: "too-short", playedSeconds: 12 }),
  [],
  "sessions shorter than 15 seconds are ignored"
);

let history = historyApi.updateHistory([], {
  ...base,
  sessionId: "first-session",
  playedSeconds: 20,
  ranges: [[0, 20]]
});
assert.equal(history.length, 1);
assert.equal(history[0].id, "first-session");

history = historyApi.updateHistory(history, {
  ...base,
  sessionId: "second-session",
  startedAt: "2026-09-11T11:00:00.000Z",
  playedSeconds: 18,
  ranges: [[40, 58]]
});
assert.equal(history.length, 2, "the same video watched twice keeps two entries");
assert.equal(
  history.map((entry) => entry.id).join(","),
  "second-session,first-session",
  "entries keep strict reverse chronology"
);

history = historyApi.updateHistory(history, {
  ...base,
  sessionId: "first-session",
  playedSeconds: 45,
  ranges: [[20, 45]]
});
assert.equal(history.length, 2, "updating one session does not duplicate it");
assert.equal(history.find((entry) => entry.id === "first-session").playedSeconds, 45);

history = historyApi.updateHistory(history, {
  ...base,
  sessionId: "completed-session",
  startedAt: "2026-09-11T12:00:00.000Z",
  playedSeconds: 96,
  ranges: [[0, 96]]
});
assert.equal(history[0].completed, true, "95% unique coverage marks a session completed");

assert.equal(historyApi.coveredSeconds([[0, 20], [10, 30]]), 30, "overlapping ranges are counted once");

console.log("Watch history tests passed");
