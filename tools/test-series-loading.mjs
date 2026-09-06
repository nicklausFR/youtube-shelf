import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../public/app.js", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const start = source.indexOf("  async function update() {", source.indexOf("function openVideoSeries(seed)"));
const definition = source.slice(start, source.indexOf('\n  render();\n  update();', start));

for (const playlistId of [undefined, "PLcourse"]) {
  const requests = [];
  const progress = [];
  let timerCleared = false;
  const fetchPage = async ({ continuation }) => {
    requests.push(continuation);
    return { videos: [{ id: continuation ? "second" : "first" }], continuation: continuation ? "" : "next" };
  };
  const context = {
    seed: { playlistId, channel: "Creator" }, seedChannelId: "UCcreator",
    spinner: {}, list: { setAttribute(key, value) { this[key] = value; } },
    status: {}, heading: {}, dialog: { open: true, addEventListener() {}, removeEventListener() {} },
    playlistVideos: [], catalog: [], playlistLoaded: false, cardSeriesAnnotations: {},
    discoveredSeriesVideos: new Map(),
    relevantCatalog() { return [...context.discoveredSeriesVideos.values()]; },
    render() { return context.discoveredSeriesVideos.size; },
    uiMessage(key, values) { progress.push([key, values]); return `${key}:${values}`; },
    fetchYoutubeChannelVideosPage: fetchPage, fetchYoutubePlaylistPage: fetchPage,
    setInterval() { return 1; }, clearInterval() { timerCleared = true; }
  };
  vm.createContext(context);
  await vm.runInContext(`${definition}\nupdate()`, context);
  assert.deepEqual(requests, ["", "next"], context.status.textContent);
  assert.equal(context.status.textContent, `${playlistId ? "seriesPlaylistComplete" : "seriesDetectedComplete"}:2`);
  assert.deepEqual(progress.filter(([key]) => key === "seriesLoadingCount").map(([, values]) => Array.from(values).slice(0, 3)), [[1, 1, 1], [2, 2, 2]]);
  assert.equal(context.spinner.hidden, true);
  assert.equal(context.list["aria-busy"], "false");
  assert.equal(timerCleared, true);
}
console.log("Series and playlist loading: two pages, progress and completion passed");
