const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("public/index.html", "utf8");
const app = fs.readFileSync("public/app.js", "utf8");
const live = fs.readFileSync("youtube-live.js", "utf8");
const background = fs.readFileSync("background-core.js", "utf8");
const chromiumManifest = JSON.parse(fs.readFileSync("manifests/chromium.json", "utf8"));
const chromiumPlatform = fs.readFileSync("public/platform-chromium.js", "utf8");

assert.match(html, /id="watchHistoryTab"[\s\S]*?data-section="history"[\s\S]*?hidden/);
assert.match(html, /id="watchHistoryEnabledOption"/);
assert.match(html, /id="resetWatchHistory"/);
assert.ok(html.indexOf('id="watchHistoryOptionsPrompt"') > html.indexOf('id="youtubeDataOptionsPrompt"'));
assert.doesNotMatch(html.slice(
  html.indexOf('id="youtubeDataOptionsPrompt"'),
  html.indexOf('id="watchHistoryOptionsPrompt"')
), /watchHistoryEnabledOption|resetWatchHistory/);
assert.match(app, /function renderWatchHistory\(/);
assert.match(app, /watchHistory\.map\(\(entry, historyOrder\)/);
assert.match(app, /removeWatchHistoryEntry\(video\.historyEntryId\)/);
assert.match(app, /refreshYoutubeHistoryCompanions\(\)/);
assert.match(app, /watchHistoryTabEl\?\.addEventListener\("contextmenu"/);
assert.match(app, /activePrimarySection !== "favorites" && activePrimarySection !== "history"/);
assert.match(app, /toggleExcludedContentEl\.hidden = typeof activePrimarySection !== "undefined" && activePrimarySection === "history"/);
assert.match(app, /historyProgressPercent/);
assert.match(app, /writeEmbeddedWatchHistoryWithoutBackground/);
assert.match(app, /youtubeOriginalTitle[\s\S]*?youtube\.com\/oembed/);
assert.doesNotMatch(app, /watchUrl\.searchParams\.set\("hl", "en"\)/);
assert.match(live, /YOUTUBE_SHELF_WATCH_HISTORY_UPDATE/);
assert.match(live, /watch-history-2/);
assert.match(live, /writeWatchHistoryWithoutBackground/);
assert.match(background, /YouTubeShelfWatchHistory\.updateHistory/);
assert.deepEqual(chromiumManifest.content_scripts[0].js.slice(-3), [
  "public/platform-chromium.js",
  "public/watch-history.js",
  "youtube-live.js"
]);
assert.match(chromiumPlatform, /public\/watch-history\.js/);

console.log("Watch history UI wiring tests passed");
