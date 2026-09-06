import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { createPlatform } from "../public/platform.js";
import { validatePlatform } from "../public/platform-contract.js";

function event() {
  const listeners = new Set();
  return { listeners, addListener(fn) { listeners.add(fn); }, removeListener(fn) { listeners.delete(fn); }, hasListener(fn) { return listeners.has(fn); } };
}
const runtime = { id: "original-id", onMessage: event(), getURL: path => `chrome-extension://original-id/${path}`, getManifest: () => ({ version: "test" }) };
const values = {};
const local = {
  get(key, callback) { assert.equal(this, local); callback({ [key]: values[key] }); },
  set(value, callback) { assert.equal(this, local); Object.assign(values, value); callback?.(); }
};
let panelOptions;
const sidePanel = { open(options) { assert.equal(this, sidePanel); panelOptions = options; return Promise.resolve(); } };
const native = { runtime, sidePanel, storage: { local, onChanged: event() }, tabs: { query: async () => [{ id: 7 }] } };
const platform = createPlatform({ chromeApi: native });
validatePlatform(platform);
assert.notEqual(platform.host.runtime, runtime);
assert.equal(platform.chrome, undefined);
await platform.writeConfiguration("config", { channels: [{ id: "fixture" }] });
assert.deepEqual(await platform.readConfiguration("config"), { channels: [{ id: "fixture" }] });
await platform.host.panel.open({ windowId: 5 });
assert.deepEqual(panelOptions, { windowId: 5 });
assert.equal(platform.host.panel.close, undefined, "Unsupported optional operations remain absent");
assert.deepEqual(await platform.host.tabs.query({}), [{ id: 7 }]);
const listener = () => {};
platform.host.runtime.onMessage.addListener(listener);
assert.equal(runtime.onMessage.hasListener(listener), true);
platform.host.runtime.onMessage.removeListener(listener);
assert.equal(runtime.onMessage.hasListener(listener), false);
runtime.id = undefined;
assert.equal(platform.host.runtime.id, undefined, "Extension invalidation remains observable");
runtime.lastError = { message: "storage denied" };
await assert.rejects(platform.readConfiguration("config"), /storage denied/);
await assert.rejects(platform.writeConfiguration("config", {}), /storage denied/);
runtime.lastError = undefined;
await platform.writeConfiguration("config", {});
assert.throws(() => validatePlatform({ ...platform, contractVersion: 99 }), /Unsupported/);
assert.throws(() => validatePlatform({ ...platform, capabilities: { ...platform.capabilities, sessionStorage: true } }), /unavailable capability/);

// Same adapter runs as a classic worker/content script and tolerates reinjection.
const context = vm.createContext({ chrome: native });
const source = readFileSync(new URL("../public/platform-chromium.js", import.meta.url), "utf8");
vm.runInContext(source, context);
vm.runInContext(source, context);
assert.equal(context.YouTubeShelfHosts.createHost().runtime.getManifest().version, "test");
console.log("Host adapter: callbacks, promises, receiver binding, listeners, live errors, invalidation and reinjection passed.");
