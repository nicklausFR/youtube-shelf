const COMMENTS_MODE_KEY = "youtubeChannelShelfHideComments";
const PANEL_OPEN_KEY = "youtubeChannelShelfPanelOpen";
const PANEL_HEARTBEAT_KEY = "youtubeChannelShelfPanelHeartbeat";
const HEARTBEAT_TTL_MS = 2500;

let commentsModeEnabled = false;
let panelOpen = false;
let panelHeartbeat = 0;

function isPanelActuallyVisible() {
  return panelOpen && Date.now() - panelHeartbeat < HEARTBEAT_TTL_MS;
}

function applyDisplayOptions() {
  const active = isPanelActuallyVisible();
  document.documentElement.classList.toggle("yt-companion-panel-open", active);
  document.documentElement.classList.toggle("yt-companion-hide-comments", active && commentsModeEnabled);
}

chrome.storage.local.get([COMMENTS_MODE_KEY, PANEL_OPEN_KEY, PANEL_HEARTBEAT_KEY], (result) => {
  commentsModeEnabled = Boolean(result[COMMENTS_MODE_KEY]);
  panelOpen = Boolean(result[PANEL_OPEN_KEY]);
  panelHeartbeat = Number(result[PANEL_HEARTBEAT_KEY] || 0);
  applyDisplayOptions();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (changes[COMMENTS_MODE_KEY]) {
    commentsModeEnabled = Boolean(changes[COMMENTS_MODE_KEY].newValue);
  }
  if (changes[PANEL_OPEN_KEY]) {
    panelOpen = Boolean(changes[PANEL_OPEN_KEY].newValue);
  }
  if (changes[PANEL_HEARTBEAT_KEY]) {
    panelHeartbeat = Number(changes[PANEL_HEARTBEAT_KEY].newValue || 0);
  }
  applyDisplayOptions();
});

window.setInterval(applyDisplayOptions, 1000);
