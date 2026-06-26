const openWindows = new Set();
const COMMENTS_MODE_KEY = "youtubeChannelShelfHideComments";
const SUGGESTIONS_MODE_KEY = "youtubeChannelShelfHideSuggestions";
const DATA_COMMAND_KEY = "youtubeChannelShelfDataCommand";
const PANEL_OPEN_KEY = "youtubeChannelShelfPanelOpen";
const PANEL_HEARTBEAT_KEY = "youtubeChannelShelfPanelHeartbeat";
const HEARTBEAT_TTL_MS = 2500;

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
    chrome.contextMenus.create({ id: "exportNative", parentId: "importExportMenu", title: "Export YouTube Channel Shelf", contexts: ["action"] });
    chrome.contextMenus.create({ id: "importNative", parentId: "importExportMenu", title: "Import YouTube Channel Shelf", contexts: ["action"] });
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

  if (["exportNative", "importNative", "importFreetube", "cleanSlate"].includes(info.menuItemId)) {
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






