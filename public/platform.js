function runtimeChrome() {
  return globalThis.chrome && typeof globalThis.chrome === "object" ? globalThis.chrome : {};
}

function unavailable() {
  return new Error("The browser extension storage API is unavailable");
}

function storageGet(chromeApi, area, key) {
  if (!area) return Promise.reject(unavailable());
  return new Promise((resolve, reject) => {
    area.get(key, (result) => {
      const error = chromeApi.runtime?.lastError;
      if (error) reject(new Error(error.message));
      else resolve(result?.[key] ?? null);
    });
  });
}

function storageSet(chromeApi, area, key, value) {
  if (!area) return Promise.reject(unavailable());
  return new Promise((resolve, reject) => {
    area.set({ [key]: value }, () => {
      const error = chromeApi.runtime?.lastError;
      if (error) reject(new Error(error.message));
      else resolve(value);
    });
  });
}

export function createPlatform(options = {}) {
  const chromeApi = options.chromeApi ?? runtimeChrome();
  const navigatorApi = options.navigatorApi ?? globalThis.navigator ?? {};
  const extensionStorage = chromeApi.storage?.local;
  const isExtension = Boolean(extensionStorage && chromeApi.runtime?.getURL);

  return {
    chrome: chromeApi,
    kind: isExtension ? "extension" : "unsupported",
    isExtension,
    isWeb: false,
    assetUrl(path) {
      const normalized = String(path || "").replace(/^\/+/, "");
      return chromeApi.runtime?.getURL
        ? chromeApi.runtime.getURL(normalized)
        : new URL(`../${normalized}`, import.meta.url).href;
    },
    browserLanguage: () => chromeApi.i18n?.getUILanguage?.() || navigatorApi.language || "en",
    version: (fallback = "") => chromeApi.runtime?.getManifest?.().version || fallback,
    initialize: () => {},
    readConfiguration: (storageKey) => storageGet(chromeApi, extensionStorage, storageKey),
    writeConfiguration: (storageKey, value) => storageSet(chromeApi, extensionStorage, storageKey, value)
  };
}

export const platform = createPlatform();
