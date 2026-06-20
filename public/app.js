const toggleSidebarEl = document.querySelector("#toggleSidebar");
const backEl = document.querySelector("#back");
const forwardEl = document.querySelector("#forward");
const openAppSessionEl = document.querySelector("#openAppSession");
const searchFormEl = document.querySelector("#searchForm");
const searchInputEl = document.querySelector("#searchInput");
const contentToolbarEl = document.querySelector(".contentToolbar");
const addChannelEl = document.querySelector("#addChannel");
const addCategoryEl = document.querySelector("#addCategory");
const sidePanelPathEl = document.querySelector("#sidePanelPath");
const sidePanelVideoPathEl = document.querySelector("#sidePanelVideoPath");
const channelIconModeEl = document.querySelector("#channelIconMode");
const channelBackEl = document.querySelector("#channelBack");
const channelForwardEl = document.querySelector("#channelForward");
const channelSearchInputEl = document.querySelector("#channelSearchInput");
const categoriesEl = document.querySelector("#categories");
const channelsEl = document.querySelector("#channels");
const activeChannelSeparatorEl = document.querySelector("#activeChannelSeparator");
const channelTitleEl = document.querySelector("#channelTitle");
const videoTitleLineEl = document.querySelector("#videoTitleLine");
const currentVideoTitleEl = document.querySelector("#currentVideoTitle");
const channelActionsEl = document.querySelector("#channelActions");
const toggleListLayoutEl = document.querySelector("#toggleListLayout");
const sidePanelBackEl = document.querySelector("#sidePanelBack");
const assignCategoriesEl = document.querySelector("#assignCategories");
const unsubscribeEl = document.querySelector("#unsubscribe");
const listViewEl = document.querySelector("#listView");
const playerViewEl = document.querySelector("#playerView");
const videosEl = document.querySelector("#videos");
const statusEl = document.querySelector("#status");
const playerEl = document.querySelector("#player");
const playerPanelEl = document.querySelector(".playerPanel");
const refreshEl = document.querySelector("#refresh");
const playerWatchLaterEl = document.querySelector("#playerWatchLater");
const seenPromptEl = document.querySelector("#seenPrompt");
const markSeenEl = document.querySelector("#markSeen");
const keepWatchLaterEl = document.querySelector("#keepWatchLater");
const categoryAssignPromptEl = document.querySelector("#categoryAssignPrompt");
const categoryAssignListEl = document.querySelector("#categoryAssignList");
const newCategoryNameEl = document.querySelector("#newCategoryName");
const createCategoryFromModalEl = document.querySelector("#createCategoryFromModal");
const cancelCategoryAssignEl = document.querySelector("#cancelCategoryAssign");
const saveCategoryAssignEl = document.querySelector("#saveCategoryAssign");
const channelAssignPromptEl = document.querySelector("#channelAssignPrompt");
const channelAssignListEl = document.querySelector("#channelAssignList");
const cancelChannelAssignEl = document.querySelector("#cancelChannelAssign");
const saveChannelAssignEl = document.querySelector("#saveChannelAssign");
const importExportPromptEl = document.querySelector("#importExportPrompt");
const exportNativeConfigEl = document.querySelector("#exportNativeConfig");
const exportYoutubeConfigEl = document.querySelector("#exportYoutubeConfig");
const importNativeConfigEl = document.querySelector("#importNativeConfig");
const importYoutubeConfigEl = document.querySelector("#importYoutubeConfig");
const importFreetubeConfigEl = document.querySelector("#importFreetubeConfig");
const closeImportExportEl = document.querySelector("#closeImportExport");

let activeVideoId = "";
let activeChannel = null;
let activeSearchQuery = "";
let channelSearchQuery = "";
let config = { version: 1, categories: [], channels: [], seenVideos: {}, watchLater: {} };
let allChannels = [];
let allCategories = [];
let activeCategoryId = "";
let activeView = "home";
let currentVideos = [];
let seenVideos = {};
let watchLater = {};
let currentWatchLaterVideoId = "";
let currentWatchLaterStartedAt = 0;
let seenPromptResolve = null;
let configLoaded = false;
let listLayout = localStorage.getItem("listLayout") || "grid";
if (listLayout === "rows" || listLayout === "thumbs") listLayout = "wide";
if (!["wide", "grid", "single"].includes(listLayout)) listLayout = "grid";
const storedChannelListMode = localStorage.getItem("channelListMode");
let channelListMode = storedChannelListMode || (localStorage.getItem("channelIconMode") === "true" ? "icons" : "columns");
let sidePanelCategoriesExpanded = false;
let categoryAssignChannel = null;
let channelAssignCategory = null;
let contextMenuEl = null;
let confirmDialogResolve = null;
let lastHandledDataCommandAt = 0;
let categoryResizeStartY = 0;
let categoryResizeStartHeight = 0;
let pendingImportKind = "";
const STORAGE_KEY = "youtubeChannelShelfConfig";
const CONFIG_URLS = ["../data/config.json", "../data/config.default.json"];
const PANEL_OPEN_KEY = "youtubeChannelShelfPanelOpen";
const PANEL_HEARTBEAT_KEY = "youtubeChannelShelfPanelHeartbeat";
const DATA_COMMAND_KEY = "youtubeChannelShelfDataCommand";
const COMMENTS_MODE_KEY = "youtubeChannelShelfHideComments";
const SPLIT_COLUMN_MIN_WIDTH = 450;
const VIDEO_GRID_MIN_COLUMN_WIDTH = 220;
// Next version: virtual category for new videos.
// const NEW_VIDEOS_CATEGORY_ID = "__new_videos";

async function readBundledConfig() {
  let lastError = null;

  for (const url of CONFIG_URLS) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No configuration file available");
}

function setPanelOpenState(open) {
  if (!globalThis.chrome?.storage?.local) return;
  chrome.storage.local.set({
    [PANEL_OPEN_KEY]: open,
    [PANEL_HEARTBEAT_KEY]: open ? Date.now() : 0
  });
}

function syncPanelVisibilityState() {
  setPanelOpenState(document.visibilityState === "visible");
}

function isSidePanelView() {
  return true;
}

function currentCategoryName() {
  if (activeView === "watchLater") return "Watch later";
  if (!activeCategoryId) return "";
  return allCategories.find((category) => category.id === activeCategoryId)?.name || "";
}

function makePathButton(text, onClick, options = {}) {
  const button = document.createElement("button");
  button.className = "pathButton";
  if (options.kind) button.classList.add("pathButton-" + options.kind);
  if (options.active) button.classList.add("is-active");
  button.type = "button";
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

function appendPathItem(container, text, onClick, options = {}) {
  const row = document.createElement("div");
  row.className = "pathRow";
  if (options.level) row.classList.add("pathLevel" + options.level);
  row.append(makePathButton(text, onClick, options));

  if (options.contextActions?.length) {
    row.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      showContextMenu(event, options.contextActions);
    });
  }

  container.append(row);
}

function makeSettingsButton() {
  const button = document.createElement("button");
  button.className = "pathSettingsButton";
  button.type = "button";
  button.title = "Settings";
  button.setAttribute("aria-label", "Settings");
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 0 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 0 1 4 0v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.3.37.63.6 1 .6h.6a2 2 0 0 1 0 4h-.6a1.7 1.7 0 0 0-1 .6Z"/></svg>';
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    showContextMenu(event, settingsContextActions());
  });
  return button;
}

function appendSettingsPathItem(container) {
  const row = document.createElement("div");
  row.className = "pathRow pathSettingsRow";
  row.append(makeSettingsButton());
  container.append(row);
}

function toggleDisplayOptions() {
  if (!globalThis.chrome?.storage?.local) return;
  chrome.storage.local.get(COMMENTS_MODE_KEY, (result) => {
    chrome.storage.local.set({ [COMMENTS_MODE_KEY]: !Boolean(result[COMMENTS_MODE_KEY]) });
  });
}

function settingsContextActions() {
  return [
    { label: "Import / Export", action: openImportExportDialog },
    { label: "Display options", action: toggleDisplayOptions },
    { label: "Clean Slate", action: cleanSlate, danger: true }
  ];
}

function ensureContextMenu() {
  if (contextMenuEl) return contextMenuEl;
  contextMenuEl = document.createElement("div");
  contextMenuEl.className = "contextMenu";
  contextMenuEl.hidden = true;
  document.body.append(contextMenuEl);
  return contextMenuEl;
}

function hideContextMenu() {
  if (contextMenuEl) contextMenuEl.hidden = true;
}

function closeConfirmDialog(value) {
  const dialog = document.querySelector("#confirmPrompt");
  if (dialog) dialog.hidden = true;
  const resolve = confirmDialogResolve;
  confirmDialogResolve = null;
  if (resolve) resolve(value);
}

function ensureConfirmDialog() {
  let overlay = document.querySelector("#confirmPrompt");
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.id = "confirmPrompt";
  overlay.className = "modalOverlay";
  overlay.hidden = true;

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.role = "dialog";
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "confirmPromptTitle");

  const title = document.createElement("h2");
  title.id = "confirmPromptTitle";
  title.textContent = "Confirm action";

  const message = document.createElement("p");
  message.id = "confirmPromptMessage";

  const actions = document.createElement("div");
  actions.className = "modalActions";

  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "modalButton secondary";
  cancel.textContent = "Cancel";
  cancel.addEventListener("click", () => closeConfirmDialog(false));

  const confirm = document.createElement("button");
  confirm.type = "button";
  confirm.className = "modalButton primary";
  confirm.textContent = "Delete";
  confirm.addEventListener("click", () => closeConfirmDialog(true));

  actions.append(cancel, confirm);
  modal.append(title, message, actions);
  overlay.append(modal);
  document.body.append(overlay);
  return overlay;
}

function requestConfirmation(message) {
  if (confirmDialogResolve) closeConfirmDialog(false);
  const dialog = ensureConfirmDialog();
  const messageEl = dialog.querySelector("#confirmPromptMessage");
  if (messageEl) messageEl.textContent = message;
  dialog.hidden = false;
  dialog.querySelector(".modalButton.secondary")?.focus();
  return new Promise((resolve) => {
    confirmDialogResolve = resolve;
  });
}

function videoContextActions(video) {
  return [
    {
      label: watchLater[video.id] ? "Remove from Watch later" : "Watch later",
      action: () => toggleWatchLater(video)
    },
    {
      label: "Mark as watched",
      action: async () => {
        markVideoSeen(video.id);
        renderVideos(currentVideos);
      }
    }
  ];
}

function showContextMenu(event, actions) {
  const menu = ensureContextMenu();
  menu.replaceChildren(
    ...actions.map((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = item.label;
      if (item.danger) button.classList.add("is-danger");
      button.addEventListener("click", async () => {
        hideContextMenu();
        await maybePromptSeenForWatchLater();
        await Promise.resolve(item.action());
      });
      return button;
    })
  );

  menu.hidden = false;
  const width = menu.offsetWidth;
  const height = menu.offsetHeight;
  menu.style.left = `${Math.min(event.clientX, window.innerWidth - width - 8)}px`;
  menu.style.top = `${Math.min(event.clientY, window.innerHeight - height - 8)}px`;
}

async function showRootChannels() {
  await maybePromptSeenForWatchLater();
  clearChannelSearch();
  showChannelListState("");
  pushHistory(channelListHistoryEntry(""));
}

async function showCategoryChannels(categoryId = activeCategoryId) {
  await maybePromptSeenForWatchLater();
  clearChannelSearch();
  showChannelListState(categoryId);
  pushHistory(channelListHistoryEntry(categoryId));
}

async function showChannelVideos() {
  await maybePromptSeenForWatchLater();
  if (!activeChannel) return;
  document.body.classList.add("sidePanelVideos");
  syncStackedChannelViewState();
  listViewEl.hidden = false;
  showListView();
  setHeader("", true);
  renderSidePanelPath();
  renderVideos(currentVideos);
}

function categoryContextActions(category) {
  const actions = [
    { label: "Add a channel here", action: () => openChannelAssignment(category) }
  ];
  if (category.id) {
    actions.push({ label: "Delete category", action: () => removeCategory(category.id), danger: true });
  }
  return actions;
}

function appendCategoryPath(container) {
  container.classList.toggle("has-many-categories", allCategories.length > 4);

  appendSettingsPathItem(container);

  appendPathItem(container, "All channels", showRootChannels, {
    active: activeView === "channels" && !activeCategoryId && !activeChannel,
    contextActions: [
      { label: "Add category", action: () => addCategoryEl.click() }
    ]
  });

  /* Next version: virtual "New videos" category.
  appendPathItem(container, "New videos", async () => {
    await maybePromptSeenForWatchLater();
    activeView = "channels";
    activeCategoryId = NEW_VIDEOS_CATEGORY_ID;
    activeChannel = null;
    activeVideoId = "";
    currentVideos = [];
    videosEl.replaceChildren();
    setHeader("", false);
    renderCategories();
    renderChannels(channelsForActiveCategory());
    renderSidePanelPath();
    setActiveChannelButton();
  }, {
    active: activeView === "channels" && activeCategoryId === NEW_VIDEOS_CATEGORY_ID && !activeChannel,
    contextActions: [],
    kind: "auto"
  });
  */

  appendPathItem(container, "Watch later", async () => {
    await maybePromptSeenForWatchLater();
    activeView = "watchLater";
    activeCategoryId = "";
    clearChannelSearch();
    pushHistory({ type: "watchLater", id: "watchLater" });
    renderCategories();
    renderChannels([]);
    renderWatchLater();
  }, { active: activeView === "watchLater" });

  for (const category of allCategories) {
    appendPathItem(container, category.name, () => {
      showCategoryChannels(category.id);
    }, {
      active: activeView === "channels" && activeCategoryId === category.id && !activeChannel,
      contextActions: categoryContextActions(category)
    });
  }
}

function appendActiveChannelCategories(container) {
  if (!activeChannel?.categories?.length) return;

  for (const categoryId of activeChannel.categories) {
    const category = allCategories.find((item) => item.id === categoryId);
    if (!category) continue;
    appendPathItem(container, category.name, () => showCategoryChannels(category.id), {
      level: 2,
      active: false,
      contextActions: categoryContextActions(category)
    });
  }
}

function appendActiveChannelSummary(container) {
  if (!activeChannel) return;
  appendActiveChannelCategories(container);
}

function makeCategoryResizeHandle() {
  const handle = document.createElement("div");
  handle.className = "categoryResizeHandle";
  handle.title = "Adjust category height";
  handle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    categoryResizeStartY = event.clientY;
    categoryResizeStartHeight = sidePanelPathEl.getBoundingClientRect().height;
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener("pointermove", (event) => {
    if (!handle.hasPointerCapture(event.pointerId)) return;
    const maxHeight = Math.max(90, sidePanelPathEl.scrollHeight);
    const nextHeight = Math.max(52, Math.min(maxHeight, categoryResizeStartHeight + event.clientY - categoryResizeStartY));
    document.documentElement.style.setProperty("--category-panel-max-height", `${nextHeight}px`);
    sidePanelPathEl.classList.toggle("is-fully-expanded", nextHeight >= maxHeight - 2);
  });
  handle.addEventListener("pointerup", (event) => {
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
  });
  return handle;
}

function renderSidePanelPath() {
  if (!sidePanelPathEl || !sidePanelVideoPathEl) return;
  updateChannelSearchPlaceholder();
  sidePanelPathEl.replaceChildren();
  sidePanelVideoPathEl.replaceChildren();
  appendCategoryPath(sidePanelPathEl);
  sidePanelPathEl.classList.remove("is-fully-expanded");
  sidePanelPathEl.parentElement?.querySelectorAll(".categoryResizeHandle").forEach((handle) => handle.remove());
  sidePanelPathEl.after(makeCategoryResizeHandle());
  appendActiveChannelSummary(sidePanelVideoPathEl);
  syncStackedChannelViewState();
}

async function showSidePanelChannels() {
  await maybePromptSeenForWatchLater();
  document.body.classList.remove("sidePanelVideos");
  activeView = "channels";
  activeChannel = null;
  activeVideoId = "";
  activeSearchQuery = "";
  clearChannelSearch();
  currentVideos = [];
  setHeader("", false);
  videosEl.replaceChildren();
  renderCategories();
  renderChannels(channelsForActiveCategory());
  renderSidePanelPath();
  setActiveChannelButton();
  syncStackedChannelViewState();
  pushHistory(channelListHistoryEntry());
}

function applyListLayout() {
  document.body.classList.toggle("videoWideColumns", listLayout === "wide");
  document.body.classList.toggle("videoListSingleColumn", listLayout === "single");
  document.body.classList.toggle("channelIconMode", channelListMode === "icons");
  document.body.classList.toggle("channelListSingleColumn", channelListMode === "single");
  syncChannelIconModeButton();
  syncVideoLayoutButton();
  updateSplitColumnState();
}

function syncChannelIconModeButton() {
  if (!channelIconModeEl) return;
  channelIconModeEl.classList.toggle("is-active", channelListMode === "icons");
  channelIconModeEl.disabled = false;
  const labels = {
    icons: "Icons only",
    columns: "List with names in available columns",
    single: "List in one column only"
  };
  const nextLabels = {
    icons: "List with names in available columns",
    columns: "List in one column only",
    single: "Icons only"
  };
  const label = activeChannel ? "Back to channel list" : `${labels[channelListMode]}. Next: ${nextLabels[channelListMode]}`;
  channelIconModeEl.title = label;
  channelIconModeEl.setAttribute("aria-label", label);
  channelIconModeEl.setAttribute("aria-pressed", String(channelListMode === "icons"));
}

function syncVideoLayoutButton() {
  if (!toggleListLayoutEl) return;
  const labels = {
    wide: "Wide video columns",
    grid: "Video grid in available columns",
    single: "Video cards in one column only"
  };
  const nextLabels = {
    wide: "Video grid in available columns",
    grid: "Video cards in one column only",
    single: "Wide video columns"
  };
  const label = `${labels[listLayout]}. Next: ${nextLabels[listLayout]}`;
  toggleListLayoutEl.classList.toggle("is-active", listLayout === "wide");
  toggleListLayoutEl.title = label;
  toggleListLayoutEl.setAttribute("aria-label", label);
  toggleListLayoutEl.setAttribute("aria-pressed", String(listLayout === "wide"));
  syncVideoLayoutAvailability();
}

function syncVideoLayoutAvailability() {
  requestAnimationFrame(() => {
    const isVideoList = document.body.classList.contains("sidePanelVideos") && activeView !== "watchLater";
    const width = videosEl.getBoundingClientRect().width || videosEl.parentElement?.getBoundingClientRect().width || 0;
    const styles = getComputedStyle(videosEl);
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;
    const canShowMultipleColumns = width >= VIDEO_GRID_MIN_COLUMN_WIDTH * 2 + gap;
    document.body.classList.toggle("videoMultiColumnAvailable", isVideoList && canShowMultipleColumns);
    document.body.classList.toggle("videoSingleColumnOnly", isVideoList && width > 0 && !canShowMultipleColumns);
  });
}

function updateSplitColumnState() {
  const hasEnoughWidth = window.innerWidth >= SPLIT_COLUMN_MIN_WIDTH;
  document.body.classList.toggle("useSplitColumns", hasEnoughWidth);
  syncStackedChannelViewState();
  syncVideoLayoutAvailability();
}

function syncStackedChannelViewState() {
  const stacked = document.body.classList.contains("sidePanelVideos") && !document.body.classList.contains("useSplitColumns");
  document.body.classList.toggle("stackedChannelView", stacked);
  document.body.classList.toggle("hasActiveChannel", Boolean(activeChannel));
  if (activeChannelSeparatorEl) {
    activeChannelSeparatorEl.hidden = !document.body.classList.contains("sidePanelVideos") || !activeChannel;
  }
}

let historyStack = [];
let historyIndex = -1;
let suppressHistory = false;
let applyingHistory = false;

function textFrom(entry, selector) {
  return entry.querySelector(selector)?.textContent?.trim() || "";
}

function parseFeed(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  const entries = [...doc.querySelectorAll("entry")];

  return entries.map((entry) => {
    const videoId = textFrom(entry, "videoId");
    return {
      id: videoId,
      title: textFrom(entry, "title"),
      published: textFrom(entry, "published"),
      thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
    };
  });
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function youtubeUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

async function openOfficialYoutube(video) {
  const videoId = typeof video === "string" ? video : video.id;
  if (!videoId) return;

  if (currentWatchLaterVideoId && currentWatchLaterVideoId !== videoId) {
    await maybePromptSeenForWatchLater();
  }

  activeVideoId = videoId;
  currentWatchLaterVideoId = activeView === "watchLater" && watchLater[videoId] ? videoId : "";
  currentWatchLaterStartedAt = currentWatchLaterVideoId ? Date.now() : 0;
  setActiveVideoButton();

  if (typeof video === "object" && !currentWatchLaterVideoId) {
    seenVideos[videoId] = {
      seenAt: new Date().toISOString(),
      channelId: activeChannel?.id || video.channelId || "",
      title: video.title || ""
    };
    await saveConfig().catch(() => {});
  }

  if (globalThis.chrome?.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.id) {
        chrome.tabs.update(tab.id, { url: youtubeUrl(videoId) });
      } else {
        window.location.href = youtubeUrl(videoId);
      }
    });
    return;
  }

  window.location.href = youtubeUrl(videoId);
}

async function readStoredConfig() {
  if (!globalThis.chrome?.storage?.local) return null;
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => resolve(result[STORAGE_KEY] || null));
  });
}

async function writeStoredConfig(value) {
  if (!globalThis.chrome?.storage?.local) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    return;
  }

  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: value }, () => {
      const error = chrome.runtime?.lastError;
      if (error) reject(new Error(error.message));
      else resolve();
    });
  });
}



function videoIdFromInput(value) {
  const trimmed = value.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : "";
    }

    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v") || url.pathname.split("/").pop() || "";
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : "";
    }
  } catch {
    return "";
  }

  return "";
}

function pushHistory(entry) {
  if (suppressHistory) return;
  const current = historyStack[historyIndex];
  if (current && current.type === entry.type && current.id === entry.id) return;

  historyStack = historyStack.slice(0, historyIndex + 1);
  historyStack.push(entry);
  historyIndex = historyStack.length - 1;
  updateHistoryButtons();
}

function metaForVideo(video) {
  const parts = [];
  if (video.channel) parts.push(video.channel);
  if (video.published) {
    const formatted = formatDate(video.published);
    parts.push(formatted || video.published);
  }
  if (video.views) parts.push(video.views);
  return parts.join(" - ");
}

function updateHistoryButtons() {
  const backDisabled = applyingHistory || historyIndex <= 0;
  const forwardDisabled = applyingHistory || historyIndex >= historyStack.length - 1;
  backEl.disabled = backDisabled;
  forwardEl.disabled = forwardDisabled;
  if (channelBackEl) channelBackEl.disabled = backDisabled;
  if (channelForwardEl) channelForwardEl.disabled = forwardDisabled;
}

function channelListHistoryEntry(categoryId = activeCategoryId) {
  return { type: "channelList", id: categoryId || "" };
}

function currentShelfBaseHistoryEntry() {
  if (activeView === "watchLater") return { type: "watchLater", id: "watchLater" };
  if (activeChannel) return { type: "channel", id: activeChannel.id };
  if (activeView === "channels") return channelListHistoryEntry();
  return null;
}

function channelSearchHistoryEntry() {
  const query = channelSearchQuery.trim();
  if (!query) return currentShelfBaseHistoryEntry();
  return {
    type: "channelSearch",
    id: JSON.stringify({
      query,
      categoryId: activeCategoryId || "",
      channelId: activeChannel?.id || ""
    })
  };
}

function recordChannelSearchHistory() {
  const entry = channelSearchHistoryEntry();
  if (!entry) return;

  const current = historyStack[historyIndex];
  if (!suppressHistory && current?.type === "channelSearch" && entry.type === "channelSearch") {
    historyStack[historyIndex] = entry;
    updateHistoryButtons();
    return;
  }

  pushHistory(entry);
}

function showChannelListState(categoryId = "") {
  document.body.classList.remove("sidePanelVideos");
  activeView = "channels";
  activeCategoryId = categoryId || "";
  activeChannel = null;
  activeVideoId = "";
  activeSearchQuery = "";
  currentVideos = [];
  videosEl.replaceChildren();
  setHeader("", false);
  renderCategories();
  renderChannels(channelsForActiveCategory());
  renderSidePanelPath();
  setActiveChannelButton();
  syncStackedChannelViewState();
  setStatus();
}

function setActiveVideoButton() {
  for (const button of videosEl.querySelectorAll(".video")) {
    button.classList.toggle("is-active", button.dataset.videoId === activeVideoId);
  }
  updatePlayerWatchLaterButton();
}

function updatePlayerWatchLaterButton() {
  if (!playerWatchLaterEl) return;
  playerWatchLaterEl.classList.toggle("is-active", Boolean(watchLater[activeVideoId]));
  playerWatchLaterEl.textContent = "Watch later";
}

function markVideoSeen(videoId) {
  const video = currentVideos.find((item) => item.id === videoId);
  seenVideos[videoId] = {
    seenAt: new Date().toISOString(),
    channelId: activeChannel?.id || video?.channelId || "",
    title: video?.title || ""
  };
  saveConfig().catch((error) => {
    setStatus(`Seen status save error: ${error.message}`, true);
  });
}

async function maybePromptSeenForWatchLater() {
  if (!currentWatchLaterVideoId || !watchLater[currentWatchLaterVideoId]) return;

  const videoId = currentWatchLaterVideoId;
  currentWatchLaterVideoId = "";
  currentWatchLaterStartedAt = 0;
  const shouldMarkSeen = await askMarkSeen();
  if (!shouldMarkSeen) return;

  const item = watchLater[videoId];
  seenVideos[videoId] = {
    savedAt: item.savedAt || new Date().toISOString(),
    seenAt: new Date().toISOString(),
    channelId: item.channelId || "",
    title: item.title || ""
  };
  delete watchLater[videoId];
  await saveConfig();

  if (activeView === "watchLater") {
    renderWatchLater();
  } else {
    renderVideos(currentVideos);
  }
}

async function checkCurrentWatchLaterVisibility() {
  if (!currentWatchLaterVideoId || !globalThis.chrome?.tabs || seenPromptResolve) return;
  if (Date.now() - currentWatchLaterStartedAt < 2500) return;

  const tab = await new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => resolve(activeTab || null));
  });
  const visibleVideoId = videoIdFromInput(tab?.url || "");
  if (visibleVideoId !== currentWatchLaterVideoId) {
    await maybePromptSeenForWatchLater();
  }
}

function askMarkSeen() {
  seenPromptEl.hidden = false;
  markSeenEl.focus();

  return new Promise((resolve) => {
    seenPromptResolve = resolve;
  });
}

function closeSeenPrompt(value) {
  seenPromptEl.hidden = true;
  if (seenPromptResolve) {
    seenPromptResolve(value);
    seenPromptResolve = null;
  }
}

function showListView() {
  listViewEl.hidden = false;
  playerViewEl.hidden = true;
  contentToolbarEl.hidden = false;
  document.querySelector(".channelHeader").style.width = "";
  document.body.classList.remove("isPlayerMode");
  refreshEl.hidden = false;
  playerEl.removeAttribute("src");
  activeVideoId = "";
  setActiveVideoButton();
}

function setStatus(text = "", visible = false) {
  statusEl.textContent = text;
  statusEl.hidden = !visible;
}

function setHeader(title = "", showActions = false) {
  channelTitleEl.textContent = title;
  channelActionsEl.hidden = !showActions;
  videoTitleLineEl.hidden = true;
  refreshEl.hidden = false;
  document.title = title || "Youtube";
}

function showPlayerView() {
  listViewEl.hidden = true;
  playerViewEl.hidden = false;
  contentToolbarEl.hidden = true;
  document.body.classList.add("isPlayerMode");
  refreshEl.hidden = true;
  requestAnimationFrame(syncHeaderToPlayerWidth);
}

function syncHeaderToPlayerWidth() {
  if (playerViewEl.hidden) return;
  const width = playerPanelEl.getBoundingClientRect().width;
  if (width > 0) {
    document.querySelector(".channelHeader").style.width = `${width}px`;
  }
}

function play(videoId, options = {}) {
  activeVideoId = videoId;
  currentWatchLaterVideoId = activeView === "watchLater" && watchLater[videoId] ? videoId : "";
  currentWatchLaterStartedAt = currentWatchLaterVideoId ? Date.now() : 0;
  const video = currentVideos.find((item) => item.id === videoId);
  const videoTitle = video?.title || videoId;
  channelTitleEl.textContent = videoTitle;
  currentVideoTitleEl.textContent = "";
  document.title = videoTitle;
  videoTitleLineEl.hidden = false;
  showPlayerView();
  const origin = encodeURIComponent(window.location.origin);
  playerEl.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&enablejsapi=1&origin=${origin}`;
  setActiveVideoButton();
  if (!currentWatchLaterVideoId) {
    markVideoSeen(videoId);
  }

  if (!options.skipHistory) {
    pushHistory({ type: "video", id: videoId });
  }
}

function createVideoCard(video) {
      const card = document.createElement("div");
      card.className = "video";
      card.classList.toggle("is-seen", Boolean(seenVideos[video.id]));
      card.tabIndex = 0;
      card.role = "button";
      card.dataset.videoId = video.id;
      card.addEventListener("click", () => openOfficialYoutube(video));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openOfficialYoutube(video);
        }
      });
      card.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        event.stopPropagation();
        showContextMenu(event, videoContextActions(video));
      });

      const thumb = document.createElement("img");
      thumb.className = "thumb";
      thumb.alt = "";
      thumb.loading = "lazy";
      thumb.src = video.thumbnail;

      const thumbFrame = document.createElement("div");
      thumbFrame.className = "thumbFrame";
      thumbFrame.append(thumb);

      const details = document.createElement("div");
      details.className = "videoDetails";
      const title = document.createElement("div");
      title.className = "videoTitle";
      title.textContent = video.title;

      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = metaForVideo(video);

      const watchButton = document.createElement("button");
      watchButton.className = "watchLaterButton";
      watchButton.classList.toggle("is-active", Boolean(watchLater[video.id]));
      watchButton.type = "button";
      watchButton.textContent = "Watch later";
      watchButton.addEventListener("click", async (event) => {
        event.stopPropagation();
        await toggleWatchLater(video);
      });

      details.append(title, meta);
      card.append(thumbFrame, details, watchButton);
      return card;
}

function renderVideos(videos, target = videosEl) {
  target.replaceChildren(...videos.map(createVideoCard));

  setActiveVideoButton();
  syncVideoLayoutAvailability();
}

async function toggleWatchLater(video) {
  if (watchLater[video.id]) {
    delete watchLater[video.id];
  } else {
    watchLater[video.id] = {
      savedAt: new Date().toISOString(),
      seenAt: "",
      channelId: activeChannel?.id || video.channelId || "",
      title: video.title || ""
    };
  }
  await saveConfig();
  updatePlayerWatchLaterButton();
  if (activeView === "watchLater") {
    renderWatchLater();
  } else {
    renderVideos(currentVideos);
  }
}

function thumbnailFromSubscription(subscription) {
  const thumbnails = subscription.snippet?.thumbnails || {};
  return thumbnails.default?.url || thumbnails.medium?.url || thumbnails.high?.url || "";
}

function normalizeSubscription(subscription) {
  const snippet = subscription.snippet || {};
  return {
    id: snippet.resourceId?.channelId || snippet.channelId,
    title: snippet.title || "Untitled channel",
    thumbnail: thumbnailFromSubscription(subscription)
  };
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}
function emptyConfig() {
  return { version: 1, categories: [], channels: [], seenVideos: {}, watchLater: {}, updatedAt: new Date().toISOString() };
}

function downloadText(filename, text, type = "application/json") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function currentExportConfig() {
  return {
    version: 1,
    categories: allCategories,
    channels: allChannels,
    seenVideos,
    watchLater,
    updatedAt: new Date().toISOString()
  };
}

function exportNativeConfig() {
  downloadText(`youtube-channel-shelf-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(currentExportConfig(), null, 2));
}

function csvValue(value) {
  return `"${String(value || "").replace(/"/g, '""')}"`;
}

function exportYoutubeCsv() {
  const rows = [["Channel Id", "Channel Url", "Channel Title"]];
  for (const channel of allChannels) {
    rows.push([channel.id, `https://www.youtube.com/channel/${channel.id}`, channel.title || channel.id]);
  }
  const csv = rows.map((row) => row.map(csvValue).join(",")).join("\n");
  downloadText(`youtube-subscriptions-${new Date().toISOString().slice(0, 10)}.csv`, csv, "text/csv");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === "," || char === ";" || char === "\t") {
      row.push(cell.trim());
      cell = "";
    } else if (char === "\n") {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }
  return rows.filter((item) => item.some(Boolean));
}

function channelIdFromAny(value = "") {
  const text = String(value).trim();
  const direct = text.match(/UC[-_a-zA-Z0-9]{10,}/);
  return direct ? direct[0] : "";
}

function normalizeImportedChannel(entry) {
  if (!entry) return null;
  const snippet = entry.snippet || entry;
  const id = entry.id || entry.channelId || entry.channel_id || entry.channelID || entry.authorId || entry.authorID || entry.ucid || snippet.resourceId?.channelId || snippet.channelId || channelIdFromAny(entry.url || entry.channelUrl || entry.channel_url || entry.link || entry.htmlUrl || "");
  if (!id) return null;
  return {
    id,
    title: entry.title || entry.name || entry.channelName || entry.channel_name || entry.author || snippet.title || id,
    thumbnail: entry.thumbnail || entry.thumbnailUrl || entry.channelThumbnail || snippet.thumbnails?.default?.url || snippet.thumbnails?.medium?.url || "",
    categories: entry.categories || [],
    description: entry.description || snippet.description || "",
    contentType: entry.contentType || entry.content_type || entry.content || entry.type || entry.genre || entry.niche || "",
    tags: entry.tags || entry.keywords || entry.topics || []
  };
}

function extractChannelsFromJson(value) {
  if (Array.isArray(value)) return value.map(normalizeImportedChannel).filter(Boolean);
  if (Array.isArray(value?.channels)) return value.channels.map(normalizeImportedChannel).filter(Boolean);
  if (Array.isArray(value?.items)) return value.items.map(normalizeImportedChannel).filter(Boolean);
  if (Array.isArray(value?.subscriptions)) return value.subscriptions.map(normalizeImportedChannel).filter(Boolean);
  if (value?.profiles) {
    const profile = Object.values(value.profiles)[0];
    if (Array.isArray(profile?.subscriptions)) return profile.subscriptions.map(normalizeImportedChannel).filter(Boolean);
  }
  return [];
}

function extractChannelsFromCsv(text) {
  const rows = parseCsv(text);
  if (!rows.length) return [];
  const header = rows[0].map((item) => item.toLowerCase());
  const hasHeader = header.some((item) => item.includes("channel") || item.includes("title"));
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const idIndex = Math.max(header.findIndex((item) => item.includes("channel id")), header.findIndex((item) => item === "id"));
  const titleIndex = Math.max(header.findIndex((item) => item.includes("title")), header.findIndex((item) => item.includes("name")));
  const urlIndex = header.findIndex((item) => item.includes("url"));
  return dataRows.map((row) => {
    const id = channelIdFromAny(row[idIndex] || row[urlIndex] || row.join(" "));
    if (!id) return null;
    return { id, title: row[titleIndex] || id, thumbnail: "", categories: [] };
  }).filter(Boolean);
}

function mergeChannels(imported) {
  const existing = new Map(allChannels.map((channel) => [channel.id, channel]));
  for (const channel of imported) {
    const current = existing.get(channel.id);
    existing.set(channel.id, {
      ...current,
      ...channel,
      id: channel.id,
      title: channel.title || current?.title || channel.id,
      thumbnail: channel.thumbnail || current?.thumbnail || "",
      categories: [...new Set([...(current?.categories || []), ...(channel.categories || [])])]
    });
  }
  allChannels = [...existing.values()].sort((a, b) => a.title.localeCompare(b.title, "fr"));
}

async function importNativeConfigFromText(text) {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.channels)) throw new Error("Invalid YouTube Channel Shelf file");
  config = { ...emptyConfig(), ...parsed, updatedAt: new Date().toISOString() };
  allCategories = config.categories || [];
  allChannels = config.channels || [];
  seenVideos = config.seenVideos || {};
  watchLater = config.watchLater || {};
  await writeStoredConfig(config);
}

async function importChannelsFromText(text) {
  let imported = [];
  try {
    imported = extractChannelsFromJson(JSON.parse(text));
  } catch {
    imported = extractChannelsFromCsv(text);
  }
  if (!imported.length) throw new Error("No channel recognized");
  mergeChannels(imported);
  await saveConfig();
}

async function runImportFilePicker(kind) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,.csv,.txt,application/json,text/csv,text/plain";
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    input.remove();
    if (!file) return;
    try {
      const text = await file.text();
      if (kind === "native") await importNativeConfigFromText(text);
      else await importChannelsFromText(text);
      configLoaded = true;
      activeCategoryId = "";
      activeChannel = null;
      currentVideos = [];
      renderCategories();
      renderChannels(channelsForActiveCategory());
      renderSidePanelPath();
      videosEl.replaceChildren();
      setStatus("Import complete", true);
    } catch (error) {
      setStatus(`Import failed: ${error.message}`, true);
    }
  }, { once: true });
  document.body.append(input);
  input.click();
}

async function cleanSlate() {
  if (!await requestConfirmation("Delete all subscriptions and categories?")) return;
  config = emptyConfig();
  allCategories = [];
  allChannels = [];
  seenVideos = {};
  watchLater = {};
  activeCategoryId = "";
  activeChannel = null;
  currentVideos = [];
  configLoaded = true;
  await writeStoredConfig(config);
  renderCategories();
  renderChannels([]);
  renderSidePanelPath();
  videosEl.replaceChildren();
  setStatus("Data deleted", true);
}


function openImportPickerDialog(kind) {
  pendingImportKind = kind;
  importExportPromptEl.hidden = false;
  const labels = {
    native: "Import YouTube Channel Shelf",
    youtube: "Import YouTube",
    freetube: "Import FreeTube"
  };
  for (const button of [exportNativeConfigEl, exportYoutubeConfigEl, importNativeConfigEl, importYoutubeConfigEl, importFreetubeConfigEl]) {
    button.hidden = true;
  }
  const target = kind === "native" ? importNativeConfigEl : kind === "youtube" ? importYoutubeConfigEl : importFreetubeConfigEl;
  target.hidden = false;
  target.textContent = labels[kind] || "Import";
}

function openFullImportExportDialog() {
  pendingImportKind = "";
  importExportPromptEl.hidden = false;
  exportNativeConfigEl.hidden = false;
  exportYoutubeConfigEl.hidden = false;
  importNativeConfigEl.hidden = false;
  importYoutubeConfigEl.hidden = false;
  importFreetubeConfigEl.hidden = false;
  importNativeConfigEl.textContent = "Import YouTube Channel Shelf";
  importYoutubeConfigEl.textContent = "Import YouTube";
  importFreetubeConfigEl.textContent = "Import FreeTube";
}
function openImportExportDialog() {
  openFullImportExportDialog();
}

function closeImportExportDialog() {
  importExportPromptEl.hidden = true;
}

async function handleDataCommand(command) {
  if (command === "importExportDialog") {
    openImportExportDialog();
    return;
  }
  if (!configLoaded && command !== "importNative" && command !== "importYoutube" && command !== "importFreetube") {
    setStatus("Configuration is not loaded yet", true);
    return;
  }
  if (command === "exportNative") exportNativeConfig();
  else if (command === "exportYoutube") exportYoutubeCsv();
  else if (command === "importNative") await runImportFilePicker("native");
  else if (command === "importYoutube") await runImportFilePicker("youtube");
  else if (command === "importFreetube") await runImportFilePicker("freetube");
  else if (command === "cleanSlate") await cleanSlate();
}
function createCategory(name) {
  const trimmed = name.trim();
  const idBase = slugify(trimmed);
  if (!idBase) return null;

  const existing = allCategories.find((category) => category.name.toLocaleLowerCase("fr") === trimmed.toLocaleLowerCase("fr"));
  if (existing) return existing;

  let id = idBase;
  let suffix = 2;
  while (allCategories.some((category) => category.id === id)) {
    id = `${idBase}-${suffix}`;
    suffix += 1;
  }

  const category = { id, name: trimmed };
  allCategories.push(category);
  return category;
}

function renderCategoryAssignmentList() {
  if (!categoryAssignListEl) return;
  categoryAssignListEl.replaceChildren(
    ...allCategories.map((category) => {
      const label = document.createElement("label");
      label.className = "categoryAssignItem";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = category.id;
      checkbox.checked = Boolean(categoryAssignChannel?.categories?.includes(category.id));

      const name = document.createElement("span");
      name.textContent = category.name;

      label.append(checkbox, name);
      return label;
    })
  );
}

function renderChannelAssignmentList() {
  if (!channelAssignListEl || !channelAssignCategory) return;
  channelAssignListEl.replaceChildren(
    ...allChannels.map((channel) => {
      const label = document.createElement("label");
      label.className = "categoryAssignItem";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = channel.id;
      checkbox.checked = Boolean((channel.categories || []).includes(channelAssignCategory.id));

      const name = document.createElement("span");
      name.textContent = channel.title;

      label.append(checkbox, name);
      return label;
    })
  );
}

function openChannelAssignment(category) {
  if (!category?.id || !channelAssignPromptEl) return;
  channelAssignCategory = category;
  renderChannelAssignmentList();
  channelAssignPromptEl.hidden = false;
}

function closeChannelAssignment() {
  channelAssignPromptEl.hidden = true;
  channelAssignCategory = null;
}

async function saveChannelAssignment() {
  if (!channelAssignCategory) return;
  const selectedIds = new Set([...channelAssignListEl.querySelectorAll("input:checked")].map((checkbox) => checkbox.value));
  allChannels = allChannels.map((channel) => {
    const categories = new Set(channel.categories || []);
    if (selectedIds.has(channel.id)) categories.add(channelAssignCategory.id);
    else categories.delete(channelAssignCategory.id);
    return { ...channel, categories: [...categories] };
  });
  if (activeChannel) {
    activeChannel = allChannels.find((channel) => channel.id === activeChannel.id) || activeChannel;
  }
  await saveConfig();
  renderCategories();
  renderChannels(channelsForActiveCategory());
  renderSidePanelPath();
  closeChannelAssignment();
}
function openCategoryAssignment(channel = activeChannel) {
  if (!channel || !categoryAssignPromptEl) return;
  categoryAssignChannel = channel;
  newCategoryNameEl.value = "";
  renderCategoryAssignmentList();
  categoryAssignPromptEl.hidden = false;
  newCategoryNameEl.focus();
}

function closeCategoryAssignment() {
  categoryAssignPromptEl.hidden = true;
  categoryAssignChannel = null;
  newCategoryNameEl.value = "";
}

async function addCategoryFromAssignment() {
  const category = createCategory(newCategoryNameEl.value);
  if (!category) return;
  if (categoryAssignChannel) {
    categoryAssignChannel.categories = [...new Set([...(categoryAssignChannel.categories || []), category.id])];
  }
  newCategoryNameEl.value = "";
  renderCategoryAssignmentList();
  const checkbox = categoryAssignListEl.querySelector(`input[value="${CSS.escape(category.id)}"]`);
  if (checkbox) checkbox.checked = true;
}

async function saveCategoryAssignment() {
  if (!categoryAssignChannel) return;
  if (newCategoryNameEl.value.trim()) {
    await addCategoryFromAssignment();
  }
  const categoryIds = [...categoryAssignListEl.querySelectorAll("input:checked")].map((checkbox) => checkbox.value);
  categoryAssignChannel.categories = [...new Set(categoryIds)];
  allChannels = allChannels.map((channel) => (channel.id === categoryAssignChannel.id ? categoryAssignChannel : channel));
  activeChannel = activeChannel?.id === categoryAssignChannel.id ? categoryAssignChannel : activeChannel;
  await saveConfig();
  renderCategories();
  renderChannels(channelsForActiveCategory());
  renderSidePanelPath();
  closeCategoryAssignment();
}

async function removeCategory(categoryId) {
  const category = allCategories.find((item) => item.id === categoryId);
  if (!category) return;
  if (!await requestConfirmation(`Delete category "${category.name}"?`)) return;

  allCategories = allCategories.filter((item) => item.id !== categoryId);
  allChannels = allChannels.map((channel) => ({
    ...channel,
    categories: (channel.categories || []).filter((id) => id !== categoryId)
  }));
  if (activeCategoryId === categoryId) activeCategoryId = "";
  await saveConfig();
  renderCategories();
  renderChannels(channelsForActiveCategory());
  renderSidePanelPath();
}

async function unsubscribeActiveChannel() {
  if (!activeChannel) return;
  const id = activeChannel.id;
  allChannels = allChannels.filter((channel) => channel.id !== id);
  activeChannel = null;
  activeVideoId = "";
  activeSearchQuery = "";
  currentVideos = [];
  setHeader("", false);
  setStatus();
  videosEl.replaceChildren();
  showListView();
  await saveConfig();
  renderCategories();
  renderChannels(channelsForActiveCategory());
  renderSidePanelPath();
}
async function unsubscribeChannel(channel) {
  if (!channel) return;
  if (activeChannel?.id === channel.id) {
    await unsubscribeActiveChannel();
    return;
  }
  allChannels = allChannels.filter((item) => item.id !== channel.id);
  await saveConfig();
  renderCategories();
  renderChannels(channelsForActiveCategory());
  renderSidePanelPath();
}

function channelContextActions(channel) {
  return [
    { label: "Classify", action: () => openCategoryAssignment(channel) },
    { label: "Unsubscribe", action: () => unsubscribeChannel(channel), danger: true }
  ];
}

function channelsForActiveCategory() {
  if (!activeCategoryId) return allChannels;
  return allChannels.filter((channel) => (channel.categories || []).includes(activeCategoryId));
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function savedVideoTextsForChannel(channelId) {
  const entries = [
    ...Object.values(seenVideos || {}),
    ...Object.values(watchLater || {})
  ];

  return entries
    .filter((item) => item?.channelId === channelId)
    .map((item) => item.title || "");
}

function channelContentTypeTexts(channel) {
  const fields = [
    "description",
    "content",
    "contentType",
    "contentTypes",
    "content_type",
    "type",
    "types",
    "genre",
    "genres",
    "niche",
    "niches",
    "topic",
    "topics",
    "tag",
    "tags",
    "keyword",
    "keywords"
  ];

  return fields.flatMap((field) => {
    const value = channel?.[field];
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") return Object.values(value);
    return value ? [value] : [];
  });
}

function searchableTextForChannel(channel) {
  const categoryNames = categoryNamesForChannel(channel);
  const feedVideos = Array.isArray(channel.feedVideos) ? channel.feedVideos : [];
  const activeFeedVideos = activeChannel?.id === channel.id ? currentVideos : [];
  const videoTitles = [...feedVideos, ...activeFeedVideos]
    .map((video) => video?.title || "")
    .filter(Boolean);

  return normalizeSearchText([
    channel.id,
    channel.title,
    channel.feedLatestTitle,
    ...channelContentTypeTexts(channel),
    ...categoryNames,
    ...videoTitles,
    ...savedVideoTextsForChannel(channel.id)
  ].join(" "));
}

function sourceChannelsForSearch() {
  if (activeView === "watchLater") return [];
  if (!activeCategoryId) return allChannels;
  return allChannels.filter((channel) => (channel.categories || []).includes(activeCategoryId));
}

function isSelectedChannelSearchScope() {
  return activeView === "channels" && Boolean(activeChannel);
}

function updateChannelSearchPlaceholder() {
  if (!channelSearchInputEl) return;
  const placeholder = isSelectedChannelSearchScope()
    ? "Search in this channel"
    : activeView === "watchLater"
      ? "Search Watch later"
      : activeCategoryId
      ? `Search channels in ${currentCategoryName()}`
      : "Search all channels";
  channelSearchInputEl.placeholder = placeholder;
  channelSearchInputEl.setAttribute("aria-label", placeholder);
}

function syncChannelSearchState() {
  updateChannelSearchPlaceholder();
  document.body.classList.toggle("isChannelSearching", Boolean(channelSearchQuery.trim()) && !isSelectedChannelSearchScope());
}

function clearChannelSearch() {
  channelSearchQuery = "";
  if (channelSearchInputEl) channelSearchInputEl.value = "";
  syncChannelSearchState();
}

function searchableTextForVideo(video) {
  return normalizeSearchText([
    video?.id,
    video?.title,
    video?.published,
    video?.channel
  ].join(" "));
}

function renderSearchedVideos() {
  syncChannelSearchState();
  const query = normalizeSearchText(channelSearchQuery.trim());
  if (!query) {
    renderVideos(currentVideos);
    setStatus();
    return;
  }

  const filteredVideos = currentVideos.filter((video) => searchableTextForVideo(video).includes(query));
  renderVideos(filteredVideos);
  setStatus(filteredVideos.length ? "" : "No videos found in this channel.", !filteredVideos.length);
}

function renderWatchLaterVideoResults(videos) {
  const watchLaterList = document.createElement("div");
  watchLaterList.className = "videos watchLaterVideos";
  channelsEl.replaceChildren(watchLaterList);
  renderVideos(videos, watchLaterList);
}

function renderSearchResults() {
  syncChannelSearchState();
  if (isSelectedChannelSearchScope()) {
    renderSearchedVideos();
    return;
  }
  if (activeView === "watchLater") {
    const query = normalizeSearchText(channelSearchQuery.trim());
    const filteredVideos = query ? currentVideos.filter((video) => searchableTextForVideo(video).includes(query)) : currentVideos;
    renderWatchLaterVideoResults(filteredVideos);
    setStatus(filteredVideos.length ? "" : "No videos found in Watch later.", !filteredVideos.length);
    return;
  }
  renderChannels(sourceChannelsForSearch());
}

function filterChannelsForSearch(channels) {
  const query = normalizeSearchText(channelSearchQuery.trim());
  if (!query) return channels;
  return channels.filter((channel) => searchableTextForChannel(channel).includes(query));
}

async function saveConfig() {
  if (!configLoaded) {
    throw new Error("Configuration is not loaded yet");
  }

  config = {
    version: 1,
    categories: allCategories,
    channels: allChannels,
    seenVideos,
    watchLater,
    updatedAt: new Date().toISOString()
  };

  await writeStoredConfig(config);
  allCategories = config.categories || [];
  allChannels = config.channels || [];
  seenVideos = config.seenVideos || {};
  watchLater = config.watchLater || {};
}

function renderCategories() {
  const buttons = [
    { id: "", name: "All channels" },
    // Next version: { id: NEW_VIDEOS_CATEGORY_ID, name: "New videos", automatic: true },
    { id: "__watch_later", name: "Watch later", special: true },
    ...allCategories
  ].map((category) => {
    const button = document.createElement("button");
    button.className = "category";
    button.classList.toggle("is-special", Boolean(category.special));
    button.classList.toggle("is-auto", Boolean(category.automatic));
    button.type = "button";
    button.textContent = category.name;
    button.classList.toggle(
      "is-active",
      category.id === "__watch_later" ? activeView === "watchLater" : activeView === "channels" && category.id === activeCategoryId
    );
    button.addEventListener("click", async () => {
      await maybePromptSeenForWatchLater();
      /* Next version: virtual "New videos" category click handling.
      if (category.id === NEW_VIDEOS_CATEGORY_ID) {
        activeView = "channels";
        activeCategoryId = NEW_VIDEOS_CATEGORY_ID;
        activeChannel = null;
        activeVideoId = "";
        currentVideos = [];
        videosEl.replaceChildren();
        setHeader("", false);
        renderCategories();
        renderChannels(channelsForActiveCategory());
        renderSidePanelPath();
        setActiveChannelButton();
        return;
      }
      */

      if (category.id === "__watch_later") {
        activeView = "watchLater";
        activeCategoryId = "";
        clearChannelSearch();
        pushHistory({ type: "watchLater", id: "watchLater" });
        renderCategories();
        renderChannels([]);
        renderWatchLater();
        return;
      }

      clearChannelSearch();
      showChannelListState(category.id);
      pushHistory(channelListHistoryEntry(category.id));
    });
    return button;
  });

  categoriesEl.replaceChildren(...buttons);
  renderSidePanelPath();
}

function renderWatchLater() {
  activeChannel = null;
  activeSearchQuery = "";
  document.body.classList.remove("sidePanelVideos");
  syncStackedChannelViewState();
  listViewEl.hidden = false;
  playerViewEl.hidden = true;
  setActiveChannelButton();
  setHeader("", false);
  renderSidePanelPath();
  setStatus();

  currentVideos = Object.entries(watchLater).map(([id, item]) => ({
    id,
    title: item.title || id,
    published: item.savedAt || "",
    channelId: item.channelId || "",
    thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
  }));
  videosEl.replaceChildren();
  const watchLaterList = document.createElement("div");
  watchLaterList.className = "videos watchLaterVideos";
  channelsEl.replaceChildren(watchLaterList);
  renderVideos(currentVideos, watchLaterList);
  syncStackedChannelViewState();
}

function renderChannels(channels) {
  const visibleChannels = filterChannelsForSearch(channels);
  if (!visibleChannels.length) {
    if (!channelSearchQuery.trim()) {
      channelsEl.replaceChildren();
      setActiveChannelButton();
      return;
    }

    const message = document.createElement("p");
    message.className = "meta channelSearchEmpty";
    message.textContent = "No channels found.";
    channelsEl.replaceChildren(message);
    return;
  }

  channelsEl.replaceChildren(
    ...visibleChannels.map((channel) => {
      const button = document.createElement("button");
      button.className = "channel";
      button.type = "button";
      button.title = channel.title;
      button.dataset.channelId = channel.id;
      button.addEventListener("click", () => selectChannel(channel));
      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        event.stopPropagation();
        showContextMenu(event, channelContextActions(channel));
      });

      const icon = channel.thumbnail ? document.createElement("img") : document.createElement("div");
      if (channel.thumbnail) {
        icon.alt = "";
        icon.loading = "lazy";
        icon.src = channel.thumbnail;
      } else {
        icon.className = "channelFallback";
        icon.textContent = channel.title.slice(0, 1).toUpperCase();
      }

      const body = document.createElement("div");
      body.className = "channelBody";

      const name = document.createElement("div");
      name.className = "channelName";
      name.textContent = channel.title;

      const meta = document.createElement("div");
      meta.className = "channelMeta";

      const categories = document.createElement("div");
      categories.className = "channelCategoryList";
      categories.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openCategoryAssignment(channel);
      });

      body.append(name, meta, categories);
      button.append(icon, body);
      return button;
    })
  );

  setActiveChannelButton();
}

function categoryNamesForChannel(channel) {
  return (channel?.categories || [])
    .map((categoryId) => allCategories.find((category) => category.id === categoryId)?.name)
    .filter(Boolean);
}

function setActiveChannelButton() {
  for (const button of channelsEl.querySelectorAll(".channel")) {
    const isActive = button.dataset.channelId === activeChannel?.id;
    button.classList.toggle("is-active", isActive);

    const categoryList = button.querySelector(".channelCategoryList");
    const meta = button.querySelector(".channelMeta");
    if (!categoryList) continue;
    categoryList.replaceChildren();

    const channel = allChannels.find((item) => item.id === button.dataset.channelId);
    if (meta) {
      meta.replaceChildren();
      if (isActive && document.body.classList.contains("sidePanelVideos")) {
        const count = channel?.feedVideoCount;
        const date = channel?.feedLatestPublished ? formatDate(channel.feedLatestPublished) : "";
        if (count) {
          const countLine = document.createElement("div");
          countLine.textContent = `${count} videos`;
          meta.append(countLine);
        }
        if (date) {
          const latestLine = document.createElement("div");
          latestLine.textContent = `Latest video: ${date}`;
          meta.append(latestLine);
        }
      }
    }
    /* Next version: automatic NEW chip on each channel.
    const newChip = document.createElement("span");
    newChip.className = "channelCategoryChip channelCategoryNewChip";
    newChip.textContent = "NEW";
    newChip.title = "New videos";
    categoryList.append(newChip);
    */

    const categoryNames = categoryNamesForChannel(channel);
    if (!categoryNames.length) {
      if (isActive && document.body.classList.contains("sidePanelVideos")) {
        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "channelCategoryChip channelCategoryAddChip";
        addButton.textContent = "Add category";
        addButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          openCategoryAssignment(channel);
        });
        categoryList.append(addButton);
      }
      continue;
    }

    categoryList.replaceChildren(
      ...categoryNames.map((name) => {
        const item = document.createElement("span");
        item.className = "channelCategoryChip";
        item.textContent = name;
        item.title = "Right-click to edit classification";
        item.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          event.stopPropagation();
          openCategoryAssignment(channel);
        });
        return item;
      })
    );
  }
  syncChannelCategoryLineHeights();
}

function syncChannelCategoryLineHeights() {
  requestAnimationFrame(() => {
    for (const button of channelsEl.querySelectorAll(".channel")) {
      const categoryList = button.querySelector(".channelCategoryList");
      const chips = categoryList ? [...categoryList.children] : [];
      const rowCount = chips.length ? new Set(chips.map((chip) => chip.offsetTop)).size : 0;
      const extraHeight = Math.max(0, rowCount - 1) * 22;
      button.classList.toggle("has-multiple-category-lines", rowCount > 1);
      button.style.setProperty("--category-extra-height", `${extraHeight}px`);
    }
  });
}

async function selectChannel(channel, options = {}) {
  await maybePromptSeenForWatchLater();
  const fullChannel = allChannels.find((item) => item.id === channel?.id) || channel;
  clearChannelSearch();
  activeView = "channels";
  activeChannel = fullChannel;
  activeSearchQuery = "";
  document.body.classList.add("sidePanelVideos");
  syncStackedChannelViewState();
  showListView();
  videosEl.replaceChildren();
  setHeader("", true);
  renderSidePanelPath();
  setActiveChannelButton();

  if (!options.skipHistory) {
    pushHistory({ type: "channel", id: channel.id });
  }

  await loadFeed();
}

async function loadFeed() {
  if (!activeChannel && activeSearchQuery) {
    await searchYoutube(activeSearchQuery);
    return;
  }

  if (!activeChannel) {
    setStatus();
    videosEl.replaceChildren();
    return;
  }

  setStatus("Loading...", true);
  refreshEl.disabled = true;

  try {
    const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(activeChannel.id)}`, {
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    currentVideos = parseFeed(await response.text());
    const latestPublished = currentVideos[0]?.published || "";
    activeChannel = {
      ...activeChannel,
      feedVideoCount: currentVideos.length,
      feedLatestPublished: latestPublished,
      feedLatestTitle: currentVideos[0]?.title || "",
      feedVideos: currentVideos.map((video) => ({
        id: video.id,
        title: video.title,
        published: video.published
      }))
    };
    allChannels = allChannels.map((channel) => (channel.id === activeChannel.id ? { ...channel, ...activeChannel } : channel));
    setActiveChannelButton();
    if (channelSearchQuery.trim() && isSelectedChannelSearchScope()) {
      renderSearchedVideos();
    } else {
      renderVideos(currentVideos);
      setStatus();
    }
  } catch (error) {
    currentVideos = [];
    setStatus("Loading error", true);
    const message = document.createElement("p");
    message.className = "meta";
    message.textContent = `Unable to load feed: ${error.message}`;
    videosEl.replaceChildren(message);
  } finally {
    refreshEl.disabled = false;
  }
}

async function searchYoutube(query, options = {}) {
  const trimmed = query.trim();
  if (!trimmed) return;
  await maybePromptSeenForWatchLater();
  activeView = "search";
  activeSearchQuery = trimmed;
  activeChannel = null;
  showListView();
  setActiveChannelButton();
  setHeader("YouTube search", false);
  currentVideos = [];
  videosEl.replaceChildren();
  setStatus("General search is not wired in this test extension. Paste a YouTube URL to play it embedded.", true);
  if (!options.skipHistory) {
    pushHistory({ type: "search", id: trimmed });
  }
}

async function loadChannels() {
  refreshEl.disabled = true;

  try {
    const storedConfig = await readStoredConfig();
    const bundledConfig = await readBundledConfig();
    config = storedConfig || bundledConfig;
    allCategories = config.categories || [];
    allChannels = (config.channels || [])
      .filter((channel) => channel.id)
      .sort((a, b) => a.title.localeCompare(b.title, "fr"));
    seenVideos = config.seenVideos || {};
    watchLater = config.watchLater || {};
    configLoaded = true;

    if (activeView === "home") activeView = "channels";
    renderCategories();
    renderChannels(channelsForActiveCategory());
    if (historyIndex < 0) {
      pushHistory(channelListHistoryEntry());
    }
  } catch (error) {
    const message = document.createElement("p");
    message.className = "meta";
    message.textContent = `Unable to load channels: ${error.message}`;
    channelsEl.replaceChildren(message);
  } finally {
    refreshEl.disabled = false;
  }
}

function applyExternalConfig(nextConfig) {
  if (!nextConfig) return;

  const activeChannelId = activeChannel?.id || "";
  config = {
    version: 1,
    categories: [],
    channels: [],
    seenVideos: {},
    watchLater: {},
    ...nextConfig
  };
  allCategories = Array.isArray(config.categories) ? config.categories : [];
  allChannels = (Array.isArray(config.channels) ? config.channels : [])
    .filter((channel) => channel.id)
    .sort((a, b) => (a.title || a.id).localeCompare(b.title || b.id, "fr"));
  seenVideos = config.seenVideos || {};
  watchLater = config.watchLater || {};
  configLoaded = true;

  if (activeCategoryId && !allCategories.some((category) => category.id === activeCategoryId)) {
    activeCategoryId = "";
  }

  activeChannel = activeChannelId ? allChannels.find((channel) => channel.id === activeChannelId) || null : null;
  renderCategories();

  if (activeView === "watchLater") {
    renderChannels([]);
    renderWatchLater();
    return;
  }

  renderChannels(channelsForActiveCategory());
  if (!activeChannel) {
    currentVideos = [];
    videosEl.replaceChildren();
    document.body.classList.remove("sidePanelVideos");
    setHeader("", false);
  } else {
    setActiveChannelButton();
    setHeader("", true);
  }

  renderSidePanelPath();
  setStatus();
}
async function navigateHistory(delta) {
  if (applyingHistory) return;
  await maybePromptSeenForWatchLater();
  const nextIndex = historyIndex + delta;
  const entry = historyStack[nextIndex];
  if (!entry) return;

  applyingHistory = true;
  historyIndex = nextIndex;
  updateHistoryButtons();
  suppressHistory = true;

  try {
    if (entry.type === "channelList") {
      clearChannelSearch();
      showChannelListState(entry.id || "");
      return;
    }

    if (entry.type === "channel") {
      const channel = allChannels.find((item) => item.id === entry.id);
      if (channel) {
        await selectChannel(channel, { skipHistory: true });
        return;
      }
    }

    if (entry.type === "channelSearch") {
      let state = {};
      try {
        state = JSON.parse(entry.id || "{}");
      } catch {
        state = { query: entry.id || "" };
      }

      if (state.channelId) {
        const channel = allChannels.find((item) => item.id === state.channelId);
        if (channel) {
          await selectChannel(channel, { skipHistory: true });
          channelSearchQuery = state.query || "";
          if (channelSearchInputEl) channelSearchInputEl.value = channelSearchQuery;
          renderSearchResults();
          return;
        }
      } else {
        showChannelListState(state.categoryId || "");
        channelSearchQuery = state.query || "";
        if (channelSearchInputEl) channelSearchInputEl.value = channelSearchQuery;
        renderSearchResults();
        return;
      }
    }

    if (entry.type === "video") {
      play(entry.id, { skipHistory: true });
      return;
    }

    if (entry.type === "search") {
      await searchYoutube(entry.id, { skipHistory: true });
      return;
    }

    if (entry.type === "watchLater") {
      activeView = "watchLater";
      activeCategoryId = "";
      clearChannelSearch();
      renderCategories();
      renderChannels([]);
      renderWatchLater();
    }
  } finally {
    suppressHistory = false;
    applyingHistory = false;
    updateHistoryButtons();
  }
}

toggleSidebarEl.addEventListener("click", () => {
  document.body.classList.toggle("sidebarCollapsed");
});

backEl.addEventListener("click", () => {
  navigateHistory(-1);
});
forwardEl.addEventListener("click", () => {
  navigateHistory(1);
});
channelBackEl?.addEventListener("click", () => {
  navigateHistory(-1);
});
channelForwardEl?.addEventListener("click", () => {
  navigateHistory(1);
});

toggleListLayoutEl.addEventListener("click", () => {
  listLayout = listLayout === "wide" ? "grid" : listLayout === "grid" ? "single" : "wide";
  localStorage.setItem("listLayout", listLayout);
  applyListLayout();
});

window.addEventListener("resize", () => {
  updateSplitColumnState();
  syncVideoLayoutAvailability();
  syncChannelCategoryLineHeights();
});

playerWatchLaterEl.addEventListener("click", async () => {
  if (!activeVideoId) return;
  const video = currentVideos.find((item) => item.id === activeVideoId) || {
    id: activeVideoId,
    title: activeVideoId,
    channelId: activeChannel?.id || ""
  };
  await toggleWatchLater(video);
});


function suppressNativeContextMenu(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (!target.closest(".sidebar, .sidePanelPath, .videos")) return;
  event.preventDefault();
}

document.addEventListener("contextmenu", suppressNativeContextMenu);
document.addEventListener("click", hideContextMenu);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideContextMenu();
});
markSeenEl.addEventListener("click", () => closeSeenPrompt(true));
keepWatchLaterEl.addEventListener("click", () => closeSeenPrompt(false));
createCategoryFromModalEl.addEventListener("click", () => {
  addCategoryFromAssignment().catch((error) => setStatus(`Category error: ${error.message}`, true));
});
newCategoryNameEl.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addCategoryFromAssignment().catch((error) => setStatus(`Category error: ${error.message}`, true));
});
cancelCategoryAssignEl.addEventListener("click", closeCategoryAssignment);
saveCategoryAssignEl.addEventListener("click", () => {
  saveCategoryAssignment().catch((error) => setStatus(`Save error: ${error.message}`, true));
});
cancelChannelAssignEl.addEventListener("click", closeChannelAssignment);
saveChannelAssignEl.addEventListener("click", () => {
  saveChannelAssignment().catch((error) => setStatus(`Save error: ${error.message}`, true));
});
closeImportExportEl.addEventListener("click", closeImportExportDialog);
exportNativeConfigEl.addEventListener("click", exportNativeConfig);
exportYoutubeConfigEl.addEventListener("click", exportYoutubeCsv);
importNativeConfigEl.addEventListener("click", () => runImportFilePicker("native"));
importYoutubeConfigEl.addEventListener("click", () => runImportFilePicker("youtube"));
importFreetubeConfigEl.addEventListener("click", () => runImportFilePicker("freetube"));

channelIconModeEl?.addEventListener("click", () => {
  if (activeChannel) {
    showSidePanelChannels().catch((error) => setStatus(`Navigation error: ${error.message}`, true));
    return;
  }
  channelListMode = channelListMode === "icons" ? "columns" : channelListMode === "columns" ? "single" : "icons";
  localStorage.setItem("channelListMode", channelListMode);
  applyListLayout();
});

channelSearchInputEl?.addEventListener("input", () => {
  channelSearchQuery = channelSearchInputEl.value;
  recordChannelSearchHistory();
  renderSearchResults();
});

channelSearchInputEl?.addEventListener("search", () => {
  channelSearchQuery = channelSearchInputEl.value;
  recordChannelSearchHistory();
  renderSearchResults();
});

window.addEventListener("resize", syncHeaderToPlayerWidth);

openAppSessionEl.addEventListener("click", () => {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  window.open(url.toString(), "_blank", "noopener");
});

searchFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const value = searchInputEl.value;
  const videoId = videoIdFromInput(value);

  if (videoId) {
    await maybePromptSeenForWatchLater();
    activeView = "direct";
    activeChannel = null;
    activeSearchQuery = "";
    setActiveChannelButton();
    play(videoId);
    return;
  }

  searchYoutube(value);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !isSidePanelView()) return;
  showSidePanelChannels();
});

sidePanelBackEl?.addEventListener("click", showSidePanelChannels);

refreshEl.addEventListener("click", loadFeed);

unsubscribeEl.addEventListener("click", () => {
  unsubscribeActiveChannel().catch((error) => {
    setStatus(`Save error: ${error.message}`, true);
  });
});

assignCategoriesEl.addEventListener("click", () => openCategoryAssignment(activeChannel));

async function addChannel(categoryId = activeCategoryId) {
  const channelId = prompt("YouTube channel ID, format UC...");
  if (!channelId) return;
  const cleanId = channelId.trim();
  if (!/^UC[-_a-zA-Z0-9]+$/.test(cleanId)) {
    setStatus("Invalid channel ID", true);
    return;
  }
  if (allChannels.some((channel) => channel.id === cleanId)) {
    setStatus("Channel already present", true);
    return;
  }

  try {
    const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(cleanId)}`, {
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const doc = new DOMParser().parseFromString(await response.text(), "application/xml");
    const title = doc.querySelector("feed > title")?.textContent?.trim() || "Untitled channel";
    allChannels.push({
      id: cleanId,
      title,
      thumbnail: "",
      categories: categoryId ? [categoryId] : []
    });
    allChannels.sort((a, b) => a.title.localeCompare(b.title, "fr"));
    await saveConfig();
    renderCategories();
    renderChannels(channelsForActiveCategory());
    renderSidePanelPath();
    setStatus();
  } catch (error) {
    setStatus(`Add failed: ${error.message}`, true);
  }
}

addChannelEl.addEventListener("click", () => {
  addChannel(activeCategoryId);
});

addCategoryEl.addEventListener("click", async () => {
  const name = prompt("Category name");
  if (!name) return;
  const category = createCategory(name);
  if (!category) return;
  await saveConfig();
  renderCategories();
  renderChannels(channelsForActiveCategory());
  renderSidePanelPath();
});

applyListLayout();
syncPanelVisibilityState();
if (globalThis.chrome?.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (changes[STORAGE_KEY]?.newValue) {
      applyExternalConfig(changes[STORAGE_KEY].newValue);
    }
    if (changes[DATA_COMMAND_KEY]?.newValue) {
      handleIncomingDataCommand(changes[DATA_COMMAND_KEY].newValue);
    }
  });
}

async function handleIncomingDataCommand(payload) {
  if (!payload?.command || payload.createdAt === lastHandledDataCommandAt) return;
  lastHandledDataCommandAt = payload.createdAt;
  await handleDataCommand(payload.command).catch((error) => {
    setStatus(`Command failed: ${error.message}`, true);
  });
}

async function handlePendingDataCommand() {
  if (!globalThis.chrome?.storage?.local) return;
  const result = await new Promise((resolve) => chrome.storage.local.get(DATA_COMMAND_KEY, resolve));
  const payload = result[DATA_COMMAND_KEY];
  if (payload?.createdAt && Date.now() - payload.createdAt < 8000) {
    await handleIncomingDataCommand(payload);
  }
}
document.addEventListener("visibilitychange", syncPanelVisibilityState);
window.setInterval(syncPanelVisibilityState, 1000);
window.setInterval(() => {
  checkCurrentWatchLaterVisibility().catch(() => {});
}, 1500);
window.addEventListener("pagehide", () => setPanelOpenState(false));
window.addEventListener("beforeunload", () => setPanelOpenState(false));


loadChannels().then(() => {
  handlePendingDataCommand().catch(() => {});
  const initialVideoId = videoIdFromInput(new URLSearchParams(window.location.search).get("video") || "");
  if (initialVideoId) {
    openOfficialYoutube(initialVideoId);
  }
});























































