import { newPipeSubscriptionData, newPipeSubscriptionFilename } from "./newpipe-export.js";
import { searchTextMatchesQuery } from "./youtube-channel-search.js";
import { fetchYoutubeChannelVideosPage } from "./youtube-channel-videos.js";
import { createI18n } from "./i18n.js";
import { mergeSynchronizationData, synchronizationContentChanged } from "./sync-merge.js";
import { formatNetworkBytes, installNetworkMeter } from "./network-meter.js";

const networkMeter = installNetworkMeter();
const interfaceI18n = await createI18n(localStorage.getItem("youtubeChannelShelfInterfaceLanguage") || "auto");

const toggleSidebarEl = document.querySelector("#toggleSidebar");
const backEl = document.querySelector("#back");
const forwardEl = document.querySelector("#forward");
const openAppSessionEl = document.querySelector("#openAppSession");
const searchFormEl = document.querySelector("#searchForm");
const searchInputEl = document.querySelector("#searchInput");
const globalSearchResultsEl = document.querySelector("#globalSearchResults");
const networkSnifferEl = document.querySelector("#networkSniffer");
const topOptionsEl = document.querySelector("#topOptions");
const primaryTabEls = [...document.querySelectorAll(".primaryTab[data-section]")];
const sortResultsEl = document.querySelector("#sortResults");
const youtubeThisWeekEl = document.querySelector("#youtubeThisWeek");
const contentToolbarEl = document.querySelector(".contentToolbar");
const addChannelEl = document.querySelector("#addChannel");
const addCategoryEl = document.querySelector("#addCategory");
const sidePanelPathEl = document.querySelector("#sidePanelPath");
const sidePanelVideoPathEl = document.querySelector("#sidePanelVideoPath");
const channelIconModeEl = document.querySelector("#channelIconMode");
const channelZoomOutEl = document.querySelector("#channelZoomOut");
const channelZoomInEl = document.querySelector("#channelZoomIn");
const addListItemEl = document.querySelector("#addListItem");
const channelBackEl = document.querySelector("#channelBack");
const channelForwardEl = document.querySelector("#channelForward");
const channelSearchInputEl = document.querySelector("#channelSearchInput");
const channelShelfControlsEl = document.querySelector("#channelShelfControls");
const resultsToolbarEl = document.querySelector(".resultsToolbar");
const channelListSeparatorEl = document.querySelector("#channelListSeparator");
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
const videoNotePromptEl = document.querySelector("#videoNotePrompt");
const videoNoteTitleEl = document.querySelector("#videoNoteTitle");
const videoNoteVideoTitleEl = document.querySelector("#videoNoteVideoTitle");
const videoNoteTextEl = document.querySelector("#videoNoteText");
const cancelVideoNoteEl = document.querySelector("#cancelVideoNote");
const saveVideoNoteEl = document.querySelector("#saveVideoNote");
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
const exportNewPipeConfigEl = document.querySelector("#exportNewPipeConfig");
const importNativeConfigEl = document.querySelector("#importNativeConfig");
const importFreetubeConfigEl = document.querySelector("#importFreetubeConfig");
const closeImportExportEl = document.querySelector("#closeImportExport");
const appearanceOptionsPromptEl = document.querySelector("#appearanceOptionsPrompt");
const themeOptionEl = document.querySelector("#themeOption");
const splitColumnWidthOptionEl = document.querySelector("#splitColumnWidthOption");
const youtubeTabOptionEl = document.querySelector("#youtubeTabOption");
const hideCommentsOptionEl = document.querySelector("#hideCommentsOption");
const hideSuggestionsOptionEl = document.querySelector("#hideSuggestionsOption");
const closeAppearanceOptionsEl = document.querySelector("#closeAppearanceOptions");
const displayOptionsInactiveEl = document.querySelector("#displayOptionsInactive");
const languageOptionsPromptEl = document.querySelector("#languageOptionsPrompt");
const youtubeTitleLanguageOptionEl = document.querySelector("#youtubeTitleLanguageOption");
const interfaceLanguageOptionEl = document.querySelector("#interfaceLanguageOption");
const closeLanguageOptionsEl = document.querySelector("#closeLanguageOptions");
const openTranslationEditorEl = document.querySelector("#openTranslationEditor");
const translationEditorPromptEl = document.querySelector("#translationEditorPrompt");
const translationEditorLocaleEl = document.querySelector("#translationEditorLocale");
const translationEditorTextEl = document.querySelector("#translationEditorText");
const translationEditorStatusEl = document.querySelector("#translationEditorStatus");
const resetTranslationEditorEl = document.querySelector("#resetTranslationEditor");
const closeTranslationEditorEl = document.querySelector("#closeTranslationEditor");
const saveTranslationEditorEl = document.querySelector("#saveTranslationEditor");
const aboutPromptEl = document.querySelector("#aboutPrompt");
const aboutVersionEl = document.querySelector("#aboutVersion");
const aboutLatestVersionRowEl = document.querySelector("#aboutLatestVersionRow");
const aboutLatestVersionEl = document.querySelector("#aboutLatestVersion");
const aboutDownloadLatestEl = document.querySelector("#aboutDownloadLatest");
const closeAboutEl = document.querySelector("#closeAbout");
const youtubeDataOptionsPromptEl = document.querySelector("#youtubeDataOptionsPrompt");
const feedCheckIntervalOptionEl = document.querySelector("#feedCheckIntervalOption");
const metadataCheckIntervalOptionEl = document.querySelector("#metadataCheckIntervalOption");
const feedCheckConcurrencyOptionEl = document.querySelector("#feedCheckConcurrencyOption");
const closeYoutubeDataOptionsEl = document.querySelector("#closeYoutubeDataOptions");
const webDavSyncPromptEl = document.querySelector("#webDavSyncPrompt");
const webDavUrlEl = document.querySelector("#webDavUrl");
const webDavUsernameEl = document.querySelector("#webDavUsername");
const webDavPasswordEl = document.querySelector("#webDavPassword");
const webDavStatusEl = document.querySelector("#webDavStatus");
const testWebDavEl = document.querySelector("#testWebDav");
const enableWebDavSyncEl = document.querySelector("#enableWebDavSync");
const syncWebDavNowEl = document.querySelector("#syncWebDavNow");
const disconnectWebDavEl = document.querySelector("#disconnectWebDav");
const closeWebDavSyncEl = document.querySelector("#closeWebDavSync");
const addChannelPromptEl = document.querySelector("#addChannelPrompt");
const addChannelSearchFormEl = document.querySelector("#addChannelSearchForm");
const addChannelSearchInputEl = document.querySelector("#addChannelSearchInput");
const addChannelResultsEl = document.querySelector("#addChannelResults");
const closeAddChannelEl = document.querySelector("#closeAddChannel");
const addVideoPromptEl = document.querySelector("#addVideoPrompt");
const addVideoTitleEl = document.querySelector("#addVideoTitle");
const addVideoFormEl = document.querySelector("#addVideoForm");
const addVideoInputEl = document.querySelector("#addVideoInput");
const closeAddVideoEl = document.querySelector("#closeAddVideo");
const addCategoryPromptEl = document.querySelector("#addCategoryPrompt");
const addCategoryFormEl = document.querySelector("#addCategoryForm");
const addCategoryParentFieldEl = document.querySelector("#addCategoryParentField");
const addCategoryParentEl = document.querySelector("#addCategoryParent");
const addCategoryNameEl = document.querySelector("#addCategoryName");
const closeAddCategoryEl = document.querySelector("#closeAddCategory");

let activeVideoId = "";
let activeChannel = null;
let activeSearchQuery = "";
let youtubeSearchQuery = "";
let youtubeSearchResultsQuery = "";
let youtubeSearchResultsCache = [];
let youtubeSearchPendingResults = [];
let youtubeSearchContinuation = "";
let youtubeSearchApiKey = "";
let youtubeSearchClientVersion = "";
let youtubeSearchLocale = { hl: "en", gl: "US" };
let youtubeSearchLoadingMore = false;
let youtubeSearchExhausted = false;
let youtubeSearchLoadObserver = null;
let youtubeSearchInitialQuery = "";
let youtubeSearchInitialPromise = null;
let channelSearchQuery = "";
let config = { version: 1, categories: [], favoriteCategories: [], channels: [], favorites: {}, seenVideos: {}, watchLater: {} };
let allChannels = [];
let allCategories = [];
let favoriteCategories = [];
let activeCategoryId = "";
let activeFavoriteCategoryId = "";
let activeView = "home";
let pendingAddVideoCollection = "";
let activePrimarySection = "youtube";
let currentVideos = [];
let favorites = {};
let seenVideos = {};
let watchLater = {};
let currentWatchLaterVideoId = "";
let pendingAddChannelCategoryId = "";
let channelSearchMetadataRefreshTimer = 0;
let channelSearchMetadataRefreshInFlight = false;
let subscriberSortRefreshInFlight = false;
let savedVideoMetadataRefreshInFlight = false;
let globalSearchTimer = 0;
let globalSearchController = null;
let globalSearchRequestId = 0;
let channelVideoSearchTimer = 0;
let channelVideoSearchController = null;
let channelVideoSearchRequestId = 0;
let channelVideoSearchQueryKey = "";
let channelVideoSearchResults = [];
let channelVideoSearchLoading = false;
let channelVideoSearchError = "";
let channelVideoSearchUsedYoutube = false;
let currentWatchLaterStartedAt = 0;
let lastVideoChannelNavigationAt = 0;
let lastVideoChannelNavigationId = "";
let seenPromptResolve = null;
let videoNoteTarget = null;
let configLoaded = false;
let sessionFeedBaseline = new Map();
let newVideosRefreshPending = false;
let listLayout = localStorage.getItem("listLayout") || "grid";
if (listLayout === "rows" || listLayout === "thumbs") listLayout = "wide";
if (!["wide", "grid", "single"].includes(listLayout)) listLayout = "grid";
const CHANNEL_LIST_MODE_KEY_PREFIX = "channelListMode:";
const CHANNEL_LIST_MODE_SCOPES = ["channels", "category", "channelVideos", "newVideos", "watchLater"];
const VIDEO_LIST_MODE_SCOPES = ["channelVideos", "newVideos", "watchLater"];
const storedChannelListMode = localStorage.getItem("channelListMode");
const fallbackChannelListMode = ["icons", "columns", "single"].includes(storedChannelListMode)
  ? storedChannelListMode
  : localStorage.getItem("channelIconMode") === "true" ? "icons" : "columns";
let channelListMode = fallbackChannelListMode;
let channelListModes = Object.fromEntries(CHANNEL_LIST_MODE_SCOPES.map((scope) => {
  const value = localStorage.getItem(CHANNEL_LIST_MODE_KEY_PREFIX + scope) || fallbackChannelListMode;
  const allowedModes = VIDEO_LIST_MODE_SCOPES.includes(scope)
    ? ["icons", "columns", "single", "titles", "compactTitles"]
    : ["icons", "columns", "single"];
  return [scope, allowedModes.includes(value) ? value : "columns"];
}));
let sidePanelCategoriesExpanded = false;
let categoryAssignChannel = null;
let categoryAssignFavoriteVideoId = "";
const expandedCategoryAssignmentIds = new Set();
let channelAssignCategory = null;
let categoryBeingRenamed = null;
let categoryDialogScope = "channels";
let categoryDialogParentId = "";
let contextMenuEl = null;
let contextSubmenuEl = null;
let confirmDialogResolve = null;
let lastHandledDataCommandAt = 0;
let categoryResizeStartY = 0;
let categoryResizeStartHeight = 0;
let categoryOverflowSyncFrame = 0;
let pendingImportKind = "";
let draggedFavoriteCategoryId = "";
let draggedFavoriteVideoId = "";
const STORAGE_KEY = "youtubeChannelShelfConfig";
const PANEL_OPEN_KEY = "youtubeChannelShelfPanelOpen";
const PANEL_HEARTBEAT_KEY = "youtubeChannelShelfPanelHeartbeat";
const DATA_COMMAND_KEY = "youtubeChannelShelfDataCommand";
const COMMENTS_MODE_KEY = "youtubeChannelShelfHideComments";
const SUGGESTIONS_MODE_KEY = "youtubeChannelShelfHideSuggestions";
const FOCUS_PLAYER_MODE_KEY = "youtubeChannelShelfFocusPlayer";
const CHANNEL_VIDEO_SOURCE_KEY = "youtubeChannelShelfChannelVideoSource";
const FEED_CHECK_INTERVAL_KEY = "youtubeChannelShelfFeedCheckIntervalMinutes";
const METADATA_CHECK_INTERVAL_KEY = "youtubeChannelShelfMetadataCheckIntervalDays";
const FEED_CHECK_CONCURRENCY_KEY = "youtubeChannelShelfFeedCheckConcurrency";
const YOUTUBE_TITLE_LANGUAGE_KEY = "youtubeChannelShelfTitleLanguage";
const INTERFACE_LANGUAGE_KEY = "youtubeChannelShelfInterfaceLanguage";
const TRANSLATION_OVERRIDES_KEY = "youtubeChannelShelfTranslationOverrides";
const LIST_ZOOM_KEY = "youtubeChannelShelfListZoom";
const SPLIT_COLUMN_WIDTH_KEY = "youtubeChannelShelfSplitColumnWidth";
const YOUTUBE_TAB_HOME_KEY = "youtubeChannelShelfYoutubeTabHome";
const CATEGORY_PANEL_HEIGHT_KEY = "youtubeChannelShelfCategoryPanelHeight";
const CATEGORY_ZOOM_KEY = "youtubeChannelShelfCategoryZoom";
const SORT_MODES_KEY = "youtubeChannelShelfSortModes";
const WEBDAV_SYNC_SETTINGS_KEY = "youtubeChannelShelfWebDavSyncSettings";
const WEBDAV_DEFAULT_URL = "";
const WEBDAV_SYNC_WRITE_DELAY_MS = 10000;
const WEBDAV_SYNC_POLL_INTERVAL_MS = 60000;
const WEBDAV_REQUEST_TIMEOUT_MS = 15000;
const LIST_ZOOM_MIN = 0.7;
const LIST_ZOOM_MAX = 1.5;
const LIST_ZOOM_STEP = 0.1;
const CATEGORY_ZOOM_MIN = 0.8;
const CATEGORY_ZOOM_MAX = 1.4;
const CATEGORY_ZOOM_STEP = 0.1;
const SPLIT_COLUMN_DEFAULT_WIDTH = 450;
const SPLIT_COLUMN_MIN_WIDTH = 240;
const SPLIT_COLUMN_MAX_WIDTH = 2000;
const VIDEO_GRID_MIN_COLUMN_WIDTH = 220;
const NEW_VIDEOS_CATEGORY_ID = "__new_videos";
const UNCATEGORIZED_CATEGORY_ID = "__uncategorized";
const FAVORITE_CATEGORY_DRAG_TYPE = "application/x-youtube-shelf-favorite-category";
const FAVORITE_VIDEO_GROUP_DRAG_TYPE = "application/x-youtube-shelf-favorite-video";
const FAVORITE_VIDEO_CATEGORY_DRAG_TYPE = "application/x-youtube-shelf-favorite-videos";
const YOUTUBE_SEARCH_BATCH_SIZE = 20;
const FEED_CHECK_INTERVAL_DEFAULT = 30;
const METADATA_CHECK_INTERVAL_DEFAULT = 7;
const FEED_CHECK_CONCURRENCY_DEFAULT = 4;
const YOUTUBE_REGION_BY_LANGUAGE = {
  ar: "SA", de: "DE", en: "US", es: "ES", fr: "FR", hi: "IN", it: "IT",
  ja: "JP", ko: "KR", nl: "NL", pl: "PL", pt: "BR", ru: "RU", tr: "TR",
  uk: "UA", vi: "VN", zh: "TW"
};
const youtubeOriginalTitleCache = new Map();
const youtubeAutomaticTitleCache = new Map();
const expandedFavoriteVideoGroups = new Set();
const selectedFavoriteVideoIds = new Set();

function storedInteger(key, fallback, minimum, maximum) {
  const parsed = Number.parseInt(localStorage.getItem(key), 10);
  return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback;
}

let feedCheckIntervalMinutes = storedInteger(FEED_CHECK_INTERVAL_KEY, FEED_CHECK_INTERVAL_DEFAULT, 0, 1440);
let metadataCheckIntervalDays = storedInteger(METADATA_CHECK_INTERVAL_KEY, METADATA_CHECK_INTERVAL_DEFAULT, 1, 30);
let feedCheckConcurrency = storedInteger(FEED_CHECK_CONCURRENCY_KEY, FEED_CHECK_CONCURRENCY_DEFAULT, 1, 10);
let splitColumnWidth = Math.min(
  SPLIT_COLUMN_MAX_WIDTH,
  Math.max(SPLIT_COLUMN_MIN_WIDTH, Number.parseInt(localStorage.getItem(SPLIT_COLUMN_WIDTH_KEY), 10) || SPLIT_COLUMN_DEFAULT_WIDTH)
);
let youtubeTitleLanguage = ["auto", "original"].includes(localStorage.getItem(YOUTUBE_TITLE_LANGUAGE_KEY))
  ? localStorage.getItem(YOUTUBE_TITLE_LANGUAGE_KEY)
  : "original";
let interfaceLanguage = ["auto", "en", "fr"].includes(localStorage.getItem(INTERFACE_LANGUAGE_KEY))
  ? localStorage.getItem(INTERFACE_LANGUAGE_KEY)
  : "auto";
let youtubeTabHome = ["this-week", "blank"].includes(localStorage.getItem(YOUTUBE_TAB_HOME_KEY))
  ? localStorage.getItem(YOUTUBE_TAB_HOME_KEY)
  : "this-week";
let translationEditorLoadId = 0;

function uiText(value) {
  return interfaceI18n.translateText(value);
}

function uiMessage(key, substitutions = []) {
  return interfaceI18n.getMessage(key, substitutions);
}

function renderNetworkMeter(state) {
  if (!networkSnifferEl) return;
  const total = formatNetworkBytes(state.totalBytes, false, interfaceI18n.locale);
  networkSnifferEl.classList.toggle("is-active", state.active > 0);
  const summary = uiMessage("networkMeterTooltip", [state.requests, total]);
  networkSnifferEl.setAttribute("aria-label", summary);
  networkSnifferEl.dataset.tooltip = summary;
}

networkMeter.subscribe(renderNetworkMeter);
chrome.runtime?.onMessage?.addListener?.((message) => {
  if (message?.type !== "YOUTUBE_SHELF_THUMBNAIL_NETWORK") return;
  networkMeter.recordExternal(message);
});

function initializeInterfaceLanguage() {
  interfaceI18n.localizeTree(document);
  interfaceI18n.observe(document.body);
}

let sortModes = (() => {
  try {
    return {
      youtube: "default",
      channels: "default",
      channelVideos: "date-desc",
      newVideos: "date-desc",
      watchLater: "date-desc",
      favorites: "date-desc",
      ...JSON.parse(localStorage.getItem(SORT_MODES_KEY) || "{}")
    };
  } catch {
    return { youtube: "default", channels: "default", channelVideos: "date-desc", newVideos: "date-desc", watchLater: "date-desc", favorites: "date-desc" };
  }
})();
const invalidAddedDateSortScopes = Object.entries(sortModes)
  .filter(([scope, mode]) => (scope === "channelVideos" || scope.startsWith("channelVideos:")) && mode === "added-desc")
  .map(([scope]) => scope);
if (invalidAddedDateSortScopes.length) {
  sortModes = Object.fromEntries(Object.entries(sortModes).map(([scope, mode]) => (
    invalidAddedDateSortScopes.includes(scope) ? [scope, "date-desc"] : [scope, mode]
  )));
  localStorage.setItem(SORT_MODES_KEY, JSON.stringify(sortModes));
}

function setActivePrimarySection(section) {
  if (!["youtube", "channels", "watchLater", "favorites"].includes(section)) return;
  activePrimarySection = section;
  if (section !== "channels") document.body.classList.remove("isChannelDropTarget");
  if (section !== "watchLater") document.body.classList.remove("isWatchLaterDropTarget");
  if (section !== "favorites") document.body.classList.remove("isFavoriteDropTarget");
  document.body.classList.toggle("primarySectionYoutube", section === "youtube");
  document.body.classList.toggle("primarySectionChannels", section === "channels");
  document.body.classList.toggle("primarySectionWatchLater", section === "watchLater");
  document.body.classList.toggle("primarySectionFavorites", section === "favorites");
  for (const tab of primaryTabEls) {
    const active = tab.dataset.section === section;
    tab.classList.toggle("is-active", active);
    if (active) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  }
  const placeholders = {
    youtube: "Search YouTube",
    channels: "Search channels",
    watchLater: "Search Watch later",
    favorites: "Search favorites"
  };
  searchInputEl.placeholder = uiText(placeholders[section]);
  searchInputEl.setAttribute("aria-label", uiText(placeholders[section]));
  syncYoutubeThisWeekButton();
  syncAddListItemButton();
  syncSortButton();
}

function currentSortScope() {
  if (activeView === "youtubeHome") return "youtube";
  if (activePrimarySection === "channels" && activeChannel?.id) return `channelVideos:${activeChannel.id}`;
  if (activePrimarySection === "channels" && activeView === "newVideos") return "newVideos";
  return activePrimarySection;
}

function isChannelVideoSortScope(scope) {
  return scope === "channelVideos" || scope.startsWith("channelVideos:");
}

function sortModeForScope(scope) {
  if (Object.prototype.hasOwnProperty.call(sortModes, scope)) return sortModes[scope];
  if (isChannelVideoSortScope(scope)) return sortModes.channelVideos || "date-desc";
  return "default";
}

function sortModeLabel(mode, scope = currentSortScope()) {
  const labels = {
    default: scope === "youtube" ? "sortRelevance" : "sortDefaultOrder",
    "title-asc": "sortTitleAscending",
    "title-desc": "sortTitleDescending",
    "date-desc": scope === "channels" ? "sortLatestVideoFirst" : "sortNewestFirst",
    "date-asc": scope === "channels" ? "sortOldestLatestVideoFirst" : "sortOldestFirst",
    "added-desc": "sortDateAdded",
    "views-desc": "sortMostViewed",
    "views-asc": "sortLeastViewed",
    "subscribers-desc": "sortMostSubscribers",
    "subscribers-asc": "sortLeastSubscribers"
  };
  return uiMessage(labels[mode] || labels.default);
}

function sortOptionsForCurrentScope() {
  const scope = currentSortScope();
  const modes = scope === "channels"
    ? ["default", "title-asc", "title-desc", "date-desc", "date-asc", "subscribers-desc", "subscribers-asc"]
    : isChannelVideoSortScope(scope) && activeChannel
      ? ["default", "title-asc", "title-desc", "date-desc", "date-asc", "views-desc", "views-asc"]
      : scope === "favorites" || scope === "watchLater"
        ? ["default", "added-desc", "title-asc", "title-desc", "date-desc", "date-asc", "views-desc", "views-asc"]
        : ["default", "title-asc", "title-desc", "date-desc", "date-asc", "views-desc", "views-asc"];
  return modes.map((mode) => ({
    label: sortModeLabel(mode, scope),
    highlighted: sortModeForScope(scope) === mode,
    action: () => setSortMode(scope, mode)
  }));
}

function syncSortButton() {
  if (!sortResultsEl) return;
  const scope = currentSortScope();
  const mode = sortModeForScope(scope);
  const label = uiMessage("sortBy", [sortModeLabel(mode, scope)]);
  sortResultsEl.title = label;
  sortResultsEl.setAttribute("aria-label", label);
  sortResultsEl.classList.toggle("is-active", mode !== "default");
}

function setSortMode(scope, mode) {
  const previousMode = sortModeForScope(scope);
  sortModes = { ...sortModes, [scope]: mode };
  localStorage.setItem(SORT_MODES_KEY, JSON.stringify(sortModes));
  syncSortButton();
  const channelYoutubeOrderChanged = isChannelVideoSortScope(scope)
    && Boolean(activeChannel)
    && youtubeOrderForChannelMode(previousMode) !== youtubeOrderForChannelMode(mode);
  if (channelYoutubeOrderChanged) {
    const youtubeOrder = youtubeOrderForChannelMode(mode);
    if (youtubeOrder) loadChannelVideosForYoutubeOrder(youtubeOrder).catch(() => {});
    else loadFeed().catch(() => {});
  }
  else refreshSortedView();
  if (scope === "channels" && mode.startsWith("subscribers-")) {
    refreshMissingSubscriberCounts().catch(() => {});
  }
}

function relativeDateValue(value = "") {
  const text = String(value || "").trim().toLocaleLowerCase();
  if (!text) return null;
  const absolute = Date.parse(text);
  if (Number.isFinite(absolute)) return absolute;
  const match = text.match(/(\d+(?:[.,]\d+)?)\s+(second|minute|hour|day|week|month|year|seconde|heure|jour|semaine|mois|an|année)s?/u);
  if (!match) return null;
  const amount = Number(match[1].replace(",", "."));
  const unit = match[2];
  const day = 24 * 60 * 60 * 1000;
  const multipliers = {
    second: 1000, seconde: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000, heure: 60 * 60 * 1000,
    day, jour: day,
    week: 7 * day, semaine: 7 * day,
    month: 30 * day, mois: 30 * day,
    year: 365 * day, an: 365 * day, année: 365 * day
  };
  return Date.now() - amount * multipliers[unit];
}

function compareOptionalNumbers(left, right, direction = "desc") {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return direction === "asc" ? left - right : right - left;
}

function compareTitles(left, right, direction = "asc") {
  const comparison = String(left?.title || left?.name || "").localeCompare(String(right?.title || right?.name || ""), undefined, {
    numeric: true,
    sensitivity: "base"
  });
  return direction === "desc" ? -comparison : comparison;
}

function keepFavoriteVideoGroupsTogether(videos) {
  if (activePrimarySection !== "favorites") return videos;
  const grouped = new Map();
  for (const video of videos) {
    if (!video.videoGroupId || Number(video.videoGroupSize || 0) < 2) continue;
    if (!grouped.has(video.videoGroupId)) grouped.set(video.videoGroupId, []);
    grouped.get(video.videoGroupId).push(video);
  }
  for (const members of grouped.values()) {
    members.sort((left, right) => Number(left.videoGroupOrder || 0) - Number(right.videoGroupOrder || 0));
  }

  const result = [];
  const renderedGroups = new Set();
  for (const video of videos) {
    const members = grouped.get(video.videoGroupId);
    if (!members) {
      result.push(video);
      continue;
    }
    if (renderedGroups.has(video.videoGroupId)) continue;
    renderedGroups.add(video.videoGroupId);
    result.push(...members);
  }
  return result;
}

function sortVideosForDisplay(videos) {
  const mode = sortModeForScope(currentSortScope());
  const sorted = [...videos];
  if (mode.startsWith("title-")) {
    sorted.sort((left, right) => compareTitles(left, right, mode.endsWith("desc") ? "desc" : "asc"));
  } else if (mode === "added-desc" && !(activeChannel && channelVideosLoadedSort === "latest")) {
    sorted.sort((left, right) => compareOptionalNumbers(
      relativeDateValue(left.savedAt || left.published || left.publishedText),
      relativeDateValue(right.savedAt || right.published || right.publishedText),
      "desc"
    ) || compareTitles(left, right));
  } else if (mode.startsWith("date-")) {
    sorted.sort((left, right) => compareOptionalNumbers(
      relativeDateValue(left.published || left.publishedText),
      relativeDateValue(right.published || right.publishedText),
      mode.endsWith("asc") ? "asc" : "desc"
    ) || compareTitles(left, right));
  } else if (
    mode.startsWith("views-")
    && !(mode === "views-desc" && activeChannel && channelVideosLoadedSort === "popular")
  ) {
    sorted.sort((left, right) => compareOptionalNumbers(
      metricCountValue(left.views || left.viewCountText),
      metricCountValue(right.views || right.viewCountText),
      mode.endsWith("asc") ? "asc" : "desc"
    ) || compareTitles(left, right));
  }
  return keepFavoriteVideoGroupsTogether(sorted);
}

function sortChannelsForDisplay(channels) {
  const mode = sortModes.channels || "default";
  const sorted = [...channels];
  if (mode === "default") return sorted;
  if (mode.startsWith("title-")) return sorted.sort((left, right) => compareTitles(left, right, mode.endsWith("desc") ? "desc" : "asc"));
  if (mode.startsWith("date-")) {
    return sorted.sort((left, right) => compareOptionalNumbers(
      relativeDateValue(left.feedLatestPublished),
      relativeDateValue(right.feedLatestPublished),
      mode.endsWith("asc") ? "asc" : "desc"
    ) || compareTitles(left, right));
  }
  if (mode.startsWith("subscribers-")) {
    return sorted.sort((left, right) => compareOptionalNumbers(
      Number.isFinite(left.subscriberCount) ? left.subscriberCount : metricCountValue(left.subscriberCountText),
      Number.isFinite(right.subscriberCount) ? right.subscriberCount : metricCountValue(right.subscriberCountText),
      mode.endsWith("asc") ? "asc" : "desc"
    ) || compareTitles(left, right));
  }
  return sorted;
}

function refreshSortedView() {
  if (activePrimarySection === "youtube") {
    if (activeView === "search" && youtubeSearchResultsQuery) renderYoutubeSearchResults();
    else if (activeView === "youtubeHome") renderNewVideos();
    return;
  }
  if (activePrimarySection === "favorites") {
    renderFavoritesHome();
    return;
  }
  if (activePrimarySection === "watchLater") {
    renderWatchLater();
    return;
  }
  if (activeView === "newVideos") renderNewVideos();
  else if (activeChannel) {
    if (channelSearchQuery.trim()) renderSearchedVideos();
    else renderChannelVideos(currentVideos);
  } else renderChannels(channelsForActiveCategory());
}

async function refreshMissingSubscriberCounts() {
  if (subscriberSortRefreshInFlight) return;
  const candidates = allChannels.filter((channel) => (
    channel?.id
    && !Number.isFinite(channel.subscriberCount)
    && metricCountValue(channel.subscriberCountText) === null
  ));
  if (!candidates.length) return;

  subscriberSortRefreshInFlight = true;
  setStatus(`Loading subscriber counts for ${candidates.length} channel${candidates.length === 1 ? "" : "s"}…`);
  let updatedCount = 0;
  let nextIndex = 0;
  const workerCount = Math.min(6, candidates.length);

  async function updateNextChannel() {
    while (nextIndex < candidates.length) {
      const channel = candidates[nextIndex++];
      try {
        const subscriber = await fetchChannelSubscriberCount(channel.id);
        if (!Number.isFinite(subscriber.subscriberCount)) continue;
        allChannels = allChannels.map((item) => item.id === channel.id ? { ...item, ...subscriber } : item);
        updatedCount += 1;
      } catch {
        // Keep channels without a public subscriber count at the end of the list.
      }
    }
  }

  try {
    await Promise.all(Array.from({ length: workerCount }, updateNextChannel));
    if (updatedCount) await saveConfig();
    if (activePrimarySection === "channels" && !activeChannel) {
      renderChannels(channelsForActiveCategory());
    }
    setStatus(updatedCount
      ? `Subscriber counts updated for ${updatedCount} channel${updatedCount === 1 ? "" : "s"}.`
      : "No public subscriber counts found.", !updatedCount);
  } finally {
    subscriberSortRefreshInFlight = false;
  }
}
const storedChannelVideoSource = localStorage.getItem(CHANNEL_VIDEO_SOURCE_KEY);
let channelVideoSource = ["hybrid", "innertube", "rss"].includes(storedChannelVideoSource) ? storedChannelVideoSource : "hybrid";
let channelVideosContinuation = "";
let channelVideosLoadingMore = false;
let channelVideosInnertubeFailed = false;
let channelVideosLoadedSort = "latest";
let channelVideoLoadRequestId = 0;
let listZoom = Number(localStorage.getItem(LIST_ZOOM_KEY)) || 1;
let categoryPanelHeight = Number(localStorage.getItem(CATEGORY_PANEL_HEIGHT_KEY)) || 90;
let categoryZoom = Number(localStorage.getItem(CATEGORY_ZOOM_KEY)) || 1;
let webDavSyncSettings = null;
let webDavSyncWriteTimer = 0;
let webDavSyncInProgress = false;
let webDavSyncIgnoreUpdatedAt = "";

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
  if (activeView === "newVideos" || activeView === "youtubeHome") return uiMessage("thisWeek");
  if (activeView === "favorites") {
    if (activeFavoriteCategoryId === UNCATEGORIZED_CATEGORY_ID) return uiMessage("uncategorized");
    if (!activeFavoriteCategoryId) return "";
    return favoriteCategories.find((category) => category.id === activeFavoriteCategoryId)?.name || "";
  }
  if (activeCategoryId === UNCATEGORIZED_CATEGORY_ID) return uiMessage("uncategorized");
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
    if (!element.draggable) event.preventDefault();
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
  if (options.ancestorActive) button.classList.add("is-ancestor-active");
  if (options.loading) button.classList.add("is-loading");
  if (options.countText) button.classList.add("has-count");
  button.type = "button";
  button.dataset.label = text;
  button.setAttribute("aria-label", text);
  if (options.countText) {
    const label = document.createElement("span");
    label.className = "newVideosLabelText";
    label.textContent = uiMessage("thisWeek");
    const count = document.createElement("span");
    count.className = "newVideosCount";
    count.textContent = options.countText;
    button.append(label, count);
  }
  preventMouseFocus(button);
  button.addEventListener("click", onClick);
  if (options.dropCategoryId) attachCategoryDropTarget(button, options.dropCategoryId);
  if (Object.prototype.hasOwnProperty.call(options, "dropFavoriteCategoryId")) {
    attachFavoriteCategoryDropTarget(button, options.dropFavoriteCategoryId);
  }
  if (options.reorderFavoriteCategoryId) {
    attachFavoriteCategoryReorder(button, options.reorderFavoriteCategoryId);
  }
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
  const overflowContainer = categoryOverflowContainer();
  const nextHeight = Math.max(52, overflowContainer.scrollHeight);
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
  row.append(makeCategoryZoomButton(-1), makeCategoryZoomButton(1), makeCategoryAddButton());
  container.append(row);
  syncCategoryZoomButtons();
}

function makeCategoryAddButton() {
  const button = document.createElement("button");
  button.className = "pathSettingsButton pathCategoryAddButton";
  button.type = "button";
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  const label = "Add category or subcategory";
  button.title = label;
  button.setAttribute("aria-label", label);
  preventMouseFocus(button);
  button.addEventListener("click", () => {
    const scope = activePrimarySection === "favorites" ? "favorites" : "channels";
    const sourceCategories = scope === "favorites" ? favoriteCategories : allCategories;
    const activeId = scope === "favorites" ? activeFavoriteCategoryId : activeCategoryId;
    const activeCategory = sourceCategories.find((category) => category.id === activeId);
    const parentId = activeCategory?.parentId || activeCategory?.id || "";
    openAddCategoryDialog(scope, parentId);
  });
  return button;
}

function makeCategoryZoomButton(direction) {
  const button = document.createElement("button");
  const isZoomIn = direction > 0;
  button.className = `pathSettingsButton pathCategoryZoomButton ${isZoomIn ? "pathCategoryZoomIn" : "pathCategoryZoomOut"}`;
  button.type = "button";
  const label = isZoomIn ? "Zoom in categories" : "Zoom out categories";
  button.title = label;
  button.setAttribute("aria-label", label);
  button.innerHTML = isZoomIn
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m14.5 14.5 5 5M7 10h6M10 7v6"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m14.5 14.5 5 5M7 10h6"/></svg>';
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
  if (key === FOCUS_PLAYER_MODE_KEY) {
    document.querySelectorAll(".pathFocusButton").forEach((button) => button.classList.toggle("is-active", checked));
  }
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
  const buttons = document.querySelectorAll(".pathFocusButton");
  if (!buttons.length) return;
  const active = isExtensionPanelActive();
  buttons.forEach((button) => button.toggleAttribute("disabled", !active));
  if (!globalThis.chrome?.storage?.local) return;
  chrome.storage.local.get(FOCUS_PLAYER_MODE_KEY, (result) => {
    buttons.forEach((button) => button.classList.toggle("is-active", Boolean(result[FOCUS_PLAYER_MODE_KEY])));
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

function syncAppearanceOptionsDialog() {
  if (themeOptionEl) themeOptionEl.value = globalThis.youtubeShelfTheme?.preference || "auto";
  if (splitColumnWidthOptionEl) splitColumnWidthOptionEl.value = String(splitColumnWidth);
  if (youtubeTabOptionEl) youtubeTabOptionEl.value = youtubeTabHome;
  syncDisplayOptionsDialog();
}

function openAppearanceOptionsDialog() {
  if (!appearanceOptionsPromptEl) return;
  syncAppearanceOptionsDialog();
  appearanceOptionsPromptEl.hidden = false;
  themeOptionEl?.focus();
}

function closeAppearanceOptionsDialog() {
  if (appearanceOptionsPromptEl) appearanceOptionsPromptEl.hidden = true;
}

function syncLanguageOptionsDialog() {
  if (youtubeTitleLanguageOptionEl) youtubeTitleLanguageOptionEl.value = youtubeTitleLanguage;
  if (interfaceLanguageOptionEl) interfaceLanguageOptionEl.value = interfaceLanguage;
}

function openLanguageOptionsDialog() {
  if (!languageOptionsPromptEl) return;
  syncLanguageOptionsDialog();
  languageOptionsPromptEl.hidden = false;
  youtubeTitleLanguageOptionEl?.focus();
}

function closeLanguageOptionsDialog() {
  if (languageOptionsPromptEl) languageOptionsPromptEl.hidden = true;
}

function readTranslationOverrides() {
  try {
    const value = JSON.parse(localStorage.getItem(TRANSLATION_OVERRIDES_KEY) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function setTranslationEditorStatus(message = "", isError = false) {
  if (!translationEditorStatusEl) return;
  translationEditorStatusEl.textContent = message;
  translationEditorStatusEl.classList.toggle("is-error", isError);
}

async function packagedTranslationCatalog(locale) {
  const response = await fetch(chrome.runtime.getURL(`_locales/${locale}/messages.json`));
  if (!response.ok) throw new Error("Translation catalog could not be loaded");
  return response.json();
}

async function loadTranslationEditorCatalog() {
  if (!translationEditorLocaleEl || !translationEditorTextEl) return;
  const locale = translationEditorLocaleEl.value;
  const requestId = ++translationEditorLoadId;
  translationEditorTextEl.disabled = true;
  setTranslationEditorStatus("");
  try {
    const packaged = await packagedTranslationCatalog(locale);
    if (requestId !== translationEditorLoadId) return;
    const overrides = readTranslationOverrides();
    translationEditorTextEl.value = JSON.stringify(overrides[locale] || packaged, null, 2);
    translationEditorTextEl.disabled = false;
    translationEditorTextEl.focus();
  } catch {
    if (requestId !== translationEditorLoadId) return;
    translationEditorTextEl.disabled = false;
    translationEditorTextEl.value = "";
    setTranslationEditorStatus(uiMessage("translationLoadFailed"), true);
  }
}

function openTranslationEditorDialog() {
  if (!translationEditorPromptEl || !translationEditorLocaleEl) return;
  closeLanguageOptionsDialog();
  translationEditorLocaleEl.value = interfaceI18n.locale;
  translationEditorPromptEl.hidden = false;
  loadTranslationEditorCatalog();
}

function closeTranslationEditorDialog() {
  if (translationEditorPromptEl) translationEditorPromptEl.hidden = true;
  openLanguageOptionsDialog();
}

function validateTranslationCatalog(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) || !Object.keys(value).length) {
    throw new Error("empty catalog");
  }
  for (const [key, entry] of Object.entries(value)) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry) || typeof entry.message !== "string") {
      throw new Error(key);
    }
  }
  return value;
}

function saveTranslationEditor() {
  if (!translationEditorLocaleEl || !translationEditorTextEl) return;
  try {
    const catalog = validateTranslationCatalog(JSON.parse(translationEditorTextEl.value));
    const overrides = readTranslationOverrides();
    overrides[translationEditorLocaleEl.value] = catalog;
    localStorage.setItem(TRANSLATION_OVERRIDES_KEY, JSON.stringify(overrides));
    window.location.reload();
  } catch (error) {
    setTranslationEditorStatus(uiMessage("invalidTranslationFile", [error.message]), true);
  }
}

function resetTranslationEditor() {
  if (!translationEditorLocaleEl) return;
  const overrides = readTranslationOverrides();
  delete overrides[translationEditorLocaleEl.value];
  localStorage.setItem(TRANSLATION_OVERRIDES_KEY, JSON.stringify(overrides));
  window.location.reload();
}

function setYoutubeTitleLanguage(value) {
  if (!["auto", "original"].includes(value) || value === youtubeTitleLanguage) return;
  youtubeTitleLanguage = value;
  localStorage.setItem(YOUTUBE_TITLE_LANGUAGE_KEY, youtubeTitleLanguage);
  youtubeOriginalTitleCache.clear();
  youtubeAutomaticTitleCache.clear();
  window.location.reload();
}

function setInterfaceLanguage(value) {
  if (!["auto", "en", "fr"].includes(value) || value === interfaceLanguage) return;
  interfaceLanguage = value;
  localStorage.setItem(INTERFACE_LANGUAGE_KEY, interfaceLanguage);
  window.location.reload();
}

function compareVersionNumbers(left, right) {
  const leftParts = String(left || "").replace(/^v/i, "").split(".").map((part) => Number.parseInt(part, 10) || 0);
  const rightParts = String(right || "").replace(/^v/i, "").split(".").map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (leftParts[index] || 0) - (rightParts[index] || 0);
    if (difference) return Math.sign(difference);
  }
  return 0;
}

async function refreshAboutLatestVersion() {
  if (!aboutLatestVersionEl) return;
  const currentVersion = globalThis.chrome?.runtime?.getManifest?.().version || "3.3.10";
  if (aboutVersionEl) aboutVersionEl.textContent = currentVersion;
  if (aboutLatestVersionRowEl) aboutLatestVersionRowEl.hidden = false;
  if (aboutDownloadLatestEl) aboutDownloadLatestEl.hidden = true;
  aboutLatestVersionEl.textContent = uiMessage("checkingLatestVersion");
  try {
    const [manifestResponse, commitsResponse] = await Promise.all([
      fetch("https://api.github.com/repos/nicklausFR/youtube-shelf/contents/manifest.json?ref=main", {
        cache: "no-store",
        headers: { Accept: "application/vnd.github.raw+json" }
      }),
      fetch("https://api.github.com/repos/nicklausFR/youtube-shelf/commits?sha=main&path=manifest.json&per_page=1", {
        cache: "no-store",
        headers: { Accept: "application/vnd.github+json" }
      })
    ]);
    if (!manifestResponse.ok || !commitsResponse.ok) throw new Error("GitHub request failed");
    const latestManifest = await manifestResponse.json();
    const commits = await commitsResponse.json();
    const latestVersion = String(latestManifest?.version || "").trim();
    const versionDate = commits?.[0]?.commit?.committer?.date || commits?.[0]?.commit?.author?.date || "";
    if (!latestVersion) throw new Error("Missing version");
    const formattedVersionDate = versionDate
      ? new Intl.DateTimeFormat(interfaceI18n.locale, { dateStyle: "long" }).format(new Date(versionDate))
      : "";
    if (compareVersionNumbers(latestVersion, currentVersion) <= 0) {
      if (aboutVersionEl) aboutVersionEl.textContent = uiMessage("versionUpToDate", [currentVersion]);
      if (aboutLatestVersionRowEl) aboutLatestVersionRowEl.hidden = true;
    } else {
      aboutLatestVersionEl.textContent = formattedVersionDate
        ? `${latestVersion} — ${formattedVersionDate}`
        : latestVersion;
      if (aboutDownloadLatestEl) aboutDownloadLatestEl.hidden = false;
    }
  } catch {
    aboutLatestVersionEl.textContent = uiMessage("latestVersionUnavailable");
  }
}

function openAboutDialog() {
  if (!aboutPromptEl) return;
  if (aboutVersionEl) aboutVersionEl.textContent = globalThis.chrome?.runtime?.getManifest?.().version || "3.3.10";
  aboutPromptEl.hidden = false;
  refreshAboutLatestVersion();
  closeAboutEl?.focus();
}

function closeAboutDialog() {
  if (aboutPromptEl) aboutPromptEl.hidden = true;
}

function randomSyncId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function readWebDavSyncSettings() {
  if (!globalThis.chrome?.storage?.local) return Promise.resolve(null);
  return new Promise((resolve) => {
    chrome.storage.local.get(WEBDAV_SYNC_SETTINGS_KEY, (result) => resolve(result[WEBDAV_SYNC_SETTINGS_KEY] || null));
  });
}

function writeWebDavSyncSettings(value) {
  webDavSyncSettings = value;
  if (!globalThis.chrome?.storage?.local) return Promise.resolve();
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [WEBDAV_SYNC_SETTINGS_KEY]: value }, () => {
      const error = chrome.runtime?.lastError;
      if (error) reject(new Error(error.message));
      else resolve();
    });
  });
}

async function configChecksum(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function synchronizableConfig(value = {}) {
  const channels = Array.isArray(value.channels) ? value.channels.map((channel) => {
    const {
      feedVideos: _feedVideos,
      feedVideoCount: _feedVideoCount,
      feedLatestPublished: _feedLatestPublished,
      feedLatestTitle: _feedLatestTitle,
      feedCheckedAt: _feedCheckedAt,
      channelVideoCount: _channelVideoCount,
      ...content
    } = channel || {};
    return content;
  }) : [];
  const seenVideos = Object.fromEntries(Object.entries(value.seenVideos || {}).map(([videoId, item]) => {
    if (!item || typeof item !== "object") return [videoId, Boolean(item)];
    return [videoId, {
      ...(item.savedAt ? { savedAt: item.savedAt } : {}),
      ...(item.seenAt ? { seenAt: item.seenAt } : {}),
      ...(item.channelId ? { channelId: item.channelId } : {}),
      ...(item.title ? { title: item.title } : {})
    }];
  }));
  return {
    version: 1,
    categories: Array.isArray(value.categories) ? value.categories : [],
    favoriteCategories: Array.isArray(value.favoriteCategories) ? value.favoriteCategories : [],
    channels,
    favorites: value.favorites && typeof value.favorites === "object" ? value.favorites : {},
    seenVideos,
    watchLater: value.watchLater && typeof value.watchLater === "object" ? value.watchLater : {},
    updatedAt: value.updatedAt || ""
  };
}

function setWebDavStatus(message, error = false) {
  if (!webDavStatusEl) return;
  webDavStatusEl.textContent = message;
  webDavStatusEl.style.color = error ? "var(--danger)" : "";
}

function webDavSettingsFromFields() {
  const url = String(webDavUrlEl?.value || "").trim();
  const username = String(webDavUsernameEl?.value || "").trim();
  const password = String(webDavPasswordEl?.value || "");
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("Enter a valid WebDAV file URL");
  }
  if (parsedUrl.protocol !== "https:") throw new Error("The WebDAV URL must use HTTPS");
  if (!username) throw new Error("Enter the Nextcloud username");
  if (!password) throw new Error("Enter an application password");
  return { url: parsedUrl.toString(), username, password };
}

function webDavAuthorization(settings = webDavSyncSettings) {
  const bytes = new TextEncoder().encode(`${settings.username}:${settings.password}`);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `Basic ${btoa(binary)}`;
}

function webDavOriginPermission(settings) {
  return { origins: [`${new URL(settings.url).origin}/*`] };
}

async function ensureWebDavHostPermission(settings, requestPermission = false) {
  if (!globalThis.chrome?.permissions) return true;
  const permission = webDavOriginPermission(settings);
  if (requestPermission) return chrome.permissions.request(permission);
  return chrome.permissions.contains(permission);
}

async function webDavFetch(url, options = {}, settings = webDavSyncSettings) {
  if (!settings?.username || !settings?.password) throw new Error("WebDAV credentials are not configured");
  if (!await ensureWebDavHostPermission(settings)) throw new Error("Server access permission is required");
  const method = options.method || "GET";
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), WEBDAV_REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      cache: "no-store",
      credentials: "omit",
      ...options,
      signal: controller.signal,
      headers: {
        Authorization: webDavAuthorization(settings),
        "Cache-Control": "no-cache",
        ...(options.headers || {})
      }
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = new Error(`The WebDAV ${method} request did not respond within 15 seconds`);
      timeoutError.code = "WEBDAV_TIMEOUT";
      timeoutError.method = method;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function webDavError(response, fallback = "WebDAV request failed") {
  let detail = "";
  try {
    const body = await response.text();
    if (body) {
      const documentNode = new DOMParser().parseFromString(body, "application/xml");
      const messageNode = [...documentNode.querySelectorAll("*")].find((node) => node.localName === "message");
      detail = String(messageNode?.textContent || "").trim().replace(/\s+/g, " ").slice(0, 240);
    }
  } catch {
    // Some proxies return an empty or non-readable error response.
  }
  const suffix = detail ? ` ${detail}` : "";
  if (response.status === 401) return new Error(`Authentication failed. Check the username and application password.${suffix}`);
  if (response.status === 403) return new Error(`Nextcloud denied access to this location.${suffix}`);
  if (response.status === 404) return new Error(`The WebDAV folder was not found.${suffix}`);
  return new Error(`${fallback} (HTTP ${response.status}).${suffix}`);
}

async function testWebDavConnection(settings, options = {}) {
  if (!await ensureWebDavHostPermission(settings, options.requestPermission)) {
    throw new Error("Server access permission was not granted");
  }
  const folderUrl = new URL(".", settings.url).toString();
  const response = await webDavFetch(folderUrl, {
    method: "PROPFIND",
    headers: { Depth: "0" }
  }, settings);
  if (!response.ok && response.status !== 207) throw await webDavError(response, "Unable to access the WebDAV folder");
  return true;
}

function refreshWebDavDialog() {
  const enabled = Boolean(webDavSyncSettings?.enabled && webDavSyncSettings?.password);
  testWebDavEl?.toggleAttribute("disabled", webDavSyncInProgress);
  enableWebDavSyncEl?.toggleAttribute("disabled", webDavSyncInProgress);
  syncWebDavNowEl?.toggleAttribute("disabled", !enabled || webDavSyncInProgress);
  disconnectWebDavEl?.toggleAttribute("disabled", !enabled || webDavSyncInProgress);
}

function populateWebDavDialog() {
  const settings = webDavSyncSettings || {};
  if (webDavUrlEl) webDavUrlEl.value = settings.url || WEBDAV_DEFAULT_URL;
  if (webDavUsernameEl) webDavUsernameEl.value = settings.username || "";
  if (webDavPasswordEl) webDavPasswordEl.value = settings.password || "";
  setWebDavStatus(settings.enabled ? "Enabled" : "Not configured");
  refreshWebDavDialog();
}

function openWebDavSyncDialog() {
  if (!webDavSyncPromptEl) return;
  populateWebDavDialog();
  webDavSyncPromptEl.hidden = false;
  webDavUrlEl?.focus();
}

function closeWebDavSyncDialog() {
  if (webDavSyncPromptEl) webDavSyncPromptEl.hidden = true;
}

async function readSynchronizationEnvelope(settings = webDavSyncSettings) {
  const response = await webDavFetch(settings.url, { method: "GET" }, settings);
  if (response.status === 404) return { envelope: null, etag: "", lastModified: "", exists: false };
  if (!response.ok) throw await webDavError(response, "Unable to read the synchronization file");
  const parsed = await response.json();
  if (!parsed || parsed.formatVersion !== 1 || !parsed.current?.data || !Array.isArray(parsed.current.data.channels)) {
    throw new Error("The WebDAV synchronization file is invalid");
  }
  const synchronizedData = synchronizableConfig(parsed.current.data);
  const normalizedCurrent = {
    ...parsed.current,
    data: synchronizedData,
    checksum: await configChecksum(synchronizedData)
  };
  return {
    envelope: { ...parsed, current: normalizedCurrent },
    etag: response.headers.get("ETag") || "",
    lastModified: response.headers.get("Last-Modified") || "",
    exists: true,
    requiresCompaction: JSON.stringify(parsed.current.data) !== JSON.stringify(synchronizedData)
  };
}

function webDavConflictError() {
  const error = new Error("The remote file changed during synchronization");
  error.code = "WEBDAV_CONFLICT";
  return error;
}

function sameSynchronizationSnapshot(left, right) {
  if (!left || !right) return left === right;
  const leftChangeId = String(left.changeId || "");
  const rightChangeId = String(right.changeId || "");
  if ((leftChangeId || rightChangeId) && leftChangeId !== rightChangeId) return false;
  return Number(left.revision || 0) === Number(right.revision || 0)
    && String(left.checksum || "") === String(right.checksum || "")
    && String(left.updatedAt || "") === String(right.updatedAt || "");
}

async function writeSynchronizationEnvelope(envelope, options = {}, settings = webDavSyncSettings) {
  const { exists = false } = options;
  // A number of WebDAV gateways reject conditional PUT requests even when the
  // resource has not changed. Verify the remote state immediately before the
  // write instead, then send a plain PUT that these servers accept.
  const verification = await readSynchronizationEnvelope(settings);
  if (verification.exists !== exists
    || (exists
      && !sameSynchronizationSnapshot(options.envelope?.current, verification.envelope?.current))) {
    throw webDavConflictError();
  }
  let response;
  try {
    response = await webDavFetch(settings.url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(envelope)
    }, settings);
  } catch (error) {
    if (error?.code !== "WEBDAV_TIMEOUT" || error.method !== "PUT") throw error;
    setWebDavStatus("Write response delayed - verifying remote file...");
    await new Promise((resolve) => window.setTimeout(resolve, 1200));
    try {
      const verification = await readSynchronizationEnvelope(settings);
      if (verification.envelope?.current?.changeId === envelope.current?.changeId) {
        return verification.etag;
      }
    } catch {
      // Preserve the original PUT timeout when verification is inconclusive.
    }
    throw error;
  }
  if (response.status === 412) {
    throw webDavConflictError();
  }
  if (!response.ok && response.status !== 201 && response.status !== 204) {
    throw await webDavError(response, "Unable to write the synchronization file");
  }
  return response.headers.get("ETag") || "";
}

function synchronizationHistory(envelope, nextSnapshot) {
  const candidates = [envelope?.current, ...(Array.isArray(envelope?.history) ? envelope.history : [])].filter(Boolean);
  const seen = new Set([nextSnapshot.changeId, nextSnapshot.checksum].filter(Boolean));
  const history = [];
  for (const snapshot of candidates) {
    const identity = snapshot.changeId || snapshot.checksum;
    if (!identity || seen.has(identity)) continue;
    seen.add(identity);
    history.push(snapshot);
    if (history.length >= 5) break;
  }
  return history;
}

async function applySynchronizedConfig(snapshot, etag = "") {
  const synchronizedData = synchronizableConfig({
    ...snapshot.data,
    updatedAt: snapshot.updatedAt || snapshot.data.updatedAt
  });
  const localChannels = new Map((config.channels || []).map((channel) => [channel.id, channel]));
  const channels = synchronizedData.channels.map((channel) => {
    const local = localChannels.get(channel.id) || {};
    return {
      ...channel,
      ...(local.feedVideos ? { feedVideos: local.feedVideos } : {}),
      ...(local.feedVideoCount !== undefined ? { feedVideoCount: local.feedVideoCount } : {}),
      ...(local.feedLatestPublished ? { feedLatestPublished: local.feedLatestPublished } : {}),
      ...(local.feedLatestTitle ? { feedLatestTitle: local.feedLatestTitle } : {}),
      ...(local.feedCheckedAt ? { feedCheckedAt: local.feedCheckedAt } : {}),
      ...(local.channelVideoCount !== undefined ? { channelVideoCount: local.channelVideoCount } : {})
    };
  });
  const nextConfig = { ...config, ...synchronizedData, channels };
  webDavSyncIgnoreUpdatedAt = nextConfig.updatedAt || "";
  await writeWebDavSyncSettings({
    ...webDavSyncSettings,
    revision: Number(snapshot.revision || 0),
    changeId: snapshot.changeId || "",
    parentChangeId: snapshot.parentChangeId || "",
    updatedAt: snapshot.updatedAt || nextConfig.updatedAt,
    updatedBy: snapshot.updatedBy || "",
    checksum: await configChecksum(synchronizedData),
    baseData: synchronizedData,
    etag
  });
  applyExternalConfig(nextConfig);
  await writeStoredConfig(nextConfig);
}

async function synchronizeWebDavConfig(options = {}) {
  if (!webDavSyncSettings?.enabled || !configLoaded || webDavSyncInProgress) return;
  webDavSyncInProgress = true;
  refreshWebDavDialog();
  clearTimeout(webDavSyncWriteTimer);
  webDavSyncWriteTimer = 0;
  setWebDavStatus("Synchronizing...");

  try {
    if (!await ensureWebDavHostPermission(webDavSyncSettings, options.requestPermission)) {
      setWebDavStatus("Server access permission required", true);
      return;
    }

    setWebDavStatus("Checking remote file...");
    const remoteState = await readSynchronizationEnvelope();
    const remoteEnvelope = remoteState.envelope;
    const remoteSnapshot = remoteEnvelope?.current || null;
    const localConfig = config;
    const localSynchronizedData = synchronizableConfig(localConfig);
    const localChecksum = await configChecksum(localSynchronizedData);
    const baseData = webDavSyncSettings.baseData
      ? synchronizableConfig(webDavSyncSettings.baseData)
      : null;
    const baseChecksum = baseData ? await configChecksum(baseData) : "";
    if (config !== localConfig) {
      scheduleWebDavSynchronization();
      return;
    }

    if (remoteSnapshot?.checksum === localChecksum) {
      let remoteEtag = remoteState.etag;
      if (remoteState.requiresCompaction) {
        setWebDavStatus("Compacting remote configuration...");
        remoteEtag = await writeSynchronizationEnvelope({
          formatVersion: 1,
          current: remoteSnapshot,
          history: Array.isArray(remoteEnvelope.history) ? remoteEnvelope.history : []
        }, remoteState);
      }
      await writeWebDavSyncSettings({
        ...webDavSyncSettings,
        revision: Number(remoteSnapshot.revision || 0),
        changeId: remoteSnapshot.changeId || "",
        parentChangeId: remoteSnapshot.parentChangeId || "",
        updatedAt: remoteSnapshot.updatedAt || localConfig.updatedAt,
        updatedBy: remoteSnapshot.updatedBy || "",
        checksum: localChecksum,
        baseData: localSynchronizedData,
        etag: remoteEtag
      });
      setWebDavStatus(`Synchronized - revision ${Number(remoteSnapshot.revision || 0)}`);
      return;
    }

    const localChanged = !baseData || localChecksum !== baseChecksum;
    const remoteChanged = !baseData || !remoteSnapshot || remoteSnapshot.checksum !== baseChecksum;

    if (remoteSnapshot && !localChanged && remoteChanged) {
      setWebDavStatus("Applying remote configuration...");
      let remoteEtag = remoteState.etag;
      if (remoteState.requiresCompaction) {
        setWebDavStatus("Compacting remote configuration...");
        remoteEtag = await writeSynchronizationEnvelope({
          formatVersion: 1,
          current: remoteSnapshot,
          history: Array.isArray(remoteEnvelope.history) ? remoteEnvelope.history : []
        }, remoteState);
      }
      await applySynchronizedConfig(remoteSnapshot, remoteEtag);
      setWebDavStatus(`Received - revision ${Number(remoteSnapshot.revision || 0)}`);
      return;
    }

    let synchronizedData = localSynchronizedData;
    if (remoteSnapshot && remoteChanged) {
      setWebDavStatus(baseData ? "Merging concurrent changes..." : "Merging devices for first synchronization...");
      synchronizedData = synchronizableConfig(mergeSynchronizationData(
        baseData,
        localSynchronizedData,
        remoteSnapshot.data
      ));
    }

    const synchronizedChecksum = await configChecksum(synchronizedData);
    if (remoteSnapshot?.checksum === synchronizedChecksum) {
      await applySynchronizedConfig(remoteSnapshot, remoteState.etag);
      setWebDavStatus(`Merged - revision ${Number(remoteSnapshot.revision || 0)}`);
      return;
    }

    const revision = Math.max(Number(remoteSnapshot?.revision || 0), Number(webDavSyncSettings.revision || 0)) + 1;
    const snapshot = {
      revision,
      changeId: randomSyncId(),
      parentChangeId: remoteSnapshot?.changeId || webDavSyncSettings.changeId || "",
      updatedAt: synchronizedData.updatedAt || new Date().toISOString(),
      updatedBy: webDavSyncSettings.deviceId,
      checksum: synchronizedChecksum,
      data: synchronizedData
    };
    if (config !== localConfig) {
      scheduleWebDavSynchronization();
      return;
    }
    const nextEnvelope = {
      formatVersion: 1,
      current: snapshot,
      history: synchronizationHistory(remoteEnvelope, snapshot)
    };
    const payloadKilobytes = Math.max(1, Math.round(new Blob([JSON.stringify(nextEnvelope)]).size / 1024));
    setWebDavStatus(`Uploading local configuration (${payloadKilobytes} KB)...`);
    const etag = await writeSynchronizationEnvelope(nextEnvelope, remoteState);
    const { data: _snapshotData, ...snapshotMeta } = snapshot;
    if (synchronizedChecksum !== localChecksum) {
      await applySynchronizedConfig(snapshot, etag);
      setWebDavStatus(`Merged - revision ${revision}`);
    } else {
      await writeWebDavSyncSettings({ ...webDavSyncSettings, ...snapshotMeta, baseData: synchronizedData, etag });
      setWebDavStatus(`Synchronized - revision ${revision}`);
    }
  } catch (error) {
    if (error?.code === "WEBDAV_CONFLICT") {
      setWebDavStatus("Remote file changed - retrying", true);
      webDavSyncWriteTimer = window.setTimeout(() => synchronizeWebDavConfig(), 1000);
    } else {
      setWebDavStatus(`Synchronization error: ${error.message}`, true);
    }
  } finally {
    webDavSyncInProgress = false;
    refreshWebDavDialog();
  }
}

function scheduleWebDavSynchronization() {
  if (!webDavSyncSettings?.enabled || !configLoaded) return;
  clearTimeout(webDavSyncWriteTimer);
  webDavSyncWriteTimer = window.setTimeout(() => synchronizeWebDavConfig(), WEBDAV_SYNC_WRITE_DELAY_MS);
  setWebDavStatus("Local changes pending");
}

async function testWebDavFromDialog() {
  try {
    const settings = webDavSettingsFromFields();
    setWebDavStatus("Testing connection...");
    await testWebDavConnection(settings, { requestPermission: true });
    setWebDavStatus("Connection successful");
  } catch (error) {
    setWebDavStatus(`Connection error: ${error.message}`, true);
  }
}

async function saveAndEnableWebDavSync() {
  try {
    const entered = webDavSettingsFromFields();
    setWebDavStatus("Checking connection...");
    await testWebDavConnection(entered, { requestPermission: true });
    const sameEndpoint = webDavSyncSettings?.url === entered.url && webDavSyncSettings?.username === entered.username;
    await writeWebDavSyncSettings({
      ...(sameEndpoint ? webDavSyncSettings : {}),
      ...entered,
      enabled: true,
      deviceId: sameEndpoint && webDavSyncSettings?.deviceId ? webDavSyncSettings.deviceId : randomSyncId()
    });
    refreshWebDavDialog();
    await synchronizeWebDavConfig();
  } catch (error) {
    setWebDavStatus(`Setup error: ${error.message}`, true);
  }
}

async function disconnectWebDavSynchronization() {
  clearTimeout(webDavSyncWriteTimer);
  webDavSyncWriteTimer = 0;
  const previous = webDavSyncSettings;
  await writeWebDavSyncSettings({
    url: previous?.url || WEBDAV_DEFAULT_URL,
    username: previous?.username || "",
    password: "",
    enabled: false,
    deviceId: previous?.deviceId || randomSyncId()
  });
  if (previous?.url && globalThis.chrome?.permissions) {
    await chrome.permissions.remove(webDavOriginPermission(previous)).catch(() => false);
  }
  populateWebDavDialog();
  setWebDavStatus("Disconnected - application password forgotten");
}

async function initializeWebDavSynchronization() {
  webDavSyncSettings = await readWebDavSyncSettings() || {
    url: WEBDAV_DEFAULT_URL,
    username: "",
    password: "",
    enabled: false,
    deviceId: randomSyncId()
  };
  if (!webDavSyncSettings.deviceId) {
    await writeWebDavSyncSettings({ ...webDavSyncSettings, deviceId: randomSyncId() });
  }
  chrome.storage?.local?.remove?.("youtubeChannelShelfFileSyncMeta");
  globalThis.indexedDB?.deleteDatabase?.("youtubeChannelShelfFileSync");
  refreshWebDavDialog();
  if (webDavSyncSettings.enabled && await ensureWebDavHostPermission(webDavSyncSettings)) {
    await synchronizeWebDavConfig();
  }
}

function syncYoutubeDataOptionsDialog() {
  if (feedCheckIntervalOptionEl) feedCheckIntervalOptionEl.value = String(feedCheckIntervalMinutes);
  if (metadataCheckIntervalOptionEl) metadataCheckIntervalOptionEl.value = String(metadataCheckIntervalDays);
  if (feedCheckConcurrencyOptionEl) feedCheckConcurrencyOptionEl.value = String(feedCheckConcurrency);
}

function openYoutubeDataOptionsDialog() {
  if (!youtubeDataOptionsPromptEl) return;
  syncYoutubeDataOptionsDialog();
  youtubeDataOptionsPromptEl.hidden = false;
  feedCheckIntervalOptionEl?.focus();
}

function closeYoutubeDataOptionsDialog() {
  if (youtubeDataOptionsPromptEl) youtubeDataOptionsPromptEl.hidden = true;
}

function setNewVideoCheckOption(key, value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return;
  if (key === FEED_CHECK_INTERVAL_KEY) {
    feedCheckIntervalMinutes = Math.min(1440, Math.max(0, parsed));
    localStorage.setItem(key, String(feedCheckIntervalMinutes));
  } else if (key === METADATA_CHECK_INTERVAL_KEY) {
    metadataCheckIntervalDays = Math.min(30, Math.max(1, parsed));
    localStorage.setItem(key, String(metadataCheckIntervalDays));
  } else if (key === FEED_CHECK_CONCURRENCY_KEY) {
    feedCheckConcurrency = Math.min(10, Math.max(1, parsed));
    localStorage.setItem(key, String(feedCheckConcurrency));
  }
  syncYoutubeDataOptionsDialog();
}

function dataContextActions() {
  return [
    { label: "Import/export/save", action: openImportExportDialog },
    { label: "Synchronization", action: openWebDavSyncDialog },
    { label: "Clean slate", action: cleanSlate, danger: true }
  ];
}

function settingsContextActions() {
  return [
    {
      label: "Data",
      submenu: dataContextActions()
    },
    { label: "Sniff YouTube", action: openYoutubeDataOptionsDialog },
    { label: "Display", action: openAppearanceOptionsDialog },
    { label: "Language", action: openLanguageOptionsDialog },
    { label: "About", action: openAboutDialog }
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
  if (contextSubmenuEl) contextSubmenuEl.hidden = true;
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

function warnBeforeLatestVersionDownload() {
  window.alert(uiMessage("backupBeforeUpdate"));
}

function closeVideoNoteDialog() {
  if (videoNotePromptEl) videoNotePromptEl.hidden = true;
  videoNoteTarget = null;
}

function openVideoNoteDialog(video, collection) {
  const source = collection === "favorites" ? favorites : watchLater;
  const item = source[video?.id];
  if (!item || !videoNotePromptEl || !videoNoteTextEl) return;
  videoNoteTarget = { collection, videoId: video.id };
  if (videoNoteTitleEl) videoNoteTitleEl.textContent = item.note ? "Edit personal note" : "Add personal note";
  if (videoNoteVideoTitleEl) videoNoteVideoTitleEl.textContent = video.title || item.title || video.id;
  videoNoteTextEl.value = item.note || "";
  videoNotePromptEl.hidden = false;
  videoNoteTextEl.focus();
  videoNoteTextEl.setSelectionRange(videoNoteTextEl.value.length, videoNoteTextEl.value.length);
}

async function saveVideoNote() {
  if (!videoNoteTarget || !videoNoteTextEl) return;
  const { collection, videoId } = videoNoteTarget;
  const source = collection === "favorites" ? favorites : watchLater;
  const item = source[videoId];
  if (!item) {
    closeVideoNoteDialog();
    return;
  }
  const note = videoNoteTextEl.value.trim();
  source[videoId] = { ...item, note };
  const currentVideo = currentVideos.find((video) => video.id === videoId);
  if (currentVideo) currentVideo.note = note;
  await saveConfig();
  closeVideoNoteDialog();
  if (collection === "favorites" && activePrimarySection === "favorites") renderFavoritesHome();
  else if (collection === "watchLater" && activePrimarySection === "watchLater") renderWatchLater();
  showInfoPopup(note ? "Personal note saved." : "Personal note removed.", "ok");
}

function favoriteVideoGroupIds(groupId) {
  if (!groupId) return [];
  return Object.entries(favorites)
    .filter(([, item]) => item?.videoGroupId === groupId)
    .sort((left, right) => (
      Number(left[1].videoGroupOrder || 0) - Number(right[1].videoGroupOrder || 0)
      || String(left[1].savedAt || "").localeCompare(String(right[1].savedAt || ""))
    ))
    .map(([videoId]) => videoId);
}

function normalizeFavoriteVideoGroup(groupId) {
  const videoIds = favoriteVideoGroupIds(groupId);
  if (videoIds.length < 2) {
    expandedFavoriteVideoGroups.delete(groupId);
    for (const videoId of videoIds) {
      const { videoGroupId: _groupId, videoGroupOrder: _groupOrder, ...item } = favorites[videoId];
      favorites[videoId] = item;
    }
    return;
  }
  videoIds.forEach((videoId, index) => {
    favorites[videoId] = {
      ...favorites[videoId],
      videoGroupId: groupId,
      videoGroupOrder: index + 1
    };
  });
}

async function groupFavoriteVideos(sourceVideoId, targetVideoId, placement = "after") {
  if (!sourceVideoId || !targetVideoId || sourceVideoId === targetVideoId) return;
  const source = favorites[sourceVideoId];
  const target = favorites[targetVideoId];
  if (!source || !target) return;

  const sourceGroupId = source.videoGroupId || "";
  const targetGroupId = target.videoGroupId || "";
  const reorderingSameGroup = Boolean(sourceGroupId && sourceGroupId === targetGroupId);
  let groupId = targetGroupId || sourceGroupId || `favorite-video-group-${crypto.randomUUID?.() || Date.now().toString(36)}`;
  let orderedIds;

  if (reorderingSameGroup) {
    orderedIds = favoriteVideoGroupIds(groupId).filter((videoId) => videoId !== sourceVideoId);
    const targetIndex = orderedIds.indexOf(targetVideoId);
    orderedIds.splice(targetIndex + (placement === "before" ? 0 : 1), 0, sourceVideoId);
  } else {
    const targetIds = targetGroupId ? favoriteVideoGroupIds(targetGroupId) : [targetVideoId];
    const sourceIds = sourceGroupId ? favoriteVideoGroupIds(sourceGroupId) : [sourceVideoId];
    orderedIds = targetIds.filter((videoId) => !sourceIds.includes(videoId));
    const targetIndex = orderedIds.indexOf(targetVideoId);
    orderedIds.splice(targetIndex + (placement === "before" ? 0 : 1), 0, ...sourceIds);
  }

  orderedIds.forEach((videoId, index) => {
    favorites[videoId] = {
      ...favorites[videoId],
      videoGroupId: groupId,
      videoGroupOrder: index + 1
    };
  });
  if (sourceGroupId && sourceGroupId !== groupId) normalizeFavoriteVideoGroup(sourceGroupId);
  if (targetGroupId && targetGroupId !== groupId) normalizeFavoriteVideoGroup(targetGroupId);
  normalizeFavoriteVideoGroup(groupId);
  if (reorderingSameGroup) expandedFavoriteVideoGroups.add(groupId);
  else expandedFavoriteVideoGroups.delete(groupId);
  await saveConfig();
  renderFavoritesHome();
}

async function ungroupFavoriteVideo(videoId) {
  const item = favorites[videoId];
  const groupId = item?.videoGroupId || "";
  if (!groupId) return;
  for (const groupedVideoId of favoriteVideoGroupIds(groupId)) {
    const { videoGroupId: _groupId, videoGroupOrder: _groupOrder, ...ungrouped } = favorites[groupedVideoId];
    favorites[groupedVideoId] = ungrouped;
  }
  expandedFavoriteVideoGroups.delete(groupId);
  await saveConfig();
  renderFavoritesHome();
}

function videoContextActions(video) {
  if (activePrimarySection === "favorites") {
    const selectedIds = selectedFavoriteVideoIds.has(video.id)
      ? [...selectedFavoriteVideoIds].filter((videoId) => favorites[videoId])
      : [video.id];
    const removesMultiple = selectedIds.length > 1;
    const actions = [
      {
        label: "Open in new tab",
        action: () => openOfficialYoutube(video, { newTab: true })
      },
      {
        label: favorites[video.id]?.note ? "Edit personal note" : "Add personal note",
        action: () => openVideoNoteDialog(video, "favorites")
      },
      {
        label: "Add to category",
        action: () => openFavoriteCategoryAssignment(video)
      },
      {
        label: removesMultiple
          ? uiMessage("removeSelectedFavorites", [selectedIds.length])
          : "Remove from Favorites",
        action: () => removeFavorites(selectedIds, video),
        danger: true
      }
    ];
    if (favorites[video.id]?.videoGroupId) {
      actions.splice(actions.length - 1, 0, {
        label: "Ungroup",
        action: () => ungroupFavoriteVideo(video.id)
      });
    }
    return actions;
  }
  const isWatched = Boolean(seenVideos[video.id]);
  const actions = [
    {
      label: "Open in new tab",
      action: () => openOfficialYoutube(video, { newTab: true })
    }
  ];
  if (activePrimarySection === "watchLater" && watchLater[video.id]) {
    actions.push({
      label: watchLater[video.id]?.note ? "Edit personal note" : "Add personal note",
      action: () => openVideoNoteDialog(video, "watchLater")
    });
  }
  actions.push(
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
  );
  if ((activeView === "newVideos" || activeView === "youtubeHome") && video.channelId) {
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

function contextMenuButtons(actions) {
  return actions.map((item) => {
    const button = document.createElement("button");
    const hasSubmenu = Array.isArray(item.submenu);
    button.type = "button";
    button.textContent = item.checked ? "[x] " + uiText(item.label) : uiText(item.label);
    if (item.danger) button.classList.add("is-danger");
    if (item.highlighted) button.classList.add("is-active");
    button.addEventListener("click", async (clickEvent) => {
      clickEvent.preventDefault();
      clickEvent.stopPropagation();
      if (hasSubmenu) {
        showContextSubmenu(button, item.submenu);
        return;
      }
      hideContextMenu();
      await maybePromptSeenForWatchLater();
      await Promise.resolve(item.action(clickEvent));
    });
    return button;
  });
}

function showContextSubmenu(anchor, actions) {
  if (!contextSubmenuEl) {
    contextSubmenuEl = document.createElement("div");
    contextSubmenuEl.className = "contextMenu contextSubmenu";
    contextSubmenuEl.hidden = true;
    document.body.append(contextSubmenuEl);
  }
  contextSubmenuEl.replaceChildren(...contextMenuButtons(actions));
  contextSubmenuEl.hidden = false;

  const anchorRect = anchor.getBoundingClientRect();
  const width = contextSubmenuEl.offsetWidth;
  const height = contextSubmenuEl.offsetHeight;
  const rightPosition = anchorRect.right + 4;
  const left = rightPosition + width <= window.innerWidth - 8
    ? rightPosition
    : Math.max(8, anchorRect.left - width - 4);
  contextSubmenuEl.style.left = `${left}px`;
  contextSubmenuEl.style.top = `${Math.max(8, Math.min(anchorRect.top, window.innerHeight - height - 8))}px`;
}

function showContextMenu(event, actions) {
  const menu = ensureContextMenu();
  if (contextSubmenuEl) contextSubmenuEl.hidden = true;
  menu.replaceChildren(
    ...contextMenuButtons(actions)
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
  if (!category.parentId) {
    actions.push({ label: "Add subcategory", action: () => openAddCategoryDialog("channels", category.id) });
  }
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
    if (activePrimarySection !== "channels") return;
    if (!event.dataTransfer?.types?.includes("application/x-youtube-channel-shelf-channel")) return;
    event.preventDefault();
    element.classList.add("is-category-drop-target");
  });
  element.addEventListener("dragleave", () => {
    element.classList.remove("is-category-drop-target");
  });
  element.addEventListener("drop", (event) => {
    if (activePrimarySection !== "channels") return;
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

  appendPathItem(container, uiMessage("all"), showRootChannels, {
    active: activeView === "channels" && !activeCategoryId && !activeChannel,
    contextActions: [
      { label: "Add category", action: () => addCategoryEl.click() }
    ]
  });

  const expandedParentId = expandedCategoryParentId(allCategories, activeCategoryId);
  for (const category of sortedCategorySiblings(allCategories)) {
    const children = sortedCategorySiblings(allCategories, category.id);
    appendPathItem(container, category.name, () => {
      showCategoryChannels(category.id);
    }, {
      active: activeView === "channels" && activeCategoryId === category.id && !activeChannel && !children.length,
      ancestorActive: activeView === "channels" && expandedParentId === category.id && Boolean(children.length),
      kind: children.length ? "parent" : "",
      contextActions: categoryContextActions(category),
      dropCategoryId: category.id
    });
    if (expandedParentId === category.id && children.length) {
      appendPathItem(container, uiMessage("all"), () => showCategoryChannels(category.id), {
        level: 1,
        kind: "subcategory",
        active: activeView === "channels" && activeCategoryId === category.id && !activeChannel,
        dropCategoryId: category.id
      });
      for (const child of children) {
        appendPathItem(container, child.name, () => showCategoryChannels(child.id), {
          level: 1,
          kind: "subcategory",
          active: activeView === "channels" && activeCategoryId === child.id && !activeChannel,
          contextActions: categoryContextActions(child),
          dropCategoryId: child.id
        });
      }
    }
  }

  appendPathItem(container, uiMessage("uncategorized"), () => {
    showCategoryChannels(UNCATEGORIZED_CATEGORY_ID);
  }, {
    active: activeView === "channels" && activeCategoryId === UNCATEGORIZED_CATEGORY_ID && !activeChannel
  });
}

function appendFavoriteCategoryPath(container) {
  container.classList.remove("has-many-categories");
  const categoryArea = document.createElement("div");
  categoryArea.className = "pathCategoryArea";
  categoryArea.classList.toggle("has-many-categories", favoriteCategories.length > 3);
  container.append(categoryArea);
  appendSettingsPathItem(categoryArea);

  appendPathItem(categoryArea, uiMessage("all"), () => showFavoritesCategory(""), {
    active: activeView === "favorites" && !activeFavoriteCategoryId
  });

  const expandedParentId = expandedCategoryParentId(favoriteCategories, activeFavoriteCategoryId);
  const expandedParent = favoriteCategories.find((category) => category.id === expandedParentId);
  const expandedChildren = expandedParent
    ? sortedCategorySiblings(favoriteCategories, expandedParent.id)
    : [];
  for (const category of sortedCategorySiblings(favoriteCategories)) {
    const children = sortedCategorySiblings(favoriteCategories, category.id);
    appendPathItem(categoryArea, category.name, () => showFavoritesCategory(category.id), {
      active: activeView === "favorites" && activeFavoriteCategoryId === category.id && !children.length,
      ancestorActive: activeView === "favorites" && expandedParentId === category.id && Boolean(children.length),
      kind: children.length ? "parent" : "",
      dropFavoriteCategoryId: category.id,
      reorderFavoriteCategoryId: category.id,
      contextActions: favoriteCategoryContextActions(category)
    });
  }

  appendPathItem(categoryArea, uiMessage("uncategorized"), () => showFavoritesCategory(UNCATEGORIZED_CATEGORY_ID), {
    active: activeView === "favorites" && activeFavoriteCategoryId === UNCATEGORIZED_CATEGORY_ID,
    dropFavoriteCategoryId: UNCATEGORIZED_CATEGORY_ID
  });

  if (expandedParent && expandedChildren.length) {
    const section = document.createElement("div");
    section.className = "pathSubcategorySection";

    const title = document.createElement("div");
    title.className = "pathSubcategoryTitle";
    title.textContent = uiMessage("subcategories");
    section.append(title);

    appendPathItem(section, uiMessage("all"), () => showFavoritesCategory(expandedParent.id), {
      level: 1,
      kind: "subcategory",
      active: activeView === "favorites" && activeFavoriteCategoryId === expandedParent.id,
      dropFavoriteCategoryId: expandedParent.id
    });

    for (const child of expandedChildren) {
      appendPathItem(section, child.name, () => showFavoritesCategory(child.id), {
        level: 1,
        kind: "subcategory",
        active: activeView === "favorites" && activeFavoriteCategoryId === child.id,
        dropFavoriteCategoryId: child.id,
        reorderFavoriteCategoryId: child.id,
        contextActions: favoriteCategoryContextActions(child)
      });
    }
    container.append(section);
  }
}

function attachFavoriteCategoryDropTarget(element, categoryId = "") {
  element.addEventListener("dragover", (event) => {
    if (activePrimarySection !== "favorites" || !hasVideoDropType(event.dataTransfer)) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    document.body.classList.remove("isFavoriteDropTarget");
    element.classList.add("is-category-drop-target");
  });
  element.addEventListener("dragleave", () => element.classList.remove("is-category-drop-target"));
  element.addEventListener("drop", (event) => {
    const favoriteVideoIds = droppedFavoriteVideoIdsFromDataTransfer(event.dataTransfer);
    if (favoriteVideoIds.length) {
      event.preventDefault();
      event.stopPropagation();
      element.classList.remove("is-category-drop-target");
      addFavoriteVideosToCategory(favoriteVideoIds, categoryId).catch((error) => {
        showInfoPopup(`Favorite update failed: ${error.message}`, "error");
      });
      return;
    }
    const video = droppedVideoFromDataTransfer(event.dataTransfer);
    if (!video) return;
    event.preventDefault();
    event.stopPropagation();
    element.classList.remove("is-category-drop-target");
    addVideoToFavorites(video, categoryId).catch((error) => showInfoPopup(`Favorite update failed: ${error.message}`, "error"));
  });
}

function clearFavoriteCategoryReorderTargets() {
  document.querySelectorAll(".is-category-reorder-before, .is-category-reorder-after").forEach((element) => {
    element.classList.remove("is-category-reorder-before", "is-category-reorder-after");
  });
}

async function reorderFavoriteCategory(sourceId, targetId, placeAfter) {
  if (!sourceId || sourceId === targetId) return;
  const source = favoriteCategories.find((category) => category.id === sourceId);
  const target = favoriteCategories.find((category) => category.id === targetId);
  if (!source || !target || (source.parentId || "") !== (target.parentId || "")) return;

  const siblingIds = sortedCategorySiblings(favoriteCategories, source.parentId || "").map((category) => category.id);
  const sourceIndex = siblingIds.indexOf(sourceId);
  if (sourceIndex < 0) return;
  siblingIds.splice(sourceIndex, 1);
  let targetIndex = siblingIds.indexOf(targetId);
  if (targetIndex < 0) return;
  if (placeAfter) targetIndex += 1;
  siblingIds.splice(targetIndex, 0, sourceId);

  const orderById = new Map(siblingIds.map((id, index) => [id, index]));
  favoriteCategories = favoriteCategories.map((category) => (
    orderById.has(category.id) ? { ...category, order: orderById.get(category.id) } : category
  ));
  await saveConfig();
  renderSidePanelPath();
}

function attachFavoriteCategoryReorder(element, categoryId) {
  element.draggable = true;
  element.classList.add("is-category-reorderable");
  element.title = [element.title, "Drag to reorder"].filter(Boolean).join(" · ");
  element.addEventListener("dragstart", (event) => {
    draggedFavoriteCategoryId = categoryId;
    event.dataTransfer?.setData(FAVORITE_CATEGORY_DRAG_TYPE, categoryId);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
    element.classList.add("is-category-reordering");
  });
  element.addEventListener("dragover", (event) => {
    if (!draggedFavoriteCategoryId) return;
    const sourceId = draggedFavoriteCategoryId;
    const source = favoriteCategories.find((category) => category.id === sourceId);
    const target = favoriteCategories.find((category) => category.id === categoryId);
    if (!source || !target || source.id === target.id || (source.parentId || "") !== (target.parentId || "")) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    clearFavoriteCategoryReorderTargets();
    const bounds = element.getBoundingClientRect();
    element.classList.add(event.clientX >= bounds.left + bounds.width / 2
      ? "is-category-reorder-after"
      : "is-category-reorder-before");
  });
  element.addEventListener("dragleave", () => {
    element.classList.remove("is-category-reorder-before", "is-category-reorder-after");
  });
  element.addEventListener("drop", (event) => {
    const sourceId = draggedFavoriteCategoryId || event.dataTransfer?.getData(FAVORITE_CATEGORY_DRAG_TYPE);
    if (!sourceId) return;
    event.preventDefault();
    event.stopPropagation();
    const bounds = element.getBoundingClientRect();
    const placeAfter = event.clientX >= bounds.left + bounds.width / 2;
    clearFavoriteCategoryReorderTargets();
    reorderFavoriteCategory(sourceId, categoryId, placeAfter).catch((error) => {
      showInfoPopup(`Category reorder failed: ${error.message}`, "error");
    });
  });
  element.addEventListener("dragend", () => {
    draggedFavoriteCategoryId = "";
    element.classList.remove("is-category-reordering");
    clearFavoriteCategoryReorderTargets();
  });
}

function favoriteCategoryContextActions(category) {
  const actions = [];
  if (!category.parentId) {
    actions.push({ label: "Add subcategory", action: () => openAddCategoryDialog("favorites", category.id) });
  }
  actions.push(
    { label: "Rename category", action: () => openRenameCategoryDialog(category, "favorites") },
    { label: "Delete category", action: () => removeFavoriteCategory(category.id), danger: true }
  );
  return actions;
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
  sidePanelPathEl.querySelectorAll(".has-overflow-indicator").forEach((container) => {
    container.classList.remove("has-overflow-indicator");
  });
  sidePanelPathEl.classList.remove("has-overflow-indicator");
  sidePanelPathEl.querySelector(".pathMoreRow")?.remove();
  sidePanelPathEl.querySelectorAll(".is-overflow-hidden").forEach((row) => row.classList.remove("is-overflow-hidden"));
  sidePanelPathEl.querySelectorAll(".pathRow.is-justified").forEach((row) => row.classList.remove("is-justified"));
}

function categoryOverflowContainer() {
  return sidePanelPathEl?.querySelector(":scope > .pathCategoryArea") || sidePanelPathEl;
}

function justifyCompleteCategoryLines(container, selector) {
  const rows = [...container.querySelectorAll(selector)]
    .filter((row) => !row.hidden && !row.classList.contains("is-overflow-hidden"));
  const lines = [];
  for (const row of rows) {
    const top = Math.round(row.getBoundingClientRect().top);
    const line = lines.find((candidate) => Math.abs(candidate.top - top) <= 1);
    if (line) line.rows.push(row);
    else lines.push({ top, rows: [row] });
  }
  lines.sort((left, right) => left.top - right.top);
  for (const line of lines.slice(0, -1)) {
    if (line.rows.length > 1) line.rows.forEach((row) => row.classList.add("is-justified"));
  }
}

function syncCategoryLineJustification() {
  if (!sidePanelPathEl) return;
  sidePanelPathEl.querySelectorAll(".pathRow.is-justified").forEach((row) => row.classList.remove("is-justified"));
  const overflowContainer = categoryOverflowContainer();
  justifyCompleteCategoryLines(
    overflowContainer,
    ":scope > .pathRow:not(.pathSettingsRow):not(.pathMoreRow)"
  );
  sidePanelPathEl.querySelectorAll(":scope > .pathSubcategorySection").forEach((section) => {
    justifyCompleteCategoryLines(section, ":scope > .pathRow");
  });
}

function syncCategoryOverflowState() {
  if (!sidePanelPathEl) return;
  clearCategoryOverflowIndicator();
  const overflowContainer = categoryOverflowContainer();
  if (!overflowContainer.classList.contains("has-many-categories")) {
    overflowContainer.classList.remove("is-fully-expanded");
    syncCategoryLineJustification();
    return;
  }
  const visibleHeight = overflowContainer.getBoundingClientRect().height;
  const contentHeight = overflowContainer.scrollHeight;
  const isFullyExpanded = contentHeight <= visibleHeight + 2;
  overflowContainer.classList.toggle("is-fully-expanded", isFullyExpanded);
  if (isFullyExpanded) {
    syncCategoryLineJustification();
    return;
  }

  const rows = [...overflowContainer.querySelectorAll(":scope > .pathRow:not(.pathMoreRow)")];
  const containerTop = overflowContainer.getBoundingClientRect().top;
  const visibleBottom = containerTop + visibleHeight;
  let firstHiddenIndex = rows.findIndex((row) => row.getBoundingClientRect().bottom > visibleBottom + 1);
  if (firstHiddenIndex < 0) {
    syncCategoryLineJustification();
    return;
  }

  while (firstHiddenIndex >= 0) {
    overflowContainer.querySelector(".pathMoreRow")?.remove();
    rows.forEach((row) => row.classList.remove("is-overflow-hidden"));

    const hiddenCount = rows.length - firstHiddenIndex;
    const indicator = makePathMoreIndicator(hiddenCount);
    overflowContainer.insertBefore(indicator, rows[firstHiddenIndex]);
    overflowContainer.classList.add("has-overflow-indicator");
    rows.slice(firstHiddenIndex).forEach((row) => row.classList.add("is-overflow-hidden"));

    if (indicator.getBoundingClientRect().bottom <= visibleBottom + 1 || firstHiddenIndex === 0) break;
    firstHiddenIndex -= 1;
  }
  syncCategoryLineJustification();
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
    categoryResizeStartHeight = categoryOverflowContainer().getBoundingClientRect().height;
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener("pointermove", (event) => {
    if (!handle.hasPointerCapture(event.pointerId)) return;
    clearCategoryOverflowIndicator();
    const overflowContainer = categoryOverflowContainer();
    const maxHeight = Math.max(90, overflowContainer.scrollHeight);
    const nextHeight = Math.max(52, Math.min(maxHeight, categoryResizeStartHeight + event.clientY - categoryResizeStartY));
    categoryPanelHeight = nextHeight;
    document.documentElement.style.setProperty("--category-panel-max-height", `${nextHeight}px`);
    overflowContainer.classList.toggle("is-fully-expanded", nextHeight >= maxHeight - 2);
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
  if (activePrimarySection === "favorites") appendFavoriteCategoryPath(sidePanelPathEl);
  else appendCategoryPath(sidePanelPathEl);
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
  setActivePrimarySection("channels");
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
  if (activeView === "newVideos" || activeView === "youtubeHome") return "newVideos";
  if (activeView === "watchLater") return "watchLater";
  if (activePrimarySection === "youtube") return "channelVideos";
  if (activeView === "favorites") return "channelVideos";
  if (activeChannel) return "channelVideos";
  if (activeView === "channels" && activeCategoryId) return "category";
  return "channels";
}

function listModeForScope(scope = currentListLayoutScope()) {
  return channelListModes[scope] || "columns";
}

function setListModeForScope(scope, mode) {
  const allowedModes = VIDEO_LIST_MODE_SCOPES.includes(scope)
    ? ["icons", "columns", "single", "titles", "compactTitles"]
    : ["icons", "columns", "single"];
  if (!allowedModes.includes(mode)) return;
  channelListModes = { ...channelListModes, [scope]: mode };
  localStorage.setItem(CHANNEL_LIST_MODE_KEY_PREFIX + scope, mode);
}

function applyListLayout() {
  channelListMode = listModeForScope();
  document.body.classList.toggle("channelIconMode", channelListMode === "icons");
  document.body.classList.toggle("channelListColumns", channelListMode === "columns");
  document.body.classList.toggle("channelListSingleColumn", channelListMode === "single");
  document.body.classList.toggle("videoTitleOnlyMode", channelListMode === "titles");
  document.body.classList.toggle("videoCompactTitleMode", channelListMode === "compactTitles");
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
  channelsEl.style.width = "100%";
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
    newVideos: uiMessage("thisWeek"),
    watchLater: "Watch later"
  };
  channelIconModeEl.classList.toggle("is-active", channelListMode === "icons");
  channelIconModeEl.disabled = false;
  const labels = {
    icons: "Icons only",
    columns: "List with names in adaptive columns",
    single: "List in one column",
    titles: "Video titles only",
    compactTitles: "Video titles with small thumbnails"
  };
  const availableModes = VIDEO_LIST_MODE_SCOPES.includes(scope)
    ? ["icons", "columns", "single", "titles", "compactTitles"]
    : ["icons", "columns", "single"];
  const currentIndex = Math.max(0, availableModes.indexOf(channelListMode));
  const nextMode = availableModes[(currentIndex + 1) % availableModes.length];
  const label = `${scopeLabels[scope]}: ${labels[channelListMode]}. Next: ${labels[nextMode]}`;
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
  const hasEnoughWidth = window.innerWidth >= splitColumnWidth;
  document.body.classList.toggle("useSplitColumns", hasEnoughWidth);
  syncStackedChannelViewState();
  syncVideoLayoutAvailability();
}

function setSplitColumnWidth(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return;
  splitColumnWidth = Math.min(SPLIT_COLUMN_MAX_WIDTH, Math.max(SPLIT_COLUMN_MIN_WIDTH, parsed));
  localStorage.setItem(SPLIT_COLUMN_WIDTH_KEY, String(splitColumnWidth));
  if (splitColumnWidthOptionEl) splitColumnWidthOptionEl.value = String(splitColumnWidth);
  updateSplitColumnState();
}

function syncStackedChannelViewState() {
  const stacked = document.body.classList.contains("sidePanelVideos") && !document.body.classList.contains("useSplitColumns");
  document.body.classList.toggle("stackedChannelView", stacked);
  document.body.classList.toggle("hasActiveChannel", Boolean(activeChannel));
  syncResultsToolbarPlacement();
  syncYoutubeThisWeekButton();
  syncAddListItemButton();
  syncSortButton();
  if (activeChannelSeparatorEl) {
    activeChannelSeparatorEl.hidden = !document.body.classList.contains("sidePanelVideos") || !activeChannel;
  }
}

function syncResultsToolbarPlacement() {
  if (!resultsToolbarEl || !contentToolbarEl || !channelListSeparatorEl) return;
  if (activePrimarySection === "channels" && activeChannel) {
    contentToolbarEl.append(resultsToolbarEl);
    return;
  }
  channelListSeparatorEl.before(resultsToolbarEl);
}

function syncYoutubeThisWeekButton() {
  if (!youtubeThisWeekEl) return;
  const visible = activePrimarySection === "youtube" && youtubeTabHome !== "blank";
  youtubeThisWeekEl.hidden = !visible;
  if (!visible) return;
  const active = activeView === "youtubeHome";
  youtubeThisWeekEl.classList.toggle("is-active", active);
  if (active) youtubeThisWeekEl.setAttribute("aria-current", "page");
  else youtubeThisWeekEl.removeAttribute("aria-current");
  const label = uiMessage("thisWeekInYourChannels");
  youtubeThisWeekEl.textContent = label;
  youtubeThisWeekEl.classList.toggle("is-loading", newVideosRefreshPending);
  youtubeThisWeekEl.title = label;
  youtubeThisWeekEl.setAttribute("aria-label", label);
}

function syncAddListItemButton() {
  if (!addListItemEl) return;
  const canAddChannel = activePrimarySection === "channels" && activeView === "channels" && !activeChannel;
  const canAddVideo = activePrimarySection === "favorites" || activePrimarySection === "watchLater";
  addListItemEl.hidden = !canAddChannel && !canAddVideo;
  const label = canAddChannel
    ? uiMessage("addChannel")
    : activePrimarySection === "favorites"
      ? uiMessage("addFavoriteVideo")
      : uiMessage("addWatchLaterVideo");
  addListItemEl.title = label;
  addListItemEl.setAttribute("aria-label", label);
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
    { label: uiMessage("resetWeeklyNew"), action: resetNewVideoCounters },
    { label: uiMessage("restoreWeeklyList"), action: restoreWeeklyVideoList },
    { label: "Excluded channels", action: openExcludedNewVideosDialog },
    { label: uiMessage("hideThisWeekInYourChannels"), action: () => setYoutubeTabHomePreference("blank") }
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
  if (activeView === "newVideos" || activeView === "youtubeHome") {
    renderNewVideos();
  } else if (!activeChannel) {
    renderChannels(channelsForActiveCategory());
  } else {
    setActiveChannelButton();
  }
  renderSidePanelPath();
}

async function restoreWeeklyVideoList() {
  allChannels = allChannels.map((channel) => {
    const { newVideosSeenAt, ...restored } = channel;
    return restored;
  });
  if (activeChannel?.id) {
    activeChannel = allChannels.find((channel) => channel.id === activeChannel.id) || activeChannel;
  }
  await saveConfig();
  renderCategories();
  if (activeView === "newVideos" || activeView === "youtubeHome") {
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
  if (activeView === "newVideos" || activeView === "youtubeHome") {
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
  if (activeView === "newVideos" || activeView === "youtubeHome") {
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

function metricCountValue(value = "") {
  const text = String(value || "").trim().toLocaleLowerCase().replace(/[\u00a0\u202f]/g, " ");
  if (!text) return null;
  if (/\bno (?:views?|subscribers?)\b|\baucun(?:e)?s? (?:vues?|abonnés?)\b/u.test(text)) return 0;
  const match = text.match(/(\d[\d\s.,]*)(?:\s*)(k|m|b|thousand|million|billion|millier|milliard)?/i);
  if (!match) return null;
  const suffix = String(match[2] || "").toLocaleLowerCase();
  let amount;
  if (suffix) {
    amount = Number.parseFloat(match[1].replace(/\s/g, "").replace(",", "."));
  } else {
    amount = Number.parseInt(match[1].replace(/[^\d]/g, ""), 10);
  }
  if (!Number.isFinite(amount)) return null;
  const multiplier = ["k", "thousand", "millier"].includes(suffix)
    ? 1_000
    : ["m", "million"].includes(suffix)
      ? 1_000_000
      : ["b", "billion", "milliard"].includes(suffix) ? 1_000_000_000 : 1;
  return Math.round(amount * multiplier);
}

function parseChannelSubscriberCount(html = "") {
  const patterns = [
    /"subscriberCountText"\s*:\s*"((?:\\.|[^"\\])*)"/i,
    /"subscriberCountText"\s*:\s*\{[\s\S]{0,800}?"(?:simpleText|content|text)"\s*:\s*"((?:\\.|[^"\\])*)"/i
  ];
  for (const pattern of patterns) {
    const encodedText = String(html || "").match(pattern)?.[1] || "";
    let text = encodedText;
    try {
      text = JSON.parse(`"${encodedText}"`);
    } catch {
      // The unescaped value is still usable for simple numeric formats.
    }
    const count = metricCountValue(text);
    if (count !== null) return { subscriberCount: count, subscriberCountText: text };
  }
  return { subscriberCount: null, subscriberCountText: "" };
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
  const subscriber = parseChannelSubscriberCount(html);
  return { description, tags, ...subscriber };
}

async function fetchChannelMetadata(channelId) {
  const response = await fetch(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/about`, {
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return parseChannelMetadata(await response.text());
}

async function fetchChannelSubscriberCount(channelId) {
  const response = await fetch(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/about`, {
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return parseChannelSubscriberCount(await response.text());
}

async function fetchChannelVideoCount(channelId) {
  const response = await fetch(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/videos`, {
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return parseChannelVideoCount(await response.text());
}

function youtubeUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

async function openOfficialYoutube(video, options = {}) {
  const videoId = typeof video === "string" ? video : video.id;
  if (!videoId) return;

  if (currentWatchLaterVideoId && currentWatchLaterVideoId !== videoId) {
    await maybePromptSeenForWatchLater();
  }

  activeVideoId = videoId;
  currentWatchLaterVideoId = activeView === "watchLater" && watchLater[videoId] ? videoId : "";
  currentWatchLaterStartedAt = currentWatchLaterVideoId ? Date.now() : 0;
  setActiveVideoButton();

  let shouldSaveSeenVideo = false;
  if (typeof video === "object" && !currentWatchLaterVideoId) {
    seenVideos[videoId] = {
      seenAt: new Date().toISOString(),
      channelId: activeChannel?.id || video.channelId || "",
      title: video.title || "",
      description: video.description || "",
      tags: video.tags || video.keywords || video.topics || [],
      channel: video.channel || activeChannel?.title || ""
    };
    shouldSaveSeenVideo = true;
  }

  if (options.newTab) {
    if (globalThis.chrome?.tabs) {
      chrome.tabs.create({ url: youtubeUrl(videoId) });
    } else {
      window.open(youtubeUrl(videoId), "_blank", "noopener");
    }
    if (shouldSaveSeenVideo) await saveConfig().catch(() => {});
    return;
  }

  if (globalThis.chrome?.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.id) {
        chrome.tabs.update(tab.id, { url: youtubeUrl(videoId) });
      } else {
        window.location.href = youtubeUrl(videoId);
      }
    });
    if (shouldSaveSeenVideo) await saveConfig().catch(() => {});
    return;
  }

  if (shouldSaveSeenVideo) await saveConfig().catch(() => {});
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
    if (value?.updatedAt !== webDavSyncIgnoreUpdatedAt) scheduleWebDavSynchronization();
    return;
  }

  await new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: value }, () => {
      const error = chrome.runtime?.lastError;
      if (error) reject(new Error(error.message));
      else resolve();
    });
  });
  if (value?.updatedAt !== webDavSyncIgnoreUpdatedAt) scheduleWebDavSynchronization();
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
  if (activeView === "favorites") return { type: "favorites", id: activeFavoriteCategoryId || "" };
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
      view: activeView,
      section: activePrimarySection,
      categoryId: activeView === "favorites" ? activeFavoriteCategoryId || "" : activeCategoryId || "",
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

function recordYoutubeSearchHistory(query) {
  const trimmed = String(query || "").trim();
  const entry = trimmed
    ? { type: "search", id: trimmed }
    : youtubeTabHome === "blank"
      ? { type: "youtubeBlank", id: "youtube" }
      : { type: "youtubeHome", id: "youtube" };
  const current = historyStack[historyIndex];
  if (!suppressHistory && ["search", "youtubeHome", "youtubeBlank"].includes(current?.type)) {
    historyStack[historyIndex] = entry;
    updateHistoryButtons();
    return;
  }
  pushHistory(entry);
}

function showChannelListState(categoryId = "") {
  setActivePrimarySection("channels");
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
  syncYoutubeThisWeekButton();
  syncVideoLayoutAvailability();
  setStatus(currentVideos.length ? "" : "No new videos.", !currentVideos.length);
}

function showNewVideos(options = {}) {
  setActivePrimarySection("channels");
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

function youtubeOriginalTitle(videoId, signal) {
  const normalizedId = videoIdFromInput(videoId);
  if (!normalizedId) return Promise.resolve("");
  if (youtubeOriginalTitleCache.has(normalizedId)) return youtubeOriginalTitleCache.get(normalizedId);
  const watchUrl = new URL("https://www.youtube.com/watch");
  watchUrl.searchParams.set("v", normalizedId);
  watchUrl.searchParams.set("hl", "en");
  const promise = fetch(watchUrl, {
    cache: "no-store",
    credentials: "omit",
    signal
  })
    .then((response) => response.ok ? response.text() : "")
    .then((html) => {
      const detailsJson = extractJsonObjectAfter(html, "\"videoDetails\":");
      const details = detailsJson ? JSON.parse(detailsJson) : null;
      return details?.videoId === normalizedId ? String(details.title || "").trim() : "";
    })
    .catch((error) => {
      if (error?.name === "AbortError") youtubeOriginalTitleCache.delete(normalizedId);
      return "";
    });
  youtubeOriginalTitleCache.set(normalizedId, promise);
  return promise;
}

function youtubeAutomaticTitle(videoId, signal) {
  const normalizedId = videoIdFromInput(videoId);
  if (!normalizedId) return Promise.resolve("");
  if (youtubeAutomaticTitleCache.has(normalizedId)) return youtubeAutomaticTitleCache.get(normalizedId);
  const watchUrl = `https://www.youtube.com/watch?v=${normalizedId}`;
  const promise = fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`, {
    cache: "force-cache",
    credentials: "omit",
    signal
  })
    .then((response) => response.ok ? response.json() : null)
    .then((data) => String(data?.title || "").trim())
    .catch((error) => {
      if (error?.name === "AbortError") youtubeAutomaticTitleCache.delete(normalizedId);
      return "";
    });
  youtubeAutomaticTitleCache.set(normalizedId, promise);
  return promise;
}

function restorePreferredYoutubeTitle(video, titleElement) {
  if (!video?.id || !titleElement) return;
  const titleRequest = youtubeTitleLanguage === "original" ? youtubeOriginalTitle(video.id) : youtubeAutomaticTitle(video.id);
  titleRequest.then((preferredTitle) => {
    if (!preferredTitle) return;
    video.title = preferredTitle;
    titleElement.textContent = preferredTitle;
    if (activeVideoId === video.id) {
      channelTitleEl.textContent = preferredTitle;
      document.title = preferredTitle;
    }
  });
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
  syncActiveChannelActions();
  videoTitleLineEl.hidden = true;
  refreshEl.hidden = false;
  document.title = title || "YouTube";
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
      card.classList.toggle("is-multi-selected", activePrimarySection === "favorites" && selectedFavoriteVideoIds.has(video.id));
      card.setAttribute("aria-selected", String(activePrimarySection === "favorites" && selectedFavoriteVideoIds.has(video.id)));
      card.classList.toggle("is-favorite-grouped", activePrimarySection === "favorites" && Number(video.videoGroupSize || 0) > 1);
      card.draggable = true;
      card.addEventListener("dragstart", (event) => {
        const draggedVideo = {
          id: video.id,
          title: video.title || "",
          channelId: video.channelId || "",
          channel: video.channel || videoChannelTitle(video),
          description: video.description || "",
          tags: video.tags || video.keywords || video.topics || [],
          views: video.views || video.viewCountText || ""
        };
        event.dataTransfer?.setData("application/x-youtube-channel-shelf-video", JSON.stringify(draggedVideo));
        if (activePrimarySection === "favorites" && favorites[video.id]) {
          draggedFavoriteVideoId = video.id;
          event.dataTransfer?.setData(FAVORITE_VIDEO_GROUP_DRAG_TYPE, video.id);
          const groupId = favorites[video.id].videoGroupId || "";
          const selectedIds = selectedFavoriteVideoIds.has(video.id)
            ? [...selectedFavoriteVideoIds].filter((videoId) => favorites[videoId])
            : [];
          const categoryDragIds = selectedIds.length > 1
            ? selectedIds
            : groupId ? favoriteVideoGroupIds(groupId) : [video.id];
          event.dataTransfer?.setData(FAVORITE_VIDEO_CATEGORY_DRAG_TYPE, JSON.stringify(categoryDragIds));
        }
        event.dataTransfer?.setData("text/uri-list", `https://www.youtube.com/watch?v=${video.id}`);
        event.dataTransfer?.setData("text/plain", `https://www.youtube.com/watch?v=${video.id}`);
        event.dataTransfer.effectAllowed = activePrimarySection === "favorites" ? "copyMove" : "copy";
        card.classList.add("is-dragging");
      });
      card.addEventListener("dragend", () => {
        draggedFavoriteVideoId = "";
        card.classList.remove("is-dragging");
        document.querySelectorAll(".is-favorite-group-drop-target").forEach((item) => {
          item.classList.remove("is-favorite-group-drop-target");
          delete item.dataset.favoriteDropPlacement;
        });
        document.body.classList.remove("isWatchLaterDropTarget");
        document.body.classList.remove("isFavoriteDropTarget");
        document.querySelectorAll(".is-watch-later-drop-target").forEach((item) => item.classList.remove("is-watch-later-drop-target"));
        document.querySelectorAll(".is-favorite-drop-target").forEach((item) => item.classList.remove("is-favorite-drop-target"));
      });
      if (activePrimarySection === "favorites") {
        card.addEventListener("dragover", (event) => {
          const sourceVideoId = draggedFavoriteVideoId;
          if (!sourceVideoId || sourceVideoId === video.id) return;
          event.preventDefault();
          event.stopPropagation();
          if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
          document.body.classList.remove("isFavoriteDropTarget");
          const bounds = card.getBoundingClientRect();
          card.dataset.favoriteDropPlacement = event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
          card.classList.add("is-favorite-group-drop-target");
        });
        card.addEventListener("dragleave", () => {
          card.classList.remove("is-favorite-group-drop-target");
          delete card.dataset.favoriteDropPlacement;
        });
        card.addEventListener("drop", (event) => {
          const sourceVideoId = draggedFavoriteVideoId || event.dataTransfer?.getData(FAVORITE_VIDEO_GROUP_DRAG_TYPE) || "";
          if (!sourceVideoId || sourceVideoId === video.id) return;
          event.preventDefault();
          event.stopPropagation();
          const placement = card.dataset.favoriteDropPlacement || "after";
          clearVideoDropIndicators();
          card.classList.remove("is-favorite-group-drop-target");
          delete card.dataset.favoriteDropPlacement;
          groupFavoriteVideos(sourceVideoId, video.id, placement).catch((error) => {
            showInfoPopup(`Favorite group update failed: ${error.message}`, "error");
          });
        });
      }
      card.addEventListener("click", (event) => {
        if (activePrimarySection === "favorites" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          event.stopPropagation();
          if (selectedFavoriteVideoIds.has(video.id)) selectedFavoriteVideoIds.delete(video.id);
          else selectedFavoriteVideoIds.add(video.id);
          syncFavoriteVideoSelection();
          return;
        }
        const interactive = event.target instanceof Element
          ? event.target.closest("button, a, input, select, textarea, [role='button']")
          : null;
        if (interactive && interactive !== card) return;
        event.preventDefault();
        event.stopPropagation();
        openOfficialYoutube(video);
      });
      card.addEventListener("keydown", (event) => {
        if (event.target !== card) return;
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
      restorePreferredYoutubeTitle(video, title);
      if (activePrimarySection === "favorites" && Number(video.videoGroupSize || 0) > 1) {
        const groupBadge = document.createElement("span");
        groupBadge.className = "favoriteGroupBadge";
        groupBadge.textContent = `${video.videoGroupOrder}/${video.videoGroupSize}`;
        groupBadge.title = uiMessage("favoriteGroupPosition", [video.videoGroupOrder, video.videoGroupSize]);
        card.append(groupBadge);
      }
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
      const channelTitle = videoChannelTitle(video);
      const channelMeta = document.createElement(video.channelId && channelTitle ? "button" : "div");
      channelMeta.className = "videoChannelMeta";
      channelMeta.textContent = channelTitle;
      if (channelMeta instanceof HTMLButtonElement) {
        channelMeta.type = "button";
        channelMeta.title = `Show videos from ${channelTitle}`;
        channelMeta.dataset.channelId = video.channelId;
        channelMeta.dataset.channelTitle = channelTitle;
        channelMeta.dataset.channelThumbnail = video.channelThumbnail || "";
      }
      const dateMeta = document.createElement("div");
      dateMeta.className = "videoDateMeta";
      const dateText = videoDateText(video);
      dateMeta.textContent = video.views ? [dateText, video.views].filter(Boolean).join(" - ") : dateText;
      meta.append(channelMeta, dateMeta);

      const note = document.createElement("div");
      note.className = "videoNote";
      note.textContent = video.note || "";
      note.hidden = !video.note;

      const favoriteCategoryList = document.createElement("div");
      favoriteCategoryList.className = "channelCategoryList videoCategoryList";
      if (activePrimarySection === "favorites") {
        const assignedCategories = (video.categories || [])
          .map((categoryId) => favoriteCategories.find((category) => category.id === categoryId))
          .filter(Boolean);
        favoriteCategoryList.append(...assignedCategories.map((category) => {
          const chip = document.createElement("span");
          chip.className = "channelCategoryChip";
          chip.classList.toggle("is-subcategory", Boolean(category.parentId));
          chip.role = "button";
          chip.tabIndex = 0;
          chip.textContent = category.name;
          chip.title = `Show favorites in ${category.name}`;
          const openCategory = (event) => {
            event.preventDefault();
            event.stopPropagation();
            showFavoritesCategory(category.id);
          };
          chip.addEventListener("click", openCategory);
          chip.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") openCategory(event);
          });
          return chip;
        }));
        favoriteCategoryList.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          event.stopPropagation();
          openFavoriteCategoryAssignment(video);
        });
      }

      const favoriteButton = document.createElement("button");
      favoriteButton.className = "favoriteButton";
      favoriteButton.dataset.videoId = video.id;
      const isFavorite = Boolean(favorites[video.id]);
      favoriteButton.classList.toggle("is-active", isFavorite);
      favoriteButton.type = "button";
      favoriteButton.textContent = isFavorite ? "\u2605" : "\u2606";
      favoriteButton.title = isFavorite ? "Remove from Favorites" : "Add to Favorites";
      favoriteButton.setAttribute("aria-label", favoriteButton.title);
      favoriteButton.addEventListener("click", async (event) => {
        event.stopPropagation();
        await toggleFavorite(video);
      });

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

      const noteCollection = activePrimarySection === "favorites"
        ? "favorites"
        : activePrimarySection === "watchLater" ? "watchLater" : "";
      const noteButton = document.createElement("button");
      noteButton.className = "videoNoteButton";
      noteButton.classList.toggle("is-active", Boolean(video.note));
      noteButton.type = "button";
      noteButton.textContent = "✎";
      noteButton.title = video.note ? "Edit personal note" : "Add personal note";
      noteButton.setAttribute("aria-label", noteButton.title);
      noteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        if (noteCollection) openVideoNoteDialog(video, noteCollection);
      });

      const actions = document.createElement("div");
      actions.className = "videoActions";
      if (noteCollection) actions.append(noteButton);
      if (activePrimarySection === "youtube" || activePrimarySection === "favorites" || activeView === "newVideos" || activeChannel) {
        actions.append(favoriteButton);
      }
      if (activePrimarySection === "favorites" && favoriteCategoryList.childElementCount) {
        actions.append(favoriteCategoryList);
      }
      if (activePrimarySection !== "favorites") actions.append(watchButton);

      details.append(title, meta, note);
      card.append(thumbFrame, details, actions);
      return card;
}

function createWatchMoreCard(channel, options = {}) {
  const card = document.createElement("button");
  card.className = "watchMoreCard";
  card.type = "button";
  if (options.loadMore) {
    card.textContent = channelVideosLoadingMore ? "Loading more videos..." : "Load more videos";
    card.disabled = channelVideosLoadingMore;
    card.addEventListener("click", loadMoreChannelVideos);
  } else {
    card.textContent = channelVideosInnertubeFailed
      ? "Pagination unavailable - more on YouTube"
      : "RSS feed limit - more on YouTube";
    card.addEventListener("click", () => openChannelVideosOnYouTube(channel));
  }
  return card;
}

function renderVideos(videos, target = videosEl, options = {}) {
  const items = sortVideosForDisplay(videos).map(createVideoCard);
  if (options.watchMoreChannel?.id) {
    items.push(createWatchMoreCard(options.watchMoreChannel, { loadMore: options.loadMore }));
  }
  target.replaceChildren(...items);

  setActiveVideoButton();
  syncVideoLayoutAvailability();
}

function renderChannelVideos(videos = currentVideos) {
  const searching = Boolean(channelSearchQuery.trim()) && isSelectedChannelSearchScope();
  const canLoadMore = channelVideoSource !== "rss" && Boolean(channelVideosContinuation || channelVideosLoadingMore);
  const showYoutubeFallback = channelVideoSource === "rss" || channelVideosInnertubeFailed;
  renderVideos(videos, videosEl, {
    watchMoreChannel: !searching && (canLoadMore || showYoutubeFallback) ? activeChannel : null,
    loadMore: canLoadMore
  });
}

function appendChannelSearchProgress() {
  const progress = document.createElement("div");
  progress.className = "channelSearchProgress";
  progress.textContent = "...";
  progress.setAttribute("role", "status");
  progress.setAttribute("aria-label", uiMessage("searchingYoutube"));
  videosEl.append(progress);
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
      views: video.views || video.viewCountText || "",
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
  return { version: 1, categories: [], favoriteCategories: [], channels: [], favorites: {}, seenVideos: {}, watchLater: {}, updatedAt: new Date().toISOString() };
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
    favoriteCategories,
    channels: allChannels,
    favorites,
    seenVideos,
    watchLater,
    updatedAt: new Date().toISOString()
  };
}

function exportNativeConfig() {
  downloadText(`youtube-shelf-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(currentExportConfig(), null, 2));
}

function exportNewPipeConfig() {
  const data = newPipeSubscriptionData(allChannels, chrome.runtime?.getManifest?.().version || "");
  downloadText(newPipeSubscriptionFilename(), JSON.stringify(data, null, 2));
  showInfoPopup(`${data.subscriptions.length} subscriptions exported for NewPipe.`, "ok");
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

function mergeImportedCategories(existingCategories, importedCategories) {
  const merged = (Array.isArray(existingCategories) ? existingCategories : []).map((category) => ({ ...category }));
  const imported = Array.isArray(importedCategories) ? importedCategories : [];
  const idMap = new Map();

  for (const category of imported) {
    if (!category?.id || !category?.name) continue;
    const parentId = category.parentId ? idMap.get(category.parentId) || "" : "";
    const sameCategory = merged.find((candidate) => (
      (candidate.parentId || "") === parentId
      && candidate.name.toLocaleLowerCase("fr") === category.name.toLocaleLowerCase("fr")
    ));
    if (sameCategory) {
      idMap.set(category.id, sameCategory.id);
      continue;
    }

    const baseId = slugify(category.id) || slugify(category.name) || "imported-category";
    let id = baseId;
    let suffix = 2;
    while (merged.some((candidate) => candidate.id === id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }
    merged.push({ ...category, id, parentId });
    idMap.set(category.id, id);
  }

  return { categories: merged, idMap };
}

function remapImportedCategoryIds(categoryIds, idMap) {
  return [...new Set((Array.isArray(categoryIds) ? categoryIds : []).map((id) => idMap.get(id)).filter(Boolean))];
}

function mergeNativeConfig(parsed) {
  const channelCategoriesMerge = mergeImportedCategories(allCategories, parsed.categories);
  const favoriteCategoriesMerge = mergeImportedCategories(favoriteCategories, parsed.favoriteCategories);

  allCategories = channelCategoriesMerge.categories;
  favoriteCategories = favoriteCategoriesMerge.categories;

  const importedChannels = (Array.isArray(parsed.channels) ? parsed.channels : []).map((channel) => ({
    ...channel,
    categories: remapImportedCategoryIds(channel.categories, channelCategoriesMerge.idMap)
  }));
  mergeChannels(importedChannels);

  for (const [videoId, item] of Object.entries(parsed.favorites || {})) {
    const current = favorites[videoId] || {};
    favorites[videoId] = {
      ...item,
      ...current,
      categories: [...new Set([
        ...(current.categories || []),
        ...remapImportedCategoryIds(item?.categories, favoriteCategoriesMerge.idMap)
      ])]
    };
  }
  seenVideos = { ...(parsed.seenVideos || {}), ...seenVideos };
  watchLater = { ...(parsed.watchLater || {}), ...watchLater };
}

async function importNativeConfigFromText(text) {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.channels)) throw new Error("Invalid YouTube Shelf file");
  if (parsed.importMode === "merge") {
    mergeNativeConfig(parsed);
    await saveConfig();
    return;
  }
  config = { ...emptyConfig(), ...parsed, updatedAt: new Date().toISOString() };
  allCategories = config.categories || [];
  favoriteCategories = config.favoriteCategories || [];
  allChannels = config.channels || [];
  favorites = config.favorites || {};
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
      closeImportExportDialog();
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
    native: "Import/restore YouTube Shelf datas",
    freetube: "Import from FreeTube"
  };
  for (const button of [exportNativeConfigEl, exportNewPipeConfigEl, importNativeConfigEl, importFreetubeConfigEl]) {
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
  exportNewPipeConfigEl.hidden = false;
  importNativeConfigEl.hidden = false;
  importFreetubeConfigEl.hidden = false;
  importNativeConfigEl.textContent = "Import/restore YouTube Shelf datas";
  importFreetubeConfigEl.textContent = "Import from FreeTube";
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
  else if (command === "exportNewPipe") exportNewPipeConfig();
  else if (command === "importNative") await runImportFilePicker("native");
  else if (command === "importFreetube") await runImportFilePicker("freetube");
  else if (command === "cleanSlate") await cleanSlate();
}
function createCategory(name, parentId = "") {
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

  const validParentId = allCategories.some((item) => item.id === parentId && !item.parentId) ? parentId : "";
  const category = { id, name: trimmed, ...(validParentId ? { parentId: validParentId } : {}) };
  allCategories.push(category);
  return category;
}

function renderCategoryAssignmentList() {
  if (!categoryAssignListEl) return;
  const favoriteItem = categoryAssignFavoriteVideoId ? favorites[categoryAssignFavoriteVideoId] : null;
  const sourceCategories = favoriteItem ? favoriteCategories : allCategories;
  const selectedCategoryIds = favoriteItem?.categories || categoryAssignChannel?.categories || [];
  const makeItem = (category, disclosure = null) => {
    const row = document.createElement("div");
    row.className = "categoryAssignItem categoryAssignTreeItem";
    row.classList.toggle("is-subcategory", Boolean(category.parentId));
    row.classList.toggle("has-children", Boolean(disclosure));

    if (disclosure) {
      row.append(disclosure);
    } else {
      const spacer = document.createElement("span");
      spacer.className = "categoryAssignDisclosureSpacer";
      spacer.setAttribute("aria-hidden", "true");
      row.append(spacer);
    }

    const label = document.createElement("label");
    label.className = "categoryAssignChoice";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = category.id;
    checkbox.checked = selectedCategoryIds.includes(category.id);

    const name = document.createElement("span");
    name.textContent = category.name;
    label.append(checkbox, name);
    row.append(label);
    return row;
  };

  const groups = sortedCategorySiblings(sourceCategories).map((category) => {
    const children = sortedCategorySiblings(sourceCategories, category.id);
    if (!children.length) return makeItem(category);

    const expanded = expandedCategoryAssignmentIds.has(category.id);
    const group = document.createElement("div");
    group.className = "categoryAssignGroup";
    group.classList.toggle("is-expanded", expanded);

    const toggle = document.createElement("button");
    toggle.className = "categoryAssignToggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", String(expanded));

    const childrenContainer = document.createElement("div");
    childrenContainer.className = "categoryAssignChildren";
    childrenContainer.hidden = !expanded;
    const childItems = children.map((child) => makeItem(child));
    childrenContainer.append(...childItems);

    const syncToggle = () => {
      const isExpanded = !childrenContainer.hidden;
      toggle.title = uiMessage(isExpanded ? "collapseSubcategories" : "expandSubcategories");
      toggle.setAttribute("aria-label", toggle.title);
      toggle.setAttribute("aria-expanded", String(isExpanded));
      group.classList.toggle("is-expanded", isExpanded);
    };
    toggle.addEventListener("click", () => {
      childrenContainer.hidden = !childrenContainer.hidden;
      if (childrenContainer.hidden) expandedCategoryAssignmentIds.delete(category.id);
      else expandedCategoryAssignmentIds.add(category.id);
      syncToggle();
    });
    syncToggle();
    group.append(makeItem(category, toggle), childrenContainer);
    return group;
  });

  categoryAssignListEl.replaceChildren(...groups);
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
  categoryAssignFavoriteVideoId = "";
  categoryAssignChannel = channel;
  const title = categoryAssignPromptEl.querySelector("#categoryAssignTitle");
  if (title) title.textContent = "Channel categories";
  expandedCategoryAssignmentIds.clear();
  newCategoryNameEl.value = "";
  renderCategoryAssignmentList();
  categoryAssignPromptEl.hidden = false;
  newCategoryNameEl.focus();
}

function openFavoriteCategoryAssignment(video) {
  if (!video?.id || !favorites[video.id] || !categoryAssignPromptEl) return;
  categoryAssignChannel = null;
  categoryAssignFavoriteVideoId = video.id;
  const title = categoryAssignPromptEl.querySelector("#categoryAssignTitle");
  if (title) title.textContent = "Favorite categories";
  expandedCategoryAssignmentIds.clear();
  newCategoryNameEl.value = "";
  renderCategoryAssignmentList();
  categoryAssignPromptEl.hidden = false;
  newCategoryNameEl.focus();
}

function closeCategoryAssignment() {
  categoryAssignPromptEl.hidden = true;
  categoryAssignChannel = null;
  categoryAssignFavoriteVideoId = "";
  expandedCategoryAssignmentIds.clear();
  newCategoryNameEl.value = "";
}

async function addCategoryFromAssignment() {
  const category = categoryAssignFavoriteVideoId
    ? createFavoriteCategory(newCategoryNameEl.value)
    : createCategory(newCategoryNameEl.value);
  if (!category) return;
  if (categoryAssignFavoriteVideoId && favorites[categoryAssignFavoriteVideoId]) {
    favorites[categoryAssignFavoriteVideoId].categories = [
      ...new Set([...(favorites[categoryAssignFavoriteVideoId].categories || []), category.id])
    ];
  } else if (categoryAssignChannel) {
    categoryAssignChannel.categories = [...new Set([...(categoryAssignChannel.categories || []), category.id])];
  }
  newCategoryNameEl.value = "";
  renderCategoryAssignmentList();
  const checkbox = categoryAssignListEl.querySelector(`input[value="${CSS.escape(category.id)}"]`);
  if (checkbox) checkbox.checked = true;
}

async function saveCategoryAssignment() {
  if (!categoryAssignChannel && !categoryAssignFavoriteVideoId) return;
  if (newCategoryNameEl.value.trim()) {
    await addCategoryFromAssignment();
  }
  const categoryIds = [...categoryAssignListEl.querySelectorAll("input:checked")].map((checkbox) => checkbox.value);
  if (categoryAssignFavoriteVideoId) {
    const videoId = categoryAssignFavoriteVideoId;
    if (favorites[videoId]) {
      favorites[videoId] = { ...favorites[videoId], categories: [...new Set(categoryIds)] };
    }
    await saveConfig();
    renderFavoritesHome();
    closeCategoryAssignment();
    return;
  }
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
  const hasChildren = allCategories.some((item) => item.parentId === categoryId);
  const detail = hasChildren ? " Its subcategories will be kept at the root level." : "";
  if (!await requestConfirmation(`Delete category "${category.name}"?${detail}`)) return;

  allCategories = allCategories.filter((item) => item.id !== categoryId);
  allCategories = allCategories.map((item) => item.parentId === categoryId ? { ...item, parentId: "" } : item);
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

async function removeFavoriteCategory(categoryId) {
  const category = favoriteCategories.find((item) => item.id === categoryId);
  if (!category) return;
  const hasChildren = favoriteCategories.some((item) => item.parentId === categoryId);
  const detail = hasChildren ? " Its subcategories will be kept at the root level." : "";
  if (!await requestConfirmation(`Delete category "${category.name}"?${detail}`)) return;
  favoriteCategories = favoriteCategories.filter((item) => item.id !== categoryId);
  favoriteCategories = favoriteCategories.map((item) => item.parentId === categoryId ? { ...item, parentId: "" } : item);
  favorites = Object.fromEntries(Object.entries(favorites).map(([videoId, item]) => [videoId, {
    ...item,
    categories: (item.categories || []).filter((id) => id !== categoryId)
  }]));
  if (activeFavoriteCategoryId === categoryId) activeFavoriteCategoryId = "";
  await saveConfig();
  renderFavoritesHome();
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
  const channelIsSaved = allChannels.some((item) => item.id === channel?.id);
  if (!channelIsSaved) {
    return [
      { label: "Open YouTube channel", action: () => openChannelVideosOnYouTube(channel) },
      { label: "Subscribe on YouTube", action: () => openSubscribeOnYouTube(channel) },
      { label: uiMessage("addToMyChannels"), action: () => addChannelById(channel.id, "") }
    ];
  }
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
  const categoryIds = categoryIdsForSelection(allCategories, categoryId);
  return allChannels.filter((channel) => (channel.categories || []).some((id) => categoryIds.has(id))).length;
}

function sortedCategorySiblings(sourceCategories, parentId = "") {
  return sourceCategories.filter((category) => (category.parentId || "") === parentId).sort((a, b) => {
    if (sourceCategories === favoriteCategories) {
      const sourceOrder = Number.isFinite(a.order) ? a.order : sourceCategories.indexOf(a);
      const targetOrder = Number.isFinite(b.order) ? b.order : sourceCategories.indexOf(b);
      return sourceOrder - targetOrder;
    }
    const countDelta = sourceCategories === allCategories ? channelCountForCategory(b.id) - channelCountForCategory(a.id) : 0;
    if (countDelta) return countDelta;
    return (a.name || "").localeCompare(b.name || "", "fr");
  });
}

function sortedCategoryTree(sourceCategories) {
  return sortedCategorySiblings(sourceCategories).flatMap((category) => [
    category,
    ...sortedCategorySiblings(sourceCategories, category.id)
  ]);
}

function expandedCategoryParentId(sourceCategories, activeId) {
  const activeCategory = sourceCategories.find((category) => category.id === activeId);
  if (!activeCategory) return "";
  return activeCategory.parentId || activeCategory.id;
}

function categoryIdsForSelection(sourceCategories, categoryId) {
  const ids = new Set(categoryId ? [categoryId] : []);
  for (const category of sourceCategories) {
    if (category.parentId === categoryId) ids.add(category.id);
  }
  return ids;
}

function sortedManualCategories() {
  return sortedCategoryTree(allCategories);
}

function channelsForActiveCategory() {
  if (activeCategoryId === NEW_VIDEOS_CATEGORY_ID) return [];
  if (activeCategoryId === UNCATEGORIZED_CATEGORY_ID) {
    return allChannels.filter((channel) => !(channel.categories || []).length);
  }
  if (!activeCategoryId) return allChannels;
  const categoryIds = categoryIdsForSelection(allCategories, activeCategoryId);
  return allChannels.filter((channel) => (channel.categories || []).some((id) => categoryIds.has(id)));
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
  return valuesFromFields(item, ["description", "summary", "content", "note"]);
}

function metadataTextValues(item) {
  return [
    ...channelDeclaredMetadataValues(item),
    ...videoDeclaredMetadataValues(item),
    ...descriptiveMetadataValues(item),
    ...valuesFromFields(item, ["handle", "author", "channel", "channelTitle", "channelName"])
  ];
}

function searchableTextForChannel(channel) {
  const categoryNames = categoryNamesForChannel(channel);

  const parts = [
    channel.id,
    channel.title,
    ...metadataTextValues(channel),
    ...categoryNames
  ].filter(Boolean);

  return normalizeSearchText([
    ...parts,
    ...parts.flatMap(searchAliasesFromText)
  ].join(" "));
}

function sourceChannelsForSearch() {
  if (activeView === "watchLater" || activeView === "newVideos") return [];
  if (channelSearchQuery.trim()) return allChannels;
  if (activeCategoryId === UNCATEGORIZED_CATEGORY_ID) {
    return allChannels.filter((channel) => !(channel.categories || []).length);
  }
  if (!activeCategoryId) return allChannels;
  return allChannels.filter((channel) => (channel.categories || []).includes(activeCategoryId));
}

function isSelectedChannelSearchScope() {
  return activePrimarySection === "channels" && Boolean(activeChannel);
}

function updateChannelSearchPlaceholder() {
  if (!channelSearchInputEl) return;
  const placeholder = isSelectedChannelSearchScope()
    ? "Search in this channel"
    : activeView === "watchLater"
      ? "Search Watch later"
      : activeView === "newVideos"
      ? "Search this week"
      : "Search channel";
  const localizedPlaceholder = uiText(placeholder);
  channelSearchInputEl.placeholder = localizedPlaceholder;
  channelSearchInputEl.setAttribute("aria-label", localizedPlaceholder);
  if (activePrimarySection === "channels") {
    searchInputEl.placeholder = localizedPlaceholder;
    searchInputEl.setAttribute("aria-label", localizedPlaceholder);
  }
}

function syncChannelSearchState() {
  updateChannelSearchPlaceholder();
  document.body.classList.toggle("isChannelSearching", Boolean(channelSearchQuery.trim()) && !isSelectedChannelSearchScope());
}

function clearChannelSearch() {
  resetSelectedChannelVideoSearch();
  channelSearchQuery = "";
  if (channelSearchInputEl) channelSearchInputEl.value = "";
  syncChannelSearchState();
}

function searchableTextForVideo(video) {
  const channel = allChannels.find((item) => item.id === video?.channelId) || activeChannel || null;
  const saved = [seenVideos?.[video?.id], watchLater?.[video?.id], favorites?.[video?.id]].filter(Boolean);
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

function searchableTextForChannelVideo(video) {
  const saved = [seenVideos?.[video?.id], watchLater?.[video?.id]].filter((item) => item && typeof item === "object");
  const parts = [
    video?.id,
    video?.title,
    video?.published,
    video?.publishedText,
    video?.duration,
    video?.views,
    ...videoDeclaredMetadataValues(video),
    ...descriptiveMetadataValues(video),
    ...saved.flatMap((item) => [
      item.title || "",
      ...videoDeclaredMetadataValues(item),
      ...descriptiveMetadataValues(item)
    ])
  ].filter(Boolean);
  return normalizeSearchText([
    ...parts,
    ...parts.flatMap(searchAliasesFromText)
  ].join(" "));
}

function channelVideoSearchCandidates(channel) {
  const feedVideos = (channel?.feedVideos || []).map((video) => videoWithChannel(video, channel));
  const savedVideos = [...Object.entries(watchLater || {}), ...Object.entries(seenVideos || {})]
    .filter(([, item]) => item && typeof item === "object" && item.channelId === channel?.id)
    .map(([id, item]) => videoWithChannel({
      id,
      title: item.title || id,
      published: item.savedAt || item.seenAt || "",
      description: item.description || "",
      tags: item.tags || item.keywords || item.topics || []
    }, channel));
  return mergeChannelVideoLists(currentVideos, [...feedVideos, ...savedVideos]);
}

function resetSelectedChannelVideoSearch() {
  window.clearTimeout(channelVideoSearchTimer);
  channelVideoSearchTimer = 0;
  channelVideoSearchController?.abort();
  channelVideoSearchController = null;
  channelVideoSearchRequestId += 1;
  channelVideoSearchQueryKey = "";
  channelVideoSearchResults = [];
  channelVideoSearchLoading = false;
  channelVideoSearchError = "";
  channelVideoSearchUsedYoutube = false;
}

async function runSelectedChannelVideoSearch(channel, rawQuery, requestId) {
  const controller = new AbortController();
  channelVideoSearchController = controller;
  try {
    const result = await fetchYoutubeScopedChannelSearch(channel, rawQuery, controller.signal, (videos) => {
      if (requestId !== channelVideoSearchRequestId || activeChannel?.id !== channel.id) return;
      channelVideoSearchResults = videos;
      renderSearchedVideos();
    });
    if (requestId !== channelVideoSearchRequestId || activeChannel?.id !== channel.id) return;
    channelVideoSearchResults = result;
  } catch (error) {
    if (error?.name === "AbortError" || requestId !== channelVideoSearchRequestId) return;
    channelVideoSearchError = error.message || "YouTube channel search failed";
  } finally {
    if (requestId === channelVideoSearchRequestId && activeChannel?.id === channel.id) {
      channelVideoSearchLoading = false;
      channelVideoSearchController = null;
      renderSearchedVideos();
    }
  }
}

function scheduleSelectedChannelVideoSearch() {
  const channel = activeChannel;
  const rawQuery = channelSearchQuery.trim();
  const queryKey = normalizeSearchText(rawQuery);
  if (!channel?.id || !queryKey) {
    resetSelectedChannelVideoSearch();
    return;
  }
  if (queryKey === channelVideoSearchQueryKey) return;

  window.clearTimeout(channelVideoSearchTimer);
  channelVideoSearchController?.abort();
  channelVideoSearchRequestId += 1;
  const requestId = channelVideoSearchRequestId;
  channelVideoSearchQueryKey = queryKey;
  channelVideoSearchResults = [];
  channelVideoSearchError = "";
  channelVideoSearchUsedYoutube = !channelVideoMetadataIsComplete(channel);
  channelVideoSearchLoading = channelVideoSearchUsedYoutube;
  renderSearchedVideos();
  if (!channelVideoSearchUsedYoutube) return;
  channelVideoSearchTimer = window.setTimeout(() => {
    channelVideoSearchTimer = 0;
    runSelectedChannelVideoSearch(channel, rawQuery, requestId).catch(() => {});
  }, 300);
}

function renderSearchedVideos() {
  syncChannelSearchState();
  const query = normalizeSearchText(channelSearchQuery.trim());
  if (!query) {
    renderChannelVideos(currentVideos);
    setStatus();
    return;
  }

  const activeChannelIsRendered = [...channelsEl.querySelectorAll(".channel")]
    .some((button) => button.dataset.channelId === activeChannel?.id);
  if (activeChannel?.id && !activeChannelIsRendered) renderChannels([activeChannel]);

  const localVideos = channelVideoSearchCandidates(activeChannel)
    .filter((video) => searchTextMatchesQuery(searchableTextForChannelVideo(video), query));
  const immediateLocalVideos = localVideos
    .filter((video) => searchTextMatchesQuery(video.title, query));
  const remoteVideos = channelVideoSearchQueryKey === query ? channelVideoSearchResults : [];
  const usesYoutube = channelVideoSearchQueryKey === query && channelVideoSearchUsedYoutube;
  const filteredVideos = usesYoutube
    ? mergeChannelVideoLists(immediateLocalVideos, remoteVideos)
    : localVideos;
  renderChannelVideos(filteredVideos);
  if (usesYoutube && channelVideoSearchLoading) {
    appendChannelSearchProgress();
    setStatus();
  } else if (usesYoutube && channelVideoSearchError) {
    setStatus(`YouTube channel search unavailable: ${channelVideoSearchError}`, true);
  } else if (usesYoutube) {
    setStatus(
      uiMessage(filteredVideos.length === 1 ? "youtubeChannelResult" : "youtubeChannelResults", [filteredVideos.length]),
      !filteredVideos.length
    );
  } else {
    setStatus(filteredVideos.length ? `${filteredVideos.length} videos found` : "No videos found in this channel.", !filteredVideos.length);
  }
}

function renderWatchLaterVideoResults(videos) {
  const watchLaterList = document.createElement("div");
  watchLaterList.className = "videos watchLaterVideos";
  channelsEl.classList.add("videoListHost");
  channelsEl.replaceChildren(watchLaterList);
  renderVideos(videos, watchLaterList);
}

function renderFavoriteVideoResults(videos) {
  const favoriteList = document.createElement("div");
  favoriteList.className = "videos favoriteVideos";
  channelsEl.classList.add("videoListHost");
  channelsEl.replaceChildren(favoriteList);
  const sortedVideos = sortVideosForDisplay(videos);
  const visibleGroups = new Map();
  for (const video of sortedVideos) {
    if (!video.videoGroupId) continue;
    if (!visibleGroups.has(video.videoGroupId)) visibleGroups.set(video.videoGroupId, []);
    visibleGroups.get(video.videoGroupId).push(video);
  }
  for (const members of visibleGroups.values()) {
    members.sort((left, right) => Number(left.videoGroupOrder || 0) - Number(right.videoGroupOrder || 0));
  }

  const renderedGroups = new Set();
  const items = [];
  for (const video of sortedVideos) {
    const members = visibleGroups.get(video.videoGroupId) || [];
    if (members.length < 2) {
      items.push(createVideoCard(video));
      continue;
    }
    if (renderedGroups.has(video.videoGroupId)) continue;
    renderedGroups.add(video.videoGroupId);
    items.push(createFavoriteVideoGroup(members));
  }
  favoriteList.replaceChildren(...items);
  enableFavoriteMarqueeSelection(favoriteList);
  syncFavoriteVideoSelection();
  setActiveVideoButton();
  syncVideoLayoutAvailability();
}

function syncFavoriteVideoSelection() {
  document.querySelectorAll(".favoriteVideos .video[data-video-id]").forEach((card) => {
    const selected = selectedFavoriteVideoIds.has(card.dataset.videoId || "");
    card.classList.toggle("is-multi-selected", selected);
    card.setAttribute("aria-selected", String(selected));
  });
}

function enableFavoriteMarqueeSelection(favoriteList) {
  favoriteList.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || !(event.target instanceof Element)) return;
    if (event.target.closest(".video, button, a, input, select, textarea, [role='button']")) return;
    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const initialSelection = event.ctrlKey || event.metaKey
      ? new Set(selectedFavoriteVideoIds)
      : new Set();
    if (!event.ctrlKey && !event.metaKey) {
      selectedFavoriteVideoIds.clear();
      syncFavoriteVideoSelection();
    }

    const marquee = document.createElement("div");
    marquee.className = "favoriteSelectionMarquee";
    marquee.hidden = true;
    document.body.append(marquee);
    let moved = false;

    const handlePointerMove = (moveEvent) => {
      const left = Math.min(startX, moveEvent.clientX);
      const top = Math.min(startY, moveEvent.clientY);
      const width = Math.abs(moveEvent.clientX - startX);
      const height = Math.abs(moveEvent.clientY - startY);
      moved ||= width > 3 || height > 3;
      if (!moved) return;

      marquee.hidden = false;
      Object.assign(marquee.style, {
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`
      });

      selectedFavoriteVideoIds.clear();
      initialSelection.forEach((videoId) => selectedFavoriteVideoIds.add(videoId));
      const selectionRect = { left, top, right: left + width, bottom: top + height };
      favoriteList.querySelectorAll(".video[data-video-id]").forEach((card) => {
        const bounds = card.getBoundingClientRect();
        const intersects = bounds.right >= selectionRect.left
          && bounds.left <= selectionRect.right
          && bounds.bottom >= selectionRect.top
          && bounds.top <= selectionRect.bottom;
        if (intersects) selectedFavoriteVideoIds.add(card.dataset.videoId);
      });
      syncFavoriteVideoSelection();
    };

    const handlePointerUp = () => {
      marquee.remove();
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);
  });
}

function createFavoriteVideoGroup(members) {
  const groupId = members[0]?.videoGroupId || "";
  const expanded = expandedFavoriteVideoGroups.has(groupId);
  const group = document.createElement("div");
  group.className = "favoriteVideoGroup";
  group.classList.toggle("is-expanded", expanded);
  group.dataset.favoriteGroupId = groupId;

  const summary = createVideoCard(members[0]);
  summary.classList.add("is-favorite-group-summary");
  summary.querySelector(".favoriteGroupBadge")?.remove();

  const toggle = document.createElement("button");
  toggle.className = "favoriteGroupToggle";
  toggle.type = "button";
  toggle.textContent = `1/${members.length} ${expanded ? "▴" : "▾"}`;
  toggle.title = uiMessage(expanded ? "collapseFavoriteGroup" : "expandFavoriteGroup", [members.length]);
  toggle.setAttribute("aria-label", toggle.title);
  toggle.setAttribute("aria-expanded", String(expanded));
  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (expanded) expandedFavoriteVideoGroups.delete(groupId);
    else expandedFavoriteVideoGroups.add(groupId);
    renderFavoritesHome();
  });
  summary.append(toggle);
  group.append(summary);

  if (expanded) {
    const memberList = document.createElement("div");
    memberList.className = "favoriteVideoGroupMembers";
    memberList.append(...members.slice(1).map(createVideoCard));
    group.append(memberList);
  }
  return group;
}

function channelNeedsMetadata(channel) {
  return channel?.id && (
    !channel.description
    || !(Array.isArray(channel.tags) && channel.tags.length)
    || !Number.isFinite(channel.subscriberCount)
  );
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
        if (!metadata.description && !metadata.tags?.length && !Number.isFinite(metadata.subscriberCount)) continue;
        allChannels = allChannels.map((item) => item.id === channel.id ? {
          ...item,
          description: metadata.description || item.description || "",
          tags: metadata.tags?.length ? metadata.tags : item.tags || [],
          subscriberCount: Number.isFinite(metadata.subscriberCount) ? metadata.subscriberCount : item.subscriberCount,
          subscriberCountText: metadata.subscriberCountText || item.subscriberCountText || ""
        } : item);
        changed = true;
        if (activeChannel?.id) activeChannel = allChannels.find((item) => item.id === activeChannel.id) || activeChannel;
        renderCategories();
        if (!isSelectedChannelSearchScope() && normalizeSearchText(channelSearchQuery.trim()) === query) {
          renderChannels(sourceChannelsForSearch());
        }
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
  if (!channelSearchQuery.trim()) return;
  window.clearTimeout(channelSearchMetadataRefreshTimer);
  channelSearchMetadataRefreshTimer = window.setTimeout(() => {
    enrichChannelsForSearch(channels).catch(() => {});
  }, 250);
}

function renderSearchResults() {
  syncChannelSearchState();
  if (activeView === "favorites") {
    renderFavoritesHome();
    return;
  }
  if (isSelectedChannelSearchScope()) {
    renderSearchedVideos();
    scheduleSelectedChannelVideoSearch();
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

  const nextConfig = {
    version: 1,
    categories: allCategories,
    favoriteCategories,
    channels: allChannels,
    favorites,
    seenVideos,
    watchLater,
    updatedAt: config.updatedAt || ""
  };
  const previousContent = synchronizableConfig({ ...config, updatedAt: "" });
  const nextContent = synchronizableConfig({ ...nextConfig, updatedAt: "" });
  nextConfig.updatedAt = synchronizationContentChanged(previousContent, nextContent)
    ? new Date().toISOString()
    : config.updatedAt || new Date().toISOString();
  config = nextConfig;

  await writeStoredConfig(config);
  allCategories = config.categories || [];
  favoriteCategories = config.favoriteCategories || [];
  allChannels = config.channels || [];
  favorites = config.favorites || {};
  seenVideos = config.seenVideos || {};
  watchLater = config.watchLater || {};
}

function renderCategories() {
  const expandedParentId = expandedCategoryParentId(allCategories, activeCategoryId);
  const visibleCategories = sortedCategorySiblings(allCategories).flatMap((category) => [
    category,
    ...(expandedParentId === category.id ? sortedCategorySiblings(allCategories, category.id) : [])
  ]);
  const buttons = [
    { id: "", name: uiMessage("allChannels") },
    ...visibleCategories,
    { id: UNCATEGORIZED_CATEGORY_ID, name: uiMessage("uncategorized") }
  ].map((category) => {
    const button = document.createElement("button");
    button.className = "category";
    button.classList.toggle("is-special", Boolean(category.special));
    button.classList.toggle("is-auto", Boolean(category.automatic));
    button.classList.toggle("is-subcategory", Boolean(category.parentId));
    button.classList.toggle("has-children", allCategories.some((item) => item.parentId === category.id));
    button.classList.toggle("is-ancestor-active", expandedParentId === category.id && activeCategoryId !== category.id);
    button.type = "button";
    button.textContent = category.name;
    if (category.id && !category.special && !category.automatic) attachCategoryDropTarget(button, category.id);
    button.classList.toggle(
      "is-active",
      activeView === "channels" && category.id === activeCategoryId
    );
    button.addEventListener("click", async () => {
      await maybePromptSeenForWatchLater();
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
    savedAt: item.savedAt || "",
    published: item.savedAt || "",
    channelId: item.channelId || "",
    channel: item.channel || allChannels.find((channel) => channel.id === item.channelId)?.title || "",
    note: item.note || "",
    views: item.views || "",
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
  repairMissingSavedVideoMetadata().catch(() => {});
}

function createFavoriteCategory(name, parentId = "") {
  const trimmed = name.trim();
  const idBase = slugify(trimmed);
  if (!idBase) return null;
  const existing = favoriteCategories.find((category) => category.name.toLocaleLowerCase("fr") === trimmed.toLocaleLowerCase("fr"));
  if (existing) return existing;
  let id = idBase;
  let suffix = 2;
  while (favoriteCategories.some((category) => category.id === id)) {
    id = `${idBase}-${suffix}`;
    suffix += 1;
  }
  const validParentId = favoriteCategories.some((item) => item.id === parentId && !item.parentId) ? parentId : "";
  const category = { id, name: trimmed, ...(validParentId ? { parentId: validParentId } : {}) };
  favoriteCategories.push(category);
  return category;
}

function sortedFavoriteCategories() {
  return sortedCategoryTree(favoriteCategories);
}

function syncFavoriteButtons(videoId = "") {
  const selector = videoId
    ? `.favoriteButton[data-video-id="${CSS.escape(videoId)}"]`
    : ".favoriteButton[data-video-id]";
  document.querySelectorAll(selector).forEach((button) => {
    const isFavorite = Boolean(favorites[button.dataset.videoId]);
    button.classList.toggle("is-active", isFavorite);
    button.textContent = isFavorite ? "\u2605" : "\u2606";
    button.title = isFavorite ? "Remove from Favorites" : "Add to Favorites";
    button.setAttribute("aria-label", button.title);
  });
}

async function toggleFavorite(video) {
  if (!video?.id) return;
  if (favorites[video.id]) {
    const groupId = favorites[video.id].videoGroupId || "";
    delete favorites[video.id];
    normalizeFavoriteVideoGroup(groupId);
    await saveConfig();
    syncFavoriteButtons(video.id);
    showInfoPopup(`"${video.title || video.id}" removed from Favorites.`, "info");
    return;
  }
  await addVideoToFavorites(video);
  syncFavoriteButtons(video.id);
}

async function removeFavorite(video) {
  return removeFavorites(video?.id ? [video.id] : [], video);
}

async function removeFavorites(videoIds, fallbackVideo = null) {
  const ids = [...new Set(videoIds)].filter((videoId) => favorites[videoId]);
  if (!ids.length) return;
  const confirmation = ids.length > 1
    ? uiMessage("confirmRemoveSelectedFavorites", [ids.length])
    : `Remove "${fallbackVideo?.title || favorites[ids[0]]?.title || ids[0]}" from Favorites?`;
  if (!await requestConfirmation(confirmation)) return;

  const affectedGroupIds = new Set(ids.map((videoId) => favorites[videoId]?.videoGroupId).filter(Boolean));
  ids.forEach((videoId) => {
    delete favorites[videoId];
    selectedFavoriteVideoIds.delete(videoId);
  });
  affectedGroupIds.forEach(normalizeFavoriteVideoGroup);

  // Refresh immediately from the in-memory collection instead of leaving the
  // deleted cards visible while extension storage is being written.
  renderFavoritesHome();
  ids.forEach(syncFavoriteButtons);
  await saveConfig();
}

async function completeDroppedVideoMetadata(video) {
  if (!video?.id) return video;
  const hasTitle = video.title && video.title !== video.id;
  if (hasTitle && video.channel && video.channelId) return video;
  let completed = { ...video };
  if (youtubeTitleLanguage === "original") {
    try {
      const watchUrl = new URL("https://www.youtube.com/watch");
      watchUrl.searchParams.set("v", video.id);
      watchUrl.searchParams.set("hl", "en");
      const response = await fetch(watchUrl, {
        cache: "no-store",
        credentials: "omit"
      });
      if (response.ok) {
        const html = await response.text();
        const videoDetailsJson = extractJsonObjectAfter(html, "\"videoDetails\":");
        const videoDetails = videoDetailsJson ? JSON.parse(videoDetailsJson) : null;
        if (videoDetails?.videoId === video.id) {
          completed = {
            ...completed,
            title: hasTitle ? completed.title : String(videoDetails.title || completed.title || video.id).trim(),
            channelId: completed.channelId || String(videoDetails.channelId || "").trim(),
            channel: completed.channel || String(videoDetails.author || "").trim(),
            description: completed.description || String(videoDetails.shortDescription || "").trim(),
            tags: completed.tags?.length ? completed.tags : videoDetails.keywords || [],
            views: completed.views || String(videoDetails.viewCount || "").trim()
          };
        }
      }
    } catch {
      // Fall back to oEmbed and YouTube search metadata below.
    }
  }
  if (completed.title && completed.title !== completed.id && completed.channel && completed.channelId) return completed;
  try {
    const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`;
    const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`, {
      cache: "force-cache",
      credentials: "omit"
    });
    if (response.ok) {
      const metadata = await response.json();
      completed = {
        ...completed,
        title: hasTitle ? completed.title : String(metadata?.title || completed.title || video.id).trim(),
        channel: completed.channel || String(metadata?.author_name || "").trim()
      };
      const authorUrl = String(metadata?.author_url || "").trim();
      if (!completed.channelId && authorUrl) {
        completed.channelId = await resolveDroppedChannelId(authorUrl, { silent: true }).catch(() => "");
      }
    }
  } catch {
    // Fall back to YouTube search metadata below.
  }
  if (!hasTitle && completed.channelId) {
    try {
      const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(completed.channelId)}`, {
        cache: "no-store"
      });
      if (response.ok) {
        const feedVideo = parseFeed(await response.text()).find((item) => item.id === video.id);
        if (feedVideo?.title) {
          completed = {
            ...completed,
            title: feedVideo.title,
            description: completed.description || feedVideo.description || "",
            tags: completed.tags?.length ? completed.tags : feedVideo.tags || []
          };
        }
      }
    } catch {
      // Keep the title carried by the drop or returned by oEmbed.
    }
  }
  if (completed.title && completed.title !== completed.id && completed.channel && completed.channelId) return completed;
  try {
    const match = (await fetchYoutubeGlobalSearchResults(video.id, { limit: 8 }))
      .find((item) => item.type === "video" && item.id === video.id);
    if (match) return {
      ...completed,
      title: completed.title && completed.title !== completed.id ? completed.title : match.title || completed.id,
      channelId: completed.channelId || match.channelId || "",
      channel: completed.channel || match.channel || "",
      views: completed.views || match.views || match.viewCountText || ""
    };
  } catch {
    // Keep the metadata carried by the drag operation when YouTube is unavailable.
  }
  return completed;
}

async function repairMissingSavedVideoMetadata() {
  if (savedVideoMetadataRefreshInFlight || !configLoaded) return;
  const candidates = [...new Set([
    ...Object.keys(favorites),
    ...Object.keys(watchLater)
  ])].filter((videoId) => {
    const items = [favorites[videoId], watchLater[videoId]].filter(Boolean);
    return items.some((item) => !item.channel || !item.channelId || !item.title || item.title === videoId);
  });
  if (!candidates.length) return;

  savedVideoMetadataRefreshInFlight = true;
  let changed = false;
  let nextIndex = 0;
  const workerCount = Math.min(4, candidates.length);

  async function repairNextVideo() {
    while (nextIndex < candidates.length) {
      const videoId = candidates[nextIndex++];
      const source = favorites[videoId] || watchLater[videoId] || {};
      const completed = await completeDroppedVideoMetadata({ id: videoId, ...source });
      for (const collection of [favorites, watchLater]) {
        const item = collection[videoId];
        if (!item) continue;
        const repaired = {
          ...item,
          title: !item.title || item.title === videoId ? completed.title || videoId : item.title,
          channelId: item.channelId || completed.channelId || "",
          channel: item.channel || completed.channel || "",
          views: item.views || completed.views || completed.viewCountText || ""
        };
        if (repaired.title !== item.title || repaired.channelId !== item.channelId || repaired.channel !== item.channel || repaired.views !== item.views) {
          collection[videoId] = repaired;
          changed = true;
        }
      }
    }
  }

  try {
    await Promise.all(Array.from({ length: workerCount }, repairNextVideo));
    if (!changed) return;
    await saveConfig();
    if (activePrimarySection === "favorites") renderFavoritesHome();
    else if (activePrimarySection === "watchLater") renderWatchLater();
  } finally {
    savedVideoMetadataRefreshInFlight = false;
  }
}

async function addVideoToWatchLater(video) {
  if (!video?.id) return false;
  video = await completeDroppedVideoMetadata(video);
  const existing = watchLater[video.id];
  if (existing) {
    const repaired = {
      ...existing,
      channelId: existing.channelId || video.channelId || "",
      channel: existing.channel || video.channel || "",
      title: !existing.title || existing.title === video.id ? video.title || video.id : existing.title,
      views: existing.views || video.views || video.viewCountText || ""
    };
    if (repaired.channelId !== existing.channelId || repaired.channel !== existing.channel || repaired.title !== existing.title || repaired.views !== existing.views) {
      watchLater[video.id] = repaired;
      await saveConfig();
      if (activeView === "watchLater") renderWatchLater();
      showInfoPopup("Watch later metadata updated.", "ok");
      return true;
    }
    showInfoPopup("This video is already in Watch later.", "info");
    return false;
  }
  watchLater[video.id] = {
    savedAt: new Date().toISOString(),
    seenAt: "",
    channelId: video.channelId || "",
    title: video.title || video.id,
    description: video.description || "",
    tags: video.tags || video.keywords || video.topics || [],
    views: video.views || video.viewCountText || "",
    channel: video.channel || ""
  };
  await saveConfig();
  if (activeView === "watchLater") renderWatchLater();
  showInfoPopup(`"${video.title || video.id}" added to Watch later.`, "ok");
  return true;
}

async function addVideoToFavorites(video, categoryId = "") {
  if (!video?.id) return false;
  video = await completeDroppedVideoMetadata(video);
  const targetCategoryId = favoriteCategories.some((category) => category.id === categoryId) ? categoryId : "";
  const current = favorites[video.id];
  if (current) {
    if (targetCategoryId && !(current.categories || []).includes(targetCategoryId)) {
      favorites[video.id] = {
        ...current,
        categories: [...new Set([...(current.categories || []), targetCategoryId])]
      };
      await saveConfig();
      if (activeView === "favorites") renderFavoritesHome();
      syncFavoriteButtons(video.id);
      showInfoPopup(`"${current.title || video.title || video.id}" added to this favorite category.`, "ok");
      return true;
    }
    showInfoPopup("This video is already in Favorites.", "info");
    return false;
  }
  favorites[video.id] = {
    savedAt: new Date().toISOString(),
    channelId: video.channelId || "",
    title: video.title || video.id,
    description: video.description || "",
    tags: video.tags || video.keywords || video.topics || [],
    views: video.views || video.viewCountText || "",
    channel: video.channel || "",
    categories: targetCategoryId ? [targetCategoryId] : []
  };
  await saveConfig();
  if (activeView === "favorites") renderFavoritesHome();
  syncFavoriteButtons(video.id);
  showInfoPopup(`"${video.title || video.id}" added to Favorites.`, "ok");
  return true;
}

function droppedFavoriteVideoIdsFromDataTransfer(dataTransfer) {
  const payload = dataTransfer?.getData(FAVORITE_VIDEO_CATEGORY_DRAG_TYPE) || "";
  if (!payload) return [];
  try {
    const videoIds = JSON.parse(payload);
    if (!Array.isArray(videoIds)) return [];
    return [...new Set(videoIds.filter((videoId) => typeof videoId === "string" && favorites[videoId]))];
  } catch {
    return [];
  }
}

async function addFavoriteVideosToCategory(videoIds, categoryId = "") {
  const ids = [...new Set(videoIds)].filter((videoId) => favorites[videoId]);
  if (!ids.length) return;

  const clearCategories = categoryId === UNCATEGORIZED_CATEGORY_ID;
  const targetCategoryId = favoriteCategories.some((category) => category.id === categoryId) ? categoryId : "";
  if (!clearCategories && !targetCategoryId) return;

  let changed = 0;
  ids.forEach((videoId) => {
    const item = favorites[videoId];
    const categories = clearCategories
      ? []
      : [...new Set([...(item.categories || []), targetCategoryId])];
    if (JSON.stringify(categories) === JSON.stringify(item.categories || [])) return;
    favorites[videoId] = { ...item, categories };
    changed += 1;
  });
  if (!changed) return;

  renderFavoritesHome();
  await saveConfig();
  showInfoPopup(uiMessage("favoritesAddedToCategory", [changed]), "ok");
}

function droppedVideoFromDataTransfer(dataTransfer) {
  const payload = dataTransfer?.getData("application/x-youtube-channel-shelf-video") || "";
  if (payload) {
    try {
      const video = JSON.parse(payload);
      if (videoIdFromInput(video.id || "")) return video;
    } catch {
      // Fall back to the URL payload.
    }
  }
  const value = dataTransfer?.getData("text/uri-list") || dataTransfer?.getData("text/plain") || "";
  const id = videoIdFromInput(value.split(/\r?\n/).find((line) => line && !line.startsWith("#")) || value);
  if (!id) return null;

  let title = "";
  const html = dataTransfer?.getData("text/html") || "";
  if (html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const matchingLink = [...doc.querySelectorAll("a[href]")].find((link) => videoIdFromInput(link.href) === id);
    const titleCandidates = [
      matchingLink?.getAttribute("title"),
      matchingLink?.getAttribute("aria-label"),
      matchingLink?.querySelector("img[alt]")?.getAttribute("alt"),
      matchingLink?.textContent
    ];
    title = titleCandidates
      .map((candidate) => String(candidate || "").replace(/\s+/g, " ").trim())
      .find((candidate) => candidate && candidate !== id && !videoIdFromInput(candidate)) || "";
  }
  return { id, title: title || id };
}

function renderFavoritesHome() {
  activeView = "favorites";
  activeChannel = null;
  activeVideoId = "";
  const favoriteVideoGroupSizes = Object.values(favorites).reduce((sizes, item) => {
    if (item?.videoGroupId) sizes.set(item.videoGroupId, (sizes.get(item.videoGroupId) || 0) + 1);
    return sizes;
  }, new Map());
  const favoriteSearchQuery = normalizeSearchText(channelSearchQuery.trim());
  currentVideos = Object.entries(favorites)
    .map(([id, item]) => ({
      id,
      title: item.title || id,
      savedAt: item.savedAt || "",
      published: item.savedAt || "",
      channelId: item.channelId || "",
      channel: item.channel || allChannels.find((channel) => channel.id === item.channelId)?.title || "",
      note: item.note || "",
      views: item.views || "",
      description: item.description || "",
      tags: item.tags || item.keywords || item.topics || [],
      thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
      categories: item.categories || [],
      videoGroupId: item.videoGroupId || "",
      videoGroupOrder: Number(item.videoGroupOrder || 0),
      videoGroupSize: favoriteVideoGroupSizes.get(item.videoGroupId) || 0
    }))
    .filter((video) => {
      if (favoriteSearchQuery) return true;
      if (activeFavoriteCategoryId === UNCATEGORIZED_CATEGORY_ID) return !video.categories.length;
      if (!activeFavoriteCategoryId) return true;
      const categoryIds = categoryIdsForSelection(favoriteCategories, activeFavoriteCategoryId);
      return video.categories.some((id) => categoryIds.has(id));
    })
    .filter((video) => !favoriteSearchQuery || searchableTextForVideo(video).includes(favoriteSearchQuery))
    .sort((a, b) => String(b.published).localeCompare(String(a.published)));
  document.body.classList.remove("sidePanelVideos");
  document.body.classList.add("virtualVideoListView");
  listViewEl.hidden = false;
  playerViewEl.hidden = true;
  videosEl.replaceChildren();
  if (currentVideos.length) {
    renderFavoriteVideoResults(currentVideos);
  } else {
    channelsEl.classList.add("videoListHost");
    const message = document.createElement("p");
    message.className = "meta channelSearchEmpty";
    message.textContent = favoriteSearchQuery
      ? uiMessage("noFavoritesFound")
      : activeFavoriteCategoryId
        ? uiMessage("noFavoritesInCategory")
        : uiMessage("noFavoritesYet");
    channelsEl.replaceChildren(message);
  }
  renderCategories();
  setActiveChannelButton();
  setHeader("", false);
  syncStackedChannelViewState();
  syncVideoLayoutAvailability();
  setStatus();
  repairMissingSavedVideoMetadata().catch(() => {});
}

function showFavoritesCategory(categoryId = "", options = {}) {
  setActivePrimarySection("favorites");
  activeFavoriteCategoryId = categoryId || "";
  clearChannelSearch();
  renderFavoritesHome();
  if (!options.skipHistory) pushHistory({ type: "favorites", id: activeFavoriteCategoryId });
}

function renderChannels(channels) {
  channelsEl.classList.remove("videoListHost");
  const visibleChannels = sortChannelsForDisplay(
    isSelectedChannelSearchScope() ? channels : filterChannelsForSearch(channels)
  );
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
        age.title = uiMessage("openThisWeek");
        age.textContent = ageLabel;
        age.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          youtubeSearchQuery = "";
          searchInputEl.value = "";
          pushHistory({ type: "youtubeHome", id: "youtube" });
          showYoutubeSearchHome();
        });
        age.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          event.stopPropagation();
          youtubeSearchQuery = "";
          searchInputEl.value = "";
          pushHistory({ type: "youtubeHome", id: "youtube" });
          showYoutubeSearchHome();
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
    const displayedChannel = channel
      || (activeChannel?.id === button.dataset.channelId ? activeChannel : null);
    if (meta) {
      meta.replaceChildren();
      if (displayedChannel?.subscriberCountText) {
        const subscriberLine = document.createElement("div");
        subscriberLine.textContent = displayedChannel.subscriberCountText;
        meta.append(subscriberLine);
      }
      if (isActive && document.body.classList.contains("sidePanelVideos")) {
        const count = displayedChannel?.channelVideoCount || 0;
        const date = displayedChannel?.feedLatestPublished ? formatDate(displayedChannel.feedLatestPublished) : "";
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
    const channelCategories = (channel?.categories || [])
      .map((categoryId) => allCategories.find((category) => category.id === categoryId))
      .filter(Boolean);
    if (!channelCategories.length) {
      if (isActive && document.body.classList.contains("sidePanelVideos")) {
        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "channelCategoryChip channelCategoryAddChip";
        addButton.textContent = channel ? "Add category" : uiMessage("addToMyChannels");
        addButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (channel) {
            openCategoryAssignment(channel);
          } else if (displayedChannel?.id) {
            addChannelById(displayedChannel.id, "").catch((error) => setStatus(error.message, true));
          }
        });
        categoryList.append(addButton);
      }
      continue;
    }

    categoryList.append(
      ...channelCategories.map((category) => {
        const item = document.createElement("span");
        item.className = "channelCategoryChip";
        item.role = "button";
        item.tabIndex = 0;
        item.textContent = category.name;
        item.title = `Show channels in ${category.name}. Right-click to edit classification.`;
        item.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          showCategoryChannels(category.id).catch((error) => setStatus(`Unable to open category: ${error.message}`, true));
        });
        item.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          event.stopPropagation();
          showCategoryChannels(category.id).catch((error) => setStatus(`Unable to open category: ${error.message}`, true));
        });
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
  syncActiveChannelActions();
}

function syncChannelCategoryLineHeights() {
  requestAnimationFrame(() => {
    for (const button of channelsEl.querySelectorAll(".channel")) {
      const categoryList = button.querySelector(".channelCategoryList");
      const chips = categoryList ? [...categoryList.children] : [];
      const rowCount = chips.length ? new Set(chips.map((chip) => chip.offsetTop)).size : 0;
      const categoryHeight = chips.length ? categoryList.scrollHeight : 0;
      const extraHeight = categoryHeight ? categoryHeight + 4 : 0;
      button.classList.toggle("has-category-lines", categoryHeight > 0);
      button.classList.toggle("has-multiple-category-lines", rowCount > 1);
      button.style.setProperty("--category-extra-height", `${extraHeight}px`);
    }
  });
}

async function selectChannel(channel, options = {}) {
  if (currentWatchLaterVideoId && watchLater[currentWatchLaterVideoId]) {
    await maybePromptSeenForWatchLater();
  }
  const fullChannel = allChannels.find((item) => item.id === channel?.id) || channel;
  setActivePrimarySection("channels");
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
  const channelIsRendered = [...channelsEl.querySelectorAll(".channel")]
    .some((button) => button.dataset.channelId === fullChannel.id);
  if (channelIsRendered) setActiveChannelButton();
  else renderChannels([fullChannel]);

  if (!options.skipHistory) {
    pushHistory({ type: "channel", id: channel.id });
  }

  await loadFeed();
}

async function fetchRssChannelVideos(channel) {
  const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channel.id)}`, {
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`RSS request failed: HTTP ${response.status}`);
  return parseFeed(await response.text()).map((video) => videoWithChannel(video, channel));
}

function innertubeVideosWithChannel(videos, channel) {
  return videos.map((video) => videoWithChannel({
    ...video,
    views: video.viewCountText || "",
    description: "",
    tags: []
  }, channel));
}

function mergeChannelVideoLists(current, additional) {
  const merged = new Map(current.filter((video) => video?.id).map((video) => [video.id, video]));
  for (const video of additional) {
    if (!video?.id) continue;
    const existing = merged.get(video.id);
    merged.set(video.id, existing ? {
      ...video,
      ...existing,
      published: !video.publishedText && video.published ? video.published : existing.published || video.published || "",
      description: existing.description || video.description || "",
      tags: existing.tags?.length ? existing.tags : video.tags || [],
      views: existing.views || video.views || "",
      duration: existing.duration || video.duration || "",
      publishedText: existing.publishedText || video.publishedText || ""
    } : video);
  }
  return [...merged.values()];
}

function youtubeOrderForChannelMode(mode) {
  if (mode === "views-desc") return "popular";
  return "";
}

function requestedChannelVideosYoutubeSort() {
  return youtubeOrderForChannelMode(sortModeForScope(currentSortScope())) || "latest";
}

async function loadChannelVideosForYoutubeOrder(sort) {
  if (!activeChannel?.id) return;
  const channel = activeChannel;
  const requestId = ++channelVideoLoadRequestId;
  channelVideosContinuation = "";
  channelVideosLoadingMore = false;
  channelVideosInnertubeFailed = false;
  channelVideosLoadedSort = "local";
  setStatus("Loading...", true);
  refreshEl.disabled = true;

  try {
    const page = await fetchYoutubeChannelVideosPage({ channelId: channel.id, sort });
    if (requestId !== channelVideoLoadRequestId || activeChannel?.id !== channel.id) return;
    currentVideos = innertubeVideosWithChannel(page.videos, channel);
    channelVideosContinuation = page.continuation || "";
    channelVideosLoadedSort = page.sort || sort;
    if (channelSearchQuery.trim() && isSelectedChannelSearchScope()) renderSearchedVideos();
    else renderChannelVideos(currentVideos);
    setStatus();
  } catch (error) {
    if (requestId !== channelVideoLoadRequestId || activeChannel?.id !== channel.id) return;
    channelVideosLoadedSort = "local";
    if (channelSearchQuery.trim() && isSelectedChannelSearchScope()) renderSearchedVideos();
    else renderChannelVideos(currentVideos);
    setStatus(`YouTube ${sort} order unavailable: ${error.message}`, true);
  } finally {
    if (requestId === channelVideoLoadRequestId) refreshEl.disabled = false;
  }
}

function channelVideoMetadataIsComplete(channel) {
  const expectedVideoCount = Number(channel?.channelVideoCount);
  if (!Number.isFinite(expectedVideoCount) || expectedVideoCount <= 0) return false;
  const availableVideoIds = new Set(
    channelVideoSearchCandidates(channel)
      .map((video) => video?.id)
      .filter(Boolean)
  );
  return availableVideoIds.size >= expectedVideoCount;
}

async function fetchYoutubeScopedChannelSearch(channel, rawQuery, signal, onPage) {
  const searchQuery = [rawQuery, channel.title].filter(Boolean).join(" ");
  const locale = await detectYoutubeSearchLocale(rawQuery);
  const url = new URL("https://www.youtube.com/results");
  url.searchParams.set("search_query", searchQuery);
  url.searchParams.set("sp", "EgIQAfABAQ%3D%3D");
  url.searchParams.set("hl", locale.hl);
  url.searchParams.set("gl", locale.gl);
  const html = await fetchYoutubeSearchHtml(url, signal);
  const initialData = extractJsonObjectAfter(html, "ytInitialData")
    || extractJsonObjectAfter(html, "var ytInitialData =");
  if (!initialData) throw new Error("YouTube returned no search data");
  const data = JSON.parse(initialData);
  const matches = new Map();
  const appendMatches = (results) => {
    for (const result of results) {
      if (result.type !== "video" || result.channelId !== channel.id) continue;
      if (!searchTextMatchesQuery(result.title, rawQuery)) continue;
      const { type: _type, ...video } = result;
      matches.set(video.id, videoWithChannel(video, channel));
    }
    onPage?.([...matches.values()]);
  };

  appendMatches(youtubeSearchResultsFromData(data));
  let continuation = youtubeSearchContinuationToken(data);
  const apiKey = youtubeConfigValue(html, "INNERTUBE_API_KEY");
  const clientVersion = youtubeConfigValue(html, "INNERTUBE_CLIENT_VERSION")
    || youtubeConfigValue(html, "INNERTUBE_CONTEXT_CLIENT_VERSION");
  const visitorData = youtubeConfigValue(html, "VISITOR_DATA")
    || youtubeConfigValue(html, "INNERTUBE_CONTEXT_VISITOR_DATA");
  const seenContinuations = new Set();

  while (continuation && clientVersion && !seenContinuations.has(continuation)) {
    seenContinuations.add(continuation);
    const page = await fetchYoutubeGlobalSearchPage(searchQuery, {
      continuation,
      apiKey,
      clientVersion,
      visitorData,
      locale,
      signal
    });
    appendMatches(page.results);
    continuation = page.continuation || "";
  }
  return [...matches.values()];
}

async function fetchYoutubeSearchHtml(url, signal) {
  if (!globalThis.chrome?.runtime?.sendMessage) {
    const response = await fetch(url, { cache: "no-store", credentials: "omit", signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  }
  const abortPromise = new Promise((_, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
  });
  const result = await Promise.race([
    chrome.runtime.sendMessage({ type: "YOUTUBE_SHELF_SEARCH_PAGE", url: String(url) }),
    abortPromise
  ]);
  if (!result?.ok) throw new Error(result?.error || "YouTube search failed");
  return result.text || "";
}

async function fetchYoutubeSearchContinuation(body, { clientVersion, visitorData = "", signal } = {}) {
  if (!globalThis.chrome?.runtime?.sendMessage) {
    const response = await fetch("https://www.youtube.com/youtubei/v1/search?prettyPrint=false", {
      method: "POST",
      cache: "no-store",
      credentials: "omit",
      signal,
      headers: {
        "Content-Type": "application/json",
        "X-YouTube-Client-Name": "1",
        "X-YouTube-Client-Version": clientVersion,
        ...(visitorData ? { "X-Goog-Visitor-Id": visitorData } : {})
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
  const abortPromise = new Promise((_, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
  });
  const result = await Promise.race([
    chrome.runtime.sendMessage({
      type: "YOUTUBE_SHELF_SEARCH_CONTINUATION",
      body,
      clientVersion,
      visitorData
    }),
    abortPromise
  ]);
  if (!result?.ok) throw new Error(result?.error || "YouTube search failed");
  return result.data || {};
}

function syncActiveChannelActions() {
  if (!assignCategoriesEl || !unsubscribeEl) return;
  const channelIsSaved = Boolean(activeChannel?.id)
    && allChannels.some((channel) => channel.id === activeChannel.id);
  assignCategoriesEl.textContent = uiMessage(channelIsSaved ? "classify" : "addToMyChannels");
  unsubscribeEl.hidden = !channelIsSaved;
}

async function loadMoreChannelVideos() {
  if (!activeChannel?.id || !channelVideosContinuation || channelVideosLoadingMore) return;
  const channel = activeChannel;
  const continuation = channelVideosContinuation;
  const loadedSort = channelVideosLoadedSort;
  const requestId = channelVideoLoadRequestId;
  channelVideosLoadingMore = true;
  renderChannelVideos(currentVideos);
  try {
    const page = await fetchYoutubeChannelVideosPage({
      channelId: channel.id,
      continuation,
      sort: loadedSort === "popular" ? "popular" : "latest"
    });
    if (requestId !== channelVideoLoadRequestId || activeChannel?.id !== channel.id) return;
    currentVideos = mergeChannelVideoLists(currentVideos, innertubeVideosWithChannel(page.videos, channel));
    channelVideosContinuation = page.continuation || "";
    if (loadedSort !== "local") channelVideosLoadedSort = page.sort || loadedSort;
    channelVideosInnertubeFailed = false;
    if (channelSearchQuery.trim() && isSelectedChannelSearchScope()) renderSearchedVideos();
    else {
      renderChannelVideos(currentVideos);
      setStatus();
    }
  } catch (error) {
    if (requestId !== channelVideoLoadRequestId || activeChannel?.id !== channel.id) return;
    setStatus(`Unable to load more videos: ${error.message}`, true);
  } finally {
    if (requestId === channelVideoLoadRequestId && activeChannel?.id === channel.id) {
      channelVideosLoadingMore = false;
      if (channelSearchQuery.trim() && isSelectedChannelSearchScope()) renderSearchedVideos();
      else renderChannelVideos(currentVideos);
    }
  }
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

  const channel = activeChannel;
  const requestedYoutubeOrder = youtubeOrderForChannelMode(sortModeForScope(currentSortScope()));
  const requestedYoutubeSort = requestedChannelVideosYoutubeSort();
  const requestId = ++channelVideoLoadRequestId;
  channelVideosContinuation = "";
  channelVideosLoadingMore = false;
  channelVideosInnertubeFailed = false;
  setStatus("Loading...", true);
  refreshEl.disabled = true;

  try {
    let rssVideos = [];
    let rssLoaded = false;
    let innertubePage = null;
    let partialMessage = "";
    if (requestedYoutubeOrder) {
      try {
        innertubePage = await fetchYoutubeChannelVideosPage({
          channelId: channel.id,
          sort: requestedYoutubeSort
        });
      } catch (error) {
        partialMessage = `YouTube ${requestedYoutubeSort} order unavailable: using the loaded videos (${error.message}).`;
      }
    }
    if (!innertubePage && channelVideoSource === "hybrid") {
      const [rssResult, innertubeResult] = await Promise.allSettled([
        fetchRssChannelVideos(channel),
        fetchYoutubeChannelVideosPage({ channelId: channel.id, sort: "latest" })
      ]);
      if (rssResult.status === "fulfilled") {
        rssVideos = rssResult.value;
        rssLoaded = true;
      }
      if (innertubeResult.status === "fulfilled") innertubePage = innertubeResult.value;
      if (rssResult.status === "rejected" && innertubeResult.status === "rejected") {
        throw rssResult.reason || innertubeResult.reason || new Error("No videos returned");
      }
      if (rssResult.status === "rejected") partialMessage ||= "RSS unavailable: dates come from Innertube.";
      if (innertubeResult.status === "rejected") {
        channelVideosInnertubeFailed = true;
        const detail = innertubeResult.reason?.message || "unknown error";
        partialMessage ||= `Pagination unavailable: showing the RSS feed (${detail}).`;
      }
    } else if (!innertubePage && channelVideoSource === "innertube") {
      innertubePage = await fetchYoutubeChannelVideosPage({
        channelId: channel.id,
        sort: "latest"
      });
    } else if (!innertubePage && channelVideoSource === "rss") {
      rssVideos = await fetchRssChannelVideos(channel);
      rssLoaded = true;
    }
    if (requestId !== channelVideoLoadRequestId || activeChannel?.id !== channel.id) return;

    const innertubeVideos = innertubePage ? innertubeVideosWithChannel(innertubePage.videos, channel) : [];
    currentVideos = channelVideoSource === "hybrid"
      ? mergeChannelVideoLists(rssVideos, innertubeVideos)
      : channelVideoSource === "innertube" ? innertubeVideos : rssVideos;
    if (requestedYoutubeOrder && innertubePage?.sort === requestedYoutubeSort) currentVideos = innertubeVideos;
    channelVideosContinuation = innertubePage?.continuation || "";
    channelVideosLoadedSort = requestedYoutubeOrder && innertubePage?.sort === requestedYoutubeSort
      ? requestedYoutubeSort
      : "local";

    if (channelSearchQuery.trim() && isSelectedChannelSearchScope()) {
      renderSearchedVideos();
    } else {
      renderChannelVideos(currentVideos);
      setStatus(partialMessage, Boolean(partialMessage));
    }

    let channelVideoCount = channel.channelVideoCount || 0;
    let channelMetadata = {
      description: channel.description || "",
      tags: channel.tags || [],
      subscriberCount: channel.subscriberCount,
      subscriberCountText: channel.subscriberCountText || ""
    };
    const needsVideoCount = !Number.isFinite(channel.channelVideoCount) || channel.channelVideoCount <= 0;
    const needsMetadata = !channel.description
      || !channel.tags?.length
      || !Number.isFinite(channel.subscriberCount);
    const [videoCountResult, metadataResult] = await Promise.allSettled([
      needsVideoCount ? fetchChannelVideoCount(channel.id) : Promise.resolve(0),
      needsMetadata ? fetchChannelMetadata(channel.id) : Promise.resolve(null)
    ]);
    if (videoCountResult.status === "fulfilled") {
      channelVideoCount = videoCountResult.value || channelVideoCount;
    }
    if (metadataResult.status === "fulfilled" && metadataResult.value) {
      channelMetadata = { ...channelMetadata, ...metadataResult.value };
    }
    if (requestId !== channelVideoLoadRequestId || activeChannel?.id !== channel.id) return;

    const latestPublished = rssVideos[0]?.published || "";
    activeChannel = {
      ...channel,
      ...(rssLoaded ? {
        feedVideoCount: rssVideos.length,
        feedLatestPublished: latestPublished,
        feedLatestTitle: rssVideos[0]?.title || "",
        feedVideos: rssVideos.map((video) => ({
          id: video.id,
          title: video.title,
          published: video.published,
          description: video.description || "",
          tags: video.tags || []
        }))
      } : {}),
      channelVideoCount,
      description: channelMetadata.description || channel.description || "",
      tags: channelMetadata.tags?.length ? channelMetadata.tags : channel.tags || [],
      subscriberCount: Number.isFinite(channelMetadata.subscriberCount) ? channelMetadata.subscriberCount : channel.subscriberCount,
      subscriberCountText: channelMetadata.subscriberCountText || channel.subscriberCountText || ""
    };
    allChannels = allChannels.map((channel) => (channel.id === activeChannel.id ? { ...channel, ...activeChannel } : channel));
    setActiveChannelButton();
  } catch (error) {
    if (requestId !== channelVideoLoadRequestId || activeChannel?.id !== channel.id) return;
    currentVideos = [];
    setStatus("Loading error", true);
    const message = document.createElement("p");
    message.className = "meta";
    message.textContent = `Unable to load channel videos: ${error.message}`;
    videosEl.replaceChildren(message);
  } finally {
    if (requestId === channelVideoLoadRequestId) refreshEl.disabled = false;
  }
}

function channelRefreshPriority(channel, now = Date.now()) {
  const publishedTimes = (channel?.feedVideos || [])
    .map((video) => Date.parse(video?.published || ""))
    .filter(Number.isFinite)
    .sort((left, right) => right - left);
  const latest = publishedTimes[0] || Date.parse(channel?.feedLatestPublished || "");
  if (!Number.isFinite(latest)) return Number.NEGATIVE_INFINITY;

  const gaps = publishedTimes
    .slice(0, 8)
    .map((time, index, values) => index ? values[index - 1] - time : 0)
    .filter((gap) => gap > 0)
    .sort((left, right) => left - right);
  const fallbackCadence = 7 * 24 * 60 * 60 * 1000;
  const cadence = gaps.length ? gaps[Math.floor(gaps.length / 2)] : fallbackCadence;
  const inactivity = Math.max(0, now - latest - cadence);
  return cadence + inactivity * 0.5;
}

function prioritizedChannelsForRefresh() {
  const now = Date.now();
  return [...allChannels].sort((left, right) => {
    const priority = channelRefreshPriority(left, now) - channelRefreshPriority(right, now);
    if (priority) return priority;
    return (Date.parse(right.feedLatestPublished || "") || 0) - (Date.parse(left.feedLatestPublished || "") || 0);
  });
}

function replaceChannelSummary(nextChannel) {
  allChannels = allChannels.map((channel) => channel.id === nextChannel.id ? nextChannel : channel);
  if (activeChannel?.id === nextChannel.id) activeChannel = nextChannel;
}

function feedSummaryChanged(previous, next) {
  return next.feedLatestPublished !== previous.feedLatestPublished
    || next.feedLatestTitle !== previous.feedLatestTitle
    || next.feedVideoCount !== previous.feedVideoCount
    || JSON.stringify(next.feedVideos || []) !== JSON.stringify(previous.feedVideos || []);
}

function checkIsDue(lastCheckedAt, intervalMs, now = Date.now()) {
  const checkedAt = Date.parse(lastCheckedAt || "");
  return !Number.isFinite(checkedAt) || now - checkedAt >= intervalMs;
}

function channelFeedCacheMissing(channel) {
  return !Array.isArray(channel?.feedVideos)
    || (Boolean(channel?.feedLatestPublished) && channel.feedVideos.length === 0);
}

async function runConcurrent(items, limit, worker) {
  let nextIndex = 0;
  async function runNext() {
    while (nextIndex < items.length) {
      const item = items[nextIndex++];
      await worker(item);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runNext));
}

async function refreshChannelSummaries(options = {}) {
  if (!configLoaded || !allChannels.length) return;
  const force = Boolean(options.force);
  const forceFeeds = force || Boolean(options.forceFeeds);
  const now = Date.now();
  const prioritizedChannels = prioritizedChannelsForRefresh();
  const refreshQueue = prioritizedChannels.filter((channel) => forceFeeds
    || channelFeedCacheMissing(channel)
    || checkIsDue(
      channel.feedCheckedAt,
      feedCheckIntervalMinutes * 60 * 1000,
      now
    ));
  const metadataQueue = prioritizedChannels.filter((channel) => force || checkIsDue(
    channel.metadataCheckedAt,
    metadataCheckIntervalDays * 24 * 60 * 60 * 1000,
    now
  ));
  if (!refreshQueue.length && !metadataQueue.length) return;

  newVideosRefreshPending = true;
  renderCategories();
  renderSidePanelPath();
  let feedChanged = false;
  let metadataChanged = false;

  try {
    // Refresh lightweight feeds first, in publication-cadence order, so likely
    // new videos become visible before slower channel metadata is requested.
    await runConcurrent(refreshQueue, feedCheckConcurrency, async (queuedChannel) => {
      const channel = allChannels.find((item) => item.id === queuedChannel.id) || queuedChannel;
      try {
        const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channel.id)}`, {
          cache: "no-store"
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const videos = parseFeed(await response.text()).map((video) => videoWithChannel(video, channel));
        const next = {
          ...channel,
          feedVideoCount: videos.length,
          feedLatestPublished: videos[0]?.published || "",
          feedLatestTitle: videos[0]?.title || "",
          feedCheckedAt: new Date().toISOString(),
          feedVideos: videos.map((video) => ({
            id: video.id,
            title: video.title,
            published: video.published,
            description: video.description || "",
            tags: video.tags || []
          }))
        };
        const summaryChanged = feedSummaryChanged(channel, next);
        feedChanged = true;
        replaceChannelSummary(next);
        if (summaryChanged && activePrimarySection === "youtube" && activeView === "youtubeHome") renderNewVideos();
      } catch {
        // Keep the previous feed when YouTube or RSS is temporarily unavailable.
      }
    });

    if (feedChanged) await saveConfig();

    // Metadata does not affect the new-video list, so update it only after all
    // prioritized feeds have had a chance to appear.
    await runConcurrent(metadataQueue, feedCheckConcurrency, async (queuedChannel) => {
      const channel = allChannels.find((item) => item.id === queuedChannel.id) || queuedChannel;
      const [videoCountResult, metadataResult] = await Promise.allSettled([
        fetchChannelVideoCount(channel.id),
        fetchChannelMetadata(channel.id)
      ]);
      if (videoCountResult.status === "rejected" && metadataResult.status === "rejected") return;
      const channelVideoCount = videoCountResult.status === "fulfilled" && videoCountResult.value
        ? videoCountResult.value
        : channel.channelVideoCount || 0;
      const channelMetadata = metadataResult.status === "fulfilled" ? metadataResult.value : {};
      const next = {
        ...channel,
        channelVideoCount,
        description: channelMetadata.description || channel.description || "",
        tags: channelMetadata.tags?.length ? channelMetadata.tags : channel.tags || [],
        subscriberCount: Number.isFinite(channelMetadata.subscriberCount) ? channelMetadata.subscriberCount : channel.subscriberCount,
        subscriberCountText: channelMetadata.subscriberCountText || channel.subscriberCountText || "",
        metadataCheckedAt: new Date().toISOString()
      };
      metadataChanged = true;
      replaceChannelSummary(next);
    });

    if (metadataChanged) await saveConfig();
    if (!feedChanged && !metadataChanged) return;
    allChannels.sort((left, right) => left.title.localeCompare(right.title, "fr"));
    renderCategories();
    if (activePrimarySection === "youtube" && activeView === "youtubeHome") {
      renderNewVideos();
    } else if (activePrimarySection === "channels" && !activeChannel) {
      renderChannels(channelsForActiveCategory());
    }
    setActiveChannelButton();
  } finally {
    newVideosRefreshPending = false;
    renderCategories();
    renderSidePanelPath();
    syncYoutubeThisWeekButton();
  }
}

async function refreshActiveView() {
  if (activeChannel || activeSearchQuery) {
    await loadFeed();
    return;
  }

  if (activeView === "watchLater") {
    renderWatchLater();
    return;
  }

  refreshEl.disabled = true;
  setStatus("Loading...", true);
  try {
    await refreshChannelSummaries({ force: true });
    renderCategories();
    if (activeView === "newVideos" || activeView === "youtubeHome") {
      renderNewVideos();
    } else {
      renderChannels(channelsForActiveCategory());
      setStatus();
    }
  } catch (error) {
    setStatus(`Refresh error: ${error.message}`, true);
  } finally {
    refreshEl.disabled = false;
  }
}

function appendYoutubeSearchBatch() {
  const knownIds = new Set(youtubeSearchResultsCache.map((video) => video.id));
  const batch = [];
  while (youtubeSearchPendingResults.length && batch.length < YOUTUBE_SEARCH_BATCH_SIZE) {
    const video = youtubeSearchPendingResults.shift();
    if (!video?.id || knownIds.has(video.id)) continue;
    knownIds.add(video.id);
    batch.push(video);
  }
  youtubeSearchResultsCache = [...youtubeSearchResultsCache, ...batch];
  currentVideos = [...youtubeSearchResultsCache];
  return batch.length;
}

function renderYoutubeSearchLoading(query) {
  const indicator = document.createElement("div");
  indicator.className = "youtubeResultsSearching";
  indicator.role = "status";
  indicator.setAttribute("aria-live", "polite");

  const icon = document.createElement("span");
  icon.className = "youtubeResultsSearchingIcon";
  icon.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m14.5 14.5 5 5"/></svg>';

  const label = document.createElement("span");
  label.textContent = uiMessage("searchingYoutubeFor", [query]);
  indicator.append(icon, label);
  channelsEl.replaceChildren(indicator);
}

function renderYoutubeSearchError(message) {
  const error = document.createElement("p");
  error.className = "meta channelSearchEmpty";
  error.textContent = message;
  channelsEl.replaceChildren(error);
}

function renderYoutubeSearchResults() {
  youtubeSearchLoadObserver?.disconnect();
  youtubeSearchLoadObserver = null;
  renderWatchLaterVideoResults(currentVideos);
  if (youtubeSearchExhausted || (!youtubeSearchContinuation && !youtubeSearchPendingResults.length)) return;

  const list = channelsEl.querySelector(".videos");
  if (!list) return;
  const more = document.createElement("button");
  more.type = "button";
  more.className = "watchMoreCard";
  more.textContent = youtubeSearchLoadingMore
    ? uiMessage("loadingMoreResults")
    : uiMessage("loadMoreResults", [YOUTUBE_SEARCH_BATCH_SIZE]);
  more.disabled = youtubeSearchLoadingMore;
  more.addEventListener("click", () => loadMoreYoutubeSearchResults());
  list.append(more);

  if (!youtubeSearchLoadingMore && "IntersectionObserver" in window) {
    youtubeSearchLoadObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMoreYoutubeSearchResults();
    }, {
      root: document.querySelector(".sidebar"),
      rootMargin: "300px 0px"
    });
    youtubeSearchLoadObserver.observe(more);
  }
}

async function loadMoreYoutubeSearchResults() {
  if (youtubeSearchLoadingMore || youtubeSearchExhausted || activeView !== "search") return;
  const query = youtubeSearchResultsQuery;
  youtubeSearchLoadingMore = true;
  renderYoutubeSearchResults();
  try {
    if (!youtubeSearchPendingResults.length && youtubeSearchContinuation) {
      const previousContinuation = youtubeSearchContinuation;
      const page = await fetchYoutubeGlobalSearchPage(query, {
        continuation: youtubeSearchContinuation,
        apiKey: youtubeSearchApiKey,
        clientVersion: youtubeSearchClientVersion,
        locale: youtubeSearchLocale
      });
      if (activeView !== "search" || youtubeSearchResultsQuery !== query) return;
      const knownIds = new Set([
        ...youtubeSearchResultsCache.map((video) => video.id),
        ...youtubeSearchPendingResults.map((video) => video.id)
      ]);
      const nextVideos = page.results
        .filter((result) => result.type === "video" && !knownIds.has(result.id))
        .map(({ type, ...video }) => video);
      youtubeSearchPendingResults.push(...nextVideos);
      youtubeSearchContinuation = page.continuation || "";
      youtubeSearchApiKey = page.apiKey || youtubeSearchApiKey;
      youtubeSearchClientVersion = page.clientVersion || youtubeSearchClientVersion;
      if (!nextVideos.length && youtubeSearchContinuation === previousContinuation) youtubeSearchContinuation = "";
    }
    appendYoutubeSearchBatch();
    youtubeSearchExhausted = !youtubeSearchPendingResults.length && !youtubeSearchContinuation;
  } catch (error) {
    youtubeSearchExhausted = true;
    setStatus(uiMessage("unableToLoadMoreYoutubeResults", [error.message]), true);
  } finally {
    youtubeSearchLoadingMore = false;
    if (activeView === "search" && youtubeSearchResultsQuery === query) {
      currentVideos = [...youtubeSearchResultsCache];
      renderYoutubeSearchResults();
      syncVideoLayoutAvailability();
    }
  }
}

async function searchYoutube(query, options = {}) {
  const trimmed = query.trim();
  if (!trimmed) return;
  setActivePrimarySection("youtube");
  youtubeSearchQuery = trimmed;
  await maybePromptSeenForWatchLater();
  hideGlobalSearchSuggestions();
  globalSearchController?.abort();
  activeView = "search";
  activeSearchQuery = trimmed;
  activeChannel = null;
  document.body.classList.remove("sidePanelVideos");
  document.body.classList.add("virtualVideoListView");
  syncStackedChannelViewState();
  setActiveChannelButton();
  setHeader(uiMessage("youtubeSearchHeader", [trimmed]), false);
  currentVideos = [];
  videosEl.replaceChildren();
  channelsEl.classList.add("videoListHost");
  renderYoutubeSearchLoading(trimmed);
  setStatus(uiMessage("searchingYoutube"), true);

  if (!options.skipHistory) pushHistory({ type: "search", id: trimmed });

  if (youtubeSearchResultsQuery === trimmed && (youtubeSearchResultsCache.length || youtubeSearchExhausted)) {
    currentVideos = [...youtubeSearchResultsCache];
    renderYoutubeSearchResults();
    syncVideoLayoutAvailability();
    setStatus(currentVideos.length ? "" : uiMessage("noYoutubeVideoFound"), !currentVideos.length);
    return;
  }

  try {
    if (youtubeSearchInitialQuery !== trimmed || !youtubeSearchInitialPromise) {
      youtubeSearchInitialQuery = trimmed;
      youtubeSearchInitialPromise = fetchYoutubeGlobalSearchPage(trimmed);
    }
    const page = await youtubeSearchInitialPromise;
    if (youtubeSearchQuery !== trimmed) return;
    youtubeSearchLoadObserver?.disconnect();
    youtubeSearchResultsQuery = trimmed;
    youtubeSearchResultsCache = [];
    youtubeSearchPendingResults = page.results
      .filter((result) => result.type === "video")
      .map(({ type, ...video }) => video);
    youtubeSearchContinuation = page.continuation || "";
    youtubeSearchApiKey = page.apiKey || "";
    youtubeSearchClientVersion = page.clientVersion || "";
    youtubeSearchLocale = page.locale || youtubeSearchLocale;
    youtubeSearchLoadingMore = false;
    appendYoutubeSearchBatch();
    youtubeSearchExhausted = !youtubeSearchPendingResults.length && !youtubeSearchContinuation;
    if (activeView !== "search" || activeSearchQuery !== trimmed) return;
    renderYoutubeSearchResults();
    syncVideoLayoutAvailability();
    setStatus(currentVideos.length ? "" : uiMessage("noYoutubeVideoFound"), !currentVideos.length);
  } catch (error) {
    if (youtubeSearchInitialQuery === trimmed) youtubeSearchInitialPromise = null;
    if (activeView !== "search" || activeSearchQuery !== trimmed) return;
    const message = uiMessage("youtubeSearchFailed", [error.message]);
    renderYoutubeSearchError(message);
    setStatus(message, true);
  }
}

async function showYoutubeSearchHome() {
  await maybePromptSeenForWatchLater();
  setActivePrimarySection("youtube");
  youtubeSearchLoadObserver?.disconnect();
  youtubeSearchLoadObserver = null;
  youtubeSearchQuery = "";
  activeView = "youtubeHome";
  activeSearchQuery = "";
  activeChannel = null;
  activeVideoId = "";
  document.body.classList.remove("sidePanelVideos");
  document.body.classList.add("virtualVideoListView");
  videosEl.replaceChildren();
  channelsEl.classList.add("videoListHost");
  setHeader("", false);
  renderNewVideos();
  setActiveChannelButton();
  syncStackedChannelViewState();
  syncVideoLayoutAvailability();
}

async function showYoutubeBlank() {
  await maybePromptSeenForWatchLater();
  setActivePrimarySection("youtube");
  youtubeSearchLoadObserver?.disconnect();
  youtubeSearchLoadObserver = null;
  youtubeSearchQuery = "";
  activeView = "youtubeBlank";
  activeSearchQuery = "";
  activeChannel = null;
  activeVideoId = "";
  renderYoutubeBlankContent();
}

function renderYoutubeBlankContent() {
  currentVideos = [];
  document.body.classList.remove("sidePanelVideos");
  document.body.classList.add("virtualVideoListView");
  listViewEl.hidden = false;
  playerViewEl.hidden = true;
  videosEl.replaceChildren();
  channelsEl.classList.add("videoListHost");
  const message = document.createElement("p");
  message.className = "meta youtubeBlankMessage";
  message.textContent = uiMessage("searchYoutubeEmpty");
  channelsEl.replaceChildren(message);
  setHeader("", false);
  setStatus();
  setActiveChannelButton();
  syncStackedChannelViewState();
  syncVideoLayoutAvailability();
}

function showPreferredYoutubeHome() {
  return youtubeTabHome === "blank" ? showYoutubeBlank() : showYoutubeSearchHome();
}

function setYoutubeTabHomePreference(value) {
  youtubeTabHome = value === "blank" ? "blank" : "this-week";
  localStorage.setItem(YOUTUBE_TAB_HOME_KEY, youtubeTabHome);
  if (youtubeTabOptionEl) youtubeTabOptionEl.value = youtubeTabHome;
  syncYoutubeThisWeekButton();
  if (activePrimarySection !== "youtube" || youtubeSearchQuery) return Promise.resolve();
  const homeEntry = youtubeTabHome === "blank"
    ? { type: "youtubeBlank", id: "youtube" }
    : { type: "youtubeHome", id: "youtube" };
  pushHistory(homeEntry);
  return showPreferredYoutubeHome();
}

async function loadChannels() {
  refreshEl.disabled = true;

  try {
    config = await loadInitialConfig();
    allCategories = config.categories || [];
    favoriteCategories = config.favoriteCategories || [];
    allChannels = (config.channels || [])
      .filter((channel) => channel.id)
      .sort((a, b) => a.title.localeCompare(b.title, "fr"));
    favorites = config.favorites || {};
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

  const previousActiveChannel = activeChannel;
  const activeChannelId = activeChannel?.id || "";
  config = {
    version: 1,
    categories: [],
    favoriteCategories: [],
    channels: [],
    favorites: {},
    seenVideos: {},
    watchLater: {},
    ...nextConfig
  };
  allCategories = Array.isArray(config.categories) ? config.categories : [];
  favoriteCategories = Array.isArray(config.favoriteCategories) ? config.favoriteCategories : [];
  allChannels = (Array.isArray(config.channels) ? config.channels : [])
    .filter((channel) => channel.id)
    .sort((a, b) => (a.title || a.id).localeCompare(b.title || b.id, "fr"));
  favorites = config.favorites && typeof config.favorites === "object" ? config.favorites : {};
  seenVideos = config.seenVideos || {};
  watchLater = config.watchLater || {};
  configLoaded = true;

  if (activeCategoryId && !allCategories.some((category) => category.id === activeCategoryId)) {
    activeCategoryId = "";
  }
  if (activeFavoriteCategoryId && activeFavoriteCategoryId !== UNCATEGORIZED_CATEGORY_ID && !favoriteCategories.some((category) => category.id === activeFavoriteCategoryId)) {
    activeFavoriteCategoryId = "";
  }

  activeChannel = activeChannelId
    ? allChannels.find((channel) => channel.id === activeChannelId)
      || (previousActiveChannel?.id === activeChannelId ? previousActiveChannel : null)
    : null;
  syncResultsToolbarPlacement();
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

  if (activeView === "youtubeHome") {
    setActivePrimarySection("youtube");
    renderNewVideos();
    return;
  }

  if (activeView === "youtubeBlank") {
    setActivePrimarySection("youtube");
    youtubeSearchQuery = "";
    activeSearchQuery = "";
    activeChannel = null;
    activeVideoId = "";
    renderYoutubeBlankContent();
    return;
  }

  if (activeView === "search") {
    setActivePrimarySection("youtube");
    document.body.classList.remove("sidePanelVideos");
    document.body.classList.add("virtualVideoListView");
    renderYoutubeSearchResults();
    setActiveChannelButton();
    syncStackedChannelViewState();
    syncVideoLayoutAvailability();
    return;
  }

  if (activeView === "favorites") {
    renderFavoritesHome();
    return;
  }

  const activeChannelIsSaved = activeChannel
    && allChannels.some((channel) => channel.id === activeChannel.id);
  renderChannels(activeChannel && !activeChannelIsSaved
    ? [activeChannel]
    : channelsForActiveCategory());
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
      searchInputEl.value = "";
      return;
    }

    if (entry.type === "newVideos") {
      showNewVideos({ skipHistory: true });
      searchInputEl.value = "";
      return;
    }

    if (entry.type === "channel") {
      const channel = allChannels.find((item) => item.id === entry.id);
        if (channel) {
          await selectChannel(channel, { skipHistory: true });
          searchInputEl.value = "";
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

      if (state.view === "watchLater") {
        setActivePrimarySection("watchLater");
        activeView = "watchLater";
        activeCategoryId = "";
        activeChannel = null;
        renderCategories();
        renderChannels([]);
        renderWatchLater();
        channelSearchQuery = state.query || "";
        if (channelSearchInputEl) channelSearchInputEl.value = channelSearchQuery;
        searchInputEl.value = channelSearchQuery;
        renderSearchResults();
        return;
      }

      if (state.view === "favorites") {
        setActivePrimarySection("favorites");
        activeFavoriteCategoryId = state.categoryId || "";
        channelSearchQuery = state.query || "";
        if (channelSearchInputEl) channelSearchInputEl.value = channelSearchQuery;
        searchInputEl.value = channelSearchQuery;
        renderFavoritesHome();
        return;
      }

      if (state.channelId) {
        const channel = allChannels.find((item) => item.id === state.channelId);
        if (channel) {
          await selectChannel(channel, { skipHistory: true });
          channelSearchQuery = state.query || "";
          if (channelSearchInputEl) channelSearchInputEl.value = channelSearchQuery;
          searchInputEl.value = channelSearchQuery;
          renderSearchResults();
          return;
        }
      } else {
        showChannelListState(state.categoryId || "");
        channelSearchQuery = state.query || "";
        if (channelSearchInputEl) channelSearchInputEl.value = channelSearchQuery;
        searchInputEl.value = channelSearchQuery;
        renderSearchResults();
        return;
      }
    }

    if (entry.type === "video") {
      play(entry.id, { skipHistory: true });
      return;
    }

    if (entry.type === "search") {
      searchInputEl.value = entry.id || "";
      await searchYoutube(entry.id, { skipHistory: true });
      return;
    }

    if (entry.type === "youtubeHome") {
      searchInputEl.value = "";
      await showYoutubeSearchHome();
      return;
    }

    if (entry.type === "youtubeBlank") {
      searchInputEl.value = "";
      await showYoutubeBlank();
      return;
    }

    if (entry.type === "watchLater") {
      setActivePrimarySection("watchLater");
      activeView = "watchLater";
      activeCategoryId = "";
      clearChannelSearch();
      searchInputEl.value = "";
      renderCategories();
      renderChannels([]);
      renderWatchLater();
      return;
    }

    if (entry.type === "favorites") {
      setActivePrimarySection("favorites");
      activeFavoriteCategoryId = entry.id || "";
      clearChannelSearch();
      searchInputEl.value = "";
      renderFavoritesHome();
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
    if (activePrimarySection === "favorites") {
      return [{ label: "Add category", action: openAddFavoriteCategoryDialog }];
    }
    if (activePrimarySection === "channels") {
      return [{ label: "Add category", action: () => addCategoryEl.click() }];
    }
    return [];
  }
  if (activePrimarySection === "channels") {
    return [{ label: "Add channel", action: () => addChannel(activeView === "channels" ? activeCategoryId : "") }];
  }
  return [];
}

function handleGeneralContextMenu(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (!target.closest(".sidebar, .sidePanelPath, .videos")) return;
  if (target.closest(".channel, .category, .pathButton, .pathIconButton, .video, .watchMoreCard, button, input, a")) return;
  const actions = generalContextActions(target);
  if (!actions.length) return;
  event.preventDefault();
  showContextMenu(event, actions);
}

function handleVideoChannelNavigation(event) {
  if (!(event.target instanceof Element)) return;
  const channelButton = event.target.closest("button.videoChannelMeta[data-channel-id]");
  if (!channelButton) return;
  event.preventDefault();
  event.stopPropagation();
  const channelId = channelButton.dataset.channelId || "";
  const now = Date.now();
  if (channelId === lastVideoChannelNavigationId && now - lastVideoChannelNavigationAt < 500) return;
  lastVideoChannelNavigationId = channelId;
  lastVideoChannelNavigationAt = now;
  const channel = allChannels.find((item) => item.id === channelId) || {
    id: channelId,
    title: channelButton.dataset.channelTitle || channelButton.textContent || "YouTube channel",
    thumbnail: channelButton.dataset.channelThumbnail || "",
    categories: []
  };
  selectChannel(channel).catch((error) => setStatus(`Unable to load channel: ${error.message}`, true));
}

document.addEventListener("pointerdown", handleVideoChannelNavigation, true);
document.addEventListener("click", handleVideoChannelNavigation, true);
document.addEventListener("contextmenu", handleGeneralContextMenu);
const openYoutubeThisWeekMenu = (event) => {
  if (activePrimarySection !== "youtube") return;
  event.preventDefault();
  event.stopPropagation();
  showContextMenu(event, newVideosContextActions());
};
youtubeThisWeekEl?.addEventListener("click", async (event) => {
  event.preventDefault();
  event.stopPropagation();
  window.clearTimeout(globalSearchTimer);
  globalSearchController?.abort();
  hideGlobalSearchSuggestions();
  youtubeSearchQuery = "";
  searchInputEl.value = "";
  pushHistory({ type: "youtubeHome", id: "youtube" });
  try {
    await showYoutubeSearchHome();
    await refreshChannelSummaries({ forceFeeds: true });
    if (activePrimarySection === "youtube" && activeView === "youtubeHome") renderNewVideos();
  } catch (error) {
    setStatus(error.message, true);
  }
});
youtubeThisWeekEl?.addEventListener("contextmenu", openYoutubeThisWeekMenu);
channelsEl.addEventListener("contextmenu", (event) => {
  if (activePrimarySection !== "youtube" || activeView !== "youtubeBlank") return;
  event.preventDefault();
  event.stopPropagation();
  showContextMenu(event, [{
    label: uiMessage("showThisWeekInYourChannels"),
    action: () => setYoutubeTabHomePreference("this-week")
  }]);
});
document.addEventListener("click", hideContextMenu);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideContextMenu();
});
markSeenEl.addEventListener("click", () => closeSeenPrompt(true));
keepWatchLaterEl.addEventListener("click", () => closeSeenPrompt(false));
cancelVideoNoteEl?.addEventListener("click", closeVideoNoteDialog);
saveVideoNoteEl?.addEventListener("click", () => {
  saveVideoNote().catch((error) => setStatus(`Note save error: ${error.message}`, true));
});
videoNoteTextEl?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeVideoNoteDialog();
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    saveVideoNote().catch((error) => setStatus(`Note save error: ${error.message}`, true));
  }
});
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
exportNewPipeConfigEl?.addEventListener("click", exportNewPipeConfig);
importNativeConfigEl.addEventListener("click", () => runImportFilePicker("native"));
importFreetubeConfigEl.addEventListener("click", () => runImportFilePicker("freetube"));
closeAppearanceOptionsEl?.addEventListener("click", closeAppearanceOptionsDialog);
themeOptionEl?.addEventListener("change", () => {
  globalThis.youtubeShelfTheme?.set(themeOptionEl.value);
});
splitColumnWidthOptionEl?.addEventListener("input", () => {
  const value = Number.parseInt(splitColumnWidthOptionEl.value, 10);
  if (value >= SPLIT_COLUMN_MIN_WIDTH && value <= SPLIT_COLUMN_MAX_WIDTH) setSplitColumnWidth(value);
});
splitColumnWidthOptionEl?.addEventListener("change", () => {
  setSplitColumnWidth(splitColumnWidthOptionEl.value || SPLIT_COLUMN_DEFAULT_WIDTH);
});
youtubeTabOptionEl?.addEventListener("change", () => {
  setYoutubeTabHomePreference(youtubeTabOptionEl.value)
    .catch((error) => setStatus(error.message, true));
});
closeLanguageOptionsEl?.addEventListener("click", closeLanguageOptionsDialog);
youtubeTitleLanguageOptionEl?.addEventListener("change", () => setYoutubeTitleLanguage(youtubeTitleLanguageOptionEl.value));
interfaceLanguageOptionEl?.addEventListener("change", () => setInterfaceLanguage(interfaceLanguageOptionEl.value));
openTranslationEditorEl?.addEventListener("click", openTranslationEditorDialog);
translationEditorLocaleEl?.addEventListener("change", loadTranslationEditorCatalog);
resetTranslationEditorEl?.addEventListener("click", resetTranslationEditor);
closeTranslationEditorEl?.addEventListener("click", closeTranslationEditorDialog);
saveTranslationEditorEl?.addEventListener("click", saveTranslationEditor);
closeAboutEl?.addEventListener("click", closeAboutDialog);
aboutDownloadLatestEl?.addEventListener("click", warnBeforeLatestVersionDownload);
topOptionsEl?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  showContextMenu(event, settingsContextActions());
});
sortResultsEl?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  syncSortButton();
  showContextMenu(event, sortOptionsForCurrentScope());
});
closeYoutubeDataOptionsEl?.addEventListener("click", closeYoutubeDataOptionsDialog);
testWebDavEl?.addEventListener("click", testWebDavFromDialog);
enableWebDavSyncEl?.addEventListener("click", saveAndEnableWebDavSync);
syncWebDavNowEl?.addEventListener("click", () => synchronizeWebDavConfig({ requestPermission: true }));
disconnectWebDavEl?.addEventListener("click", () => {
  disconnectWebDavSynchronization().catch((error) => setWebDavStatus(`Disconnect error: ${error.message}`, true));
});
closeWebDavSyncEl?.addEventListener("click", closeWebDavSyncDialog);
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
addCategoryParentEl?.addEventListener("change", () => {
  categoryDialogParentId = addCategoryParentEl.value;
  syncAddCategoryDialogTitle();
});
hideCommentsOptionEl?.addEventListener("click", (event) => {
  event.preventDefault();
  toggleDisplayOption(COMMENTS_MODE_KEY, false);
});
hideSuggestionsOptionEl?.addEventListener("click", (event) => {
  event.preventDefault();
  toggleDisplayOption(SUGGESTIONS_MODE_KEY, true);
});
feedCheckIntervalOptionEl?.addEventListener("change", () => {
  setNewVideoCheckOption(FEED_CHECK_INTERVAL_KEY, feedCheckIntervalOptionEl.value || FEED_CHECK_INTERVAL_DEFAULT);
});
metadataCheckIntervalOptionEl?.addEventListener("change", () => {
  setNewVideoCheckOption(METADATA_CHECK_INTERVAL_KEY, metadataCheckIntervalOptionEl.value || METADATA_CHECK_INTERVAL_DEFAULT);
});
feedCheckConcurrencyOptionEl?.addEventListener("change", () => {
  setNewVideoCheckOption(FEED_CHECK_CONCURRENCY_KEY, feedCheckConcurrencyOptionEl.value || FEED_CHECK_CONCURRENCY_DEFAULT);
});

channelIconModeEl?.addEventListener("click", () => {
  const scope = currentListLayoutScope();
  const currentMode = listModeForScope(scope);
  const availableModes = VIDEO_LIST_MODE_SCOPES.includes(scope)
    ? ["icons", "columns", "single", "titles", "compactTitles"]
    : ["icons", "columns", "single"];
  const currentIndex = Math.max(0, availableModes.indexOf(currentMode));
  const nextMode = availableModes[(currentIndex + 1) % availableModes.length];
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
  toggleDisplayOption(FOCUS_PLAYER_MODE_KEY, false);
});

for (const tab of primaryTabEls) {
  tab.addEventListener("click", async () => {
    const section = tab.dataset.section;
    const isReselectedSection = activePrimarySection === section;
    hideGlobalSearchSuggestions();

    if (section === "youtube") {
      clearChannelSearch();
      setActivePrimarySection("youtube");
      searchInputEl.value = youtubeSearchQuery;
      if (youtubeSearchQuery) {
        pushHistory({ type: "search", id: youtubeSearchQuery });
        await searchYoutube(youtubeSearchQuery, { skipHistory: true });
      } else {
        const homeEntry = youtubeTabHome === "blank"
          ? { type: "youtubeBlank", id: "youtube" }
          : { type: "youtubeHome", id: "youtube" };
        pushHistory(homeEntry);
        await showPreferredYoutubeHome();
      }
      searchInputEl.focus();
      return;
    }

    if (section === "watchLater") {
      await maybePromptSeenForWatchLater();
      clearChannelSearch();
      setActivePrimarySection("watchLater");
      activeView = "watchLater";
      pushHistory({ type: "watchLater", id: "watchLater" });
      renderCategories();
      renderChannels([]);
      renderWatchLater();
      searchInputEl.value = "";
      searchInputEl.focus();
      return;
    }

    if (section === "favorites") {
      await maybePromptSeenForWatchLater();
      clearChannelSearch();
      setActivePrimarySection("favorites");
      if (isReselectedSection) activeFavoriteCategoryId = "";
      pushHistory({ type: "favorites", id: activeFavoriteCategoryId });
      renderFavoritesHome();
      searchInputEl.value = "";
      searchInputEl.focus();
      return;
    }

    if (isReselectedSection || !activeCategoryId || activeCategoryId === NEW_VIDEOS_CATEGORY_ID) {
      await showRootChannels();
    } else {
      await showCategoryChannels(activeCategoryId);
    }
    searchInputEl.value = "";
    searchInputEl.focus();
  });
}

function clearVideoDropIndicators() {
  draggedFavoriteVideoId = "";
  document.body.classList.remove("isChannelDropTarget", "isWatchLaterDropTarget", "isFavoriteDropTarget");
  document.querySelectorAll(".is-favorite-group-drop-target").forEach((item) => {
    item.classList.remove("is-favorite-group-drop-target");
    delete item.dataset.favoriteDropPlacement;
  });
  document.querySelectorAll(".is-watch-later-drop-target").forEach((item) => item.classList.remove("is-watch-later-drop-target"));
  document.querySelectorAll(".is-favorite-drop-target").forEach((item) => item.classList.remove("is-favorite-drop-target"));
}

const watchLaterTabEl = [...primaryTabEls].find((tab) => tab.dataset.section === "watchLater");
watchLaterTabEl?.addEventListener("dragover", (event) => {
  if (!hasVideoDropType(event.dataTransfer)) return;
  event.preventDefault();
  event.stopPropagation();
  document.body.classList.remove("isChannelDropTarget");
  if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  watchLaterTabEl.classList.add("is-watch-later-drop-target");
});
watchLaterTabEl?.addEventListener("dragleave", () => {
  watchLaterTabEl.classList.remove("is-watch-later-drop-target");
});
watchLaterTabEl?.addEventListener("drop", async (event) => {
  const video = droppedVideoFromDataTransfer(event.dataTransfer);
  if (!video) return;
  event.preventDefault();
  event.stopPropagation();
  clearVideoDropIndicators();
  await addVideoToWatchLater(video);
});

const favoritesTabEl = [...primaryTabEls].find((tab) => tab.dataset.section === "favorites");
favoritesTabEl?.addEventListener("dragover", (event) => {
  if (!hasVideoDropType(event.dataTransfer)) return;
  event.preventDefault();
  event.stopPropagation();
  document.body.classList.remove("isChannelDropTarget", "isWatchLaterDropTarget");
  if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  favoritesTabEl.classList.add("is-favorite-drop-target");
});
favoritesTabEl?.addEventListener("dragleave", () => favoritesTabEl.classList.remove("is-favorite-drop-target"));
favoritesTabEl?.addEventListener("drop", async (event) => {
  const video = droppedVideoFromDataTransfer(event.dataTransfer);
  if (!video) return;
  event.preventDefault();
  event.stopPropagation();
  clearVideoDropIndicators();
  await addVideoToFavorites(video);
});

searchInputEl.addEventListener("input", () => {
  hideGlobalSearchSuggestions();
  if (activePrimarySection === "youtube") {
    window.clearTimeout(globalSearchTimer);
    const query = searchInputEl.value.trim();
    if (query.length >= 2) {
      globalSearchTimer = window.setTimeout(() => {
        searchYoutube(query, { skipHistory: true })
          .then(() => recordYoutubeSearchHistory(query))
          .catch((error) => setStatus(uiMessage("youtubeSearchFailed", [error.message]), true));
      }, 300);
    } else if (!query) {
      youtubeSearchQuery = "";
      showPreferredYoutubeHome()
        .then(() => recordYoutubeSearchHistory(""))
        .catch(() => {});
    }
    return;
  }
  if (activePrimarySection === "channels" && !activeChannel && activeView !== "channels") {
    showChannelListState("");
  }
  channelSearchQuery = searchInputEl.value;
  if (channelSearchInputEl) channelSearchInputEl.value = channelSearchQuery;
  renderSearchResults();
});
searchInputEl.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideGlobalSearchSuggestions();
    searchInputEl.blur();
  }
});

document.addEventListener("pointerdown", (event) => {
  if (!(event.target instanceof Element) || !event.target.closest(".globalYoutubeSearch")) {
    hideGlobalSearchSuggestions();
  }
});

searchFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  window.clearTimeout(globalSearchTimer);
  const value = searchInputEl.value;
  hideGlobalSearchSuggestions();

  if (activePrimarySection !== "youtube") {
    channelSearchQuery = value;
    if (channelSearchInputEl) channelSearchInputEl.value = channelSearchQuery;
    recordChannelSearchHistory();
    renderSearchResults();
    return;
  }

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
  if (activePrimarySection === "favorites") {
    if (!hasVideoDropType(event.dataTransfer)) return;
    event.preventDefault();
    document.body.classList.add("isFavoriteDropTarget");
    return;
  }
  if (activePrimarySection === "watchLater") {
    if (!hasVideoDropType(event.dataTransfer)) return;
    event.preventDefault();
    document.body.classList.add("isWatchLaterDropTarget");
    return;
  }
  if (activePrimarySection !== "channels") return;
  if (event.dataTransfer?.types?.includes("application/x-youtube-channel-shelf-video")) return;
  if (event.dataTransfer?.types?.includes("application/x-youtube-channel-shelf-channel")) return;
  if (![...event.dataTransfer?.types || []].some((type) => ["text/uri-list", "text/plain"].includes(type))) return;
  event.preventDefault();
  document.body.classList.add("isChannelDropTarget");
});

document.addEventListener("dragleave", (event) => {
  if (event.relatedTarget) return;
  clearVideoDropIndicators();
});

document.addEventListener("drop", async (event) => {
  clearVideoDropIndicators();
  if (activePrimarySection === "favorites") {
    const video = droppedVideoFromDataTransfer(event.dataTransfer);
    if (!video) return;
    event.preventDefault();
    await addVideoToFavorites(video, activeFavoriteCategoryId);
    return;
  }
  if (activePrimarySection === "watchLater") {
    const video = droppedVideoFromDataTransfer(event.dataTransfer);
    if (!video) return;
    event.preventDefault();
    await addVideoToWatchLater(video);
    return;
  }
  if (activePrimarySection !== "channels") return;
  if (event.dataTransfer?.types?.includes("application/x-youtube-channel-shelf-video")) return;
  if (event.dataTransfer?.types?.includes("application/x-youtube-channel-shelf-channel")) return;
  const data = event.dataTransfer?.getData("text/uri-list") || event.dataTransfer?.getData("text/plain") || "";
  if (!data) return;
  event.preventDefault();
  await addDroppedChannel(data);
});

document.addEventListener("dragend", clearVideoDropIndicators);

sidePanelBackEl?.addEventListener("click", showSidePanelChannels);

refreshEl.addEventListener("click", refreshActiveView);

unsubscribeEl.addEventListener("click", () => {
  unsubscribeActiveChannel().catch((error) => {
    setStatus(`Save error: ${error.message}`, true);
  });
});

assignCategoriesEl.addEventListener("click", () => {
  const channelIsSaved = Boolean(activeChannel?.id)
    && allChannels.some((channel) => channel.id === activeChannel.id);
  if (channelIsSaved) {
    openCategoryAssignment(activeChannel);
    return;
  }
  if (activeChannel?.id) {
    addChannelById(activeChannel.id, "").catch((error) => setStatus(error.message, true));
  }
});

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

async function resolveDroppedChannelId(value = "", options = {}) {
  const directId = channelIdFromDroppedText(value);
  if (directId) return directId;

  const handleUrl = handleUrlFromDroppedText(value);
  const youtubeUrl = handleUrl || youtubeUrlFromDroppedText(value);
  if (!youtubeUrl) return "";

  if (!options.silent) showInfoPopup(handleUrl ? "Resolving YouTube handle..." : "Resolving video channel...", "info");
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
    let channelMetadata = { description: "", tags: [], subscriberCount: null, subscriberCountText: "" };
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
      subscriberCount: channelMetadata.subscriberCount,
      subscriberCountText: channelMetadata.subscriberCountText || "",
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
  const subscriberCountText = textFromRuns(renderer.subscriberCountText).trim();
  const handle = subscriberCountText || textFromRuns(renderer.videoCountText).trim();
  const description = textFromRuns(renderer.descriptionSnippet).trim();
  const thumbnails = renderer.thumbnail?.thumbnails || [];
  const thumbnail = thumbnails.at(-1)?.url || thumbnails[0]?.url || "";
  return { id, title, handle, description, thumbnail, subscriberCountText, subscriberCount: metricCountValue(subscriberCountText) };
}

function hasVideoDropType(dataTransfer) {
  const types = [...dataTransfer?.types || []];
  if (types.includes("application/x-youtube-channel-shelf-channel")) return false;
  return types.some((type) => ["application/x-youtube-channel-shelf-video", "text/uri-list", "text/plain"].includes(type));
}

function collectGlobalSearchRenderers(node, results = []) {
  if (!node || typeof node !== "object") return results;
  if (node.videoRenderer) results.push({ type: "video", renderer: node.videoRenderer });
  else if (node.channelRenderer) results.push({ type: "channel", renderer: node.channelRenderer });
  for (const value of Object.values(node)) {
    if (value && typeof value === "object") collectGlobalSearchRenderers(value, results);
  }
  return results;
}

function globalVideoResultFromRenderer(renderer) {
  const id = String(renderer?.videoId || "").trim();
  if (!id) return null;
  const thumbnails = renderer.thumbnail?.thumbnails || [];
  const ownerRun = renderer.ownerText?.runs?.find((run) => run.navigationEndpoint?.browseEndpoint?.browseId) || renderer.ownerText?.runs?.[0];
  return {
    id,
    title: textFromRuns(renderer.title).trim() || "Untitled video",
    channel: textFromRuns(renderer.ownerText).trim(),
    channelId: ownerRun?.navigationEndpoint?.browseEndpoint?.browseId || "",
    published: textFromRuns(renderer.publishedTimeText).trim(),
    duration: textFromRuns(renderer.lengthText).trim(),
    views: textFromRuns(renderer.viewCountText).trim(),
    thumbnail: thumbnails.at(-1)?.url || thumbnails[0]?.url || `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
  };
}

function youtubeConfigValue(html, key) {
  const match = String(html || "").match(new RegExp(`"${key}":"((?:\\\\.|[^"\\\\])*)"`));
  if (!match) return "";
  try {
    return JSON.parse(`"${match[1]}"`);
  } catch {
    return match[1];
  }
}

function youtubeSearchContinuationToken(node) {
  if (!node || typeof node !== "object") return "";
  const rendererToken = node.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
  if (rendererToken) return rendererToken;
  for (const value of Object.values(node)) {
    const token = youtubeSearchContinuationToken(value);
    if (token) return token;
  }
  return "";
}

function youtubeSearchResultsFromData(data) {
  const seen = new Set();
  const results = [];
  for (const item of collectGlobalSearchRenderers(data)) {
    const result = item.type === "video"
      ? globalVideoResultFromRenderer(item.renderer)
      : channelResultFromRenderer(item.renderer);
    if (!result) continue;
    const key = `${item.type}:${result.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ type: item.type, ...result });
  }
  return results;
}

function fallbackSearchLanguage(query) {
  const text = String(query || "").toLocaleLowerCase();
  if (/[àâçéèêëîïôùûüÿœæ]/u.test(text) || /\b(le|la|les|des|une|avec|pour|dans|sur|comment|pourquoi)\b/u.test(text)) return "fr";
  return "en";
}

function localeForYoutubeLanguage(language) {
  const normalized = String(language || "").trim().replace(/_/g, "-");
  const base = normalized.split("-")[0].toLowerCase() || "en";
  return {
    hl: normalized || "en",
    gl: YOUTUBE_REGION_BY_LANGUAGE[base] || "US"
  };
}

async function detectYoutubeSearchLocale(query) {
  if (!globalThis.chrome?.i18n?.detectLanguage) return localeForYoutubeLanguage(fallbackSearchLanguage(query));
  const detected = await new Promise((resolve) => {
    chrome.i18n.detectLanguage(String(query || ""), (result) => resolve(result || null));
  });
  const candidate = detected?.languages
    ?.filter((item) => item?.language && item.language !== "und")
    .sort((left, right) => Number(right.percentage || 0) - Number(left.percentage || 0))[0];
  const language = candidate && (detected.isReliable || Number(candidate.percentage || 0) >= 45)
    ? candidate.language
    : fallbackSearchLanguage(query);
  return localeForYoutubeLanguage(language);
}

const YOUTUBE_SEARCH_ATTEMPTS = 3;

async function fetchYoutubeGlobalSearchPageOnce(query, options = {}) {
  const trimmed = query.trim();
  if (!trimmed) return { results: [], continuation: "", apiKey: "", clientVersion: "" };

  const locale = options.locale || await detectYoutubeSearchLocale(trimmed);

  if (options.continuation) {
    if (!options.clientVersion) {
      return { results: [], continuation: "", apiKey: options.apiKey || "", clientVersion: options.clientVersion || "" };
    }
    const body = {
      context: {
        client: {
          clientName: "WEB",
          clientVersion: options.clientVersion,
          hl: locale.hl,
          gl: locale.gl,
          originalUrl: "https://www.youtube.com",
          platform: "DESKTOP",
          utcOffsetMinutes: 0,
          ...(options.visitorData ? { visitorData: options.visitorData } : {})
        },
        request: { internalExperimentFlags: [], useSsl: true },
        user: { lockedSafetyMode: false }
      },
      continuation: options.continuation
    };
    const data = await fetchYoutubeSearchContinuation(body, {
      clientVersion: options.clientVersion,
      visitorData: options.visitorData,
      signal: options.signal
    });
    return {
      results: youtubeSearchResultsFromData(data),
      continuation: youtubeSearchContinuationToken(data),
      apiKey: options.apiKey,
      clientVersion: options.clientVersion,
      visitorData: options.visitorData || "",
      locale
    };
  }

  const url = new URL("https://www.youtube.com/results");
  url.searchParams.set("search_query", trimmed);
  url.searchParams.set("hl", locale.hl);
  url.searchParams.set("gl", locale.gl);
  const response = await fetch(url, { cache: "no-store", signal: options.signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  const initialData = extractJsonObjectAfter(html, "ytInitialData") || extractJsonObjectAfter(html, "var ytInitialData =");
  if (!initialData) return { results: [], continuation: "", apiKey: "", clientVersion: "" };
  const data = JSON.parse(initialData);
  return {
    results: youtubeSearchResultsFromData(data),
    continuation: youtubeSearchContinuationToken(data),
    apiKey: youtubeConfigValue(html, "INNERTUBE_API_KEY"),
    clientVersion: youtubeConfigValue(html, "INNERTUBE_CLIENT_VERSION") || youtubeConfigValue(html, "INNERTUBE_CONTEXT_CLIENT_VERSION"),
    visitorData: youtubeConfigValue(html, "VISITOR_DATA") || youtubeConfigValue(html, "INNERTUBE_CONTEXT_VISITOR_DATA"),
    locale
  };
}

async function fetchYoutubeGlobalSearchPage(query, options = {}) {
  let lastError;
  let lastEmptyPage = null;
  for (let attempt = 1; attempt <= YOUTUBE_SEARCH_ATTEMPTS; attempt += 1) {
    try {
      const page = await fetchYoutubeGlobalSearchPageOnce(query, options);
      if (options.continuation || page.results.length || page.continuation) return page;
      lastEmptyPage = page;
    } catch (error) {
      if (error?.name === "AbortError") throw error;
      lastError = error;
    }
  }
  if (lastEmptyPage) return lastEmptyPage;
  throw lastError;
}

async function fetchYoutubeGlobalSearchResults(query, { limit = 24, signal } = {}) {
  const page = await fetchYoutubeGlobalSearchPage(query, { signal });
  return page.results.slice(0, limit);
}

function hideGlobalSearchSuggestions() {
  window.clearTimeout(globalSearchTimer);
  globalSearchController?.abort();
  globalSearchController = null;
  globalSearchRequestId += 1;
  if (globalSearchResultsEl) globalSearchResultsEl.hidden = true;
  searchInputEl.setAttribute("aria-expanded", "false");
}

function renderGlobalSearchSuggestions(results, message = "") {
  if (!globalSearchResultsEl) return;
  if (message || !results.length) {
    const status = document.createElement("div");
    status.className = "globalSearchMessage";
    status.textContent = message || uiMessage("noYoutubeResultFound");
    globalSearchResultsEl.replaceChildren(status);
    globalSearchResultsEl.hidden = false;
    searchInputEl.setAttribute("aria-expanded", "true");
    return;
  }

  globalSearchResultsEl.replaceChildren(...results.map((result) => {
    const button = document.createElement("button");
    button.type = "button";
    button.role = "option";
    button.className = `globalSearchResult is-${result.type}`;

    const thumbnail = document.createElement(result.thumbnail ? "img" : "span");
    thumbnail.className = "globalSearchResultThumb";
    if (thumbnail instanceof HTMLImageElement) {
      thumbnail.alt = "";
      thumbnail.loading = "lazy";
      thumbnail.src = result.thumbnail;
    } else {
      thumbnail.textContent = result.title.slice(0, 1).toUpperCase();
    }

    const text = document.createElement("span");
    text.className = "globalSearchResultText";
    const title = document.createElement("span");
    title.className = "globalSearchResultTitle";
    title.textContent = result.title;
    if (result.type === "video") restorePreferredYoutubeTitle(result, title);
    const meta = document.createElement("span");
    meta.className = "globalSearchResultMeta";
    meta.textContent = result.type === "channel"
      ? [uiMessage("channel"), result.handle].filter(Boolean).join(" · ")
      : [result.channel, result.duration, result.views].filter(Boolean).join(" · ");
    text.append(title, meta);
    button.append(thumbnail, text);
    button.addEventListener("click", () => {
      hideGlobalSearchSuggestions();
      if (result.type === "channel") {
        selectChannel({ ...result, categories: [] }).catch((error) => setStatus(`Unable to load channel: ${error.message}`, true));
      } else {
        openOfficialYoutube(result);
      }
    });
    return button;
  }));
  globalSearchResultsEl.hidden = false;
  searchInputEl.setAttribute("aria-expanded", "true");
}

function scheduleGlobalSearchSuggestions() {
  window.clearTimeout(globalSearchTimer);
  globalSearchController?.abort();
  const query = searchInputEl.value.trim();
  if (query.length < 2 || videoIdFromInput(query)) {
    hideGlobalSearchSuggestions();
    return;
  }

  const requestId = ++globalSearchRequestId;
  globalSearchTimer = window.setTimeout(async () => {
    globalSearchController = new AbortController();
    renderGlobalSearchSuggestions([], uiMessage("searchingYoutube"));
    try {
      const results = await fetchYoutubeGlobalSearchResults(query, { limit: 8, signal: globalSearchController.signal });
      if (requestId !== globalSearchRequestId || searchInputEl.value.trim() !== query) return;
      renderGlobalSearchSuggestions(results);
    } catch (error) {
      if (error?.name === "AbortError" || requestId !== globalSearchRequestId) return;
      renderGlobalSearchSuggestions([], uiMessage("searchFailed", [error.message]));
    }
  }, 300);
}

async function searchYoutubeChannels(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const locale = await detectYoutubeSearchLocale(trimmed);
  const url = new URL("https://www.youtube.com/results");
  url.searchParams.set("search_query", trimmed);
  url.searchParams.set("sp", "EgIQAg%3D%3D");
  url.searchParams.set("hl", locale.hl);
  url.searchParams.set("gl", locale.gl);
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
    addChannelResultsEl.textContent = uiMessage("noChannelFound");
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
  addChannelResultsEl.textContent = uiMessage("searching");
  try {
    renderAddChannelResults(await searchYoutubeChannels(query));
  } catch (error) {
    addChannelResultsEl.textContent = uiMessage("searchFailed", [error.message]);
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

function openAddVideoDialog(collection) {
  if (!["favorites", "watchLater"].includes(collection) || !addVideoPromptEl) return;
  pendingAddVideoCollection = collection;
  if (addVideoTitleEl) {
    addVideoTitleEl.textContent = uiMessage(collection === "favorites" ? "addFavoriteVideo" : "addWatchLaterVideo");
  }
  if (addVideoInputEl) {
    addVideoInputEl.value = "";
    addVideoInputEl.placeholder = uiMessage("youtubeVideoUrlOrId");
  }
  addVideoPromptEl.hidden = false;
  addVideoInputEl?.focus();
}

function closeAddVideoDialog() {
  pendingAddVideoCollection = "";
  if (addVideoPromptEl) addVideoPromptEl.hidden = true;
}

async function submitAddVideoDialog() {
  const videoId = videoIdFromInput(addVideoInputEl?.value || "");
  if (!videoId) {
    showInfoPopup(uiMessage("invalidYoutubeVideoUrl"), "error");
    addVideoInputEl?.focus();
    return;
  }
  const collection = pendingAddVideoCollection;
  const video = { id: videoId, title: videoId };
  const added = collection === "favorites"
    ? await addVideoToFavorites(video, activeFavoriteCategoryId)
    : collection === "watchLater"
      ? await addVideoToWatchLater(video)
      : false;
  if (added) closeAddVideoDialog();
}

async function addChannel(categoryId = activeCategoryId) {
  openAddChannelDialog(categoryId);
}

function openAddCategoryDialog(scope = "channels", parentId = "") {
  categoryDialogScope = scope === "favorites" ? "favorites" : "channels";
  categoryBeingRenamed = null;
  const sourceCategories = categoryDialogScope === "favorites" ? favoriteCategories : allCategories;
  const parent = sourceCategories.find((category) => category.id === parentId && !category.parentId);
  categoryDialogParentId = parent?.id || "";
  if (!addCategoryPromptEl) return;
  const submit = addCategoryFormEl?.querySelector("button[type='submit']");
  if (submit) submit.textContent = "Add";
  if (addCategoryParentFieldEl) addCategoryParentFieldEl.hidden = false;
  if (addCategoryParentEl) {
    const rootOption = document.createElement("option");
    rootOption.value = "";
    rootOption.textContent = uiMessage("noParentMainCategory");
    addCategoryParentEl.replaceChildren(
      rootOption,
      ...sortedCategorySiblings(sourceCategories).map((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        return option;
      })
    );
    addCategoryParentEl.value = categoryDialogParentId;
  }
  syncAddCategoryDialogTitle();
  addCategoryPromptEl.hidden = false;
  if (addCategoryNameEl) addCategoryNameEl.value = "";
  addCategoryNameEl?.focus();
}

function syncAddCategoryDialogTitle() {
  if (!addCategoryPromptEl) return;
  const sourceCategories = categoryDialogScope === "favorites" ? favoriteCategories : allCategories;
  const parent = sourceCategories.find((category) => category.id === categoryDialogParentId);
  const title = addCategoryPromptEl.querySelector("#addCategoryTitle");
  if (title) {
    title.textContent = parent
      ? uiMessage("addSubcategoryTo", [parent.name])
      : uiMessage("addCategory");
  }
}

function openAddFavoriteCategoryDialog() {
  openAddCategoryDialog("favorites");
}

function openRenameCategoryDialog(category, scope = "channels") {
  if (!category?.id || !addCategoryPromptEl) return;
  categoryDialogScope = scope === "favorites" ? "favorites" : "channels";
  categoryBeingRenamed = category;
  categoryDialogParentId = category.parentId || "";
  const title = addCategoryPromptEl.querySelector("#addCategoryTitle");
  const submit = addCategoryFormEl?.querySelector("button[type='submit']");
  if (title) title.textContent = "Rename category";
  if (submit) submit.textContent = "Rename";
  if (addCategoryParentFieldEl) addCategoryParentFieldEl.hidden = true;
  addCategoryPromptEl.hidden = false;
  if (addCategoryNameEl) addCategoryNameEl.value = category.name || "";
  addCategoryNameEl?.select();
  addCategoryNameEl?.focus();
}

function closeAddCategoryDialog() {
  if (addCategoryPromptEl) addCategoryPromptEl.hidden = true;
  categoryBeingRenamed = null;
  categoryDialogScope = "channels";
  categoryDialogParentId = "";
}

async function saveNewCategoryFromDialog() {
  const name = addCategoryNameEl?.value || "";
  if (!name.trim()) return;
  const isFavoriteCategory = categoryDialogScope === "favorites";
  if (categoryBeingRenamed) {
    const trimmed = name.trim();
    const sourceCategories = isFavoriteCategory ? favoriteCategories : allCategories;
    const duplicate = sourceCategories.find((category) => (
      category.id !== categoryBeingRenamed.id
      && category.name.toLocaleLowerCase("fr") === trimmed.toLocaleLowerCase("fr")
    ));
    if (duplicate) {
      showInfoPopup(`Category "${duplicate.name}" already exists.`, "info");
      return;
    }
    categoryBeingRenamed.name = trimmed;
    if (isFavoriteCategory) {
      favoriteCategories = favoriteCategories.map((category) => (
        category.id === categoryBeingRenamed.id ? categoryBeingRenamed : category
      ));
    } else {
      allCategories = allCategories.map((category) => (
        category.id === categoryBeingRenamed.id ? categoryBeingRenamed : category
      ));
    }
    await saveConfig();
    if (isFavoriteCategory) {
      renderFavoritesHome();
      closeAddCategoryDialog();
      return;
    }
    renderCategories();
    renderChannels(channelsForActiveCategory());
    renderSidePanelPath();
    closeAddCategoryDialog();
    return;
  }
  const category = isFavoriteCategory
    ? createFavoriteCategory(name, categoryDialogParentId)
    : createCategory(name, categoryDialogParentId);
  if (!category) return;
  if (categoryDialogParentId) {
    if (isFavoriteCategory) activeFavoriteCategoryId = category.id;
    else activeCategoryId = category.id;
  }
  await saveConfig();
  if (isFavoriteCategory) {
    renderFavoritesHome();
    closeAddCategoryDialog();
    return;
  }
  renderCategories();
  renderChannels(channelsForActiveCategory());
  renderSidePanelPath();
  closeAddCategoryDialog();
}

addChannelEl.addEventListener("click", () => {
  addChannel(activeCategoryId);
});

addListItemEl?.addEventListener("click", () => {
  if (activePrimarySection === "channels") {
    openAddChannelDialog(activeCategoryId);
    return;
  }
  openAddVideoDialog(activePrimarySection);
});

addVideoFormEl?.addEventListener("submit", (event) => {
  event.preventDefault();
  submitAddVideoDialog().catch((error) => showInfoPopup(error.message, "error"));
});

closeAddVideoEl?.addEventListener("click", closeAddVideoDialog);
addVideoPromptEl?.addEventListener("click", (event) => {
  if (event.target === addVideoPromptEl) closeAddVideoDialog();
});

addCategoryEl.addEventListener("click", () => {
  openAddCategoryDialog(activePrimarySection === "favorites" ? "favorites" : "channels");
});

initializeInterfaceLanguage();
applyListLayout();
applyListZoom();
syncPanelVisibilityState({ broadcast: true });
if (globalThis.chrome?.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (changes[STORAGE_KEY]?.newValue) {
      const nextConfig = changes[STORAGE_KEY].newValue;
      applyExternalConfig(nextConfig);
      if (nextConfig.updatedAt !== webDavSyncIgnoreUpdatedAt) scheduleWebDavSynchronization();
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
document.addEventListener("visibilitychange", () => {
  syncPanelVisibilityState({ broadcast: true });
  if (document.visibilityState === "visible") synchronizeWebDavConfig().catch(() => {});
});
window.addEventListener("resize", scheduleCategoryOverflowSync);
window.setInterval(() => syncPanelVisibilityState({ broadcast: true }), 1000);
window.setInterval(() => {
  checkCurrentWatchLaterVisibility().catch(() => {});
}, 1500);
window.setInterval(() => {
  if (document.visibilityState === "visible") synchronizeWebDavConfig().catch(() => {});
}, WEBDAV_SYNC_POLL_INTERVAL_MS);
window.addEventListener("pagehide", () => setPanelOpenState(false));
window.addEventListener("beforeunload", () => setPanelOpenState(false));


loadChannels().then(async () => {
  if (activePrimarySection === "youtube") {
    searchInputEl.value = youtubeSearchQuery;
    if (youtubeSearchQuery) await searchYoutube(youtubeSearchQuery, { skipHistory: true });
    else await showPreferredYoutubeHome();
  } else if (activePrimarySection === "watchLater") {
    setActivePrimarySection("watchLater");
    activeView = "watchLater";
    activeCategoryId = "";
    clearChannelSearch();
    renderCategories();
    renderChannels([]);
    renderWatchLater();
  } else if (activePrimarySection === "favorites") {
    setActivePrimarySection("favorites");
    clearChannelSearch();
    renderFavoritesHome();
  } else {
    setActivePrimarySection("channels");
  }
  if ((sortModes.channels || "").startsWith("subscribers-")) {
    refreshMissingSubscriberCounts().catch(() => {});
  }
  initializeWebDavSynchronization().catch((error) => setWebDavStatus(`Synchronization error: ${error.message}`, true));
  handlePendingDataCommand().catch(() => {});
  const initialVideoId = videoIdFromInput(new URLSearchParams(window.location.search).get("video") || "");
  if (initialVideoId) {
    openOfficialYoutube(initialVideoId);
  }
});
