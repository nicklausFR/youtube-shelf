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
let routedYoutubeRequests = 0;
let diagnostics = {};
const meter = installNetworkMeter({ youtubeFetch: async () => {
  routedYoutubeRequests++;
  return new Response("hello", { headers: { "Content-Length": "5" } });
}, diagnosticsStorage: { set(value) { diagnostics = value; } }, diagnosticsDelayMs: 1 });
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
assert.equal(routedYoutubeRequests, 1, "Counted requests use the shared YouTube channel");
await new Promise((resolve) => setTimeout(resolve, 10));
assert.equal(diagnostics.youtubeChannelShelfNetworkDiagnosticsV1.requests, 1);
assert.equal(diagnostics.youtubeChannelShelfNetworkDiagnosticsV1.totalBytes, 8);
assert.ok(diagnostics.youtubeChannelShelfNetworkDiagnosticsV1.savedAt > 0);
meter.recordExternal({ requests: 2, receivedBytes: 2048, activeDelta: 1 });
assert.equal(latest.requests, 3);
assert.equal(latest.receivedBytes, 2053);
assert.equal(latest.active, 1);
meter.recordExternal({ activeDelta: -1 });
assert.equal(latest.active, 0);
const firstSavedAt = diagnostics.youtubeChannelShelfNetworkDiagnosticsV1.savedAt;
meter.recordExternal({ active: 2 });
assert.equal(latest.active, 2);
meter.recordExternal({ active: 0 });
assert.equal(latest.active, 0, "Absolute background activity repairs a missed delta");
await globalThis.fetch("https://nextcloud.example.test/data", { method: "PUT", body: "ignored" });
assert.equal(latest.requests, 3);
await globalThis.fetch("https://www.youtube.com/embed/abcdefghijk");
await globalThis.fetch("https://www.youtube.com/videoplayback?id=abcdefghijk");
await globalThis.fetch("https://rr1---sn.example.googlevideo.com/videoplayback?id=abcdefghijk");
assert.equal(latest.requests, 3);
meter.dispose();
globalThis.fetch = originalFetch;

let heartbeatDiagnostics = {};
const heartbeatMeter = installNetworkMeter({
  diagnosticsStorage: { set(value) { heartbeatDiagnostics = value; } },
  diagnosticsDelayMs: 1,
  diagnosticsHeartbeatMs: 5,
  externalActiveTimeoutMs: 8
});
heartbeatMeter.recordExternal({ active: 1 });
await new Promise((resolve) => setTimeout(resolve, 25));
assert.equal(heartbeatMeter.snapshot().active, 0, "Orphaned external activity expires");
assert.ok(
  heartbeatDiagnostics.youtubeChannelShelfNetworkDiagnosticsV1.savedAt > firstSavedAt,
  "Diagnostics time advances while network traffic is idle"
);
heartbeatMeter.dispose();

console.log("network meter tests passed");
