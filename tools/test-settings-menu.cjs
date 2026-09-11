const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const app = fs.readFileSync("public/app.js", "utf8");
const background = fs.readFileSync("background-core.js", "utf8");
const html = fs.readFileSync("public/index.html", "utf8");
const english = JSON.parse(fs.readFileSync("_locales/en/messages.json", "utf8"));
const french = JSON.parse(fs.readFileSync("_locales/fr/messages.json", "utf8"));

const menuSource = background.match(/const SHELF_SETTINGS_MENU_ITEMS = (\[[\s\S]*?\]);\s*const SHELF_SETTINGS_DESTINATIONS/);
assert.ok(menuSource, "Chrome settings menu descriptors are declared");
const chromeItems = vm.runInNewContext(
  `const contextMenuTitle = (_key, fallback) => fallback; (${menuSource[1]})`
);

assert.deepEqual(
  Array.from(chromeItems.filter((item) => !item.parentId), (item) => item.id),
  ["settings-interface", "appearance", "history", "settings-data", "about"],
  "Chrome action menu uses the same five top-level sections as the in-app menu"
);
assert.deepEqual(
  Array.from(chromeItems.filter((item) => item.parentId === "settings-interface"), (item) => item.settings),
  ["language", "youtubeData"],
  "Interface contains language and channel updates"
);
assert.deepEqual(
  Array.from(chromeItems.filter((item) => item.parentId === "settings-data"), (item) => item.settings),
  ["youtubeAccount", "synchronization", "importExportDialog", "cleanSlate"],
  "Data contains account, synchronization, backup, and reset"
);
assert.match(background, /contexts: \["action"\]/);
assert.match(background, /SHELF_SETTINGS_DESTINATIONS\[info\.menuItemId\]/);
assert.match(background, /host\.i18n\?\.getMessage\?\.\(messageKey\)/);
assert.match(app, /function interfaceContextActions\(\)/);
assert.match(app, /label: uiMessage\("localWatchHistory"\), action: openWatchHistoryOptionsDialog/);
assert.match(app, /label: uiMessage\("display"\), action: openAppearanceOptionsDialog/);
assert.match(app, /cleanSlate,\s*about: openAboutDialog/);
assert.match(html, /id="youtubeDataOptionsTitle">Channel updates</);
assert.match(html, /id="importExportTitle">Backup and restore</);

for (const key of [
  "interfaceSettings",
  "languageAndTranslations",
  "channelUpdates",
  "accountAndSubscriptions",
  "backupAndRestore",
  "resetShelfContent"
]) {
  assert.ok(english[key]?.message, `English label ${key} exists`);
  assert.ok(french[key]?.message, `French label ${key} exists`);
}

console.log("In-app and Chrome action settings menu structure passed");
