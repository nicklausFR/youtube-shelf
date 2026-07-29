const openWindows = new Set();
const COMMENTS_MODE_KEY = "youtubeChannelShelfHideComments";
const SUGGESTIONS_MODE_KEY = "youtubeChannelShelfHideSuggestions";
const DATA_COMMAND_KEY = "youtubeChannelShelfDataCommand";
const PANEL_OPEN_KEY = "youtubeChannelShelfPanelOpen";
const PANEL_HEARTBEAT_KEY = "youtubeChannelShelfPanelHeartbeat";
const HEARTBEAT_TTL_MS = 2500;
const THUMBNAIL_URLS = [
  "https://i.ytimg.com/*",
  "https://yt3.ggpht.com/*",
  "https://yt3.googleusercontent.com/*"
];
const extensionOrigin = new URL(chrome.runtime.getURL("")).origin;
const thumbnailResponseBytes = new Map();

function isExtensionThumbnailRequest(details) {
  return details.initiator === extensionOrigin || String(details.documentUrl || "").startsWith(extensionOrigin);
}

function reportThumbnailNetwork(value) {
  Promise.resolve(chrome.runtime.sendMessage({
    type: "YOUTUBE_SHELF_THUMBNAIL_NETWORK",
    ...value
  })).catch(() => {});
}

chrome.webRequest.onBeforeRequest.addListener((details) => {
  if (!isExtensionThumbnailRequest(details)) return;
  reportThumbnailNetwork({ activeDelta: 1 });
}, { urls: THUMBNAIL_URLS, types: ["image"] });

chrome.webRequest.onHeadersReceived.addListener((details) => {
  if (!isExtensionThumbnailRequest(details)) return;
  const contentLength = details.responseHeaders
    ?.find((header) => header.name.toLowerCase() === "content-length")
    ?.value;
  const receivedBytes = details.fromCache
    ? 0
    : Math.max(0, Number.parseInt(contentLength || "0", 10) || 0);
  thumbnailResponseBytes.set(details.requestId, receivedBytes);
}, { urls: THUMBNAIL_URLS, types: ["image"] }, ["responseHeaders"]);

chrome.webRequest.onCompleted.addListener((details) => {
  if (!isExtensionThumbnailRequest(details)) return;
  const receivedBytes = thumbnailResponseBytes.get(details.requestId) || 0;
  thumbnailResponseBytes.delete(details.requestId);
  reportThumbnailNetwork({ requests: 1, activeDelta: -1, receivedBytes });
}, { urls: THUMBNAIL_URLS, types: ["image"] });

chrome.webRequest.onErrorOccurred.addListener((details) => {
  if (!isExtensionThumbnailRequest(details)) return;
  thumbnailResponseBytes.delete(details.requestId);
  reportThumbnailNetwork({ requests: 1, failures: 1, activeDelta: -1 });
}, { urls: THUMBNAIL_URLS, types: ["image"] });

async function fetchYoutubeSearchWithRetry(url, options) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetch(url, options);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!["YOUTUBE_SHELF_SEARCH_PAGE", "YOUTUBE_SHELF_SEARCH_CONTINUATION"].includes(message?.type)) {
    return undefined;
  }
  const isContinuation = message.type === "YOUTUBE_SHELF_SEARCH_CONTINUATION";
  let url;
  if (isContinuation) {
    url = new URL("https://www.youtube.com/youtubei/v1/search?prettyPrint=false");
  } else {
    try {
      url = new URL(message.url);
    } catch {
      sendResponse({ ok: false, error: "Invalid YouTube search URL" });
      return false;
    }
    if (url.protocol !== "https:" || url.hostname !== "www.youtube.com" || url.pathname !== "/results") {
      sendResponse({ ok: false, error: "Unsupported YouTube search URL" });
      return false;
    }
  }
  const options = isContinuation ? {
    method: "POST",
    cache: "no-store",
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
      "X-YouTube-Client-Name": "1",
      "X-YouTube-Client-Version": String(message.clientVersion || ""),
      ...(message.visitorData ? { "X-Goog-Visitor-Id": String(message.visitorData) } : {})
    },
    body: JSON.stringify(message.body || {})
  } : {
    cache: "no-store",
    credentials: "omit"
  };
  fetchYoutubeSearchWithRetry(url, options)
    .then(async (response) => {
      if (!response.ok) {
        sendResponse({ ok: false, error: `HTTP ${response.status}` });
        return;
      }
      sendResponse(isContinuation
        ? { ok: true, data: await response.json() }
        : { ok: true, text: await response.text() });
    })
    .catch((error) => sendResponse({ ok: false, error: error.message || "YouTube search failed" }));
  return true;
});

chrome.sidePanel?.onOpened?.addListener?.((info) => {
  if (info.windowId !== undefined) openWindows.add(info.windowId);
});

chrome.sidePanel?.onClosed?.addListener?.((info) => {
  if (info.windowId !== undefined) openWindows.delete(info.windowId);
});

chrome.action.onClicked.addListener(async (tab) => {
  const windowId = tab.windowId || chrome.windows.WINDOW_ID_CURRENT;

  if (openWindows.has(windowId) && chrome.sidePanel.close) {
    await chrome.sidePanel.close({ windowId });
    openWindows.delete(windowId);
    return;
  }

  await chrome.sidePanel.open({ windowId });
  openWindows.add(windowId);
});

function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "displayOptions",
      title: "Display options",
      contexts: ["action"]
    });
    chrome.contextMenus.create({
      id: "hideComments",
      parentId: "displayOptions",
      title: "Hide comments",
      type: "checkbox",
      contexts: ["action"]
    });
    chrome.contextMenus.create({
      id: "hideSuggestions",
      parentId: "displayOptions",
      title: "Hide suggestion list",
      type: "checkbox",
      contexts: ["action"]
    });

    chrome.contextMenus.create({
      id: "cleanSlate",
      title: "Clean Slate",
      contexts: ["action"]
    });
    chrome.contextMenus.create({
      id: "importExportMenu",
      title: "Import / Export",
      contexts: ["action"]
    });
    chrome.contextMenus.create({ id: "exportNative", parentId: "importExportMenu", title: "Export YouTube Shelf", contexts: ["action"] });
    chrome.contextMenus.create({ id: "exportNewPipe", parentId: "importExportMenu", title: "Export for NewPipe", contexts: ["action"] });
    chrome.contextMenus.create({ id: "importNative", parentId: "importExportMenu", title: "Import YouTube Shelf", contexts: ["action"] });
    chrome.contextMenus.create({ id: "importFreetube", parentId: "importExportMenu", title: "Import FreeTube", contexts: ["action"] });
  });
}

chrome.runtime.onInstalled.addListener(createContextMenus);
chrome.runtime.onStartup?.addListener?.(createContextMenus);

async function openDataPopup(command) {
  const current = await chrome.windows.getCurrent().catch(() => null);
  const width = 460;
  const height = command === "cleanSlate" ? 260 : 240;
  const left = current ? Math.round(current.left + (current.width - width) / 2) : undefined;
  const top = current ? Math.round(current.top + (current.height - height) / 2) : undefined;
  await chrome.windows.create({
    url: chrome.runtime.getURL(`public/data-popup.html?command=${encodeURIComponent(command)}`),
    type: "popup",
    width,
    height,
    left,
    top
  });
}
async function sendDataCommand(command) {
  await chrome.storage.local.set({
    [DATA_COMMAND_KEY]: {
      command,
      createdAt: Date.now()
    }
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "hideComments") {
    chrome.storage.local.set({ [COMMENTS_MODE_KEY]: Boolean(info.checked) });
    return;
  }

  if (info.menuItemId === "hideSuggestions") {
    chrome.storage.local.set({ [SUGGESTIONS_MODE_KEY]: Boolean(info.checked) });
    return;
  }

  if (["exportNative", "exportNewPipe", "importNative", "importFreetube", "cleanSlate"].includes(info.menuItemId)) {
    await openDataPopup(info.menuItemId);
  }
});

function syncDisplayContextMenus() {
  chrome.storage.local.get([COMMENTS_MODE_KEY, SUGGESTIONS_MODE_KEY, PANEL_OPEN_KEY, PANEL_HEARTBEAT_KEY], (result) => {
    const displayOptionsEnabled = Boolean(result[PANEL_OPEN_KEY]) && Date.now() - Number(result[PANEL_HEARTBEAT_KEY] || 0) < HEARTBEAT_TTL_MS;
    chrome.contextMenus.update("hideComments", {
      checked: Boolean(result[COMMENTS_MODE_KEY]),
      enabled: displayOptionsEnabled
    }).catch(() => {});
    chrome.contextMenus.update("hideSuggestions", {
      checked: result[SUGGESTIONS_MODE_KEY] === undefined ? true : Boolean(result[SUGGESTIONS_MODE_KEY]),
      enabled: displayOptionsEnabled
    }).catch(() => {});
  });
}

syncDisplayContextMenus();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (!changes[COMMENTS_MODE_KEY] && !changes[SUGGESTIONS_MODE_KEY] && !changes[PANEL_OPEN_KEY] && !changes[PANEL_HEARTBEAT_KEY]) return;
  syncDisplayContextMenus();
});
