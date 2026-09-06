import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { buildManifest } from "./build-manifest.mjs";

const root = new URL("../", import.meta.url);
const files = (await readdir(new URL("public/", root))).filter(name => name.endsWith(".js") && name !== "platform-chromium.js");
for (const file of [...files.map(name => `public/${name}`), "background.js", "background-core.js", "youtube-live.js", "youtube-page.js"]) {
  const source = await readFile(new URL(file, root), "utf8");
  assert.doesNotMatch(source, /\b(?:chrome|browser)\s*(?:\?\.)?\./, `${file} must use the host contract`);
}
const manifest = await buildManifest();
assert.deepEqual(manifest, JSON.parse(await readFile(new URL("manifest.json", root), "utf8")));
await assert.rejects(buildManifest("firefox"), /Unsupported build target/);
assert.deepEqual(manifest.content_scripts[0].js, ["public/platform-chromium.js", "youtube-live.js"]);
for (const file of [manifest.background.service_worker, ...manifest.content_scripts[0].js]) {
  await readFile(new URL(file, root));
}
console.log("Platform boundary and Chromium packaging passed; Firefox is not implemented.");
