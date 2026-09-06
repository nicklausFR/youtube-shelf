(() => {
const previous = globalThis.__youtubeChannelShelfLiveInjected;
const version = chrome.runtime.getManifest().version;
if (previous?.version === version && previous.active()) return;
previous?.dispose?.();
let disposed = false;
const cleanup = [];
function liveActive() {
  if (!disposed && !chrome.runtime?.id) disposeLive();
  return !disposed;
}
function disposeLive() {
  if (disposed) return;
  disposed = true;
  for (const remove of cleanup.splice(0)) {
    try { remove(); } catch { /* The old extension context may already be gone. */ }
  }
  stopTrackingVideo();
  hideFullscreenEscapeHint();
}
function liveListener(target, type, listener, options) {
  const guarded = (...args) => liveActive() ? listener(...args) : undefined;
  target.addEventListener(type, guarded, options);
  cleanup.push(() => target.removeEventListener(type, guarded, options));
}
function liveChromeListener(event, listener) {
  const guarded = (...args) => liveActive() ? listener(...args) : undefined;
  event.addListener(guarded);
  cleanup.push(() => event.removeListener(guarded));
}
function liveInterval(callback, delay) {
  const timer = window.setInterval(() => { if (liveActive()) callback(); }, delay);
  cleanup.push(() => window.clearInterval(timer));
}
function liveTimeout(callback, delay) {
  const cancel = () => window.clearTimeout(timer);
  const timer = window.setTimeout(() => {
    const index = cleanup.indexOf(cancel);
    if (index >= 0) cleanup.splice(index, 1);
    if (liveActive()) callback();
  }, delay);
  cleanup.push(cancel);
  return timer;
}
globalThis.__youtubeChannelShelfLiveInjected = { version, active: liveActive, dispose: disposeLive };

const COMMENTS_MODE_KEY = "youtubeChannelShelfHideComments";
const SUGGESTIONS_MODE_KEY = "youtubeChannelShelfHideSuggestions";
const FOCUS_PLAYER_MODE_KEY = "youtubeChannelShelfFocusPlayer";
const FOCUS_FULLSCREEN_EXITED_KEY = "youtubeChannelShelfFocusFullscreenExited";
const PANEL_OPEN_KEY = "youtubeChannelShelfPanelOpen";
const PANEL_HEARTBEAT_KEY = "youtubeChannelShelfPanelHeartbeat";
const VIDEO_PROGRESS_KEY = "youtubeChannelShelfVideoProgress";
const VIDEO_PROGRESS_SAVE_INTERVAL_SECONDS = 5;
const VIDEO_PROGRESS_MINIMUM_SECONDS = 5;
const VIDEO_PROGRESS_FINISHED_SECONDS = 15;
const VIDEO_PROGRESS_MAX_ENTRIES = 500;
const VIDEO_PROGRESS_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const FULLSCREEN_HINT_ID = "youtubeShelfFullscreenHint";

let commentsModeEnabled = false;
let suggestionsModeEnabled = true;
let focusPlayerModeEnabled = false;
let shelfFullscreenActive = false;
let panelOpen = false;
let panelHeartbeat = 0;
let videoProgress = {};
let trackedVideo = null;
let trackedVideoId = "";
let lastSavedVideoSecond = -1;
let restoreAttempted = false;
let fullscreenHintTimer = 0;
let youtubeShelfSubscriptionResultSent = false;
let youtubeShelfSubscriptionResultSending = false;
let youtubeShelfSubscriptionButtonClicked = false;
let youtubeShelfConfirmationButtonClicked = false;
let youtubeShelfSubscriptionFallbackTimer = 0;
let youtubeShelfSubscriptionTargetChannelId = "";
let youtubeShelfSubscriptionAction = "subscribe";
let youtubeShelfSubscriptionStartedAt = 0;
let youtubeShelfSubscriptionTargetRequestPending = false;

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
  if (!liveActive()) return;
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
  return panelOpen;
}

function applyDisplayOptions() {
  // Updating an extension invalidates its old content-script context without
  // stopping timers in tabs that were already open. Leave the DOM to the new
  // script instead of repeatedly applying stale display preferences.
  if (!liveActive()) return;
  const active = isPanelActuallyVisible() || shelfFullscreenActive;
  document.documentElement.classList.toggle("yt-companion-panel-open", active);
  document.documentElement.classList.toggle("yt-companion-hide-comments", active && commentsModeEnabled);
  document.documentElement.classList.toggle("yt-companion-hide-suggestions", active && suggestionsModeEnabled);
  document.documentElement.classList.toggle("yt-companion-focus-player", active && focusPlayerModeEnabled);
}

function focusFullscreenKeyboardTarget() {
  window.focus();
  const target = document.querySelector("#movie_player")
    || document.querySelector("video")
    || document.body;
  if (!(target instanceof HTMLElement)) return;
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  try {
    target.focus({ preventScroll: true });
  } catch {
    target.focus();
  }
}

function hideFullscreenEscapeHint() {
  if (fullscreenHintTimer) {
    window.clearTimeout(fullscreenHintTimer);
    fullscreenHintTimer = 0;
  }
  document.getElementById(FULLSCREEN_HINT_ID)?.remove();
}

function showFullscreenEscapeHint() {
  hideFullscreenEscapeHint();
  const hint = document.createElement("div");
  hint.id = FULLSCREEN_HINT_ID;
  hint.className = "youtubeShelfFullscreenHint";
  hint.textContent = chrome.i18n.getMessage("fullscreenEscapeClickHint")
    || "Click the video, then press Escape to exit full screen.";
  (document.querySelector("#movie_player") || document.body || document.documentElement).append(hint);
}

function scheduleFullscreenEscapeHint() {
  hideFullscreenEscapeHint();
  fullscreenHintTimer = liveTimeout(() => {
    fullscreenHintTimer = 0;
    if (document.fullscreenElement) showFullscreenEscapeHint();
  }, 3500);
}

function youtubeShelfSubscriptionFromCard(card) {
  const data = card?.data || card?.__data?.data || {};
  const dataId = data.channelId
    || data.navigationEndpoint?.browseEndpoint?.browseId
    || data.contentId
    || "";
  const links = [...card.querySelectorAll("a[href]")];
  const link = links.find((item) => /\/(?:channel\/UC[-_a-zA-Z0-9]+|@[-_.a-zA-Z0-9]+|c\/|user\/)/.test(item.getAttribute("href") || ""));
  if (!link && !/^UC[-_a-zA-Z0-9]+$/.test(dataId)) return null;
  const url = link ? new URL(link.getAttribute("href"), location.origin).href : `https://www.youtube.com/channel/${dataId}`;
  const id = /^UC[-_a-zA-Z0-9]+$/.test(dataId)
    ? dataId
    : url.match(/\/channel\/(UC[-_a-zA-Z0-9]+)/)?.[1] || "";
  const title = String(
    data.title?.simpleText
    || data.title?.runs?.[0]?.text
    || card.querySelector("#channel-title, #text-container, .yt-lockup-metadata-view-model__title")?.textContent
    || link?.getAttribute("title")
    || link?.textContent
    || id
  ).trim();
  const image = card.querySelector("img");
  return {
    id,
    url,
    title,
    thumbnail: image?.currentSrc || image?.src || ""
  };
}

async function youtubeShelfReadSubscriptionsPage(requestId = "") {
  if (location.pathname !== "/feed/channels") {
    return { ok: false, error: "Open the YouTube subscriptions page first" };
  }

  const hasAccountAvatar = Boolean(document.querySelector("#avatar-btn, button[aria-label*='Account'], button[aria-label*='compte']"));
  const channels = new Map();
  let stablePasses = 0;
  let previousSignature = "";

  for (let pass = 0; pass < 60 && stablePasses < 4; pass += 1) {
    const cards = document.querySelectorAll("ytd-channel-renderer, ytd-grid-channel-renderer, yt-lockup-view-model, ytd-rich-item-renderer");
    for (const card of cards) {
      const channel = youtubeShelfSubscriptionFromCard(card);
      if (!channel?.url) continue;
      channels.set(channel.id || channel.url, channel);
    }
    if (requestId && !previousSignature.startsWith(`${channels.size}:`)) {
      Promise.resolve(chrome.runtime.sendMessage({
        type: "YOUTUBE_SHELF_SUBSCRIPTIONS_PROGRESS", requestId, channels: [...channels.values()]
      })).catch(() => {});
    }
    const signature = `${channels.size}:${document.documentElement.scrollHeight}`;
    stablePasses = signature === previousSignature ? stablePasses + 1 : 0;
    previousSignature = signature;
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((resolve) => liveTimeout(resolve, 500));
  }

  window.scrollTo(0, 0);
  if (!hasAccountAvatar && channels.size === 0) {
    return { ok: false, signedIn: false, error: "Sign in to YouTube in this tab, then try again" };
  }
  return { ok: true, signedIn: true, channels: [...channels.values()] };
}

function youtubeShelfSubscriptionConfirmationChannelId() {
  if (!youtubeShelfSubscriptionTargetChannelId && !youtubeShelfSubscriptionTargetRequestPending) {
    youtubeShelfSubscriptionTargetRequestPending = true;
    Promise.resolve(chrome.runtime.sendMessage({ type: "YOUTUBE_SHELF_GET_SUBSCRIPTION_AUTOMATION" }))
      .then((response) => {
        const channelId = String(response?.channelId || "");
        if (/^UC[-_a-zA-Z0-9]+$/.test(channelId)) {
          youtubeShelfSubscriptionTargetChannelId = channelId;
          youtubeShelfSubscriptionAction = response.action === "unsubscribe" ? "unsubscribe" : "subscribe";
          youtubeShelfSubscriptionStartedAt = Date.now();
        }
      })
      .catch(() => {})
      .finally(() => {
        youtubeShelfSubscriptionTargetRequestPending = false;
      });
  }
  return youtubeShelfSubscriptionTargetChannelId;
}

function youtubeShelfSubscriptionIsConfirmed() {
  if (document.querySelector("ytd-subscribe-button-renderer[subscribed], [subscribe-button-invisible][subscribed]")) return true;
  return [...document.querySelectorAll("button, tp-yt-paper-button")].some((button) => {
    const value = [button.textContent, button.getAttribute("aria-label"), button.getAttribute("title")]
      .filter(Boolean)
      .join(" ")
      .trim();
    return /\bsubscribed\b|\bunsubscribe\b|se d\u00e9sabonner|(?:^|[^\p{L}])abonn\u00e9(?:e)?(?!\p{L})/iu.test(value);
  });
}

function youtubeShelfButtonText(button) {
  return [button?.textContent, button?.getAttribute?.("aria-label"), button?.getAttribute?.("title")]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function youtubeShelfIsSubscribeAction(button) {
  return /^(subscribe|s[\u0027\u2019]abonner)(?:\s|$)/iu.test(youtubeShelfButtonText(button));
}

function youtubeShelfScheduleSubscriptionResult(delay) {
  if (youtubeShelfSubscriptionFallbackTimer || youtubeShelfSubscriptionResultSent) return;
  youtubeShelfSubscriptionFallbackTimer = liveTimeout(() => {
    youtubeShelfSubscriptionFallbackTimer = 0;
    youtubeShelfMonitorSubscriptionConfirmation();
  }, delay);
}

function youtubeShelfClickSubscriptionConfirmation() {
  const channelId = youtubeShelfSubscriptionConfirmationChannelId();
  if (!channelId || youtubeShelfSubscriptionResultSent) return;

  const dialogs = [...document.querySelectorAll("tp-yt-paper-dialog, ytd-popup-container")]
    .filter((dialog) => dialog.getClientRects().length);
  for (const dialog of dialogs) {
    const confirmButton = [...dialog.querySelectorAll("button, tp-yt-paper-button")]
      .find((button) => youtubeShelfIsSubscribeAction(button));
    if (confirmButton && !youtubeShelfConfirmationButtonClicked) {
      youtubeShelfConfirmationButtonClicked = true;
      confirmButton.click();
      youtubeShelfScheduleSubscriptionResult(900);
      return;
    }
  }

  if (youtubeShelfSubscriptionButtonClicked) return;
  const subscribeRenderer = document.querySelector("ytd-subscribe-button-renderer:not([subscribed]), yt-subscribe-button-view-model");
  const subscribeButton = subscribeRenderer?.querySelector("button, tp-yt-paper-button");
  if (subscribeButton && youtubeShelfIsSubscribeAction(subscribeButton)) {
    youtubeShelfSubscriptionButtonClicked = true;
    subscribeButton.click();
    youtubeShelfScheduleSubscriptionResult(1400);
    return;
  }
}

function youtubeShelfReportSubscriptionResult(status) {
  const channelId = youtubeShelfSubscriptionConfirmationChannelId();
  if (!channelId || youtubeShelfSubscriptionResultSent || youtubeShelfSubscriptionResultSending) return;
  youtubeShelfSubscriptionResultSending = true;
  Promise.resolve(chrome.runtime.sendMessage({
    type: "YOUTUBE_SHELF_SUBSCRIPTION_RESULT",
    status,
    channelId
  }))
    .then((response) => {
      if (response?.ok) {
        youtubeShelfSubscriptionResultSent = true;
        if (youtubeShelfSubscriptionFallbackTimer) {
          window.clearTimeout(youtubeShelfSubscriptionFallbackTimer);
          youtubeShelfSubscriptionFallbackTimer = 0;
        }
        return;
      }
      youtubeShelfScheduleSubscriptionResult(500);
    })
    .catch(() => youtubeShelfScheduleSubscriptionResult(500))
    .finally(() => {
      youtubeShelfSubscriptionResultSending = false;
    });
}

function youtubeShelfClickUnsubscribe() {
  const visible = (element) => element.getClientRects().length > 0;
  const isUnsubscribe = (button) => /^(unsubscribe|se d[ée]sabonner)(?:\s|$)/iu.test(youtubeShelfButtonText(button));
  const popupButtons = [...document.querySelectorAll("ytd-popup-container button, ytd-popup-container tp-yt-paper-item, tp-yt-paper-dialog button, tp-yt-paper-dialog tp-yt-paper-button")];
  const confirm = popupButtons.find((button) => visible(button) && isUnsubscribe(button));
  if (confirm) {
    if (!youtubeShelfConfirmationButtonClicked) {
      youtubeShelfConfirmationButtonClicked = true;
      confirm.click();
      liveTimeout(() => { youtubeShelfConfirmationButtonClicked = false; }, 700);
    }
    return;
  }
  const renderer = document.querySelector("ytd-subscribe-button-renderer, yt-subscribe-button-view-model");
  const button = renderer?.querySelector("button, tp-yt-paper-button");
  if (!youtubeShelfSubscriptionButtonClicked && button && visible(button) && !youtubeShelfIsSubscribeAction(button)) {
    youtubeShelfSubscriptionButtonClicked = true;
    button.click();
  }
}

function youtubeShelfMonitorSubscriptionConfirmation() {
  const channelId = youtubeShelfSubscriptionConfirmationChannelId();
  if (!channelId || youtubeShelfSubscriptionResultSent) return;
  // An operation belongs to the explicitly registered channel page only.
  if (Date.now() - youtubeShelfSubscriptionStartedAt > 30000) {
    youtubeShelfReportSubscriptionResult("cancelled");
    return;
  }
  if (location.pathname !== `/channel/${channelId}`
    && document.querySelector('meta[itemprop="channelId"]')?.content !== channelId) return;
  if (youtubeShelfSubscriptionAction === "unsubscribe") {
    const renderer = document.querySelector("ytd-subscribe-button-renderer, yt-subscribe-button-view-model");
    const button = renderer?.querySelector("button, tp-yt-paper-button");
    if (button && youtubeShelfIsSubscribeAction(button)) {
      youtubeShelfReportSubscriptionResult("unsubscribed");
      return;
    }
    youtubeShelfClickUnsubscribe();
    return;
  }
  if (youtubeShelfSubscriptionIsConfirmed()) {
    youtubeShelfReportSubscriptionResult("subscribed");
    return;
  }
  youtubeShelfClickSubscriptionConfirmation();
}

liveListener(document, "click", (event) => {
  if (!youtubeShelfSubscriptionConfirmationChannelId() || youtubeShelfSubscriptionResultSent) return;
  const button = event.target.closest?.("button, tp-yt-paper-button");
  const dialog = button?.closest?.("tp-yt-paper-dialog, ytd-popup-container");
  if (!dialog || !/^(cancel|annuler)$/iu.test(button.textContent.trim())) return;
  youtubeShelfReportSubscriptionResult("cancelled");
}, true);

chrome.storage.local.get([COMMENTS_MODE_KEY, SUGGESTIONS_MODE_KEY, FOCUS_PLAYER_MODE_KEY, PANEL_OPEN_KEY, PANEL_HEARTBEAT_KEY], (result) => {
  commentsModeEnabled = Boolean(result[COMMENTS_MODE_KEY]);
  suggestionsModeEnabled = result[SUGGESTIONS_MODE_KEY] === undefined ? true : Boolean(result[SUGGESTIONS_MODE_KEY]);
  focusPlayerModeEnabled = Boolean(result[FOCUS_PLAYER_MODE_KEY]);
  panelOpen = Boolean(result[PANEL_OPEN_KEY]);
  panelHeartbeat = Number(result[PANEL_HEARTBEAT_KEY] || 0);
  applyDisplayOptions();
});

liveChromeListener(chrome.storage.onChanged, (changes, areaName) => {
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

liveChromeListener(chrome.runtime.onMessage, (message, _sender, sendResponse) => {
  if (message?.type === "YOUTUBE_SHELF_READ_SUBSCRIPTIONS_PAGE") {
    youtubeShelfReadSubscriptionsPage(message.requestId)
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, error: error.message || "Unable to read YouTube subscriptions" }));
    return true;
  }
  if (message?.type === "YOUTUBE_SHELF_PAUSE_VIDEO") {
    document.querySelector("video")?.pause();
    return;
  }
  if (message?.type === "YOUTUBE_SHELF_ENTER_FULLSCREEN") {
    focusFullscreenKeyboardTarget();
    Promise.resolve(document.documentElement.requestFullscreen())
      .then(() => {
        shelfFullscreenActive = true;
        chrome.storage.local.set({ [FOCUS_FULLSCREEN_EXITED_KEY]: false });
        focusFullscreenKeyboardTarget();
        requestAnimationFrame(focusFullscreenKeyboardTarget);
        liveTimeout(focusFullscreenKeyboardTarget, 100);
        liveTimeout(focusFullscreenKeyboardTarget, 300);
        scheduleFullscreenEscapeHint();
        sendResponse({ ok: true });
      })
      .catch((error) => sendResponse({ ok: false, error: error.message || "Full screen unavailable" }));
    return true;
  }
  if (message?.type !== "youtubeChannelShelfDisplayOptions") return;
  commentsModeEnabled = Boolean(message.hideComments);
  suggestionsModeEnabled = message.hideSuggestions === undefined ? true : Boolean(message.hideSuggestions);
  focusPlayerModeEnabled = Boolean(message.focusPlayer);
  applyDisplayOptions();
});

let restorePanelAfterFullscreen = false;
let restoringFullscreenPanel = false;
function restoreFullscreenPanel() {
  if (!restorePanelAfterFullscreen || restoringFullscreenPanel) return;
  restoringFullscreenPanel = true;
  Promise.resolve(chrome.runtime.sendMessage({ type: "YOUTUBE_SHELF_RESTORE_AFTER_FULLSCREEN" }))
    .then((result) => { if (result?.ok) restorePanelAfterFullscreen = false; })
    .catch(() => {})
    .finally(() => { restoringFullscreenPanel = false; });
}

liveListener(document, "fullscreenchange", () => {
  if (document.fullscreenElement) {
    // Both the YouTube player and Shelf's focus mode can own fullscreen.
    Promise.resolve(chrome.runtime.sendMessage({ type: "YOUTUBE_SHELF_NATIVE_FULLSCREEN" }))
      .then((result) => { restorePanelAfterFullscreen = Boolean(result?.restorePanel); })
      .catch(() => {});
    return;
  }
  hideFullscreenEscapeHint();
  restoreFullscreenPanel();
  if (!shelfFullscreenActive) return;
  shelfFullscreenActive = false;
  chrome.storage.local.set({ [FOCUS_FULLSCREEN_EXITED_KEY]: true });
  applyDisplayOptions();
});

liveListener(document, "keydown", (event) => {
  if (event.key !== "Escape" || !document.fullscreenElement) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  restoreFullscreenPanel();
  document.exitFullscreen().catch(() => {});
}, true);

liveListener(document, "pointerdown", (event) => {
  if (!document.fullscreenElement) {
    restoreFullscreenPanel();
    return;
  }
  if (event.target instanceof Element && event.target.closest(".ytp-fullscreen-button")) restoreFullscreenPanel();
  liveTimeout(hideFullscreenEscapeHint, 0);
}, true);

liveInterval(trackCurrentVideo, 1000);
liveInterval(youtubeShelfMonitorSubscriptionConfirmation, 400);

liveListener(document, "yt-navigate-start", () => saveTrackedVideoProgress(true));
liveListener(document, "yt-navigate-finish", trackCurrentVideo);
liveListener(document, "visibilitychange", () => {
  if (document.visibilityState === "hidden") saveTrackedVideoProgress(true);
});
liveListener(window, "pagehide", () => saveTrackedVideoProgress(true));

trackCurrentVideo();
})();
