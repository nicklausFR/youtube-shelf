import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../background-core.js", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const start = source.indexOf('const YOUTUBE_DATA_REQUEST_TYPE = "YOUTUBE_SHELF_DATA_REQUEST";');
const end = source.indexOf("host.runtime.onMessage.addListener", start);
assert.ok(start >= 0 && end > start);

let active = 0;
let peak = 0;
let calls = 0;
let requestDelay = 10;
const context = {
  URL, Map, Object, Array, Number, String, JSON, Promise, Date,
  setTimeout, clearTimeout,
  fetch: async url => {
    calls++;
    active++;
    peak = Math.max(peak, active);
    await new Promise(resolve => setTimeout(resolve, requestDelay));
    active--;
    return new Response(String(url), { status: 200, headers: { "Content-Type": "text/plain" } });
  }
};
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);

const request = suffix => context.normalizedYoutubeRequest({
  url: `https://www.youtube.com/${suffix}`,
  method: "GET",
  headers: {},
  cache: "no-store"
});

const duplicate = context.queueYoutubeRequest(request("same"), 1);
assert.equal(context.queueYoutubeRequest(request("same"), 1), duplicate);
await duplicate;
assert.equal(calls, 1, "Identical cross-view requests share one fetch");

peak = 0;
requestDelay = 250;
await Promise.all([
  context.queueYoutubeRequest(request("one"), 1),
  context.queueYoutubeRequest(request("two"), 1),
  context.queueYoutubeRequest(request("three"), 1)
]);
assert.equal(peak, 1, "The default shared lane is strictly serial");

peak = 0;
await Promise.all([
  context.queueYoutubeRequest(request("four"), 2),
  context.queueYoutubeRequest(request("five"), 2),
  context.queueYoutubeRequest(request("six"), 2)
]);
assert.equal(peak, 2, "The same lane can safely test limited parallelism");

assert.throws(() => context.normalizedYoutubeRequest({ url: "https://example.com/", method: "GET" }), /Unsupported/);
assert.throws(() => context.normalizedYoutubeRequest({ url: "https://www.youtube.com/", method: "DELETE" }), /Unsupported/);

console.log("shared YouTube request broker serialization, deduplication and concurrency tests passed");
