const SHELF_BUTTON_ID = "youtube-channel-shelf-pwa-button";
const SHELF_STYLE_ID = "youtube-channel-shelf-pwa-style";

if (!window.__youtubeChannelShelfPwaButtonInjected) {
  window.__youtubeChannelShelfPwaButtonInjected = true;

  function isStandaloneAppWindow() {
    return window.matchMedia?.("(display-mode: standalone)")?.matches
      || window.matchMedia?.("(display-mode: window-controls-overlay)")?.matches
      || window.navigator.standalone === true;
  }

  function ensureShelfButtonStyle() {
    if (document.getElementById(SHELF_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = SHELF_STYLE_ID;
    style.textContent = `
      #${SHELF_BUTTON_ID} {
        align-items: center;
        background: #181818;
        border: 1px solid #3f3f3f;
        border-radius: 999px;
        bottom: 18px;
        box-shadow: 0 8px 26px rgba(0, 0, 0, 0.38);
        color: #f1f1f1;
        cursor: pointer;
        display: inline-flex;
        font: 600 13px/1.2 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        gap: 7px;
        min-height: 34px;
        padding: 0 12px;
        position: fixed;
        right: 18px;
        z-index: 2147483647;
      }

      #${SHELF_BUTTON_ID}:hover {
        border-color: #ef4f45;
      }

      #${SHELF_BUTTON_ID}[data-state="opening"] {
        cursor: wait;
        opacity: 0.72;
      }

      #${SHELF_BUTTON_ID}::before {
        background: #ef4f45;
        border-radius: 50%;
        content: "";
        height: 8px;
        width: 8px;
      }
    `;
    document.documentElement.append(style);
  }

  function ensureShelfButton() {
    if (!isStandaloneAppWindow()) {
      document.getElementById(SHELF_BUTTON_ID)?.remove();
      return;
    }
    ensureShelfButtonStyle();
    let button = document.getElementById(SHELF_BUTTON_ID);
    if (button) return;
    button = document.createElement("button");
    button.id = SHELF_BUTTON_ID;
    button.type = "button";
    button.textContent = "Shelf";
    button.title = "Open YouTube Channel Shelf";
    button.addEventListener("click", () => {
      if (button.dataset.state === "opening") return;
      button.dataset.state = "opening";
      chrome.runtime.sendMessage({ type: "youtubeChannelShelfOpenShelf" }, (response) => {
        button.dataset.state = "";
        if (chrome.runtime.lastError || response?.ok === false) {
          button.title = chrome.runtime.lastError?.message || response?.error || "Could not open YouTube Channel Shelf";
          return;
        }
        button.title = response?.mode === "popup" ? "Opened YouTube Channel Shelf popup" : "Opened YouTube Channel Shelf";
      });
    });
    document.documentElement.append(button);
  }

  ensureShelfButton();
  window.setInterval(ensureShelfButton, 1500);
}
