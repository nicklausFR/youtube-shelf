import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.YOUTUBE_SHELF_SNAPSHOT_PORT) || 4173;
const now = Date.now();
const isoDaysAgo = (days) => new Date(now - days * 86400000).toISOString();
const neutralThumbnail = (from, to) => `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 480 270">
    <defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
    <rect width="480" height="270" fill="url(#g)"/>
    <rect x="55" y="78" width="310" height="25" rx="12" fill="white" opacity=".14"/>
    <rect x="55" y="121" width="220" height="17" rx="8" fill="white" opacity=".09"/>
  </svg>
`)}`;

const snapshotConfig = {
  version: 1,
  categories: [
    { id: "tech", name: "Technology" },
    { id: "culture", name: "Culture" },
    { id: "science", name: "Science" },
    { id: "physics", name: "Physics", parentId: "science" },
    { id: "space", name: "Space", parentId: "science" },
    { id: "automotive", name: "Automotive" },
    { id: "engineering", name: "Engineering" },
    { id: "education", name: "Tutorials and education" },
    { id: "metalworking", name: "Metalworking" },
    { id: "politics", name: "Politics and analysis" },
    { id: "travel", name: "Travel" },
    { id: "woodworking", name: "Woodworking" }
  ],
  favoriteCategories: [
    { id: "learning", name: "Learning" },
    { id: "design", name: "Design", parentId: "learning" },
    { id: "editing", name: "Video editing", parentId: "learning" },
    { id: "productivity", name: "Productivity", parentId: "learning" },
    { id: "culture-favorites", name: "Culture" },
    { id: "documentaries", name: "Documentaries", parentId: "culture-favorites" },
    { id: "history", name: "History", parentId: "culture-favorites" },
    { id: "technology-favorites", name: "Technology" },
    { id: "hardware", name: "Hardware", parentId: "technology-favorites" },
    { id: "software", name: "Software", parentId: "technology-favorites" },
    { id: "ai", name: "Artificial intelligence", parentId: "technology-favorites" },
    { id: "inspiration", name: "Inspiration" },
    { id: "music", name: "Music" },
    { id: "live-sessions", name: "Live sessions", parentId: "music" },
    { id: "albums", name: "Albums", parentId: "music" },
    { id: "production", name: "Production", parentId: "music" },
    { id: "theory", name: "Music theory", parentId: "music" },
    { id: "later", name: "Review later" }
  ],
  channels: [
    {
      id: "UC_SNAPSHOT_ALPHA",
      title: "Creative Workshop",
      thumbnail: neutralThumbnail("#39475c", "#171d28"),
      categories: ["tech"],
      feedLatestPublished: isoDaysAgo(0.4),
      feedCheckedAt: isoDaysAgo(0.05),
      metadataCheckedAt: isoDaysAgo(0.05),
      newVideosSeenAt: isoDaysAgo(8),
      feedVideos: [
        { id: "snapdemo001", isShort: true, title: "Discover a Better Creative Workflow", published: isoDaysAgo(0.4), thumbnail: neutralThumbnail("#563a52", "#20283a") },
        { id: "snapdemo002", title: "A Practical Guide in Ten Minutes", published: isoDaysAgo(2), thumbnail: neutralThumbnail("#36576a", "#222b3c") }
      ]
    },
    {
      id: "UC_SNAPSHOT_BETA",
      title: "Independent Stories",
      thumbnail: neutralThumbnail("#584936", "#211d1a"),
      categories: ["culture"],
      feedLatestPublished: isoDaysAgo(1),
      feedCheckedAt: isoDaysAgo(0.05),
      metadataCheckedAt: isoDaysAgo(0.05),
      newVideosSeenAt: isoDaysAgo(8),
      feedVideos: [
        { id: "snapdemo003", title: "A Story Worth Sharing", published: isoDaysAgo(1), thumbnail: neutralThumbnail("#625137", "#27333b") },
        { id: "snapdemo004", title: "Behind the Scenes of the Next Project", published: isoDaysAgo(4), thumbnail: neutralThumbnail("#465747", "#2f2838") }
      ]
    },
    {
      id: "UC_SNAPSHOT_GAMMA",
      title: "Everyday Science Lab",
      thumbnail: neutralThumbnail("#374d58", "#1c232a"),
      categories: ["science"],
      feedLatestPublished: isoDaysAgo(3),
      feedCheckedAt: isoDaysAgo(0.05),
      metadataCheckedAt: isoDaysAgo(0.05),
      newVideosSeenAt: isoDaysAgo(8),
      feedVideos: [
        { id: "snapdemo005", title: "Understanding an Everyday Phenomenon", published: isoDaysAgo(3), thumbnail: neutralThumbnail("#3e5268", "#28233a") }
      ]
    }
  ],
  favorites: {
    snapfav0001: { title: "Midnight Studio — Live Session", savedAt: isoDaysAgo(1), channelId: "UC_SNAPSHOT_ALPHA", channel: "Creative Workshop", categories: ["music", "live-sessions"], note: "Beautiful live arrangement." },
    snapfav0002: { title: "How a Great Album Tells a Story", savedAt: isoDaysAgo(2), channelId: "UC_SNAPSHOT_BETA", channel: "Independent Stories", categories: ["music", "albums"] },
    snapfav0003: { title: "Building a Beat From Field Recordings", savedAt: isoDaysAgo(3), channelId: "UC_SNAPSHOT_GAMMA", channel: "Everyday Science Lab", categories: ["music", "production"] },
    snapfav0004: { title: "Harmony Explained With Four Chords", savedAt: isoDaysAgo(4), channelId: "UC_SNAPSHOT_ALPHA", channel: "Creative Workshop", categories: ["music", "theory"] },
    snapfav0005: { title: "Acoustic Set in a Small Theatre", savedAt: isoDaysAgo(5), channelId: "UC_SNAPSHOT_BETA", channel: "Independent Stories", categories: ["music", "live-sessions"] },
    snapfav0006: { title: "Inside an Independent Record", savedAt: isoDaysAgo(6), channelId: "UC_SNAPSHOT_BETA", channel: "Independent Stories", categories: ["music", "albums"] },
    snapfav0007: { title: "Recording Warm Vocals at Home", savedAt: isoDaysAgo(7), channelId: "UC_SNAPSHOT_ALPHA", channel: "Creative Workshop", categories: ["music", "production"] },
    snapfav0008: { title: "Rhythm, Pulse and Polyrhythm", savedAt: isoDaysAgo(8), channelId: "UC_SNAPSHOT_ALPHA", channel: "Creative Workshop", categories: ["music", "theory"] },
    snapfav0009: { title: "Electronic Improvisation — Live", savedAt: isoDaysAgo(9), channelId: "UC_SNAPSHOT_GAMMA", channel: "Everyday Science Lab", categories: ["music", "live-sessions"] },
    snapfav0010: { title: "Ten Albums for Focused Work", savedAt: isoDaysAgo(10), channelId: "UC_SNAPSHOT_BETA", channel: "Independent Stories", categories: ["music", "albums"] },
    snapfav0011: { title: "Mixing With Space and Silence", savedAt: isoDaysAgo(11), channelId: "UC_SNAPSHOT_ALPHA", channel: "Creative Workshop", categories: ["music", "production"] },
    snapfav0012: { title: "A Simple Guide to Musical Modes", savedAt: isoDaysAgo(12), channelId: "UC_SNAPSHOT_GAMMA", channel: "Everyday Science Lab", categories: ["music", "theory"] }
  },
  seenVideos: { snapdemo002: { seenAt: isoDaysAgo(1.8) } },
  watchLater: {
    snapwatch01: { title: "Building Better Habits With Simple Systems", savedAt: isoDaysAgo(0.6), channelId: "UC_SNAPSHOT_ALPHA", channel: "Creative Workshop" },
    snapwatch02: { title: "A Thoughtful Tour of Modern Craft", savedAt: isoDaysAgo(2.5), channelId: "UC_SNAPSHOT_BETA", channel: "Independent Stories", note: "Watch this weekend." },
    snapwatch03: { title: "Why Patterns Appear Everywhere", savedAt: isoDaysAgo(4.5), channelId: "UC_SNAPSHOT_GAMMA", channel: "Everyday Science Lab" }
  },
  updatedAt: new Date(now).toISOString()
};

// Enough fictional uploads to demonstrate dense and multi-column layouts.
const extraTitles = [
  "Choosing the Right Tools for a Small Workshop", "Light and Color in Everyday Photography",
  "From Sketch to Finished Object", "The Science Behind a Simple Pendulum",
  "Making Space for Creative Work", "Recording Clear Sound at Home",
  "A Closer Look at Natural Patterns", "Repairing Instead of Replacing",
  "Designing a Useful Everyday Object", "What Makes a Good Documentary?",
  "Small Experiments, Surprising Results"
];
extraTitles.forEach((title, index) => {
  const channel = snapshotConfig.channels[index % snapshotConfig.channels.length];
  channel.feedVideos.push({ id: `extra${String(index).padStart(6, "0")}`, title,
    published: isoDaysAgo(1 + index / 2), thumbnail: channel.thumbnail,
    duration: "12:34", views: "24k views" });
});
snapshotConfig.channels.forEach((channel, index) => {
  channel.subscriberCountText = ["128k subscribers", "84k subscribers", "256k subscribers"][index];
});

const bootstrap = `
<script>
(() => {
  const data = { youtubeChannelShelfConfig: ${JSON.stringify(snapshotConfig)} };
  const listeners = new Set();
  const storageArea = {
    get(keys, callback) {
      const names = Array.isArray(keys) ? keys : typeof keys === 'string' ? [keys] : Object.keys(keys || data);
      const result = Object.fromEntries(names.filter((key) => key in data).map((key) => [key, data[key]]));
      if (callback) { callback(result); return; }
      return Promise.resolve(result);
    },
    set(values, callback) { Object.assign(data, values || {}); callback?.(); return Promise.resolve(); },
    remove(keys, callback) { for (const key of Array.isArray(keys) ? keys : [keys]) delete data[key]; callback?.(); return Promise.resolve(); }
  };
  globalThis.chrome = {
    runtime: {
      getURL: (path = '') => new URL('/' + String(path).replace(/^\\/+/, ''), location.origin).href,
      getManifest: () => ({ version: 'snapshot' }),
      onMessage: { addListener() {} },
      sendMessage: async () => null
    },
    i18n: { getUILanguage: () => 'en', detectLanguage: (_text, callback) => callback?.({ languages: [{ language: 'en', percentage: 100 }] }) },
    storage: {
      local: storageArea,
      session: storageArea,
      onChanged: { addListener(listener) { listeners.add(listener); } }
    },
    tabs: {
      getCurrent: async () => null,
      get: async () => null,
      query: async () => [],
      sendMessage: async () => null,
      create: async () => null,
      update: async () => null,
      remove: async () => null
    },
    scripting: { insertCSS: async () => null, executeScript: async () => [] },
    sidePanel: { open: async () => null, close: async () => null },
    permissions: { contains: async () => false, request: async () => false, remove: async () => false }
  };
  const snapshotParams = new URLSearchParams(location.search);
  const snapshotLayout = snapshotParams.get('layout');
  if (['icons', 'columns', 'single', 'titles', 'compactTitles'].includes(snapshotLayout)) {
    localStorage.setItem('channelListMode:newVideos', snapshotLayout);
    localStorage.setItem('channelListMode:watchLater', snapshotLayout);
    localStorage.setItem('channelListMode:channelVideos', snapshotLayout);
  }
  localStorage.setItem('youtubeChannelShelfInterfaceLanguage', 'en');
  localStorage.setItem('youtubeChannelShelfTheme', 'dark');
  localStorage.setItem('youtubeChannelShelfYoutubeTabHome', 'this-week');
  localStorage.setItem('youtubeChannelShelfWeeklyGroupByChannel', 'false');
  document.documentElement.dataset.snapshot = 'true';
})();
</script>
<style>
  html[data-snapshot="true"] .thumbFrame { background: linear-gradient(135deg, #39475c, #171d28); }
  html[data-snapshot="true"] img.thumb[src^="https://i.ytimg.com/"] { opacity: 0; }
</style>`;

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"], [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"],
  [".png", "image/png"], [".svg", "image/svg+xml"]
]);
const contextualPanelCaptures = new Set([
  "youtube-shelf-panel-columns.png",
  "youtube-shelf-panel-icons.png",
  "youtube-shelf-panel-single.png",
  "youtube-shelf-panel-titles.png",
  "youtube-shelf-panel-compact-titles.png",
  "youtube-shelf-panel-channels.png",
  "youtube-shelf-panel-favorites.png",
  "youtube-shelf-panel-watch-later.png"
]);

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const candidate = resolve(projectRoot, `.${decoded === "/" ? "/public/index.html" : decoded}`);
  if (candidate !== projectRoot && !candidate.startsWith(projectRoot + sep)) return null;
  return candidate;
}

const server = http.createServer(async (request, response) => {
  try {
    if ((request.url || "").split("?")[0] === "/__panel-capture") {
      const captureUrl = new URL(request.url || "/", "http://127.0.0.1");
      const layout = captureUrl.searchParams.get("layout") || "compactTitles";
      if (!["icons", "columns", "single", "titles", "compactTitles"].includes(layout)) throw new Error("Invalid layout");
      const capture = `<!doctype html>
        <html><head><meta charset="utf-8"><style>
          * { box-sizing: border-box; }
          html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #0f0f0f; }
          iframe { display: block; width: 420px; height: 900px; border: 0; }
        </style></head><body>
          <iframe src="/public/index.html?layout=${layout}" title="YouTube Shelf"></iframe>
        </body></html>`;
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      response.end(capture);
      return;
    }
    if ((request.url || "").split("?")[0] === "/__landscape-capture") {
      const captureUrl = new URL(request.url || "/", "http://127.0.0.1");
      const requestedWidth = Number.parseInt(captureUrl.searchParams.get("width") || "800", 10);
      const requestedHeight = Number.parseInt(captureUrl.searchParams.get("height") || "360", 10);
      const width = Math.min(1920, Math.max(700, requestedWidth || 800));
      const height = Math.min(520, Math.max(240, requestedHeight || 360));
      const capture = `<!doctype html>
        <html><head><meta charset="utf-8"><style>
          * { box-sizing: border-box; }
          html, body { width: 100%; height: 100%; margin: 0; overflow: auto; background: #090a0d; }
          body { display: grid; min-height: 100%; place-items: start center; padding: 12px; }
          iframe { display: block; width: ${width}px; height: ${height}px; border: 1px solid #444; }
        </style></head><body>
          <iframe src="/public/index.html?layout=columns&amp;mode=page" title="YouTube Shelf landscape"></iframe>
        </body></html>`;
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      response.end(capture);
      return;
    }
    if ((request.url || "").split("?")[0] === "/__side-panel-context") {
      const contextUrl = new URL(request.url || "/", "http://127.0.0.1");
      const requestedPanel = contextUrl.searchParams.get("panel") || "youtube-shelf-panel-columns.png";
      if (!contextualPanelCaptures.has(requestedPanel)) throw new Error("Invalid panel capture");
      const composite = `<!doctype html>
        <html><head><meta charset="utf-8"><style>
          * { box-sizing: border-box; }
          html, body { width: 1920px; height: 900px; margin: 0; overflow: hidden; background: #090a0d; }
          body { display: grid; grid-template-columns: minmax(0, 1fr) 420px; }
          .youtube { position: relative; overflow: hidden; background: #08090b; }
          .youtube img { width: 100%; height: 100%; object-fit: cover; }
          .panel { position: relative; z-index: 1; width: 420px; height: 900px; box-shadow: -18px 0 42px #000b; }
          .panel img { display: block; width: 420px; height: 900px; object-fit: cover; }
        </style></head><body>
          <div class="youtube"><img src="/docs/screenshots/youtube-context-blurred.png" alt=""></div>
          <aside class="panel"><img src="/docs/screenshots/${requestedPanel}" alt="YouTube Shelf side panel"></aside>
        </body></html>`;
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      response.end(composite);
      return;
    }
    const path = safePath(request.url || "/");
    if (!path) throw new Error("Invalid path");
    let body = await readFile(path);
    if (path.endsWith(`${sep}public${sep}index.html`)) {
      body = Buffer.from(body.toString("utf8").replace("<script src=\"theme.js\"></script>", `${bootstrap}\n    <script src=\"theme.js\"></script>`));
    }
    response.writeHead(200, { "Content-Type": mimeTypes.get(extname(path)) || "application/octet-stream", "Cache-Control": "no-store" });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`YouTube Shelf snapshot server: http://127.0.0.1:${port}/public/index.html`);
});
