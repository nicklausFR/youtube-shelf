const STORAGE_KEY = "youtubeChannelShelfConfig";
const command = new URLSearchParams(location.search).get("command") || "";
const titleEl = document.querySelector("#title");
const descriptionEl = document.querySelector("#description");
const actionsEl = document.querySelector("#actions");
const statusEl = document.querySelector("#status");

function setStatus(text) {
  statusEl.textContent = text || "";
}

function emptyConfig() {
  return {
    version: 1,
    categories: [],
    channels: [],
    seenVideos: {},
    watchLater: {},
    updatedAt: new Date().toISOString()
  };
}

function readConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => resolve(result[STORAGE_KEY] || emptyConfig()));
  });
}

function writeConfig(config) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: config }, () => {
      const error = chrome.runtime?.lastError;
      if (error) reject(new Error(error.message));
      else resolve();
    });
  });
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

function csvValue(value) {
  return `"${String(value || "").replace(/"/g, '""')}"`;
}

function channelIdFromAny(value = "") {
  const match = String(value).match(/UC[-_a-zA-Z0-9]{10,}/);
  return match ? match[0] : "";
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const character = text[i];
    if (quoted) {
      if (character === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
      continue;
    }

    if (character === '"') quoted = true;
    else if (character === "," || character === ";" || character === "\t") {
      row.push(cell.trim());
      cell = "";
    } else if (character === "\n") {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
    } else if (character !== "\r") {
      cell += character;
    }
  }

  if (cell || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }

  return rows.filter((candidate) => candidate.some(Boolean));
}

function normalizeImportedChannel(entry) {
  if (!entry) return null;
  const snippet = entry.snippet || {};
  const thumbnails = snippet.thumbnails || entry.thumbnails || {};
  const id =
    entry.channelId ||
    entry.channel_id ||
    entry.channelID ||
    entry.authorId ||
    entry.authorID ||
    entry.ucid ||
    snippet.resourceId?.channelId ||
    snippet.channelId ||
    channelIdFromAny(entry.id || entry.url || entry.channelUrl || entry.channel_url || entry.link || entry.htmlUrl || entry.authorUrl || entry.channel_url || "");

  if (!id) return null;

  return {
    id,
    title: entry.title || entry.name || entry.channelName || entry.channel_name || entry.author || snippet.title || id,
    thumbnail:
      entry.thumbnail ||
      entry.thumbnailUrl ||
      entry.channelThumbnail ||
      entry.authorThumbnail ||
      thumbnails.medium?.url ||
      thumbnails.default?.url ||
      thumbnails.high?.url ||
      "",
    categories: Array.isArray(entry.categories) ? entry.categories : []
  };
}

function collectChannelLikeObjects(value, output = [], depth = 0) {
  if (!value || depth > 8) return output;

  if (Array.isArray(value)) {
    for (const item of value) collectChannelLikeObjects(item, output, depth + 1);
    return output;
  }

  if (typeof value !== "object") return output;
  const normalized = normalizeImportedChannel(value);
  if (normalized) output.push(normalized);

  for (const key of ["channels", "items", "subscriptions", "profiles", "playlists", "data"]) {
    if (value[key]) collectChannelLikeObjects(value[key], output, depth + 1);
  }

  return output;
}

function extractChannelsFromJson(value) {
  const channels = collectChannelLikeObjects(value);
  const byId = new Map();
  for (const channel of channels) {
    if (!byId.has(channel.id)) byId.set(channel.id, channel);
  }
  return [...byId.values()];
}

function extractChannelsFromCsv(text) {
  const rows = parseCsv(text);
  if (!rows.length) return [];

  const header = rows[0].map((value) => value.toLowerCase());
  const hasHeader = header.some((value) => value.includes("channel") || value.includes("title") || value.includes("name"));
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const idIndex = Math.max(header.findIndex((value) => value.includes("channel id")), header.findIndex((value) => value === "id"));
  const titleIndex = Math.max(header.findIndex((value) => value.includes("title")), header.findIndex((value) => value.includes("name")));
  const urlIndex = header.findIndex((value) => value.includes("url"));

  return dataRows
    .map((row) => {
      const id = channelIdFromAny(row[idIndex] || row[urlIndex] || row.join(" "));
      return id ? { id, title: row[titleIndex] || id, thumbnail: "", categories: [] } : null;
    })
    .filter(Boolean);
}

function mergeChannels(config, imported) {
  const existing = new Map((config.channels || []).map((channel) => [channel.id, channel]));

  for (const channel of imported) {
    const current = existing.get(channel.id);
    existing.set(channel.id, {
      id: channel.id,
      title: channel.title || current?.title || channel.id,
      thumbnail: channel.thumbnail || current?.thumbnail || "",
      categories: [...new Set([...(current?.categories || []), ...(channel.categories || [])])]
    });
  }

  config.channels = [...existing.values()].sort((a, b) => (a.title || a.id).localeCompare(b.title || b.id, "fr"));
  config.updatedAt = new Date().toISOString();
  return config;
}

async function exportNative() {
  const config = await readConfig();
  downloadText(`youtube-channel-shelf-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(config, null, 2));
  setStatus("Export complete.");
}

async function exportYoutube() {
  const config = await readConfig();
  const rows = [
    ["Channel Id", "Channel Url", "Channel Title"],
    ...(config.channels || []).map((channel) => [channel.id, `https://www.youtube.com/channel/${channel.id}`, channel.title || channel.id])
  ];
  downloadText(`youtube-subscriptions-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((row) => row.map(csvValue).join(",")).join("\n"), "text/csv");
  setStatus("Export complete.");
}

async function importFile(kind, file) {
  const text = await file.text();

  if (kind === "native") {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed.channels)) throw new Error("Invalid YouTube Channel Shelf file");
    const nextConfig = { ...emptyConfig(), ...parsed, updatedAt: new Date().toISOString() };
    await writeConfig(nextConfig);
    return nextConfig.channels.length;
  }

  let imported = [];
  try {
    imported = extractChannelsFromJson(JSON.parse(text));
  } catch {
    imported = extractChannelsFromCsv(text);
  }

  if (!imported.length) throw new Error("No channel recognized");
  const config = await readConfig();
  await writeConfig(mergeChannels(config, imported));
  return imported.length;
}

function showImported(count) {
  const message = `${count} Subscriptions imported`;
  setStatus(message);
  window.setTimeout(() => window.close(), 1200);
}

function addButton(label, action, extraClass = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = extraClass;
  button.textContent = label;
  button.addEventListener("click", () => action().catch((error) => setStatus(error.message)));
  actionsEl.append(button);
  return button;
}

function addImportButton(kind, label, autoOpen = false) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,.csv,.txt,application/json,text/csv,text/plain";
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      setStatus("Importing...");
      const count = await importFile(kind, file);
      showImported(count);
    } catch (error) {
      setStatus(error.message);
    } finally {
      input.value = "";
    }
  });

  const button = document.createElement("button");
  button.type = "button";
  button.className = "primary";
  button.textContent = label;
  button.addEventListener("click", () => input.click());
  actionsEl.append(button, input);

  if (autoOpen) {
    setStatus("Opening file picker...");
    window.setTimeout(() => input.click(), 120);
  }
}

function render() {
  const labels = {
    exportNative: "Export YouTube Channel Shelf",
    importNative: "Import YouTube Channel Shelf",
    importFreetube: "Import FreeTube",
    cleanSlate: "Clean Slate"
  };

  titleEl.textContent = labels[command] || "Import / Export";

  if (command === "exportNative") addButton("Export", exportNative, "primary");
  else if (command === "importNative") {
    descriptionEl.textContent = "Select the YouTube Channel Shelf export.";
    addImportButton("native", "Choose a file", true);
  }
  else if (command === "importFreetube") {
    descriptionEl.textContent = "Select the FreeTube export.";
    addImportButton("freetube", "Choose a file", true);
  }
  else if (command === "cleanSlate") {
    descriptionEl.textContent = "Delete all subscriptions and local data?";
    addButton("Clean Slate", async () => {
      await writeConfig(emptyConfig());
      setStatus("Clean Slate complete.");
      window.setTimeout(() => window.close(), 1200);
    }, "primary danger");
  } else {
    addButton("Export YouTube Channel Shelf", exportNative);
    addImportButton("native", "Import YouTube Channel Shelf");
    addImportButton("freetube", "Import FreeTube");
  }
}

render();











