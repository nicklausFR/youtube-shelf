import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../public/app.js", import.meta.url), "utf8").replace(/\r\n/g, "\n");
function definition(name) {
  const functionStart = source.search(new RegExp(`^function ${name}\\(`, "m"));
  assert.ok(functionStart >= 0, `Missing ${name}`);
  return source.slice(functionStart, source.indexOf("\n}\n", functionStart) + 2);
}
const start = source.indexOf("function videoIdFromInput(");
const end = source.indexOf("function pushHistory(", start);
assert.ok(start >= 0 && end > start, "Direct video search helpers must exist");

const context = vm.createContext({ URL });
vm.runInContext(`${source.slice(start, end)}; this.helpers = { videoIdFromInput, videoFromYoutubeSearchInput };`, context);
const { videoIdFromInput, videoFromYoutubeSearchInput } = context.helpers;

const videoId = "3y_v1uDrMrA";
assert.equal(videoIdFromInput(`https://www.youtube.com/watch?v=${videoId}`), videoId);
assert.equal(videoIdFromInput(`https://youtu.be/${videoId}?t=42`), videoId);
assert.equal(videoIdFromInput(`https://www.youtube.com/shorts/${videoId}`), videoId);
assert.equal(videoIdFromInput("https://www.youtube.com/@example"), "");

assert.deepEqual(
  { ...videoFromYoutubeSearchInput(`https://www.youtube.com/watch?v=${videoId}&list=PL_test&index=4`) },
  {
    id: videoId,
    title: videoId,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    playlistId: "PL_test",
    playlistIndex: 4
  }
);
assert.equal(videoFromYoutubeSearchInput("ordinary search words"), null);

context.allChannels = [];
context.activeChannel = null;
vm.runInContext(definition("videoChannelTitle"), context);
assert.equal(context.videoChannelTitle({ id: videoId, title: videoId }), "");

context.DOMParser = class {
  parseFromString() {
    return { querySelectorAll: () => [] };
  }
};
context.droppedVideoFromDataTransfer = () => null;
vm.runInContext([
  "youtubeUrlFromDroppedText",
  "droppedTextFromDataTransfer",
  "youtubeVideoSearchValueFromTransfer"
].map(definition).join("\n"), context);
const textTransfer = {
  getData(type) {
    return type === "text/plain" ? `À voir : https://www.youtube.com/watch?v=${videoId}` : "";
  }
};
assert.equal(context.youtubeVideoSearchValueFromTransfer(textTransfer), `https://www.youtube.com/watch?v=${videoId}`);

assert.match(source, /searchInputEl\.addEventListener\("paste"/);
assert.match(source, /searchInputEl\.addEventListener\("drop"/);
assert.match(source, /includeShorts: Boolean\(videoFromYoutubeSearchInput\(youtubeSearchResultsQuery\)\)/);
assert.match(source, /if \(videoFromYoutubeSearchInput\(value\)\) setActivePrimarySection\("youtube"\)/);
assert.doesNotMatch(
  source.slice(source.indexOf('searchFormEl.addEventListener("submit"'), source.indexOf('document.addEventListener("keydown"', source.indexOf('searchFormEl.addEventListener("submit"'))),
  /play\(videoId\)/
);

console.log("Direct YouTube URL search, paste, drop and submit behavior passed");
