// Classic script: shared by extension pages, the worker and content scripts.
// Only this adapter reads the native Chromium namespace. Services expose an
// explicit set of operations; native receivers and optional APIs are preserved.
(() => {
  function methods(native, names) {
    if (!native) return undefined;
    const result = {};
    for (const name of names) {
      if (typeof native[name] === "function") result[name] = (...args) => native[name](...args);
    }
    return result;
  }

  function events(native, target, names) {
    for (const name of names) {
      if (native?.[name]) target[name] = methods(native[name], ["addListener", "removeListener", "hasListener"]);
    }
    return target;
  }

  function service(native, operations, eventNames = []) {
    const result = methods(native, operations);
    return result ? events(native, result, eventNames) : undefined;
  }

  function createChromiumHost(native = globalThis.chrome ?? {}) {
    const runtime = service(native.runtime, ["getURL", "getManifest", "sendMessage", "connect"],
      ["onMessage", "onConnect", "onInstalled", "onStartup"]) || {};
    // These values must be read at use time: lastError is callback-scoped and
    // runtime.id disappears when an extension update invalidates a content script.
    for (const key of ["id", "lastError"]) {
      Object.defineProperty(runtime, key, { enumerable: true, get: () => native.runtime?.[key] });
    }
    const storage = native.storage ? events(native.storage, {
      local: service(native.storage.local, ["get", "set", "remove"]),
      session: service(native.storage.session, ["get", "set", "remove"])
    }, ["onChanged"]) : undefined;
    const windows = service(native.windows, ["getCurrent", "create", "update", "remove"],
      ["onRemoved", "onBoundsChanged"]);
    if (windows) Object.defineProperty(windows, "WINDOW_ID_CURRENT", { get: () => native.windows.WINDOW_ID_CURRENT });
    const scripting = service(native.scripting, ["insertCSS", "executeScript"]);
    return {
      runtime,
      storage,
      tabs: service(native.tabs, ["get", "getCurrent", "query", "create", "update", "remove", "sendMessage"],
        ["onCreated", "onUpdated", "onRemoved"]),
      windows,
      panel: service(native.sidePanel, ["open", "close"], ["onOpened", "onClosed"]),
      scripting,
      companion: scripting ? {
        async ensure(tabId) {
          await scripting.insertCSS({ target: { tabId }, files: ["youtube-clean.css"] }).catch(() => {});
          await scripting.executeScript({
            target: { tabId }, files: ["public/platform-chromium.js", "youtube-live.js"]
          }).catch(() => {});
        }
      } : undefined,
      permissions: service(native.permissions, ["request", "contains", "remove"]),
      i18n: service(native.i18n, ["getUILanguage", "getMessage", "detectLanguage"]),
      action: service(native.action, [], ["onClicked"]),
      menus: service(native.contextMenus, ["create", "update", "removeAll"], ["onClicked"]),
      network: {
        rules: service(native.declarativeNetRequest, ["updateDynamicRules"]),
        configureYoutubeEmbedReferer() {
          return native.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [1001],
            addRules: [{
              id: 1001, priority: 2,
              action: { type: "modifyHeaders", requestHeaders: [{ header: "Referer", operation: "set", value: native.runtime.id }] },
              condition: { initiatorDomains: [native.runtime.id], requestDomains: ["www.youtube.com"], resourceTypes: ["sub_frame"] }
            }]
          }).catch(() => {});
        },
        requests: service(native.webRequest, [], ["onBeforeRequest", "onHeadersReceived", "onCompleted", "onErrorOccurred"])
      }
    };
  }

  globalThis.YouTubeShelfHosts = { createHost: createChromiumHost, createChromiumHost };
})();
