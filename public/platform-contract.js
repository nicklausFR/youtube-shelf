// Version this contract when shared UI and private adapters must evolve together.
export const PLATFORM_CONTRACT_VERSION = 1;

export function validatePlatform(platform) {
  if (platform?.contractVersion !== PLATFORM_CONTRACT_VERSION) {
    throw new Error("Unsupported YouTube Shelf platform contract");
  }
  for (const name of ["assetUrl", "browserLanguage", "version", "initialize", "readConfiguration", "writeConfiguration"]) {
    if (typeof platform[name] !== "function") throw new Error(`Platform method missing: ${name}`);
  }
  for (const name of ["panel", "tabs", "youtubeCompanion", "permissions", "sessionStorage"]) {
    if (typeof platform.capabilities?.[name] !== "boolean") throw new Error(`Platform capability missing: ${name}`);
  }
  if (!platform.host || typeof platform.host.runtime?.onMessage?.addListener !== "function") {
    throw new Error("Platform messaging event is missing");
  }
  const requirements = {
    panel: platform.host.panel?.open,
    tabs: platform.host.tabs?.query,
    youtubeCompanion: platform.host.companion?.ensure,
    permissions: platform.host.permissions?.request,
    sessionStorage: platform.host.storage?.session?.get
  };
  for (const [name, implementation] of Object.entries(requirements)) {
    if (platform.capabilities[name] && typeof implementation !== "function") {
      throw new Error(`Platform advertises an unavailable capability: ${name}`);
    }
  }
  return platform;
}
