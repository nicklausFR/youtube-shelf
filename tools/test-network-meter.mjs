import assert from "node:assert/strict";
import { formatNetworkBytes, installNetworkMeter } from "../public/network-meter.js";

assert.equal(formatNetworkBytes(0, true), "0B");
assert.equal(formatNetworkBytes(1024, true), "1K");
assert.equal(formatNetworkBytes(1536, true), "1.5K");
assert.equal(formatNetworkBytes(1024 * 1024, true), "1M");
assert.equal(formatNetworkBytes(1536), "1.5 KB");
assert.equal(formatNetworkBytes(1536, false, "fr"), "1.5 Ko");

const originalFetch = globalThis.fetch;
globalThis.fetch = async () => new Response("hello", { headers: { "Content-Length": "5" } });
const meter = installNetworkMeter();
let latest = meter.snapshot();
meter.subscribe((state) => {
  latest = state;
});
await globalThis.fetch("https://www.youtube.com/data", { method: "POST", body: "abc" });
assert.equal(latest.requests, 1);
assert.equal(latest.sentBytes, 3);
assert.equal(latest.receivedBytes, 5);
assert.equal(latest.totalBytes, 8);
assert.equal(latest.active, 0);
meter.recordExternal({ requests: 2, receivedBytes: 2048, activeDelta: 1 });
assert.equal(latest.requests, 3);
assert.equal(latest.receivedBytes, 2053);
assert.equal(latest.active, 1);
meter.recordExternal({ activeDelta: -1 });
assert.equal(latest.active, 0);
await globalThis.fetch("https://nextcloud.example.test/data", { method: "PUT", body: "ignored" });
assert.equal(latest.requests, 3);
await globalThis.fetch("https://www.youtube.com/embed/abcdefghijk");
await globalThis.fetch("https://www.youtube.com/videoplayback?id=abcdefghijk");
await globalThis.fetch("https://rr1---sn.example.googlevideo.com/videoplayback?id=abcdefghijk");
assert.equal(latest.requests, 3);
globalThis.fetch = originalFetch;

console.log("network meter tests passed");
