import assert from "node:assert/strict";
import { createPlatform } from "../public/platform.js";

{
  const values = { shelf: { channels: [{ id: "one" }] } };
  const storage = {
    get(key, callback) { callback({ [key]: values[key] }); },
    set(next, callback) { Object.assign(values, next); callback(); }
  };
  const chromeApi = {
    runtime: {
      getURL: (path) => `chrome-extension://test/${path}`,
      getManifest: () => ({ version: "3.3.15" })
    },
    storage: { local: storage },
    i18n: { getUILanguage: () => "fr" }
  };
  const current = createPlatform({ chromeApi });
  assert.equal(current.kind, "extension");
  assert.equal(current.isWeb, false);
  assert.equal(current.browserLanguage(), "fr");
  assert.equal(current.version(), "3.3.15");
  assert.equal(current.assetUrl("_locales/fr/messages.json"), "chrome-extension://test/_locales/fr/messages.json");
  assert.equal(current.initialize(), undefined);
  assert.deepEqual(await current.readConfiguration("shelf"), values.shelf);
  await current.writeConfiguration("shelf", { channels: [{ id: "two" }] });
  assert.deepEqual(values.shelf.channels.map(({ id }) => id), ["two"]);
}

{
  const current = createPlatform({ chromeApi: {}, navigatorApi: { language: "fr-FR" } });
  assert.equal(current.kind, "unsupported");
  assert.equal(current.isExtension, false);
  assert.equal(current.isWeb, false);
  await assert.rejects(() => current.readConfiguration("shelf"), /storage API is unavailable/);
}

console.log("extension platform tests passed");
