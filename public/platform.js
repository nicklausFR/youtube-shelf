import "./platform-chromium.js";
import { PLATFORM_CONTRACT_VERSION } from "./platform-contract.js";

function unavailable() {
  return new Error("The browser extension storage API is unavailable");
}

function storageGet(host, area, key) {
  if (!area) return Promise.reject(unavailable());
  return new Promise((resolve, reject) => {
    area.get(key, (result) => {
      const error = host.runtime?.lastError;
      if (error) reject(new Error(error.message));
      else resolve(result?.[key] ?? null);
    });
  });
}

function storageSet(host, area, key, value) {
  if (!area) return Promise.reject(unavailable());
  return new Promise((resolve, reject) => {
    area.set({ [key]: value }, () => {
      const error = host.runtime?.lastError;
      if (error) reject(new Error(error.message));
      else resolve(value);
    });
  });
}

export function createPlatform(options = {}) {
  const host = options.host ?? globalThis.YouTubeShelfHosts.createHost(options.chromeApi);
  const navigatorApi = options.navigatorApi ?? globalThis.navigator ?? {};
  const extensionStorage = host.storage?.local;
  const isExtension = Boolean(extensionStorage && host.runtime?.getURL);

  return {
    contractVersion: PLATFORM_CONTRACT_VERSION,
    host: host,
    capabilities: {
      panel: Boolean(host.panel?.open),
      tabs: Boolean(host.tabs?.query),
      youtubeCompanion: Boolean(host.companion?.ensure),
      permissions: Boolean(host.permissions?.request),
      sessionStorage: Boolean(host.storage?.session?.get)
    },
    kind: isExtension ? "extension" : "unsupported",
    isExtension,
    isWeb: false,
    assetUrl(path) {
      const normalized = String(path || "").replace(/^\/+/, "");
      return host.runtime?.getURL
        ? host.runtime.getURL(normalized)
        : new URL(`../${normalized}`, import.meta.url).href;
    },
    browserLanguage: () => host.i18n?.getUILanguage?.() || navigatorApi.language || "en",
    version: (fallback = "") => host.runtime?.getManifest?.().version || fallback,
    initialize: () => {},
    readConfiguration: (storageKey) => storageGet(host, extensionStorage, storageKey),
    writeConfiguration: (storageKey, value) => storageSet(host, extensionStorage, storageKey, value)
  };
}

export const platform = createPlatform();
