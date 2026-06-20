const openWindows = new Set();
const COMMENTS_MODE_KEY = "youtubeChannelShelfHideComments";
const DATA_COMMAND_KEY = "youtubeChannelShelfDataCommand";

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

  if (["exportNative", "importNative", "importFreetube", "cleanSlate"].includes(info.menuItemId)) {
    await openDataPopup(info.menuItemId);
  }
});

chrome.storage.local.get(COMMENTS_MODE_KEY, (result) => {
  chrome.contextMenus.update("hideComments", {
    checked: Boolean(result[COMMENTS_MODE_KEY])
  }).catch(() => {});
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes[COMMENTS_MODE_KEY]) return;
  chrome.contextMenus.update("hideComments", {
    checked: Boolean(changes[COMMENTS_MODE_KEY].newValue)
  }).catch(() => {});
});










