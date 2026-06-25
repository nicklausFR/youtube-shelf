const COMMENTS_MODE_KEY = "youtubeChannelShelfHideComments";
const SUGGESTIONS_MODE_KEY = "youtubeChannelShelfHideSuggestions";
const PANEL_OPEN_KEY = "youtubeChannelShelfPanelOpen";
const PANEL_HEARTBEAT_KEY = "youtubeChannelShelfPanelHeartbeat";
const HEARTBEAT_TTL_MS = 2500;

let commentsModeEnabled = false;
let suggestionsModeEnabled = true;
let panelOpen = false;
let panelHeartbeat = 0;

function isPanelActuallyVisible() {
  return panelOpen && Date.now() - panelHeartbeat < HEARTBEAT_TTL_MS;
}

function applyDisplayOptions() {
  const active = isPanelActuallyVisible();
  document.documentElement.classList.toggle("yt-companion-panel-open", active);
  document.documentElement.classList.toggle("yt-companion-hide-comments", active && commentsModeEnabled);
  document.documentElement.classList.toggle("yt-companion-hide-suggestions", active && suggestionsModeEnabled);
}

chrome.storage.local.get([COMMENTS_MODE_KEY, SUGGESTIONS_MODE_KEY, PANEL_OPEN_KEY, PANEL_HEARTBEAT_KEY], (result) => {
  commentsModeEnabled = Boolean(result[COMMENTS_MODE_KEY]);
  suggestionsModeEnabled = result[SUGGESTIONS_MODE_KEY] === undefined ? true : Boolean(result[SUGGESTIONS_MODE_KEY]);
  panelOpen = Boolean(result[PANEL_OPEN_KEY]);
  panelHeartbeat = Number(result[PANEL_HEARTBEAT_KEY] || 0);
  applyDisplayOptions();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (changes[COMMENTS_MODE_KEY]) {
    commentsModeEnabled = Boolean(changes[COMMENTS_MODE_KEY].newValue);
  }
  if (changes[SUGGESTIONS_MODE_KEY]) {
    suggestionsModeEnabled = changes[SUGGESTIONS_MODE_KEY].newValue === undefined ? true : Boolean(changes[SUGGESTIONS_MODE_KEY].newValue);
  }
  if (changes[PANEL_OPEN_KEY]) {
    panelOpen = Boolean(changes[PANEL_OPEN_KEY].newValue);
  }
  if (changes[PANEL_HEARTBEAT_KEY]) {
    panelHeartbeat = Number(changes[PANEL_HEARTBEAT_KEY].newValue || 0);
  }
  applyDisplayOptions();
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== "youtubeChannelShelfDisplayOptions") return;
  commentsModeEnabled = Boolean(message.hideComments);
  suggestionsModeEnabled = message.hideSuggestions === undefined ? true : Boolean(message.hideSuggestions);
  applyDisplayOptions();
});

window.setInterval(applyDisplayOptions, 1000);
