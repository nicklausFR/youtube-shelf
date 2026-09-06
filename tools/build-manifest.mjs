import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { realpathSync } from "node:fs";

const root = new URL("../", import.meta.url);
export async function buildManifest(target = "chromium") {
  // Firefox is intentionally not implemented in this restructuring.
  if (target !== "chromium") throw new Error(`Unsupported build target: ${target}`);
  const common = JSON.parse(await readFile(new URL("manifests/common.json", root), "utf8"));
  const specific = JSON.parse(await readFile(new URL(`manifests/${target}.json`, root), "utf8"));
  return { ...common, ...specific, permissions: [...new Set([...common.permissions, ...specific.permissions])] };
}

const canonical = path => {
  const value = realpathSync(resolve(path));
  return process.platform === "win32" ? value.toLowerCase() : value;
};
if (process.argv[1] && canonical(process.argv[1]) === canonical(fileURLToPath(import.meta.url))) {
  const manifest = await buildManifest(process.argv.find(arg => arg.startsWith("--target="))?.split("=")[1]);
  const path = new URL("manifest.json", root);
  if (process.argv.includes("--check")) {
    const existing = JSON.parse(await readFile(path, "utf8"));
    const { isDeepStrictEqual } = await import("node:util");
    if (!isDeepStrictEqual(existing, manifest)) throw new Error("manifest.json differs from its sources");
    console.log("Chromium manifest matches its shared and target-specific sources.");
  } else {
    await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`Generated ${fileURLToPath(path)}`);
  }
}
