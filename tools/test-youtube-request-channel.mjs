import assert from "node:assert/strict";
import { createYoutubeRequestClient } from "../public/youtube-request-channel.js";

const messages = [];
const runtime = {
  async sendMessage(message) {
    messages.push(message);
    return {
      transportOk: true,
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ shared: true })
    };
  }
};
const request = createYoutubeRequestClient({ runtime, concurrency: () => 7 });
const response = await request("https://www.youtube.com/youtubei/v1/browse", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ browseId: "UCtest" }),
  cache: "no-store"
});
assert.deepEqual(await response.json(), { shared: true });
assert.equal(messages.length, 1);
assert.equal(messages[0].concurrency, 3, "The shared lane clamps experimental concurrency");
assert.equal(messages[0].method, "POST");
assert.equal(messages[0].headers["content-type"], "application/json");

const controller = new AbortController();
controller.abort();
await assert.rejects(request("https://www.youtube.com/watch?v=dQw4w9WgXcQ", {
  signal: controller.signal
}), error => error?.name === "AbortError");
assert.equal(messages.length, 1, "An already aborted request never enters the shared lane");

let fallbackCalls = 0;
const fallback = createYoutubeRequestClient({
  fetchImpl: async () => { fallbackCalls++; return new Response("fallback"); }
});
assert.equal(await (await fallback("https://www.youtube.com/data")).text(), "fallback");
assert.equal(fallbackCalls, 1);

let unavailableMessages = 0;
let localActive = 0;
let localPeak = 0;
const unavailable = createYoutubeRequestClient({
  runtime: { async sendMessage() { unavailableMessages++; return undefined; } },
  fetchImpl: async () => {
    localActive++;
    localPeak = Math.max(localPeak, localActive);
    await new Promise(resolve => setTimeout(resolve, 5));
    localActive--;
    return new Response("local");
  },
  concurrency: () => 1
});
assert.equal(await (await unavailable("https://www.youtube.com/first")).text(), "local");
await Promise.all([
  unavailable("https://www.youtube.com/second"),
  unavailable("https://www.youtube.com/third")
]);
assert.equal(unavailableMessages, 1, "A missing worker response switches the page to its local lane");
assert.equal(localPeak, 1, "The fallback remains serialized instead of returning to request bursts");

console.log("shared YouTube request client tests passed");
