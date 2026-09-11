(() => {
  const MAX_ENTRIES = 1000;
  const MIN_SESSION_SECONDS = 15;

  function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function mergeRanges(ranges = []) {
    const sorted = ranges
      .map((range) => [Math.max(0, finiteNumber(range?.[0])), Math.max(0, finiteNumber(range?.[1]))])
      .filter(([start, end]) => end > start && end - start <= 120)
      .sort((left, right) => left[0] - right[0]);
    const merged = [];
    for (const range of sorted) {
      const previous = merged.at(-1);
      if (!previous || range[0] > previous[1] + 1) merged.push([...range]);
      else previous[1] = Math.max(previous[1], range[1]);
    }
    return merged.slice(-200).map(([start, end]) => [Math.round(start * 10) / 10, Math.round(end * 10) / 10]);
  }

  function coveredSeconds(ranges = []) {
    return mergeRanges(ranges).reduce((total, [start, end]) => total + end - start, 0);
  }

  function safeIso(value, fallback = Date.now()) {
    const timestamp = typeof value === "number" ? value : Date.parse(value || "");
    return new Date(Number.isFinite(timestamp) ? timestamp : fallback).toISOString();
  }

  function normalizeEntry(entry = {}) {
    const duration = Math.max(0, finiteNumber(entry.duration));
    const ranges = mergeRanges(entry.ranges);
    const coverage = coveredSeconds(ranges);
    return {
      id: String(entry.id || entry.sessionId || "").slice(0, 120),
      videoId: String(entry.videoId || "").slice(0, 32),
      startedAt: safeIso(entry.startedAt),
      updatedAt: safeIso(entry.updatedAt || entry.startedAt),
      title: String(entry.title || "").slice(0, 300),
      channel: String(entry.channel || "").slice(0, 200),
      channelId: String(entry.channelId || "").slice(0, 80),
      thumbnail: String(entry.thumbnail || "").slice(0, 1000),
      duration: Math.max(0, Math.round(duration)),
      lastPosition: Math.max(0, Math.round(finiteNumber(entry.lastPosition))),
      playedSeconds: Math.max(0, Math.round(finiteNumber(entry.playedSeconds))),
      ranges,
      completed: duration > 0 && coverage / duration >= 0.95
    };
  }

  function updateHistory(history, payload = {}) {
    const videoId = String(payload.videoId || "");
    const sessionId = String(payload.sessionId || "");
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId) || !sessionId || finiteNumber(payload.playedSeconds) < MIN_SESSION_SECONDS) {
      return Array.isArray(history) ? history : [];
    }
    const source = Array.isArray(history) ? history : [];
    const existing = source.find((entry) => entry?.id === sessionId);
    const next = normalizeEntry({
      ...existing,
      ...payload,
      id: sessionId,
      videoId,
      startedAt: existing?.startedAt || payload.startedAt,
      ranges: [...(existing?.ranges || []), ...(payload.ranges || [])]
    });
    return [next, ...source.filter((entry) => entry?.id !== sessionId)]
      .sort((left, right) => String(right.startedAt || "").localeCompare(String(left.startedAt || "")))
      .slice(0, MAX_ENTRIES);
  }

  globalThis.YouTubeShelfWatchHistory = {
    MAX_ENTRIES,
    MIN_SESSION_SECONDS,
    mergeRanges,
    coveredSeconds,
    normalizeEntry,
    updateHistory
  };
})();
