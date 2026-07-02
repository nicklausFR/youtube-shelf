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
const channelZoomOutEl = document.querySelector("#channelZoomOut");
const channelZoomInEl = document.querySelector("#channelZoomIn");
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
const excludedNewVideosPromptEl = document.querySelector("#excludedNewVideosPrompt");
const excludedNewVideosListEl = document.querySelector("#excludedNewVideosList");
const cancelExcludedNewVideosEl = document.querySelector("#cancelExcludedNewVideos");
const saveExcludedNewVideosEl = document.querySelector("#saveExcludedNewVideos");
const importExportPromptEl = document.querySelector("#importExportPrompt");
const exportNativeConfigEl = document.querySelector("#exportNativeConfig");
const importNativeConfigEl = document.querySelector("#importNativeConfig");
const importFreetubeConfigEl = document.querySelector("#importFreetubeConfig");
const closeImportExportEl = document.querySelector("#closeImportExport");
const displayOptionsPromptEl = document.querySelector("#displayOptionsPrompt");
const hideCommentsOptionEl = document.querySelector("#hideCommentsOption");
const hideSuggestionsOptionEl = document.querySelector("#hideSuggestionsOption");
const closeDisplayOptionsEl = document.querySelector("#closeDisplayOptions");
const displayOptionsInactiveEl = document.querySelector("#displayOptionsInactive");
const addChannelPromptEl = document.querySelector("#addChannelPrompt");
const addChannelSearchFormEl = document.querySelector("#addChannelSearchForm");
const addChannelSearchInputEl = document.querySelector("#addChannelSearchInput");
const addChannelResultsEl = document.querySelector("#addChannelResults");
const closeAddChannelEl = document.querySelector("#closeAddChannel");
const addCategoryPromptEl = document.querySelector("#addCategoryPrompt");
const addCategoryFormEl = document.querySelector("#addCategoryForm");
const addCategoryNameEl = document.querySelector("#addCategoryName");
const closeAddCategoryEl = document.querySelector("#closeAddCategory");

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
let pendingAddChannelCategoryId = "";
let channelSearchMetadataRefreshTimer = 0;
let channelSearchMetadataRefreshInFlight = false;
let currentWatchLaterStartedAt = 0;
let seenPromptResolve = null;
let configLoaded = false;
let sessionFeedBaseline = new Map();
let listLayout = localStorage.getItem("listLayout") || "grid";
if (listLayout === "rows" || listLayout === "thumbs") listLayout = "wide";
if (!["wide", "grid", "single"].includes(listLayout)) listLayout = "grid";
const CHANNEL_LIST_MODE_KEY_PREFIX = "channelListMode:";
const CHANNEL_LIST_MODE_SCOPES = ["channels", "category", "channelVideos", "newVideos", "watchLater"];
const storedChannelListMode = localStorage.getItem("channelListMode");
const fallbackChannelListMode = ["icons", "columns", "single"].includes(storedChannelListMode)
  ? storedChannelListMode
  : localStorage.getItem("channelIconMode") === "true" ? "icons" : "columns";
let channelListMode = fallbackChannelListMode;
let channelListModes = Object.fromEntries(CHANNEL_LIST_MODE_SCOPES.map((scope) => {
  const value = localStorage.getItem(CHANNEL_LIST_MODE_KEY_PREFIX + scope) || fallbackChannelListMode;
  return [scope, ["icons", "columns", "single"].includes(value) ? value : "columns"];
}));
let sidePanelCategoriesExpanded = false;
let categoryAssignChannel = null;
let channelAssignCategory = null;
let categoryBeingRenamed = null;
let contextMenuEl = null;
let confirmDialogResolve = null;
let lastHandledDataCommandAt = 0;
let categoryResizeStartY = 0;
let categoryResizeStartHeight = 0;
let categoryOverflowSyncFrame = 0;
let pendingImportKind = "";
const STORAGE_KEY = "youtubeChannelShelfConfig";
const PANEL_OPEN_KEY = "youtubeChannelShelfPanelOpen";
const PANEL_HEARTBEAT_KEY = "youtubeChannelShelfPanelHeartbeat";
const DATA_COMMAND_KEY = "youtubeChannelShelfDataCommand";
const COMMENTS_MODE_KEY = "youtubeChannelShelfHideComments";
const SUGGESTIONS_MODE_KEY = "youtubeChannelShelfHideSuggestions";
const FOCUS_PLAYER_MODE_KEY = "youtubeChannelShelfFocusPlayer";
const SNIFF_YOUTUBE_KEY = "youtubeChannelShelfSniffYoutube";
const LIST_ZOOM_KEY = "youtubeChannelShelfListZoom";
const CATEGORY_PANEL_HEIGHT_KEY = "youtubeChannelShelfCategoryPanelHeight";
const CATEGORY_ZOOM_KEY = "youtubeChannelShelfCategoryZoom";
const LIST_ZOOM_MIN = 0.7;
const LIST_ZOOM_MAX = 1.5;
const LIST_ZOOM_STEP = 0.1;
const CATEGORY_ZOOM_MIN = 0.8;
const CATEGORY_ZOOM_MAX = 1.4;
const CATEGORY_ZOOM_STEP = 0.1;
const SPLIT_COLUMN_MIN_WIDTH = 450;
const VIDEO_GRID_MIN_COLUMN_WIDTH = 220;
const NEW_VIDEOS_CATEGORY_ID = "__new_videos";
const UNCATEGORIZED_CATEGORY_ID = "__uncategorized";
let sniffYoutubeEnabled = localStorage.getItem(SNIFF_YOUTUBE_KEY) !== "false";
let listZoom = Number(localStorage.getItem(LIST_ZOOM_KEY)) || 1;
let categoryPanelHeight = Number(localStorage.getItem(CATEGORY_PANEL_HEIGHT_KEY)) || 90;
let categoryZoom = Number(localStorage.getItem(CATEGORY_ZOOM_KEY)) || 1;

function setPanelOpenState(open, options = {}) {
  if (!globalThis.chrome?.storage?.local) return;
  const heartbeat = open ? Date.now() : 0;
  chrome.storage.local.set({
    [PANEL_OPEN_KEY]: open,
    [PANEL_HEARTBEAT_KEY]: heartbeat
  }, () => {
    if (open && options.broadcast) {
      broadcastDisplayOptions({ panelOpen: true, panelHeartbeat: heartbeat });
    }
  });
}

function isExtensionPanelActive() {
  return document.visibilityState === "visible";
}

function syncPanelVisibilityState(options = {}) {
  setPanelOpenState(isExtensionPanelActive(), options);
  syncDisplayOptionsAvailability();
}

function isSidePanelView() {
  return true;
}

function currentCategoryName() {
  if (activeView === "watchLater") return "Watch later";
  if (activeView === "newVideos") return "New";
  if (activeCategoryId === UNCATEGORIZED_CATEGORY_ID) return "Uncategorized";
  if (!activeCategoryId) return "";
  return allCategories.find((category) => category.id === activeCategoryId)?.name || "";
}

function preventMouseFocus(element) {
  const clearMouseCaret = () => {
    if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
    window.getSelection()?.removeAllRanges();
  };
  element.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.pointerType === "keyboard") return;
    event.preventDefault();
    clearMouseCaret();
  }, { capture: true });
  element.addEventListener("mouseup", clearMouseCaret);
  element.addEventListener("click", () => setTimeout(clearMouseCaret, 0));
}

function makePathButton(text, onClick, options = {}) {
  const button = document.createElement("button");
  button.className = "pathButton";
  if (options.kind) button.classList.add("pathButton-" + options.kind);
  if (options.active) button.classList.add("is-active");
  button.type = "button";
  button.dataset.label = text;
  button.setAttribute("aria-label", text);
  preventMouseFocus(button);
  button.addEventListener("click", onClick);
  if (options.dropCategoryId) attachCategoryDropTarget(button, options.dropCategoryId);
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

function expandCategoryPanelToContent() {
  if (!sidePanelPathEl) return;
  clearCategoryOverflowIndicator();
  const nextHeight = Math.max(52, sidePanelPathEl.scrollHeight);
  categoryPanelHeight = nextHeight;
  document.documentElement.style.setProperty("--category-panel-max-height", `${nextHeight}px`);
  localStorage.setItem(CATEGORY_PANEL_HEIGHT_KEY, String(Math.round(categoryPanelHeight)));
  syncCategoryOverflowState();
}

function makePathMoreIndicator(count) {
  const row = document.createElement("div");
  row.className = "pathRow pathMoreRow";
  const button = document.createElement("button");
  button.className = "pathButton pathButton-more";
  button.type = "button";
  button.title = "Show all categories";
  button.dataset.label = `+${count} more`;
  button.setAttribute("aria-label", `Show ${count} more categories`);
  preventMouseFocus(button);
  button.addEventListener("click", expandCategoryPanelToContent);
  row.append(button);
  return row;
}

function makeSettingsButton() {
  const button = document.createElement("button");
  button.className = "pathSettingsButton";
  button.type = "button";
  button.title = "Settings";
  button.setAttribute("aria-label", "Settings");
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 0 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 0 1 4 0v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06A2 2 0 0 1 20.11 7l-.06.06A1.7 1.7 0 0 0 19.4 9c.3.37.63.6 1 .6h.6a2 2 0 0 1 0 4h-.6a1.7 1.7 0 0 0-1 .6Z"/></svg>';
  preventMouseFocus(button);
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    showContextMenu(event, settingsContextActions());
  });
  return button;
}

function makeFocusPlayerButton() {
  const button = document.createElement("button");
  button.className = "pathSettingsButton pathFocusButton";
  button.type = "button";
  button.title = "Focus video player";
  button.setAttribute("aria-label", "Focus video player");
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7a3 3 0 0 1 3-3h2v2H7a1 1 0 0 0-1 1v2H4V7Zm11-3h2a3 3 0 0 1 3 3v2h-2V7a1 1 0 0 0-1-1h-2V4ZM4 15h2v2a1 1 0 0 0 1 1h2v2H7a3 3 0 0 1-3-3v-2Zm14 0h2v2a3 3 0 0 1-3 3h-2v-2h2a1 1 0 0 0 1-1v-2ZM9 9h6v6H9V9Z"/></svg>';
  preventMouseFocus(button);
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleDisplayOption(FOCUS_PLAYER_MODE_KEY, false);
  });
  return button;
}

function appendSettingsPathItem(container) {
  const row = document.createElement("div");
  row.className = "pathRow pathSettingsRow";
  row.append(makeSettingsButton(), makeFocusPlayerButton(), makeCategoryZoomButton(-1), makeCategoryZoomButton(1));
  container.append(row);
  syncFocusPlayerButtonState();
  syncCategoryZoomButtons();
}

function makeCategoryZoomButton(direction) {
  const button = document.createElement("button");
  const isZoomIn = direction > 0;
  button.className = `pathSettingsButton pathCategoryZoomButton ${isZoomIn ? "pathCategoryZoomIn" : "pathCategoryZoomOut"}`;
  button.type = "button";
  button.dataset.label = isZoomIn ? "+" : "-";
  preventMouseFocus(button);
  button.addEventListener("click", () => changeCategoryZoom(isZoomIn ? CATEGORY_ZOOM_STEP : -CATEGORY_ZOOM_STEP));
  return button;
}

function readDisplayOptionState() {
  return new Promise((resolve) => {
    if (!globalThis.chrome?.storage?.local) {
      resolve({
        hideComments: Boolean(hideCommentsOptionEl?.checked),
        hideSuggestions: hideSuggestionsOptionEl ? Boolean(hideSuggestionsOptionEl.checked) : true,
        focusPlayer: Boolean(document.querySelector(".pathFocusButton")?.classList.contains("is-active"))
      });
      return;
    }

    chrome.storage.local.get([COMMENTS_MODE_KEY, SUGGESTIONS_MODE_KEY, FOCUS_PLAYER_MODE_KEY], (result) => {
      resolve({
        hideComments: Boolean(result[COMMENTS_MODE_KEY]),
        hideSuggestions: result[SUGGESTIONS_MODE_KEY] === undefined ? true : Boolean(result[SUGGESTIONS_MODE_KEY]),
        focusPlayer: Boolean(result[FOCUS_PLAYER_MODE_KEY])
      });
    });
  });
}

async function broadcastDisplayOptions(overrides = {}) {
  if (!globalThis.chrome?.tabs?.query) return;
  const state = await readDisplayOptionState();
  const panelOpen = isExtensionPanelActive();
  const panelHeartbeat = panelOpen ? Date.now() : 0;
  const message = {
    type: "youtubeChannelShelfDisplayOptions",
    ...state,
    panelOpen,
    panelHeartbeat,
    ...overrides
  };
  chrome.tabs.query({ url: ["*://www.youtube.com/*", "*://youtube.com/*"] }, (tabs = []) => {
    for (const tab of tabs) {
      if (tab.id === undefined) continue;
      ensureYoutubeCompanion(tab.id).finally(() => {
        chrome.tabs.sendMessage(tab.id, message).catch?.(() => {});
      });
    }
  });
}

async function ensureYoutubeCompanion(tabId) {
  if (!globalThis.chrome?.scripting || tabId === undefined) return;
  await chrome.scripting.insertCSS({
    target: { tabId },
    files: ["youtube-clean.css"]
  }).catch(() => {});
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["youtube-live.js"]
  }).catch(() => {});
}

function setDisplayOption(key, value) {
  if (!globalThis.chrome?.storage?.local) return;
  const checked = Boolean(value);
  if (key === COMMENTS_MODE_KEY && hideCommentsOptionEl) hideCommentsOptionEl.checked = checked;
  if (key === SUGGESTIONS_MODE_KEY && hideSuggestionsOptionEl) hideSuggestionsOptionEl.checked = checked;
  if (key === FOCUS_PLAYER_MODE_KEY) document.querySelector(".pathFocusButton")?.classList.toggle("is-active", checked);
  chrome.storage.local.set({ [key]: checked });
  const overrides = {};
  if (key === COMMENTS_MODE_KEY) overrides.hideComments = checked;
  if (key === SUGGESTIONS_MODE_KEY) overrides.hideSuggestions = checked;
  if (key === FOCUS_PLAYER_MODE_KEY) overrides.focusPlayer = checked;
  broadcastDisplayOptions(overrides);
}

function toggleDisplayOption(key, fallback = false) {
  if (!globalThis.chrome?.storage?.local) return;
  chrome.storage.local.get(key, (result) => {
    const current = result[key] === undefined ? fallback : Boolean(result[key]);
    setDisplayOption(key, !current);
  });
}

function syncFocusPlayerButtonState() {
  const button = document.querySelector(".pathFocusButton");
  if (!button) return;
  const active = isExtensionPanelActive();
  button.toggleAttribute("disabled", !active);
  if (!globalThis.chrome?.storage?.local) return;
  chrome.storage.local.get(FOCUS_PLAYER_MODE_KEY, (result) => {
    button.classList.toggle("is-active", Boolean(result[FOCUS_PLAYER_MODE_KEY]));
  });
}

function syncDisplayOptionsAvailability() {
  const active = isExtensionPanelActive();
  hideCommentsOptionEl?.toggleAttribute("disabled", !active);
  hideSuggestionsOptionEl?.toggleAttribute("disabled", !active);
  syncFocusPlayerButtonState();
  if (displayOptionsInactiveEl) displayOptionsInactiveEl.hidden = active;
}

function syncDisplayOptionsDialog() {
  syncDisplayOptionsAvailability();
  if (!globalThis.chrome?.storage?.local) return;
  chrome.storage.local.get([COMMENTS_MODE_KEY, SUGGESTIONS_MODE_KEY], (result) => {
    if (hideCommentsOptionEl) hideCommentsOptionEl.checked = Boolean(result[COMMENTS_MODE_KEY]);
    if (hideSuggestionsOptionEl) hideSuggestionsOptionEl.checked = result[SUGGESTIONS_MODE_KEY] === undefined ? true : Boolean(result[SUGGESTIONS_MODE_KEY]);
  });
}

function openDisplayOptionsDialog() {
  if (!displayOptionsPromptEl) return;
  syncDisplayOptionsDialog();
  displayOptionsPromptEl.hidden = false;
  hideCommentsOptionEl?.focus();
}

function closeDisplayOptionsDialog() {
  if (displayOptionsPromptEl) displayOptionsPromptEl.hidden = true;
}

function setSniffYoutubeEnabled(value) {
  sniffYoutubeEnabled = Boolean(value);
  localStorage.setItem(SNIFF_YOUTUBE_KEY, String(sniffYoutubeEnabled));
  if (globalThis.chrome?.storage?.local) {
    chrome.storage.local.set({ [SNIFF_YOUTUBE_KEY]: sniffYoutubeEnabled });
  }
  showInfoPopup(`Sniff YouTube metadata ${sniffYoutubeEnabled ? "enabled" : "disabled"}.`, "info");
}

function toggleSniffYoutube() {
  setSniffYoutubeEnabled(!sniffYoutubeEnabled);
}

function settingsContextActions() {
  return [
    { label: "Add channel", action: () => addChannel(activeCategoryId) },
    { label: "Add category", action: () => addCategoryEl.click() },
    { label: "Import / Export", action: openImportExportDialog },
    { label: "Display options", action: openDisplayOptionsDialog },
    { label: `Sniff YouTube metadata: ${sniffYoutubeEnabled ? "On" : "Off"}`, action: toggleSniffYoutube },
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
  const isWatched = Boolean(seenVideos[video.id]);
  const actions = [
    {
      label: watchLater[video.id] ? "Remove from Watch later" : "Watch later",
      action: () => toggleWatchLater(video)
    },
    {
      label: isWatched ? "Mark as unwatched" : "Mark as watched",
      action: async () => {
        if (isWatched) delete seenVideos[video.id];
        else markVideoSeen(video.id);
        await saveConfig();
        refreshCurrentVideoList();
      }
    }
  ];
  if (activeView === "newVideos" && video.channelId) {
    actions.push({
      label: "Do not include this channel in New videos",
      action: () => setChannelNewVideosExcluded(video.channelId, true)
    });
  }
  return actions;
}

function refreshCurrentVideoList() {
  if (activeView === "watchLater") renderWatchLater();
  else if (activeView === "newVideos") renderNewVideos();
  else if (activeChannel) renderChannelVideos(currentVideos);
  else renderVideos(currentVideos);
}

function showContextMenu(event, actions) {
  const menu = ensureContextMenu();
  menu.replaceChildren(
    ...actions.map((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = item.checked ? "[x] " + item.label : item.submenu ? item.label + " >" : item.label;
      if (item.danger) button.classList.add("is-danger");
      if (item.submenu) button.classList.add("has-submenu");
      button.addEventListener("click", async (clickEvent) => {
        if (!item.submenu) hideContextMenu();
        await maybePromptSeenForWatchLater();
        await Promise.resolve(item.action(clickEvent));
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
  document.body.classList.remove("virtualVideoListView");
  document.body.classList.add("sidePanelVideos");
  syncStackedChannelViewState();
  listViewEl.hidden = false;
  showListView();
  setHeader("", true);
  renderSidePanelPath();
  renderChannelVideos(currentVideos);
}

function categoryContextActions(category) {
  const actions = [
    { label: "Add a channel here", action: () => openChannelAssignment(category) }
  ];
  if (category.id) {
    actions.push({ label: "Rename category", action: () => openRenameCategoryDialog(category) });
    actions.push({ label: "Delete category", action: () => removeCategory(category.id), danger: true });
  }
  return actions;
}

async function assignChannelToCategory(channelId, categoryId) {
  const previousView = activeView;
  const previousCategoryId = activeCategoryId;
  const previousChannelId = activeChannel?.id || "";
  const channel = allChannels.find((item) => item.id === channelId);
  const category = allCategories.find((item) => item.id === categoryId);
  if (!channel || !category) return;
  if ((channel.categories || []).includes(categoryId)) {
    highlightChannel(channelId, "existing");
    showInfoPopup(`"${channel.title}" is already in "${category.name}".`, "info");
    return;
  }
  channel.categories = [...new Set([...(channel.categories || []), categoryId])];
  allChannels = allChannels.map((item) => item.id === channelId ? channel : item);
  if (activeChannel?.id === channelId) activeChannel = channel;
  await saveConfig();
  activeView = previousView;
  activeCategoryId = previousCategoryId;
  if (previousChannelId) activeChannel = allChannels.find((item) => item.id === previousChannelId) || activeChannel;
  renderCategories();
  renderChannels(channelsForActiveCategory());
  renderSidePanelPath();
  highlightChannel(channelId, "ok");
  showInfoPopup(`"${channel.title}" added to "${category.name}".`, "ok");
}

function attachCategoryDropTarget(element, categoryId) {
  if (!categoryId) return;
  element.addEventListener("dragover", (event) => {
    if (!event.dataTransfer?.types?.includes("application/x-youtube-channel-shelf-channel")) return;
    event.preventDefault();
    element.classList.add("is-category-drop-target");
  });
  element.addEventListener("dragleave", () => {
    element.classList.remove("is-category-drop-target");
  });
  element.addEventListener("drop", (event) => {
    const channelId = event.dataTransfer?.getData("application/x-youtube-channel-shelf-channel") || "";
    if (!channelId) return;
    event.preventDefault();
    event.stopPropagation();
    element.classList.remove("is-category-drop-target");
    assignChannelToCategory(channelId, categoryId).catch((error) => showInfoPopup(`Category update failed: ${error.message}`, "error"));
  });
}

function appendCategoryPath(container) {
  container.classList.toggle("has-many-categories", allCategories.length > 3);

  appendSettingsPathItem(container);

  appendPathItem(container, "All channels", showRootChannels, {
    active: activeView === "channels" && !activeCategoryId && !activeChannel,
    contextActions: [
      { label: "Add category", action: () => addCategoryEl.click() }
    ]
  });

  appendPathItem(container, `This week${channelsWithNewVideos().length ? ` (${channelsWithNewVideos().length})` : ""}`, async () => {
    await maybePromptSeenForWatchLater();
    showNewVideos();
  }, {
    active: activeView === "newVideos",
    contextActions: [
      ...newVideosContextActions()
    ],
    kind: "new"
  });

  appendPathItem(container, "Watch later", async () => {
    await maybePromptSeenForWatchLater();
    activeView = "watchLater";
    activeCategoryId = "";
    clearChannelSearch();
    pushHistory({ type: "watchLater", id: "watchLater" });
    renderCategories();
    renderChannels([]);
    renderWatchLater();
  }, { active: activeView === "watchLater", kind: "auto" });

  for (const category of sortedManualCategories()) {
    appendPathItem(container, category.name, () => {
      showCategoryChannels(category.id);
    }, {
      active: activeView === "channels" && activeCategoryId === category.id && !activeChannel,
      contextActions: categoryContextActions(category),
      dropCategoryId: category.id
    });
  }

  appendPathItem(container, "Uncategorized", () => {
    showCategoryChannels(UNCATEGORIZED_CATEGORY_ID);
  }, {
    active: activeView === "channels" && activeCategoryId === UNCATEGORIZED_CATEGORY_ID && !activeChannel
  });
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

function applyCategoryPanelHeight() {
  const height = Math.max(52, Number(categoryPanelHeight) || 90);
  document.documentElement.style.setProperty("--category-panel-max-height", `${height}px`);
}

function clampCategoryZoom(value) {
  return Math.min(CATEGORY_ZOOM_MAX, Math.max(CATEGORY_ZOOM_MIN, Math.round(value * 10) / 10));
}

function syncCategoryZoomButtons() {
  const percent = Math.round(categoryZoom * 100);
  document.querySelectorAll(".pathCategoryZoomOut").forEach((button) => {
    button.toggleAttribute("disabled", categoryZoom <= CATEGORY_ZOOM_MIN);
    button.setAttribute("title", `Zoom out categories (${percent}%)`);
    button.setAttribute("aria-label", `Zoom out categories (${percent}%)`);
  });
  document.querySelectorAll(".pathCategoryZoomIn").forEach((button) => {
    button.toggleAttribute("disabled", categoryZoom >= CATEGORY_ZOOM_MAX);
    button.setAttribute("title", `Zoom in categories (${percent}%)`);
    button.setAttribute("aria-label", `Zoom in categories (${percent}%)`);
  });
}

function applyCategoryZoom() {
  categoryZoom = clampCategoryZoom(categoryZoom);
  sidePanelPathEl?.style.setProperty("--category-path-zoom", String(categoryZoom));
  localStorage.setItem(CATEGORY_ZOOM_KEY, String(categoryZoom));
  syncCategoryZoomButtons();
  scheduleCategoryOverflowSync();
}

function changeCategoryZoom(delta) {
  categoryZoom = clampCategoryZoom(categoryZoom + delta);
  applyCategoryZoom();
}

function clearCategoryOverflowIndicator() {
  if (!sidePanelPathEl) return;
  sidePanelPathEl.classList.remove("has-overflow-indicator");
  sidePanelPathEl.querySelector(".pathMoreRow")?.remove();
  sidePanelPathEl.querySelectorAll(".is-overflow-hidden").forEach((row) => row.classList.remove("is-overflow-hidden"));
}

function syncCategoryOverflowState() {
  if (!sidePanelPathEl) return;
  clearCategoryOverflowIndicator();
  if (!sidePanelPathEl.classList.contains("has-many-categories")) {
    sidePanelPathEl.classList.remove("is-fully-expanded");
    return;
  }
  const visibleHeight = sidePanelPathEl.getBoundingClientRect().height;
  const contentHeight = sidePanelPathEl.scrollHeight;
  const isFullyExpanded = contentHeight <= visibleHeight + 2;
  sidePanelPathEl.classList.toggle("is-fully-expanded", isFullyExpanded);
  if (isFullyExpanded) return;

  const rows = [...sidePanelPathEl.querySelectorAll(":scope > .pathRow:not(.pathMoreRow)")];
  const containerTop = sidePanelPathEl.getBoundingClientRect().top;
  const visibleBottom = containerTop + visibleHeight;
  let firstHiddenIndex = rows.findIndex((row) => row.getBoundingClientRect().bottom > visibleBottom + 1);
  if (firstHiddenIndex < 0) return;

  while (firstHiddenIndex >= 0) {
    sidePanelPathEl.querySelector(".pathMoreRow")?.remove();
    rows.forEach((row) => row.classList.remove("is-overflow-hidden"));

    const hiddenCount = rows.length - firstHiddenIndex;
    const indicator = makePathMoreIndicator(hiddenCount);
    sidePanelPathEl.insertBefore(indicator, rows[firstHiddenIndex]);
    sidePanelPathEl.classList.add("has-overflow-indicator");
    rows.slice(firstHiddenIndex).forEach((row) => row.classList.add("is-overflow-hidden"));

    if (indicator.getBoundingClientRect().bottom <= visibleBottom + 1 || firstHiddenIndex === 0) break;
    firstHiddenIndex -= 1;
  }
}

function scheduleCategoryOverflowSync() {
  if (categoryOverflowSyncFrame) cancelAnimationFrame(categoryOverflowSyncFrame);
  categoryOverflowSyncFrame = requestAnimationFrame(() => {
    categoryOverflowSyncFrame = 0;
    syncCategoryOverflowState();
  });
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
    clearCategoryOverflowIndicator();
    const maxHeight = Math.max(90, sidePanelPathEl.scrollHeight);
    const nextHeight = Math.max(52, Math.min(maxHeight, categoryResizeStartHeight + event.clientY - categoryResizeStartY));
    categoryPanelHeight = nextHeight;
    document.documentElement.style.setProperty("--category-panel-max-height", `${nextHeight}px`);
    sidePanelPathEl.classList.toggle("is-fully-expanded", nextHeight >= maxHeight - 2);
    requestAnimationFrame(syncCategoryOverflowState);
  });
  handle.addEventListener("pointerup", (event) => {
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    localStorage.setItem(CATEGORY_PANEL_HEIGHT_KEY, String(Math.round(categoryPanelHeight)));
    requestAnimationFrame(syncCategoryOverflowState);
  });
  return handle;
}

function renderSidePanelPath() {
  if (!sidePanelPathEl || !sidePanelVideoPathEl) return;
  updateChannelSearchPlaceholder();
  applyCategoryPanelHeight();
  applyCategoryZoom();
  sidePanelPathEl.replaceChildren();
  sidePanelVideoPathEl.replaceChildren();
  appendCategoryPath(sidePanelPathEl);
  sidePanelPathEl.classList.remove("is-fully-expanded");
  sidePanelPathEl.parentElement?.querySelectorAll(".categoryResizeHandle").forEach((handle) => handle.remove());
  sidePanelPathEl.after(makeCategoryResizeHandle());
  requestAnimationFrame(syncCategoryOverflowState);
  appendActiveChannelSummary(sidePanelVideoPathEl);
  syncStackedChannelViewState();
  if (channelIconModeEl) applyListLayout();
}

async function showSidePanelChannels() {
  await maybePromptSeenForWatchLater();
  document.body.classList.remove("sidePanelVideos");
  document.body.classList.remove("virtualVideoListView");
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

function currentListLayoutScope() {
  if (activeView === "newVideos") return "newVideos";
  if (activeView === "watchLater") return "watchLater";
  if (activeChannel) return "channelVideos";
  if (activeView === "channels" && activeCategoryId) return "category";
  return "channels";
}

function listModeForScope(scope = currentListLayoutScope()) {
  return channelListModes[scope] || "columns";
}

function setListModeForScope(scope, mode) {
  if (!["icons", "columns", "single"].includes(mode)) return;
  channelListModes = { ...channelListModes, [scope]: mode };
  localStorage.setItem(CHANNEL_LIST_MODE_KEY_PREFIX + scope, mode);
}

function applyListLayout() {
  channelListMode = listModeForScope();
  document.body.classList.toggle("channelIconMode", channelListMode === "icons");
  document.body.classList.toggle("channelListSingleColumn", channelListMode === "single");
  syncChannelIconModeButton();
  syncVideoLayoutButton();
  updateSplitColumnState();
}

function clampListZoom(value) {
  return Math.min(LIST_ZOOM_MAX, Math.max(LIST_ZOOM_MIN, Math.round(value * 10) / 10));
}

function applyListZoom() {
  listZoom = clampListZoom(listZoom);
  channelsEl.style.setProperty("--list-zoom", String(listZoom));
  channelsEl.style.zoom = String(listZoom);
  localStorage.setItem(LIST_ZOOM_KEY, String(listZoom));
  const percent = Math.round(listZoom * 100);
  channelZoomOutEl?.toggleAttribute("disabled", listZoom <= LIST_ZOOM_MIN);
  channelZoomInEl?.toggleAttribute("disabled", listZoom >= LIST_ZOOM_MAX);
  channelZoomOutEl?.setAttribute("title", `Zoom out list (${percent}%)`);
  channelZoomInEl?.setAttribute("title", `Zoom in list (${percent}%)`);
}

function changeListZoom(delta) {
  listZoom = clampListZoom(listZoom + delta);
  applyListZoom();
}

function syncChannelIconModeButton() {
  if (!channelIconModeEl) return;
  const scope = currentListLayoutScope();
  const scopeLabels = {
    channels: "all channels",
    category: "category channels",
    channelVideos: "channel videos",
    newVideos: "This week",
    watchLater: "Watch later"
  };
  channelIconModeEl.classList.toggle("is-active", channelListMode === "icons");
  channelIconModeEl.disabled = false;
  const labels = {
    icons: "Icons only",
    columns: "List with names in automatic columns",
    single: "List in one column"
  };
  const nextLabels = {
    icons: "List with names in automatic columns",
    columns: "List in one column",
    single: "Icons only"
  };
  const label = `${scopeLabels[scope]}: ${labels[channelListMode]}. Next: ${nextLabels[channelListMode]}`;
  channelIconModeEl.title = label;
  channelIconModeEl.setAttribute("aria-label", label);
  channelIconModeEl.setAttribute("aria-pressed", String(channelListMode === "icons"));
}

function syncVideoLayoutButton() {
  if (!toggleListLayoutEl) return;
  const label = "Video layout adjusts automatically";
  toggleListLayoutEl.classList.remove("is-active");
  toggleListLayoutEl.hidden = true;
  toggleListLayoutEl.disabled = true;
  toggleListLayoutEl.title = label;
  toggleListLayoutEl.setAttribute("aria-label", label);
  toggleListLayoutEl.setAttribute("aria-pressed", "false");
  syncVideoLayoutAvailability();
}

function syncVideoLayoutAvailability() {
  requestAnimationFrame(() => {
    const isVirtualVideoList = document.body.classList.contains("virtualVideoListView");
    const isVideoList = document.body.classList.contains("sidePanelVideos") || isVirtualVideoList;
    const width = videosEl.getBoundingClientRect().width || videosEl.parentElement?.getBoundingClientRect().width || channelsEl.getBoundingClientRect().width || 0;
    const styles = getComputedStyle(videosEl);
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;
    const minColumnWidth = VIDEO_GRID_MIN_COLUMN_WIDTH;
    const visibleVideoCount = isVirtualVideoList ? channelsEl.querySelectorAll(".videos .video").length : videosEl.querySelectorAll(".video").length;
    const hasEnoughItemsForColumns = !isVirtualVideoList || visibleVideoCount > 1;
    const canShowGrid = hasEnoughItemsForColumns && width >= minColumnWidth * 2 + gap;
    const canShowWide = hasEnoughItemsForColumns && width >= 720;
    document.body.classList.toggle("videoWideColumns", isVideoList && canShowWide);
    document.body.classList.toggle("videoListSingleColumn", isVideoList && width > 0 && !canShowGrid);
    document.body.classList.toggle("videoMultiColumnAvailable", isVideoList && canShowGrid);
    document.body.classList.toggle("videoSingleColumnOnly", isVideoList && width > 0 && !canShowGrid);
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

function xmlTextFrom(entry, tagName) {
  return entry.getElementsByTagName(tagName)[0]?.textContent?.trim() || "";
}

function parseFeed(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  const entries = [...doc.querySelectorAll("entry")];

  return entries.map((entry) => {
    const videoId = textFrom(entry, "videoId");
    const keywords = xmlTextFrom(entry, "media:keywords") || xmlTextFrom(entry, "keywords");
    return {
      id: videoId,
      title: textFrom(entry, "title"),
      published: textFrom(entry, "published"),
      description: xmlTextFrom(entry, "media:description") || xmlTextFrom(entry, "description") || "",
      tags: keywords ? keywords.split(",").map((item) => item.trim()).filter(Boolean) : [],
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

function elapsedShort(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Math.max(0, Date.now() - date.getTime());
  const hours = Math.max(1, Math.floor(diffMs / 3600000));
  if (hours < 24) return `${hours} h`;
  return `${Math.max(1, Math.floor(hours / 24))} d`;
}

function isNewerThanReset(publishedValue, channel) {
  const published = new Date(publishedValue || "").getTime();
  if (Number.isNaN(published)) return false;
  const reset = channel?.newVideosSeenAt ? new Date(channel.newVideosSeenAt).getTime() : 0;
  return published > reset;
}

function hasNewVideos(channel) {
  if (channel?.excludeFromNewVideos) return false;
  if (!channel?.feedLatestPublished) return false;
  return isWithinNewVideosRange({ published: channel.feedLatestPublished }) && isNewerThanReset(channel.feedLatestPublished, channel);
}

function newVideoAgeLabel(channel) {
  return hasNewVideos(channel) ? elapsedShort(channel.feedLatestPublished) : "";
}

function channelsWithNewVideos() {
  return allChannels.filter(hasNewVideos);
}

function isVideoNewForChannel(video, channel) {
  if (channel?.excludeFromNewVideos) return false;
  if (!video?.published || !channel?.id) return false;
  return isWithinNewVideosRange(video) && isNewerThanReset(video.published, channel);
}

function videoWithChannel(video, channel) {
  return {
    ...video,
    channel: channel.title || "",
    channelId: channel.id || video.channelId || "",
    channelCategories: channel.categories || [],
    channelTags: metadataTextValues(channel),
    thumbnail: video.thumbnail || `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`
  };
}

function isWithinNewVideosRange(video) {
  if (!video?.published) return false;
  const published = new Date(video.published).getTime();
  if (Number.isNaN(published)) return false;
  return Date.now() - published <= 7 * 24 * 3600000;
}

function newVideosContextActions() {
  return [
    { label: "Reset weekly NEW", action: resetNewVideoCounters },
    { label: "Excluded channels", action: openExcludedNewVideosDialog }
  ];
}

function collectNewVideos() {
  return allChannels
    .flatMap((channel) => (channel.feedVideos || [])
      .filter((video) => isVideoNewForChannel(video, channel))
      .map((video) => videoWithChannel(video, channel)))
    .sort((a, b) => new Date(b.published || 0).getTime() - new Date(a.published || 0).getTime());
}

async function resetNewVideoCounters() {
  const now = new Date().toISOString();
  allChannels = allChannels.map((channel) => hasNewVideos(channel) ? { ...channel, newVideosSeenAt: now } : channel);
  if (activeChannel?.id) {
    activeChannel = allChannels.find((channel) => channel.id === activeChannel.id) || activeChannel;
  }
  await saveConfig();
  renderCategories();
  if (activeView === "newVideos") {
    renderNewVideos();
  } else if (!activeChannel) {
    renderChannels(channelsForActiveCategory());
  } else {
    setActiveChannelButton();
  }
  renderSidePanelPath();
}

async function setChannelNewVideosExcluded(channelId, excluded) {
  const channel = allChannels.find((item) => item.id === channelId);
  if (!channel) return;
  allChannels = allChannels.map((item) => {
    if (item.id !== channelId) return item;
    const { excludeFromNewVideos, ...rest } = item;
    return excluded ? { ...rest, excludeFromNewVideos: true } : rest;
  });
  if (activeChannel?.id === channelId) {
    activeChannel = allChannels.find((item) => item.id === channelId) || activeChannel;
  }
  await saveConfig();
  renderCategories();
  if (activeView === "newVideos") {
    renderNewVideos();
  } else if (!activeChannel) {
    renderChannels(channelsForActiveCategory());
  } else {
    setActiveChannelButton();
  }
  renderSidePanelPath();
  showInfoPopup(
    excluded
      ? `"${channel.title || channel.id}" will not appear in New videos.`
      : `"${channel.title || channel.id}" will appear in New videos again.`,
    "ok"
  );
}

function renderExcludedNewVideosList() {
  if (!excludedNewVideosListEl) return;
  const excludedChannels = allChannels.filter((channel) => channel.excludeFromNewVideos);
  if (!excludedChannels.length) {
    const message = document.createElement("p");
    message.className = "meta";
    message.textContent = "No excluded channels.";
    excludedNewVideosListEl.replaceChildren(message);
    return;
  }

  excludedNewVideosListEl.replaceChildren(
    ...excludedChannels.map((channel) => {
      const label = document.createElement("label");
      label.className = "categoryAssignItem";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = channel.id;
      checkbox.checked = true;

      const name = document.createElement("span");
      name.textContent = channel.title || channel.id;

      label.append(checkbox, name);
      return label;
    })
  );
}

function openExcludedNewVideosDialog() {
  if (!excludedNewVideosPromptEl) return;
  renderExcludedNewVideosList();
  excludedNewVideosPromptEl.hidden = false;
}

function closeExcludedNewVideosDialog() {
  if (excludedNewVideosPromptEl) excludedNewVideosPromptEl.hidden = true;
}

async function saveExcludedNewVideosDialog() {
  if (!excludedNewVideosListEl) return;
  const selectedIds = new Set([...excludedNewVideosListEl.querySelectorAll("input:checked")].map((checkbox) => checkbox.value));
  allChannels = allChannels.map((channel) => {
    if (!channel.excludeFromNewVideos) return channel;
    const { excludeFromNewVideos, ...rest } = channel;
    return selectedIds.has(channel.id) ? { ...rest, excludeFromNewVideos: true } : rest;
  });
  if (activeChannel?.id) {
    activeChannel = allChannels.find((channel) => channel.id === activeChannel.id) || activeChannel;
  }
  await saveConfig();
  renderCategories();
  if (activeView === "newVideos") {
    renderNewVideos();
  } else if (!activeChannel) {
    renderChannels(channelsForActiveCategory());
  } else {
    setActiveChannelButton();
  }
  renderSidePanelPath();
  closeExcludedNewVideosDialog();
}

function parseLocalizedInteger(value = "") {
  const normalized = String(value).replace(/[\s,.]/g, "");
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseChannelVideoCount(html = "") {
  const decoded = html.replace(/\\"/g, '"');
  const patterns = [
    /"videosCountText"\s*:\s*\{[^}]*"text"\s*:\s*"([^"]+)"/i,
    /"videoCountText"\s*:\s*\{[^}]*"text"\s*:\s*"([^"]+)"/i,
    /"videosCountText"\s*:\s*\{[^}]*"simpleText"\s*:\s*"([^"]+)"/i,
    /"videoCountText"\s*:\s*\{[^}]*"simpleText"\s*:\s*"([^"]+)"/i
  ];
  for (const pattern of patterns) {
    const match = decoded.match(pattern);
    if (!match) continue;
    const count = parseLocalizedInteger(match[1]);
    if (count) return count;
  }
  return 0;
}

function uniqueTextValues(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function collectJsonStringValues(html, keyNames) {
  const values = [];
  for (const key of keyNames) {
    const pattern = new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, "gi");
    for (const match of html.matchAll(pattern)) {
      try {
        values.push(JSON.parse(`"${match[1]}"`));
      } catch {
        values.push(match[1]);
      }
    }
  }
  return uniqueTextValues(values);
}

function collectJsonArrayValues(html, keyNames) {
  const values = [];
  for (const key of keyNames) {
    const pattern = new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]+)\\]`, "gi");
    for (const match of html.matchAll(pattern)) {
      values.push(...collectJsonStringValues(match[1], ["simpleText", "text", "name"]));
      for (const item of match[1].matchAll(/"((?:\\.|[^"\\])+)"/g)) {
        try {
          values.push(JSON.parse(`"${item[1]}"`));
        } catch {
          values.push(item[1]);
        }
      }
    }
  }
  return uniqueTextValues(values);
}

function parseChannelMetadata(html = "") {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const metaContent = (name) => doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.getAttribute("content")?.trim() || "";
  const description = metaContent("description") || metaContent("og:description") || collectJsonStringValues(html, ["description", "shortDescription"]).join(" ");
  const keywordText = metaContent("keywords");
  const tags = uniqueTextValues([
    ...(keywordText ? keywordText.split(/[,;]+/) : []),
    ...collectJsonArrayValues(html, ["keywords", "tags", "topicDetails", "channelTags"]),
    ...collectJsonStringValues(html, ["category", "title"])
  ]);
  return { description, tags };
}

async function fetchChannelMetadata(channelId) {
  if (!sniffYoutubeEnabled) return {};
  const response = await fetch(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/about`, {
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return parseChannelMetadata(await response.text());
}

async function fetchChannelVideoCount(channelId) {
  if (!sniffYoutubeEnabled) return 0;
  const response = await fetch(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/videos`, {
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return parseChannelVideoCount(await response.text());
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
      title: video.title || "",
      description: video.description || "",
      tags: video.tags || video.keywords || video.topics || [],
      channel: video.channel || activeChannel?.title || ""
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

async function readLegacyFileConfig() {
  try {
    const response = await fetch("../data/config.json", { cache: "no-store" });
    if (!response.ok) return null;
    const parsed = await response.json();
    if (!parsed || typeof parsed !== "object") return null;
    return { ...emptyConfig(), ...parsed };
  } catch {
    return null;
  }
}

async function loadInitialConfig() {
  const storedConfig = await readStoredConfig();
  if (storedConfig) return storedConfig;

  const legacyConfig = await readLegacyFileConfig();
  if (legacyConfig) {
    await writeStoredConfig({ ...legacyConfig, updatedAt: new Date().toISOString() });
    return legacyConfig;
  }

  return emptyConfig();
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

function videoChannelTitle(video) {
  return video.channel || allChannels.find((channel) => channel.id === video.channelId)?.title || (activeChannel?.id === video.channelId ? activeChannel.title : "");
}

function videoDateText(video) {
  if (!video.published) return "";
  return formatDate(video.published) || video.published;
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

function newVideosHistoryEntry() {
  return { type: "newVideos", id: "newVideos" };
}

function currentShelfBaseHistoryEntry() {
  if (activeView === "watchLater") return { type: "watchLater", id: "watchLater" };
  if (activeView === "newVideos") return newVideosHistoryEntry();
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
  document.body.classList.remove("virtualVideoListView");
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

function renderNewVideos() {
  currentVideos = collectNewVideos();
  videosEl.replaceChildren();
  const newVideoList = document.createElement("div");
  newVideoList.className = "videos newVideos";
  channelsEl.classList.add("videoListHost");
  channelsEl.replaceChildren(newVideoList);
  renderVideos(currentVideos, newVideoList);
  syncVideoLayoutAvailability();
  setStatus(currentVideos.length ? "" : "No new videos.", !currentVideos.length);
}

function showNewVideos(options = {}) {
  clearChannelSearch();
  document.body.classList.remove("sidePanelVideos");
  document.body.classList.add("virtualVideoListView");
  activeView = "newVideos";
  activeCategoryId = NEW_VIDEOS_CATEGORY_ID;
  activeChannel = null;
  activeVideoId = "";
  activeSearchQuery = "";
  listViewEl.hidden = false;
  playerViewEl.hidden = true;
  setHeader("", false);
  renderCategories();
  renderChannels([]);
  renderSidePanelPath();
  setActiveChannelButton();
  syncStackedChannelViewState();
  renderNewVideos();
  if (!options.skipHistory) pushHistory(newVideosHistoryEntry());
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

function showInfoPopup(message, mode = "ok") {
  document.querySelector("#infoPrompt")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "infoPrompt";
  overlay.className = `modalOverlay infoPrompt is-${mode}`;

  const modal = document.createElement("div");
  modal.className = "modal infoModal";
  modal.role = "status";
  modal.textContent = message;

  overlay.append(modal);
  document.body.append(overlay);
  window.setTimeout(() => overlay.remove(), 1500);
}

function highlightChannel(channelId, mode = "ok") {
  requestAnimationFrame(() => {
    const item = channelsEl.querySelector(`.channel[data-channel-id="${CSS.escape(channelId)}"]`);
    if (!item) return;
    item.classList.remove("is-drop-added", "is-drop-existing");
    item.classList.add(mode === "existing" ? "is-drop-existing" : "is-drop-added");
    item.scrollIntoView({ block: "center", behavior: "smooth" });
    window.setTimeout(() => item.classList.remove("is-drop-added", "is-drop-existing"), 2600);
  });
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
      card.classList.toggle("is-unseen", !seenVideos[video.id]);
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
      const channelForVideo = allChannels.find((channel) => channel.id === video.channelId) || activeChannel;
      const showFreshBadge = video.published && (
        activeView === "newVideos" ||
        (channelForVideo && isVideoNewForChannel(video, channelForVideo))
      );
      if (showFreshBadge) {
        const age = document.createElement("span");
        age.className = "freshAgeBadge videoFreshAgeBadge";
        age.textContent = elapsedShort(video.published);
        card.append(age);
      }
      const meta = document.createElement("div");
      meta.className = "meta";
      const channelMeta = document.createElement("div");
      channelMeta.className = "videoChannelMeta";
      channelMeta.textContent = videoChannelTitle(video);
      const dateMeta = document.createElement("div");
      dateMeta.className = "videoDateMeta";
      const dateText = videoDateText(video);
      dateMeta.textContent = video.views ? [dateText, video.views].filter(Boolean).join(" - ") : dateText;
      meta.append(channelMeta, dateMeta);

      const watchButton = document.createElement("button");
      watchButton.className = "watchLaterButton";
      const isWatchLater = Boolean(watchLater[video.id]);
      watchButton.classList.toggle("is-active", isWatchLater);
      watchButton.type = "button";
      watchButton.textContent = "Watch later";
      watchButton.addEventListener("click", async (event) => {
        event.stopPropagation();
        await toggleWatchLater(video);
      });

      const actions = document.createElement("div");
      actions.className = "videoActions";
      actions.append(watchButton);

      details.append(title, meta);
      card.append(thumbFrame, details, actions);
      return card;
}

function createWatchMoreCard(channel) {
  const card = document.createElement("button");
  card.className = "watchMoreCard";
  card.type = "button";
  card.textContent = "RSS feed limit - more on YouTube";
  card.addEventListener("click", () => openChannelVideosOnYouTube(channel));
  return card;
}

function renderVideos(videos, target = videosEl, options = {}) {
  const items = videos.map(createVideoCard);
  if (options.watchMoreChannel?.id) items.push(createWatchMoreCard(options.watchMoreChannel));
  target.replaceChildren(...items);

  setActiveVideoButton();
  syncVideoLayoutAvailability();
}

function renderChannelVideos(videos = currentVideos) {
  renderVideos(videos, videosEl, { watchMoreChannel: activeChannel });
}

async function toggleWatchLater(video) {
  if (watchLater[video.id]) {
    delete watchLater[video.id];
  } else {
    watchLater[video.id] = {
      savedAt: new Date().toISOString(),
      seenAt: "",
      channelId: activeChannel?.id || video.channelId || "",
      title: video.title || "",
      description: video.description || "",
      tags: video.tags || video.keywords || video.topics || [],
      channel: video.channel || activeChannel?.title || ""
    };
  }
  await saveConfig();
  updatePlayerWatchLaterButton();
  if (activeView === "watchLater") {
    renderWatchLater();
  } else if (activeChannel) {
    renderChannelVideos(currentVideos);
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
      newVideosSeenAt: current?.newVideosSeenAt || channel.newVideosSeenAt || new Date().toISOString(),
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
    freetube: "Import FreeTube"
  };
  for (const button of [exportNativeConfigEl, importNativeConfigEl, importFreetubeConfigEl]) {
    button.hidden = true;
  }
  const target = kind === "native" ? importNativeConfigEl : importFreetubeConfigEl;
  target.hidden = false;
  target.textContent = labels[kind] || "Import";
}

function openFullImportExportDialog() {
  pendingImportKind = "";
  importExportPromptEl.hidden = false;
  exportNativeConfigEl.hidden = false;
  importNativeConfigEl.hidden = false;
  importFreetubeConfigEl.hidden = false;
  importNativeConfigEl.textContent = "Import YouTube Channel Shelf";
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
  if (!configLoaded && command !== "importNative" && command !== "importFreetube") {
    setStatus("Configuration is not loaded yet", true);
    return;
  }
  if (command === "exportNative") exportNativeConfig();
  else if (command === "importNative") await runImportFilePicker("native");
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

function openChannelVideosOnYouTube(channel) {
  if (!channel?.id) return;
  const url = `https://www.youtube.com/channel/${encodeURIComponent(channel.id)}/videos`;
  chrome.tabs?.create?.({ url });
}
function openSubscribeOnYouTube(channel) {
  if (!channel?.id) return;
  const url = `https://www.youtube.com/channel/${encodeURIComponent(channel.id)}?sub_confirmation=1`;
  chrome.tabs?.create?.({ url });
}

function channelContextActions(channel) {
  const actions = [
    { label: "Open YouTube channel", action: () => openChannelVideosOnYouTube(channel) },
    { label: "Subscribe on YouTube", action: () => openSubscribeOnYouTube(channel) },
    { label: "Add to category", action: () => openCategoryAssignment(channel) },
    { label: "Remove channel", action: () => unsubscribeChannel(channel), danger: true }
  ];
  if (channel.excludeFromNewVideos) {
    actions.splice(3, 0, { label: "Include in New videos", action: () => setChannelNewVideosExcluded(channel.id, false) });
  }
  return actions;
}

function isManualCategoryId(categoryId) {
  return Boolean(categoryId && categoryId !== NEW_VIDEOS_CATEGORY_ID && categoryId !== UNCATEGORIZED_CATEGORY_ID);
}

function channelCountForCategory(categoryId) {
  return allChannels.filter((channel) => (channel.categories || []).includes(categoryId)).length;
}

function sortedManualCategories() {
  return [...allCategories].sort((a, b) => {
    const countDelta = channelCountForCategory(b.id) - channelCountForCategory(a.id);
    if (countDelta) return countDelta;
    return (a.name || "").localeCompare(b.name || "", "fr");
  });
}

function channelsForActiveCategory() {
  if (activeCategoryId === NEW_VIDEOS_CATEGORY_ID) return [];
  if (activeCategoryId === UNCATEGORIZED_CATEGORY_ID) {
    return allChannels.filter((channel) => !(channel.categories || []).length);
  }
  if (!activeCategoryId) return allChannels;
  return allChannels.filter((channel) => (channel.categories || []).includes(activeCategoryId));
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function searchWordsFromText(value) {
  return normalizeSearchText(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function searchAliasesFromText(value) {
  const words = searchWordsFromText(value);
  if (!words.length) return [];
  const aliases = new Set();
  aliases.add(words.join(""));
  return [...aliases].filter((alias) => alias.length > 1);
}

function searchPartScore(value, query, weights) {
  const text = normalizeSearchText(value);
  if (!text) return 0;
  const words = searchWordsFromText(value);
  const joined = words.join("");
  if (text === query || joined === query) return weights.exact;
  if (text.startsWith(query) || joined.startsWith(query)) return weights.prefix;
  if (words.some((word) => word.startsWith(query))) return weights.wordPrefix;
  if (text.includes(query) || joined.includes(query)) return weights.includes;
  return 0;
}

function valuesFromFields(item, fields) {
  return fields.flatMap((field) => {
    const value = item?.[field];
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") return Object.values(value);
    return value ? [value] : [];
  });
}

function channelDeclaredMetadataValues(channel) {
  return valuesFromFields(channel, [
    "tag",
    "tags",
    "keyword",
    "keywords",
    "topic",
    "topics",
    "category",
    "categories",
    "contentType",
    "contentTypes",
    "content_type",
    "type",
    "types",
    "genre",
    "genres",
    "niche",
    "niches"
  ]);
}

function videoDeclaredMetadataValues(video) {
  return valuesFromFields(video, [
    "tag",
    "tags",
    "keyword",
    "keywords",
    "topic",
    "topics",
    "contentType",
    "contentTypes",
    "content_type",
    "type",
    "types",
    "genre",
    "genres"
  ]);
}

function descriptiveMetadataValues(item) {
  return valuesFromFields(item, ["description", "summary", "content"]);
}

function metadataTextValues(item) {
  return [
    ...channelDeclaredMetadataValues(item),
    ...videoDeclaredMetadataValues(item),
    ...descriptiveMetadataValues(item),
    ...valuesFromFields(item, ["handle", "author", "channel", "channelTitle", "channelName"])
  ];
}

function savedVideoTextsForChannel(channelId) {
  const entries = [
    ...Object.values(seenVideos || {}),
    ...Object.values(watchLater || {})
  ];

  return entries
    .filter((item) => item?.channelId === channelId)
    .flatMap((item) => [item.title || "", ...metadataTextValues(item)]);
}

function searchableTextForChannel(channel) {
  const categoryNames = categoryNamesForChannel(channel);
  const feedVideos = Array.isArray(channel.feedVideos) ? channel.feedVideos : [];
  const activeFeedVideos = activeChannel?.id === channel.id ? currentVideos : [];
  const videoTitles = [...feedVideos, ...activeFeedVideos]
    .map((video) => video?.title || "")
    .filter(Boolean);

  const parts = [
    channel.id,
    channel.title,
    channel.feedLatestTitle,
    ...metadataTextValues(channel),
    ...categoryNames,
    ...videoTitles,
    ...savedVideoTextsForChannel(channel.id)
  ].filter(Boolean);

  return normalizeSearchText([
    ...parts,
    ...parts.flatMap(searchAliasesFromText)
  ].join(" "));
}

function sourceChannelsForSearch() {
  if (activeView === "watchLater" || activeView === "newVideos") return [];
  if (activeCategoryId === UNCATEGORIZED_CATEGORY_ID) {
    return allChannels.filter((channel) => !(channel.categories || []).length);
  }
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
      : activeView === "newVideos"
      ? "Search this week"
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
  const channel = allChannels.find((item) => item.id === video?.channelId) || activeChannel || null;
  const saved = [seenVideos?.[video?.id], watchLater?.[video?.id]].filter(Boolean);
  const parts = [
    video?.id,
    video?.title,
    video?.published,
    ...videoDeclaredMetadataValues(video),
    ...saved.flatMap((item) => [item.title || "", ...videoDeclaredMetadataValues(item)]),
    video?.channel,
    channel?.title,
    ...descriptiveMetadataValues(video),
    ...saved.flatMap(descriptiveMetadataValues)
  ].filter(Boolean);

  return normalizeSearchText([
    ...parts,
    ...parts.flatMap(searchAliasesFromText)
  ].join(" "));
}

function renderSearchedVideos() {
  syncChannelSearchState();
  const query = normalizeSearchText(channelSearchQuery.trim());
  if (!query) {
    renderChannelVideos(currentVideos);
    setStatus();
    return;
  }

  const filteredVideos = currentVideos.filter((video) => searchableTextForVideo(video).includes(query));
  renderChannelVideos(filteredVideos);
  setStatus(filteredVideos.length ? "" : "No videos found in this channel.", !filteredVideos.length);
}

function renderWatchLaterVideoResults(videos) {
  const watchLaterList = document.createElement("div");
  watchLaterList.className = "videos watchLaterVideos";
  channelsEl.replaceChildren(watchLaterList);
  renderVideos(videos, watchLaterList);
}

function channelNeedsMetadata(channel) {
  return sniffYoutubeEnabled && channel?.id && !channel.description && !(Array.isArray(channel.tags) && channel.tags.length);
}

async function enrichChannelsForSearch(channels) {
  if (channelSearchMetadataRefreshInFlight) return;
  const query = normalizeSearchText(channelSearchQuery.trim());
  if (!query || query.length < 3) return;
  const candidates = channels.filter(channelNeedsMetadata);
  if (!candidates.length) return;
  channelSearchMetadataRefreshInFlight = true;
  let changed = false;
  let nextIndex = 0;
  const workerCount = Math.min(6, candidates.length);

  async function enrichNextChannel() {
    while (nextIndex < candidates.length && normalizeSearchText(channelSearchQuery.trim()) === query) {
      const channel = candidates[nextIndex++];
      try {
        const metadata = await fetchChannelMetadata(channel.id);
        if (!metadata.description && !metadata.tags?.length) continue;
        allChannels = allChannels.map((item) => item.id === channel.id ? {
          ...item,
          description: metadata.description || item.description || "",
          tags: metadata.tags?.length ? metadata.tags : item.tags || []
        } : item);
        changed = true;
        if (activeChannel?.id) activeChannel = allChannels.find((item) => item.id === activeChannel.id) || activeChannel;
        renderCategories();
        renderChannels(sourceChannelsForSearch());
      } catch {
        // Search metadata is opportunistic.
      }
    }
  }

  try {
    await Promise.all(Array.from({ length: workerCount }, enrichNextChannel));
  } finally {
    if (changed && configLoaded) await saveConfig().catch(() => {});
    channelSearchMetadataRefreshInFlight = false;
  }
}

function scheduleSearchMetadataRefresh(channels) {
  if (!sniffYoutubeEnabled || !channelSearchQuery.trim()) return;
  window.clearTimeout(channelSearchMetadataRefreshTimer);
  channelSearchMetadataRefreshTimer = window.setTimeout(() => {
    enrichChannelsForSearch(channels).catch(() => {});
  }, 250);
}

function renderSearchResults() {
  syncChannelSearchState();
  if (isSelectedChannelSearchScope()) {
    renderSearchedVideos();
    return;
  }
  if (activeView === "watchLater" || activeView === "newVideos") {
    const query = normalizeSearchText(channelSearchQuery.trim());
    const filteredVideos = query ? currentVideos.filter((video) => searchableTextForVideo(video).includes(query)) : currentVideos;
    renderWatchLaterVideoResults(filteredVideos);
    const scopeLabel = activeView === "newVideos" ? "New" : "Watch later";
    setStatus(filteredVideos.length ? "" : `No videos found in ${scopeLabel}.`, !filteredVideos.length);
    return;
  }
  const sourceChannels = sourceChannelsForSearch();
  renderChannels(sourceChannels);
  scheduleSearchMetadataRefresh(sourceChannels);
}

function channelSearchScore(channel, query) {
  if (!query) return 1;
  let score = 0;
  score = Math.max(score, searchPartScore(channel.title, query, { exact: 1000, prefix: 900, wordPrefix: 760, includes: 420 }));
  score = Math.max(score, searchPartScore(channelDeclaredMetadataValues(channel).join(" "), query, { exact: 760, prefix: 650, wordPrefix: 520, includes: 300 }));
  score = Math.max(score, searchPartScore(categoryNamesForChannel(channel).join(" "), query, { exact: 700, prefix: 600, wordPrefix: 500, includes: 280 }));
  score = Math.max(score, searchPartScore([channel.handle, channel.id].filter(Boolean).join(" "), query, { exact: 560, prefix: 500, wordPrefix: 380, includes: 220 }));
  score = Math.max(score, searchPartScore(descriptiveMetadataValues(channel).join(" "), query, { exact: 260, prefix: 220, wordPrefix: 180, includes: 80 }));

  const feedVideos = Array.isArray(channel.feedVideos) ? channel.feedVideos : [];
  const videoText = [
    channel.feedLatestTitle,
    ...feedVideos.flatMap((video) => [video?.title || "", ...videoDeclaredMetadataValues(video)]),
    ...savedVideoTextsForChannel(channel.id)
  ].join(" ");
  score = Math.max(score, searchPartScore(videoText, query, { exact: 180, prefix: 150, wordPrefix: 120, includes: 50 }));

  if (!score && searchableTextForChannel(channel).includes(query)) score = 20;
  return score;
}

function filterChannelsForSearch(channels) {
  const query = normalizeSearchText(channelSearchQuery.trim());
  if (!query) return channels;
  return channels
    .map((channel, index) => ({ channel, index, score: channelSearchScore(channel, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.channel.title.localeCompare(b.channel.title, "fr") || a.index - b.index)
    .map((item) => item.channel);
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
    { id: NEW_VIDEOS_CATEGORY_ID, name: `This week${channelsWithNewVideos().length ? ` (${channelsWithNewVideos().length})` : ""}`, automatic: true },
    { id: "__watch_later", name: "Watch later", automatic: true },
    ...sortedManualCategories(),
    { id: UNCATEGORIZED_CATEGORY_ID, name: "Uncategorized" }
  ].map((category) => {
    const button = document.createElement("button");
    button.className = "category";
    button.classList.toggle("is-special", Boolean(category.special));
    button.classList.toggle("is-auto", Boolean(category.automatic));
    button.classList.toggle("is-new", category.id === NEW_VIDEOS_CATEGORY_ID);
    button.type = "button";
    button.textContent = category.name;
    if (category.id && !category.special && !category.automatic) attachCategoryDropTarget(button, category.id);
    if (category.id === NEW_VIDEOS_CATEGORY_ID) {
      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        event.stopPropagation();
        showContextMenu(event, newVideosContextActions());
      });
    }
    button.classList.toggle(
      "is-active",
      category.id === "__watch_later" ? activeView === "watchLater" : category.id === NEW_VIDEOS_CATEGORY_ID ? activeView === "newVideos" : activeView === "channels" && category.id === activeCategoryId
    );
    button.addEventListener("click", async () => {
      await maybePromptSeenForWatchLater();
      if (category.id === NEW_VIDEOS_CATEGORY_ID) {
        showNewVideos();
        return;
      }

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
  document.body.classList.add("virtualVideoListView");
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
    channel: item.channel || allChannels.find((channel) => channel.id === item.channelId)?.title || "",
    description: item.description || "",
    tags: item.tags || item.keywords || item.topics || [],
    thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
  }));
  videosEl.replaceChildren();
  const watchLaterList = document.createElement("div");
  watchLaterList.className = "videos watchLaterVideos";
  channelsEl.classList.add("videoListHost");
  channelsEl.replaceChildren(watchLaterList);
  renderVideos(currentVideos, watchLaterList);
  syncStackedChannelViewState();
  syncVideoLayoutAvailability();
}

function renderChannels(channels) {
  channelsEl.classList.remove("videoListHost");
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
      button.draggable = true;
      button.addEventListener("dragstart", (event) => {
        event.dataTransfer?.setData("application/x-youtube-channel-shelf-channel", channel.id);
        event.dataTransfer?.setData("text/plain", channel.id);
        event.dataTransfer.effectAllowed = "copy";
        button.classList.add("is-dragging");
      });
      button.addEventListener("dragend", () => {
        button.classList.remove("is-dragging");
        document.querySelectorAll(".is-category-drop-target").forEach((item) => item.classList.remove("is-category-drop-target"));
      });
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

      const titleRow = document.createElement("div");
      titleRow.className = "channelTitleRow";
      const name = document.createElement("div");
      name.className = "channelName";
      name.textContent = channel.title;
      titleRow.append(name);
      const ageLabel = newVideoAgeLabel(channel);
      if (ageLabel) {
        const age = document.createElement("span");
        age.className = "freshAgeBadge channelFreshAgeBadge";
        age.role = "button";
        age.tabIndex = 0;
        age.title = "Open This week";
        age.textContent = ageLabel;
        age.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          showNewVideos();
        });
        age.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          event.stopPropagation();
          showNewVideos();
        });
        titleRow.append(age);
      }

      const meta = document.createElement("div");
      meta.className = "channelMeta";

      const categories = document.createElement("div");
      categories.className = "channelCategoryList";
      categories.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openCategoryAssignment(channel);
      });

      body.append(titleRow, meta, categories);
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
        const count = channel?.channelVideoCount || 0;
        const date = channel?.feedLatestPublished ? formatDate(channel.feedLatestPublished) : "";
        if (count) {
          const countLine = document.createElement("div");
          countLine.textContent = `${count.toLocaleString("fr-FR")} videos`;
          meta.append(countLine);
        }
        if (date) {
          const latestLine = document.createElement("div");
          latestLine.textContent = `Latest video: ${date}`;
          meta.append(latestLine);
        }
      }
    }
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

    categoryList.append(
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
  if (fullChannel?.id) {
    fullChannel.newVideosSeenAt = new Date().toISOString();
    allChannels = allChannels.map((item) => item.id === fullChannel.id ? { ...item, newVideosSeenAt: fullChannel.newVideosSeenAt } : item);
    if (configLoaded) await saveConfig().catch(() => {});
  }
  clearChannelSearch();
  activeView = "channels";
  activeChannel = fullChannel;
  activeSearchQuery = "";
  document.body.classList.remove("virtualVideoListView");
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

    currentVideos = parseFeed(await response.text()).map((video) => videoWithChannel(video, activeChannel));
    let channelVideoCount = activeChannel.channelVideoCount || 0;
    let channelMetadata = { description: activeChannel.description || "", tags: activeChannel.tags || [] };
    try {
      channelVideoCount = await fetchChannelVideoCount(activeChannel.id) || channelVideoCount;
    } catch {
      // The RSS feed remains usable even when YouTube page parsing fails.
    }
    try {
      channelMetadata = { ...channelMetadata, ...await fetchChannelMetadata(activeChannel.id) };
    } catch {
      // Metadata is optional.
    }
    const latestPublished = currentVideos[0]?.published || "";
    activeChannel = {
      ...activeChannel,
      feedVideoCount: currentVideos.length,
      channelVideoCount,
      description: channelMetadata.description || activeChannel.description || "",
      tags: channelMetadata.tags?.length ? channelMetadata.tags : activeChannel.tags || [],
      feedLatestPublished: latestPublished,
      feedLatestTitle: currentVideos[0]?.title || "",
      feedVideos: currentVideos.map((video) => ({
        id: video.id,
        title: video.title,
        published: video.published,
        description: video.description || "",
        tags: video.tags || []
      }))
    };
    allChannels = allChannels.map((channel) => (channel.id === activeChannel.id ? { ...channel, ...activeChannel } : channel));
    setActiveChannelButton();
    if (channelSearchQuery.trim() && isSelectedChannelSearchScope()) {
      renderSearchedVideos();
    } else {
      renderChannelVideos(currentVideos);
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

async function refreshChannelSummaries() {
  if (!configLoaded || !allChannels.length) return;
  let changed = false;
  const updatedChannels = [];

  for (const channel of allChannels) {
    try {
      const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channel.id)}`, {
        cache: "no-store"
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const videos = parseFeed(await response.text()).map((video) => videoWithChannel(video, channel));
      let channelVideoCount = channel.channelVideoCount || 0;
      let channelMetadata = { description: channel.description || "", tags: channel.tags || [] };
      try {
        channelVideoCount = await fetchChannelVideoCount(channel.id) || channelVideoCount;
      } catch {
        // Keep the previous count when the page parser cannot read YouTube.
      }
      try {
        channelMetadata = { ...channelMetadata, ...await fetchChannelMetadata(channel.id) };
      } catch {
        // Metadata is optional.
      }
      const latestPublished = videos[0]?.published || "";
      const next = {
        ...channel,
        feedVideoCount: videos.length,
        channelVideoCount,
        description: channelMetadata.description || channel.description || "",
        tags: channelMetadata.tags?.length ? channelMetadata.tags : channel.tags || [],
        feedLatestPublished: latestPublished,
        feedLatestTitle: videos[0]?.title || "",
        feedVideos: videos.map((video) => ({
          id: video.id,
          title: video.title,
          published: video.published,
          description: video.description || "",
          tags: video.tags || []
        }))
      };
      if (
        next.feedLatestPublished !== channel.feedLatestPublished ||
        next.feedLatestTitle !== channel.feedLatestTitle ||
        next.feedVideoCount !== channel.feedVideoCount ||
        next.channelVideoCount !== channel.channelVideoCount ||
        next.description !== channel.description ||
        JSON.stringify(next.tags || []) !== JSON.stringify(channel.tags || [])
      ) {
        changed = true;
      }
      updatedChannels.push(next);
    } catch {
      updatedChannels.push(channel);
    }
  }

  if (!changed) return;
  allChannels = updatedChannels.sort((a, b) => a.title.localeCompare(b.title, "fr"));
  await saveConfig();
  renderCategories();
  if (!activeChannel) renderChannels(channelsForActiveCategory());
  setActiveChannelButton();
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
    if (globalThis.chrome?.storage?.local) {
      const settings = await new Promise((resolve) => chrome.storage.local.get(SNIFF_YOUTUBE_KEY, resolve));
      if (settings[SNIFF_YOUTUBE_KEY] !== undefined) {
        sniffYoutubeEnabled = Boolean(settings[SNIFF_YOUTUBE_KEY]);
        localStorage.setItem(SNIFF_YOUTUBE_KEY, String(sniffYoutubeEnabled));
      }
    }
    config = await loadInitialConfig();
    allCategories = config.categories || [];
    allChannels = (config.channels || [])
      .filter((channel) => channel.id)
      .sort((a, b) => a.title.localeCompare(b.title, "fr"));
    sessionFeedBaseline = new Map(allChannels.map((channel) => [channel.id, channel.feedLatestPublished || ""]));
    seenVideos = config.seenVideos || {};
    watchLater = config.watchLater || {};
    configLoaded = true;

    if (activeView === "home") activeView = "channels";
    renderCategories();
    renderChannels(channelsForActiveCategory());
    if (historyIndex < 0) {
      pushHistory(channelListHistoryEntry());
    }
    refreshChannelSummaries().catch(() => {});
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

  if (activeView === "newVideos") {
    renderChannels([]);
    renderNewVideos();
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

    if (entry.type === "newVideos") {
      showNewVideos({ skipHistory: true });
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

toggleListLayoutEl?.addEventListener("click", (event) => {
  event.preventDefault();
  syncVideoLayoutAvailability();
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


function generalContextActions(target) {
  if (target?.closest(".sidePanelPath")) {
    return [
      { label: "Add category", action: () => addCategoryEl.click() }
    ];
  }
  return [
    { label: "Add channel", action: () => addChannel(activeView === "channels" ? activeCategoryId : "") }
  ];
}

function handleGeneralContextMenu(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (!target.closest(".sidebar, .sidePanelPath, .videos")) return;
  if (target.closest(".channel, .category, .pathButton, .pathIconButton, .video, .watchMoreCard, button, input, a")) return;
  event.preventDefault();
  showContextMenu(event, generalContextActions(target));
}

document.addEventListener("contextmenu", handleGeneralContextMenu);
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
cancelExcludedNewVideosEl?.addEventListener("click", closeExcludedNewVideosDialog);
saveExcludedNewVideosEl?.addEventListener("click", () => {
  saveExcludedNewVideosDialog().catch((error) => setStatus(`Save error: ${error.message}`, true));
});
closeImportExportEl.addEventListener("click", closeImportExportDialog);
exportNativeConfigEl.addEventListener("click", exportNativeConfig);
importNativeConfigEl.addEventListener("click", () => runImportFilePicker("native"));
importFreetubeConfigEl.addEventListener("click", () => runImportFilePicker("freetube"));
closeDisplayOptionsEl?.addEventListener("click", closeDisplayOptionsDialog);
closeAddChannelEl?.addEventListener("click", closeAddChannelDialog);
closeAddCategoryEl?.addEventListener("click", closeAddCategoryDialog);
addChannelSearchFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  runAddChannelSearch();
});
addCategoryFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  saveNewCategoryFromDialog().catch((error) => setStatus(`Category error: ${error.message}`, true));
});
hideCommentsOptionEl?.addEventListener("click", (event) => {
  event.preventDefault();
  toggleDisplayOption(COMMENTS_MODE_KEY, false);
});
hideSuggestionsOptionEl?.addEventListener("click", (event) => {
  event.preventDefault();
  toggleDisplayOption(SUGGESTIONS_MODE_KEY, true);
});

channelIconModeEl?.addEventListener("click", () => {
  const scope = currentListLayoutScope();
  const currentMode = listModeForScope(scope);
  const nextMode = currentMode === "icons" ? "columns" : currentMode === "columns" ? "single" : "icons";
  setListModeForScope(scope, nextMode);
  applyListLayout();
});

channelZoomOutEl?.addEventListener("click", () => changeListZoom(-LIST_ZOOM_STEP));
channelZoomInEl?.addEventListener("click", () => changeListZoom(LIST_ZOOM_STEP));

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

document.addEventListener("dragover", (event) => {
  if (event.dataTransfer?.types?.includes("application/x-youtube-channel-shelf-channel")) return;
  if (![...event.dataTransfer?.types || []].some((type) => ["text/uri-list", "text/plain"].includes(type))) return;
  event.preventDefault();
  document.body.classList.add("isChannelDropTarget");
});

document.addEventListener("dragleave", (event) => {
  if (event.relatedTarget) return;
  document.body.classList.remove("isChannelDropTarget");
});

document.addEventListener("drop", async (event) => {
  if (event.dataTransfer?.types?.includes("application/x-youtube-channel-shelf-channel")) return;
  const data = event.dataTransfer?.getData("text/uri-list") || event.dataTransfer?.getData("text/plain") || "";
  if (!data) return;
  event.preventDefault();
  document.body.classList.remove("isChannelDropTarget");
  await addDroppedChannel(data);
});

sidePanelBackEl?.addEventListener("click", showSidePanelChannels);

refreshEl.addEventListener("click", loadFeed);

unsubscribeEl.addEventListener("click", () => {
  unsubscribeActiveChannel().catch((error) => {
    setStatus(`Save error: ${error.message}`, true);
  });
});

assignCategoriesEl.addEventListener("click", () => openCategoryAssignment(activeChannel));

function channelIdFromDroppedText(value = "") {
  return String(value).match(/(?:\/channel\/|^)(UC[-_a-zA-Z0-9]{20,})/)?.[1] || "";
}

function handleUrlFromDroppedText(value = "") {
  const text = String(value).trim();
  const handle = text.match(/(?:youtube\.com\/|^)(@[-_.a-zA-Z0-9]+)/)?.[1];
  return handle ? `https://www.youtube.com/${handle}` : "";
}

function youtubeUrlFromDroppedText(value = "") {
  const text = String(value).trim();
  const url = text.match(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s]+/)?.[0] || "";
  return url ? url.replace(/&amp;/g, "&") : "";
}

function channelIdFromYoutubeHtml(html = "") {
  return (
    html.match(/"externalId":"(UC[-_a-zA-Z0-9]{20,})"/)?.[1] ||
    html.match(/"channelId":"(UC[-_a-zA-Z0-9]{20,})"/)?.[1] ||
    html.match(/"browseId":"(UC[-_a-zA-Z0-9]{20,})"/)?.[1] ||
    html.match(/\/channel\/(UC[-_a-zA-Z0-9]{20,})/)?.[1] ||
    ""
  );
}

async function resolveDroppedChannelId(value = "") {
  const directId = channelIdFromDroppedText(value);
  if (directId) return directId;

  const handleUrl = handleUrlFromDroppedText(value);
  const youtubeUrl = handleUrl || youtubeUrlFromDroppedText(value);
  if (!youtubeUrl) return "";

  showInfoPopup(handleUrl ? "Resolving YouTube handle..." : "Resolving video channel...", "info");
  const response = await fetch(youtubeUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`YouTube lookup failed: HTTP ${response.status}`);
  return channelIdFromYoutubeHtml(await response.text());
}

async function addChannelById(channelId, categoryId = activeCategoryId) {
  const cleanId = String(channelId || "").trim();
  const targetCategoryId = isManualCategoryId(categoryId) ? categoryId : "";
  if (!/^UC[-_a-zA-Z0-9]+$/.test(cleanId)) {
    showInfoPopup("Unsupported channel identifier. Drop a YouTube URL that contains /channel/UC...", "error");
    return false;
  }
  if (allChannels.some((channel) => channel.id === cleanId)) {
    if (activeCategoryId && !channelsForActiveCategory().some((channel) => channel.id === cleanId)) {
      activeCategoryId = "";
      renderCategories();
      renderChannels(channelsForActiveCategory());
      renderSidePanelPath();
    }
    highlightChannel(cleanId, "existing");
    showInfoPopup("This channel is already in the shelf.", "info");
    return false;
  }

  try {
    const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(cleanId)}`, {
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const doc = new DOMParser().parseFromString(await response.text(), "application/xml");
    const title = doc.querySelector("feed > title")?.textContent?.trim() || "Untitled channel";
    let channelVideoCount = 0;
    let channelMetadata = { description: "", tags: [] };
    try {
      channelVideoCount = await fetchChannelVideoCount(cleanId);
    } catch {
      // Count is optional; the channel can still be added from RSS.
    }
    try {
      channelMetadata = await fetchChannelMetadata(cleanId);
    } catch {
      // Metadata is optional; the channel can still be added from RSS.
    }
    allChannels.push({
      id: cleanId,
      title,
      thumbnail: "",
      channelVideoCount,
      description: channelMetadata.description || "",
      tags: channelMetadata.tags || [],
      newVideosSeenAt: new Date().toISOString(),
      categories: targetCategoryId ? [targetCategoryId] : []
    });
    allChannels.sort((a, b) => a.title.localeCompare(b.title, "fr"));
    await saveConfig();
    renderCategories();
    renderChannels(channelsForActiveCategory());
    renderSidePanelPath();
    highlightChannel(cleanId, "ok");
    showInfoPopup("Channel added to the shelf.", "ok");
    return true;
  } catch (error) {
    showInfoPopup(`Channel could not be added: ${error.message}`, "error");
    return false;
  }
}

async function addDroppedChannel(value) {
  let channelId = "";
  try {
    channelId = await resolveDroppedChannelId(value);
  } catch (error) {
    showInfoPopup(error.message, "error");
    return;
  }
  if (!channelId) {
    showInfoPopup("This URL is not supported. Drop a YouTube channel URL, @handle URL, or video URL.", "error");
    return;
  }
  await addChannelById(channelId);
}

function extractJsonObjectAfter(text, marker) {
  const markerIndex = text.indexOf(marker);
  if (markerIndex < 0) return null;
  const start = text.indexOf("{", markerIndex + marker.length);
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === "\"") inString = false;
      continue;
    }
    if (char === "\"") inString = true;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }
  return null;
}

function textFromRuns(value) {
  return value?.simpleText || value?.runs?.map((run) => run.text || "").join("") || "";
}

function collectChannelRenderers(node, results = []) {
  if (!node || typeof node !== "object") return results;
  if (node.channelRenderer) results.push(node.channelRenderer);
  for (const value of Object.values(node)) {
    if (value && typeof value === "object") collectChannelRenderers(value, results);
  }
  return results;
}

function channelResultFromRenderer(renderer) {
  const id = renderer.channelId || renderer.navigationEndpoint?.browseEndpoint?.browseId || "";
  if (!/^UC[-_a-zA-Z0-9]+$/.test(id)) return null;
  const title = textFromRuns(renderer.title).trim() || "Untitled channel";
  const handle = textFromRuns(renderer.subscriberCountText).trim() || textFromRuns(renderer.videoCountText).trim();
  const description = textFromRuns(renderer.descriptionSnippet).trim();
  const thumbnails = renderer.thumbnail?.thumbnails || [];
  const thumbnail = thumbnails.at(-1)?.url || thumbnails[0]?.url || "";
  return { id, title, handle, description, thumbnail };
}

async function searchYoutubeChannels(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const url = "https://www.youtube.com/results?search_query=" + encodeURIComponent(trimmed) + "&sp=EgIQAg%253D%253D";
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("HTTP " + response.status);
  const html = await response.text();
  const initialData = extractJsonObjectAfter(html, "ytInitialData") || extractJsonObjectAfter(html, "var ytInitialData =");
  if (!initialData) return [];
  const data = JSON.parse(initialData);
  const seen = new Set();
  return collectChannelRenderers(data)
    .map(channelResultFromRenderer)
    .filter(Boolean)
    .filter((channel) => {
      if (seen.has(channel.id)) return false;
      seen.add(channel.id);
      return true;
    })
    .slice(0, 8);
}

function renderAddChannelResults(results) {
  if (!addChannelResultsEl) return;
  if (!results.length) {
    addChannelResultsEl.textContent = "No channel found.";
    return;
  }
  addChannelResultsEl.replaceChildren(...results.map((channel) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "addChannelResult";
    const avatar = document.createElement("span");
    avatar.className = "addChannelResultAvatar";
    avatar.textContent = channel.title.slice(0, 1).toUpperCase();
    if (channel.thumbnail) {
      const image = document.createElement("img");
      image.alt = "";
      image.src = channel.thumbnail;
      image.addEventListener("error", () => image.remove());
      avatar.append(image);
    }
    const details = document.createElement("span");
    details.className = "addChannelResultDetails";
    const title = document.createElement("strong");
    title.textContent = channel.title;
    const meta = document.createElement("span");
    meta.textContent = channel.handle || channel.id;
    const description = document.createElement("small");
    description.textContent = channel.description;
    details.append(title, meta, description);
    button.append(avatar, details);
    button.addEventListener("click", async () => {
      const added = await addChannelById(channel.id, pendingAddChannelCategoryId || activeCategoryId);
      if (added) closeAddChannelDialog();
    });
    return button;
  }));
}

async function runAddChannelSearch() {
  const query = addChannelSearchInputEl?.value || "";
  if (!addChannelResultsEl) return;
  addChannelResultsEl.textContent = "Searching...";
  try {
    renderAddChannelResults(await searchYoutubeChannels(query));
  } catch (error) {
    addChannelResultsEl.textContent = "Search failed: " + error.message;
  }
}

function openAddChannelDialog(categoryId = activeCategoryId) {
  pendingAddChannelCategoryId = categoryId || "";
  if (!addChannelPromptEl) return;
  addChannelPromptEl.hidden = false;
  if (addChannelResultsEl) addChannelResultsEl.textContent = "";
  addChannelSearchInputEl?.select();
  addChannelSearchInputEl?.focus();
}

function closeAddChannelDialog() {
  if (addChannelPromptEl) addChannelPromptEl.hidden = true;
}

async function addChannel(categoryId = activeCategoryId) {
  openAddChannelDialog(categoryId);
}

function openAddCategoryDialog() {
  categoryBeingRenamed = null;
  if (!addCategoryPromptEl) return;
  const title = addCategoryPromptEl.querySelector("#addCategoryTitle");
  const submit = addCategoryFormEl?.querySelector("button[type='submit']");
  if (title) title.textContent = "Add category";
  if (submit) submit.textContent = "Add";
  addCategoryPromptEl.hidden = false;
  if (addCategoryNameEl) addCategoryNameEl.value = "";
  addCategoryNameEl?.focus();
}

function openRenameCategoryDialog(category) {
  if (!category?.id || !addCategoryPromptEl) return;
  categoryBeingRenamed = category;
  const title = addCategoryPromptEl.querySelector("#addCategoryTitle");
  const submit = addCategoryFormEl?.querySelector("button[type='submit']");
  if (title) title.textContent = "Rename category";
  if (submit) submit.textContent = "Rename";
  addCategoryPromptEl.hidden = false;
  if (addCategoryNameEl) addCategoryNameEl.value = category.name || "";
  addCategoryNameEl?.select();
  addCategoryNameEl?.focus();
}

function closeAddCategoryDialog() {
  if (addCategoryPromptEl) addCategoryPromptEl.hidden = true;
  categoryBeingRenamed = null;
}

async function saveNewCategoryFromDialog() {
  const name = addCategoryNameEl?.value || "";
  if (!name.trim()) return;
  if (categoryBeingRenamed) {
    const trimmed = name.trim();
    const duplicate = allCategories.find((category) => (
      category.id !== categoryBeingRenamed.id
      && category.name.toLocaleLowerCase("fr") === trimmed.toLocaleLowerCase("fr")
    ));
    if (duplicate) {
      showInfoPopup(`Category "${duplicate.name}" already exists.`, "info");
      return;
    }
    categoryBeingRenamed.name = trimmed;
    allCategories = allCategories.map((category) => (
      category.id === categoryBeingRenamed.id ? categoryBeingRenamed : category
    ));
    await saveConfig();
    renderCategories();
    renderChannels(channelsForActiveCategory());
    renderSidePanelPath();
    closeAddCategoryDialog();
    return;
  }
  const category = createCategory(name);
  if (!category) return;
  await saveConfig();
  renderCategories();
  renderChannels(channelsForActiveCategory());
  renderSidePanelPath();
  closeAddCategoryDialog();
}

addChannelEl.addEventListener("click", () => {
  addChannel(activeCategoryId);
});

addCategoryEl.addEventListener("click", openAddCategoryDialog);

applyListLayout();
applyListZoom();
syncPanelVisibilityState({ broadcast: true });
if (globalThis.chrome?.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (changes[STORAGE_KEY]?.newValue) {
      applyExternalConfig(changes[STORAGE_KEY].newValue);
    }
    if (changes[DATA_COMMAND_KEY]?.newValue) {
      handleIncomingDataCommand(changes[DATA_COMMAND_KEY].newValue);
    }
    if (changes[COMMENTS_MODE_KEY] || changes[SUGGESTIONS_MODE_KEY] || changes[FOCUS_PLAYER_MODE_KEY]) {
      syncDisplayOptionsDialog();
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
document.addEventListener("visibilitychange", () => syncPanelVisibilityState({ broadcast: true }));
window.addEventListener("resize", scheduleCategoryOverflowSync);
window.setInterval(() => syncPanelVisibilityState({ broadcast: true }), 1000);
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




