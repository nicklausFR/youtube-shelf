const openWindows = new Set();
const COMMENTS_MODE_KEY = "youtubeChannelShelfHideComments";
const SUGGESTIONS_MODE_KEY = "youtubeChannelShelfHideSuggestions";
const FOCUS_PLAYER_MODE_KEY = "youtubeChannelShelfFocusPlayer";
const DATA_COMMAND_KEY = "youtubeChannelShelfDataCommand";
const PANEL_OPEN_KEY = "youtubeChannelShelfPanelOpen";
const PANEL_HEARTBEAT_KEY = "youtubeChannelShelfPanelHeartbeat";
// Each extension view owns a connection. A hidden view cannot close another
// view's session, and background timer throttling cannot expire an open tab.
const panelPresenceSessions = new Map();
let panelPresenceWrites = Promise.resolve();
function publishPanelPresence() {
  const open = [...panelPresenceSessions.values()].some(Boolean);
  panelPresenceWrites = panelPresenceWrites.catch(() => {}).then(() =>
    chrome.storage.local.set({ [PANEL_OPEN_KEY]: open, [PANEL_HEARTBEAT_KEY]: open ? Date.now() : 0 })
  );
}
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "youtube-shelf-presence") return;
  panelPresenceSessions.set(port, false);
  port.onMessage.addListener((message) => {
    const open = message?.open === true;
    if (panelPresenceSessions.get(port) === open) return;
    panelPresenceSessions.set(port, open);
    publishPanelPresence();
  });
  port.onDisconnect.addListener(() => {
    panelPresenceSessions.delete(port);
    publishPanelPresence();
  });
});
const THUMBNAIL_URLS = [
  "https://i.ytimg.com/*",
  "https://yt3.ggpht.com/*",
  "https://yt3.googleusercontent.com/*"
];
const extensionOrigin = new URL(chrome.runtime.getURL("")).origin;
const thumbnailResponseBytes = new Map();
const YOUTUBE_EMBED_REFERER_RULE_ID = 1001;
const VIDEO_POPUP_BOUNDS_KEY = "youtubeChannelShelfVideoPopupBounds";
const SUBSCRIPTION_AUTOMATION_PREFIX = "youtubeShelfSubscriptionAutomation:";
const fullPageTabsByWindow = new Map();
let videoPopupWindowId = null;
let videoPopupTabId = null;
let videoPopupBoundsTimer = null;

function configureYoutubeEmbedRefererRule() {
  return chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [YOUTUBE_EMBED_REFERER_RULE_ID],
    addRules: [{
      id: YOUTUBE_EMBED_REFERER_RULE_ID,
      priority: 2,
      action: {
        type: "modifyHeaders",
        requestHeaders: [{
          header: "Referer",
          operation: "set",
          value: chrome.runtime.id
        }]
      },
      condition: {
        initiatorDomains: [chrome.runtime.id],
        requestDomains: ["www.youtube.com"],
        resourceTypes: ["sub_frame"]
      }
    }]
  }).catch(() => {});
}

configureYoutubeEmbedRefererRule();

function isExtensionThumbnailRequest(details) {
  // Thumbnails rendered by the extension live in its top-level document.
  // Resources loaded by the embedded YouTube player live in a child frame and
  // must not be reported as application traffic, particularly in page mode.
  if (Number(details.frameId) > 0) return false;
  const documentUrl = String(details.documentUrl || "");
  if (/^https:\/\/(?:www\.)?youtube\.com\/embed\//.test(documentUrl)) return false;
  return details.initiator === extensionOrigin || documentUrl.startsWith(extensionOrigin);
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "YOUTUBE_SHELF_SUBSCRIPTION_RESULT") {
    const tabId = sender.tab?.id;
    const windowId = sender.tab?.windowId;
    const channelId = String(message.channelId || "");
    if (!Number.isInteger(tabId) || !Number.isInteger(windowId) || !/^UC[-_a-zA-Z0-9]+$/.test(channelId)) {
      sendResponse({ ok: false });
      return false;
    }
    const key = `${SUBSCRIPTION_AUTOMATION_PREFIX}${tabId}`;
    chrome.storage.session.get(key)
      .then(async (result) => {
        const target = typeof result[key] === "string" ? { channelId: result[key], action: "subscribe" } : result[key];
        const expected = target?.action === "unsubscribe" ? "unsubscribed" : "subscribed";
        if (target?.channelId !== channelId || ![expected, "cancelled"].includes(message.status)) {
          sendResponse({ ok: false });
          return;
        }
        await chrome.storage.session.remove(key);
        await Promise.resolve(chrome.runtime.sendMessage({
          type: "YOUTUBE_SHELF_SUBSCRIPTION_RESULT_RELAY",
          status: message.status,
          channelId
        })).catch(() => {});
        await chrome.windows.remove(windowId).catch(() => {});
        sendResponse({ ok: true });
      })
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === "YOUTUBE_SHELF_REGISTER_SUBSCRIPTION_AUTOMATION") {
    const tabId = Number(message.tabId);
    const channelId = String(message.channelId || "");
    if (!sender.url?.startsWith(extensionOrigin) || !Number.isInteger(tabId) || !/^UC[-_a-zA-Z0-9]+$/.test(channelId)) {
      sendResponse({ ok: false });
      return false;
    }
    chrome.storage.session.set({ [`${SUBSCRIPTION_AUTOMATION_PREFIX}${tabId}`]: { channelId, action: message.action === "unsubscribe" ? "unsubscribe" : "subscribe" } })
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === "YOUTUBE_SHELF_GET_SUBSCRIPTION_AUTOMATION") {
    const tabId = sender.tab?.id;
    if (!Number.isInteger(tabId)) {
      sendResponse({ ok: false });
      return false;
    }
    chrome.storage.session.get(`${SUBSCRIPTION_AUTOMATION_PREFIX}${tabId}`)
      .then((result) => sendResponse({
        ok: true,
        ...(typeof result[`${SUBSCRIPTION_AUTOMATION_PREFIX}${tabId}`] === "string"
          ? { channelId: result[`${SUBSCRIPTION_AUTOMATION_PREFIX}${tabId}`], action: "subscribe" }
          : result[`${SUBSCRIPTION_AUTOMATION_PREFIX}${tabId}`] || {})
      }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === "YOUTUBE_SHELF_OPEN_VIDEO_POPUP") {
    openVideoPopup(message.videoId, message.title)
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: error.message || "Unable to open video popup" }));
    return true;
  }
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

function isFullPageTab(tab) {
  try {
    const url = new URL(tab?.url || "");
    return url.origin === extensionOrigin
      && url.pathname.endsWith("/public/index.html")
      && url.searchParams.get("mode") === "page";
  } catch {
    return false;
  }
}

function trackFullPageTab(tab) {
  if (tab?.id === undefined || tab.windowId === undefined) return;
  for (const [windowId, tabIds] of fullPageTabsByWindow) {
    tabIds.delete(tab.id);
    if (!tabIds.size) fullPageTabsByWindow.delete(windowId);
  }
  if (!isFullPageTab(tab)) return;
  if (!fullPageTabsByWindow.has(tab.windowId)) fullPageTabsByWindow.set(tab.windowId, new Set());
  fullPageTabsByWindow.get(tab.windowId).add(tab.id);
}

chrome.tabs.query({}).then((tabs) => tabs.forEach(trackFullPageTab)).catch(() => {});
chrome.tabs.onCreated.addListener(trackFullPageTab);
chrome.tabs.onUpdated.addListener((_tabId, _changeInfo, tab) => trackFullPageTab(tab));
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(`${SUBSCRIPTION_AUTOMATION_PREFIX}${tabId}`).catch(() => {});
  for (const [windowId, tabIds] of fullPageTabsByWindow) {
    tabIds.delete(tabId);
    if (!tabIds.size) fullPageTabsByWindow.delete(windowId);
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  const windowId = tab.windowId || chrome.windows.WINDOW_ID_CURRENT;
  if (isFullPageTab(tab) && tab.id !== undefined) {
    let returnUrl = "https://www.youtube.com/";
    try {
      const pageUrl = new URL(tab.url || "");
      const sourceUrl = pageUrl.searchParams.get("sourceUrl") || "";
      const videoId = pageUrl.searchParams.get("video") || "";
      returnUrl = videoId
        ? `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
        : /^https?:\/\//.test(sourceUrl) ? sourceUrl : returnUrl;
    } catch {
      // Fall back to the YouTube home page.
    }
    const opening = chrome.sidePanel.open({ windowId });
    const normalYoutubeView = chrome.storage.local.set({ [FOCUS_PLAYER_MODE_KEY]: false });
    await Promise.all([opening, normalYoutubeView]);
    openWindows.add(windowId);
    await chrome.tabs.update(tab.id, { active: true, url: returnUrl });
    return;
  }

  const existingFullPageTabId = [...(fullPageTabsByWindow.get(windowId) || [])][0];
  if (existingFullPageTabId !== undefined) {
    await chrome.tabs.update(existingFullPageTabId, { active: true });
    return;
  }

  if (openWindows.has(windowId) && chrome.sidePanel.close) {
    await chrome.sidePanel.close({ windowId }).catch(() => {});
    openWindows.delete(windowId);
    return;
  }

  const opening = chrome.sidePanel.open({ windowId });
  await opening;
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

chrome.runtime.onInstalled.addListener(() => {
  publishPanelPresence();
  createContextMenus();
  configureYoutubeEmbedRefererRule();
});
chrome.runtime.onStartup?.addListener?.(() => {
  publishPanelPresence();
  createContextMenus();
  configureYoutubeEmbedRefererRule();
});

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

function videoPopupUrl(videoId, title = "") {
  const params = new URLSearchParams({ video: videoId });
  if (title) params.set("title", String(title).slice(0, 180));
  return chrome.runtime.getURL(`public/video-popup.html?${params}`);
}

async function findVideoPopupTab() {
  if (videoPopupTabId !== null) {
    const known = await chrome.tabs.get(videoPopupTabId).catch(() => null);
    if (known) return known;
  }
  const popupBaseUrl = chrome.runtime.getURL("public/video-popup.html");
  const tabs = await chrome.tabs.query({});
  return tabs.find((tab) => String(tab.url || "").startsWith(popupBaseUrl)) || null;
}

async function openVideoPopup(rawVideoId, title = "") {
  const videoId = String(rawVideoId || "").trim();
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) throw new Error("Invalid YouTube video identifier");
  const url = videoPopupUrl(videoId, title);
  const existingTab = await findVideoPopupTab();
  if (existingTab?.id !== undefined && existingTab.windowId !== undefined) {
    videoPopupTabId = existingTab.id;
    videoPopupWindowId = existingTab.windowId;
    await chrome.tabs.update(existingTab.id, { active: true, url });
    await chrome.windows.update(existingTab.windowId, { focused: true, state: "normal" });
    return;
  }

  const stored = await chrome.storage.local.get(VIDEO_POPUP_BOUNDS_KEY);
  const bounds = stored?.[VIDEO_POPUP_BOUNDS_KEY] || {};
  const options = {
    url,
    type: "popup",
    focused: true,
    width: Math.max(420, Number(bounds.width) || 720),
    height: Math.max(260, Number(bounds.height) || 435)
  };
  if (Number.isFinite(bounds.left)) options.left = bounds.left;
  if (Number.isFinite(bounds.top)) options.top = bounds.top;
  const popup = await chrome.windows.create(options);
  videoPopupWindowId = popup?.id ?? null;
  videoPopupTabId = popup?.tabs?.[0]?.id ?? null;
}

chrome.windows.onBoundsChanged?.addListener?.((window) => {
  if (window.id !== videoPopupWindowId || window.state !== "normal") return;
  if (videoPopupBoundsTimer) clearTimeout(videoPopupBoundsTimer);
  videoPopupBoundsTimer = setTimeout(() => {
    videoPopupBoundsTimer = null;
    chrome.storage.local.set({
      [VIDEO_POPUP_BOUNDS_KEY]: {
        left: window.left,
        top: window.top,
        width: window.width,
        height: window.height
      }
    });
  }, 250);
});

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId !== videoPopupWindowId) return;
  videoPopupWindowId = null;
  videoPopupTabId = null;
});

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
    const displayOptionsEnabled = Boolean(result[PANEL_OPEN_KEY]);
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
