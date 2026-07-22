if (!globalThis.__youtubeChannelShelfLiveInjected) {
globalThis.__youtubeChannelShelfLiveInjected = true;

const COMMENTS_MODE_KEY = "youtubeChannelShelfHideComments";
const SUGGESTIONS_MODE_KEY = "youtubeChannelShelfHideSuggestions";
const FOCUS_PLAYER_MODE_KEY = "youtubeChannelShelfFocusPlayer";
const PANEL_OPEN_KEY = "youtubeChannelShelfPanelOpen";
const PANEL_HEARTBEAT_KEY = "youtubeChannelShelfPanelHeartbeat";
const VIDEO_PROGRESS_KEY = "youtubeChannelShelfVideoProgress";
const HEARTBEAT_TTL_MS = 2500;
const VIDEO_PROGRESS_SAVE_INTERVAL_SECONDS = 5;
const VIDEO_PROGRESS_MINIMUM_SECONDS = 5;
const VIDEO_PROGRESS_FINISHED_SECONDS = 15;
const VIDEO_PROGRESS_MAX_ENTRIES = 500;
const VIDEO_PROGRESS_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

let commentsModeEnabled = false;
let suggestionsModeEnabled = true;
let focusPlayerModeEnabled = false;
let panelOpen = false;
let panelHeartbeat = 0;
let videoProgress = {};
let trackedVideo = null;
let trackedVideoId = "";
let lastSavedVideoSecond = -1;
let restoreAttempted = false;

const videoProgressReady = new Promise((resolve) => {
  chrome.storage.local.get(VIDEO_PROGRESS_KEY, (result) => {
    const stored = result[VIDEO_PROGRESS_KEY];
    videoProgress = stored && typeof stored === "object" ? stored : {};
    if (removeExpiredVideoProgress()) persistVideoProgress();
    resolve();
  });
});

function currentYoutubeVideoId() {
  const url = new URL(window.location.href);
  if (url.pathname === "/watch") return (url.searchParams.get("v") || "").trim();
  return url.pathname.match(/^\/(?:shorts|live)\/([^/?#]+)/)?.[1] || "";
}

function hasExplicitStartTime() {
  const url = new URL(window.location.href);
  return ["t", "start", "time_continue"].some((key) => url.searchParams.has(key)) || /^#t=/.test(url.hash);
}

function isAdvertisementPlaying() {
  return Boolean(document.querySelector(".html5-video-player.ad-showing"));
}

function isFinishedPosition(time, duration) {
  return duration - time <= VIDEO_PROGRESS_FINISHED_SECONDS || time / duration >= 0.95;
}

function isVideoProgressExpired(item) {
  const updatedAt = Number(item?.updatedAt);
  return !Number.isFinite(updatedAt) || Date.now() - updatedAt >= VIDEO_PROGRESS_MAX_AGE_MS;
}

function removeExpiredVideoProgress() {
  let changed = false;
  Object.entries(videoProgress).forEach(([videoId, item]) => {
    if (!isVideoProgressExpired(item)) return;
    delete videoProgress[videoId];
    changed = true;
  });
  return changed;
}

function trimVideoProgress() {
  removeExpiredVideoProgress();
  const entries = Object.entries(videoProgress);
  if (entries.length <= VIDEO_PROGRESS_MAX_ENTRIES) return;
  entries
    .sort(([, left], [, right]) => Number(right?.updatedAt || 0) - Number(left?.updatedAt || 0))
    .slice(VIDEO_PROGRESS_MAX_ENTRIES)
    .forEach(([videoId]) => delete videoProgress[videoId]);
}

function persistVideoProgress() {
  trimVideoProgress();
  chrome.storage.local.set({ [VIDEO_PROGRESS_KEY]: videoProgress });
}

function forgetVideoProgress(videoId) {
  if (!videoId || !videoProgress[videoId]) return;
  delete videoProgress[videoId];
  persistVideoProgress();
}

function saveTrackedVideoProgress(force = false) {
  if (!trackedVideo || !trackedVideoId || isAdvertisementPlaying()) return;

  const time = Number(trackedVideo.currentTime);
  const duration = Number(trackedVideo.duration);
  if (!Number.isFinite(time) || !Number.isFinite(duration) || duration <= 0) return;

  if (time < VIDEO_PROGRESS_MINIMUM_SECONDS || isFinishedPosition(time, duration)) {
    forgetVideoProgress(trackedVideoId);
    return;
  }

  const second = Math.floor(time);
  if (!force && lastSavedVideoSecond >= 0 && Math.abs(second - lastSavedVideoSecond) < VIDEO_PROGRESS_SAVE_INTERVAL_SECONDS) return;

  lastSavedVideoSecond = second;
  videoProgress[trackedVideoId] = {
    time: second,
    duration: Math.floor(duration),
    updatedAt: Date.now()
  };
  persistVideoProgress();
}

async function restoreTrackedVideoProgress() {
  if (!trackedVideo || !trackedVideoId || restoreAttempted || hasExplicitStartTime()) return;

  const video = trackedVideo;
  const videoId = trackedVideoId;
  await videoProgressReady;
  if (video !== trackedVideo || videoId !== trackedVideoId || restoreAttempted) return;

  const duration = Number(video.duration);
  if (!Number.isFinite(duration) || duration <= 0 || isAdvertisementPlaying()) return;

  restoreAttempted = true;
  const storedItem = videoProgress[videoId];
  if (isVideoProgressExpired(storedItem)) {
    forgetVideoProgress(videoId);
    return;
  }

  const storedTime = Number(storedItem?.time);
  if (!Number.isFinite(storedTime) || storedTime < VIDEO_PROGRESS_MINIMUM_SECONDS || isFinishedPosition(storedTime, duration)) {
    forgetVideoProgress(videoId);
    return;
  }

  video.currentTime = Math.min(storedTime, Math.max(0, duration - VIDEO_PROGRESS_FINISHED_SECONDS));
}

function stopTrackingVideo() {
  if (!trackedVideo) return;
  trackedVideo.removeEventListener("timeupdate", handleVideoTimeUpdate);
  trackedVideo.removeEventListener("pause", handleVideoPause);
  trackedVideo.removeEventListener("ended", handleVideoEnded);
  trackedVideo.removeEventListener("loadedmetadata", restoreTrackedVideoProgress);
  trackedVideo.removeEventListener("durationchange", restoreTrackedVideoProgress);
  trackedVideo = null;
  trackedVideoId = "";
}

function handleVideoTimeUpdate() {
  saveTrackedVideoProgress();
}

function handleVideoPause() {
  saveTrackedVideoProgress(true);
}

function handleVideoEnded() {
  forgetVideoProgress(trackedVideoId);
}

function trackCurrentVideo() {
  const videoId = currentYoutubeVideoId();
  const video = videoId ? document.querySelector("video.html5-main-video") : null;
  if (!video || (video === trackedVideo && videoId === trackedVideoId)) return;

  stopTrackingVideo();
  trackedVideo = video;
  trackedVideoId = videoId;
  lastSavedVideoSecond = -1;
  restoreAttempted = false;
  video.addEventListener("timeupdate", handleVideoTimeUpdate);
  video.addEventListener("pause", handleVideoPause);
  video.addEventListener("ended", handleVideoEnded);
  video.addEventListener("loadedmetadata", restoreTrackedVideoProgress);
  video.addEventListener("durationchange", restoreTrackedVideoProgress);
  restoreTrackedVideoProgress();
}

function isPanelActuallyVisible() {
  return panelOpen && Date.now() - panelHeartbeat < HEARTBEAT_TTL_MS;
}

function applyDisplayOptions() {
  const active = isPanelActuallyVisible();
  document.documentElement.classList.toggle("yt-companion-panel-open", active);
  document.documentElement.classList.toggle("yt-companion-hide-comments", active && commentsModeEnabled);
  document.documentElement.classList.toggle("yt-companion-hide-suggestions", active && suggestionsModeEnabled);
  document.documentElement.classList.toggle("yt-companion-focus-player", active && focusPlayerModeEnabled);
}

chrome.storage.local.get([COMMENTS_MODE_KEY, SUGGESTIONS_MODE_KEY, FOCUS_PLAYER_MODE_KEY, PANEL_OPEN_KEY, PANEL_HEARTBEAT_KEY], (result) => {
  commentsModeEnabled = Boolean(result[COMMENTS_MODE_KEY]);
  suggestionsModeEnabled = result[SUGGESTIONS_MODE_KEY] === undefined ? true : Boolean(result[SUGGESTIONS_MODE_KEY]);
  focusPlayerModeEnabled = Boolean(result[FOCUS_PLAYER_MODE_KEY]);
  panelOpen = Boolean(result[PANEL_OPEN_KEY]);
  panelHeartbeat = Number(result[PANEL_HEARTBEAT_KEY] || 0);
  applyDisplayOptions();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (changes[VIDEO_PROGRESS_KEY]) {
    const stored = changes[VIDEO_PROGRESS_KEY].newValue;
    videoProgress = stored && typeof stored === "object" ? stored : {};
  }
  if (changes[COMMENTS_MODE_KEY]) {
    commentsModeEnabled = Boolean(changes[COMMENTS_MODE_KEY].newValue);
  }
  if (changes[SUGGESTIONS_MODE_KEY]) {
    suggestionsModeEnabled = changes[SUGGESTIONS_MODE_KEY].newValue === undefined ? true : Boolean(changes[SUGGESTIONS_MODE_KEY].newValue);
  }
  if (changes[FOCUS_PLAYER_MODE_KEY]) {
    focusPlayerModeEnabled = Boolean(changes[FOCUS_PLAYER_MODE_KEY].newValue);
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
  focusPlayerModeEnabled = Boolean(message.focusPlayer);
  if (message.panelOpen !== undefined) {
    panelOpen = Boolean(message.panelOpen);
  }
  if (message.panelHeartbeat !== undefined) {
    panelHeartbeat = Number(message.panelHeartbeat || 0);
  }
  applyDisplayOptions();
});

window.setInterval(applyDisplayOptions, 1000);
window.setInterval(trackCurrentVideo, 1000);

document.addEventListener("yt-navigate-start", () => saveTrackedVideoProgress(true));
document.addEventListener("yt-navigate-finish", trackCurrentVideo);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveTrackedVideoProgress(true);
});
window.addEventListener("pagehide", () => saveTrackedVideoProgress(true));

trackCurrentVideo();
}
