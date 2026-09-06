const host = globalThis.YouTubeShelfHosts.createHost();
const APP_HEADER_ID = "yt-minimal-header";
const APP_SIDEBAR_ID = "yt-minimal-sidebar";
const STORAGE_KEY = "youtubeChannelShelfConfig";
const CONFIG_PATHS = ["data/config.json", "data/config.default.json"];

if (!window.__ytMinimalOverlayInjected) {
  window.__ytMinimalOverlayInjected = true;

  function appUrl(hash = "") {
    return host.runtime.getURL(`public/index.html${hash}`);
  }

  function currentVideoTitle() {
    const metadataTitle = document.querySelector("ytd-watch-metadata h1 yt-formatted-string");
    const legacyTitle = document.querySelector("h1.title yt-formatted-string");
    return (metadataTitle?.textContent || legacyTitle?.textContent || document.title || "Youtube")
      .replace(/\s+-\s+YouTube$/, "")
      .trim();
  }

  function storedConfig() {
    return new Promise((resolve) => {
      host.storage.local.get(STORAGE_KEY, (result) => resolve(result[STORAGE_KEY] || null));
    });
  }

  async function loadConfig() {
    const stored = await storedConfig();
    if (stored) return stored;

    let lastError = null;
    for (const path of CONFIG_PATHS) {
      try {
        const response = await fetch(host.runtime.getURL(path));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("No configuration file available");
  }

  function ensureHeader() {
    let header = document.getElementById(APP_HEADER_ID);
    if (!header) {
      header = document.createElement("div");
      header.id = APP_HEADER_ID;

      const back = document.createElement("button");
      back.type = "button";
      back.className = "yt-minimal-back";
      back.textContent = "<";
      back.title = "Back to app";
      back.addEventListener("click", () => {
        window.location.href = appUrl();
      });

      const title = document.createElement("div");
      title.className = "yt-minimal-title";

      header.append(back, title);
      document.documentElement.append(header);
    }

    header.querySelector(".yt-minimal-title").textContent = currentVideoTitle();
  }

  async function ensureSidebar() {
    let sidebar = document.getElementById(APP_SIDEBAR_ID);
    if (!sidebar) {
      sidebar = document.createElement("aside");
      sidebar.id = APP_SIDEBAR_ID;
      sidebar.innerHTML = `<div class="yt-minimal-sidebar-title">Subscriptions</div><div class="yt-minimal-channel-list">Loading...</div>`;
      document.documentElement.append(sidebar);
    }

    const list = sidebar.querySelector(".yt-minimal-channel-list");
    if (list.dataset.loaded === "true") return;

    try {
      const config = await loadConfig();
      const channels = (config.channels || []).slice().sort((a, b) => a.title.localeCompare(b.title, "fr"));
      list.replaceChildren(
        ...channels.map((channel) => {
          const item = document.createElement("button");
          item.type = "button";
          item.className = "yt-minimal-channel";
          item.title = channel.title;
          item.addEventListener("click", () => {
            window.location.href = appUrl(`#channel=${encodeURIComponent(channel.id)}`);
          });

          const icon = channel.thumbnail ? document.createElement("img") : document.createElement("span");
          if (channel.thumbnail) {
            icon.alt = "";
            icon.src = channel.thumbnail;
          } else {
            icon.textContent = channel.title.slice(0, 1).toUpperCase();
          }

          const name = document.createElement("span");
          name.textContent = channel.title;
          item.append(icon, name);
          return item;
        })
      );
      list.dataset.loaded = "true";
    } catch {
      list.textContent = "Channels unavailable";
    }
  }

  function applyPageClass() {
    document.documentElement.classList.add("yt-minimal-page");
    document.body?.classList.add("yt-minimal-page");
  }

  function refreshOverlay() {
    applyPageClass();
    ensureHeader();
    ensureSidebar();
  }

  refreshOverlay();
  window.setInterval(refreshOverlay, 1500);
}
