const PART_PATTERN = /\b(?:part(?:ie)?|pt|episode|ep|épisode|episodio|parte|teil)\.?\s*(?:n(?:o|°)?\.?\s*)?#?\s*(\d{1,3})\b/iu;
const STOP_WORDS = new Set([
  "a", "an", "and", "at", "de", "des", "du", "en", "et", "for", "from", "in", "la", "le", "les",
  "my", "of", "on", "the", "this", "to", "un", "une", "was", "with"
]);
const COMPLETION_SUFFIXES = new Set(["completed", "finished", "termine", "terminee"]);
const PROCESS_WORDS = new Set([
  "building", "build", "rebuilding", "rebuild", "making", "progress", "finishing", "fabrication",
  "completing", "complete", "completed", "testing", "test", "repair", "restoration", "restoring",
  "broken", "massive", "heavy", "duty", "workshop", "vintage", "upgrades", "re", "finished"
]);

function sameSeriesSubject(left, right) {
  if (left.season || right.season) return left.key === right.key;
  if (left.key === right.key) return true;
  const a = left.words.filter((word) => !PROCESS_WORDS.has(word));
  const b = right.words.filter((word) => !PROCESS_WORDS.has(word));
  const shared = new Set(a.filter((word) => b.includes(word))).size;
  // Require a common subject phrase, not just common repair/build vocabulary.
  const phrase = a.some((word, index) => index + 1 < a.length
    && b.some((other, j) => other === word && b[j + 1] === a[index + 1]));
  return phrase && shared >= 2 && shared / Math.min(a.length, b.length) >= 0.6
    && shared / Math.max(a.length, b.length) >= 0.3;
}

function normalizedWords(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\bdream(?:ed|t|ing)?\b/g, "dream")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

function numberedSeriesPart(title) {
  const text = String(title || "");
  const seasonEpisode = /\b(?:s|season\s*|saison\s*)(\d{1,3})\s*[,|:._–—-]?\s*(?:ep(?:isode)?|épisode)\.?\s*#?\s*(\d{1,3})\b/iu.exec(text);
  if (seasonEpisode) {
    const season = Number(seasonEpisode[1]);
    return { position: Number(seasonEpisode[2]), season, words: [], key: `season ${season}` };
  }
  const match = PART_PATTERN.exec(text);
  if (!match) return null;
  const prefix = text.slice(0, match.index);
  // Prefer an explicitly named project/series over its changing episode subject.
  // Other suffixes (e.g. "Zayer Upgrades") may instead describe a wider topic.
  const segments = prefix.split("|").map((segment) => normalizedWords(segment)).filter((words) => words.length);
  const before = segments.length > 1 && segments.at(-1).length >= 3
    && segments.at(-1).some((word) => ["project", "projet", "series", "serie"].includes(word))
    ? segments.at(-1) : normalizedWords(prefix);
  const after = normalizedWords(text.slice(match.index + match[0].length));
  const baseWords = before.length >= 2 ? before : after;
  // Creators may append a completion label to the subject of the last part.
  // Only remove trailing labels, preserving the actual subject of the series.
  while (baseWords.length > 2 && COMPLETION_SUFFIXES.has(baseWords.at(-1))) baseWords.pop();
  if (!baseWords.length) return null;
  return { position: Number(match[1]), words: baseWords, key: baseWords.join(" ") };
}

function channelKey(video) {
  return String(video.channelId || video.channel || "").trim().toLowerCase();
}

function playlistAnnotations(videos) {
  const groups = new Map();
  videos.forEach((video, index) => {
    if (!video.playlistId) return;
    if (!groups.has(video.playlistId)) groups.set(video.playlistId, []);
    groups.get(video.playlistId).push({ video, index });
  });
  const annotations = new Map();
  for (const [playlistId, members] of groups) {
    members.sort((left, right) => Number(left.video.playlistIndex || 0) - Number(right.video.playlistIndex || 0));
    const currentSize = Math.max(members.length, ...members.map(({ video }) => (
      Number(video.playlistSize || 0) || Number(video.playlistIndex || 0)
    )));
    members.forEach(({ video, index }, memberIndex) => annotations.set(index, {
      playlistId,
      playlistTitle: video.playlistTitle || "Playlist",
      seriesId: `playlist:${playlistId}`,
      seriesPosition: Number(video.playlistIndex || 0) || memberIndex + 1,
      seriesSize: currentSize
    }));
  }
  return annotations;
}

export function annotateVideoSeries(videos = [], contextVideos = videos) {
  const result = videos.map((video) => ({ ...video }));
  const catalogById = new Map();
  for (const video of [...contextVideos, ...result]) {
    if (!video?.id) continue;
    catalogById.set(video.id, { ...(catalogById.get(video.id) || {}), ...video });
  }
  const catalog = [...catalogById.values()];
  const annotations = playlistAnnotations(catalog);
  const numberedGroups = new Map();

  catalog.forEach((video, index) => {
    if (annotations.has(index)) return;
    const part = numberedSeriesPart(video.title);
    if (!part || !channelKey(video)) return;
    const key = `${channelKey(video)}\n${part.key}`;
    if (!numberedGroups.has(key)) numberedGroups.set(key, []);
    numberedGroups.get(key).push({ index, part });
  });

  // Merge title variants before assigning any annotations. A group cannot gain
  // a different video at an already occupied episode number through a fuzzy match.
  const groups = [...numberedGroups.values()].sort((a, b) =>
    a[0].part.key.localeCompare(b[0].part.key));
  for (let i = 0; i < groups.length; i += 1) {
    for (let j = i + 1; j < groups.length; j += 1) {
      const a = groups[i], b = groups[j];
      if (!b.length || channelKey(catalog[a[0].index]) !== channelKey(catalog[b[0].index])) continue;
      if (a.some((x) => b.some((y) => x.part.position === y.part.position))) continue;
      if (!a.every((x) => b.every((y) => sameSeriesSubject(x.part, y.part)))) continue;
      a.push(...b);
      groups.splice(j--, 1);
    }
  }

  for (const members of groups) {
    const groupKey = members[0].part.key;
    const highestPosition = Math.max(...members.map(({ part }) => part.position));
    const detectedSize = Math.max(members.length, highestPosition);
    members.forEach(({ index, part }) => annotations.set(index, {
      seriesId: `series:${channelKey(catalog[index])}:${groupKey}`,
      seriesPosition: part.position,
      seriesSize: detectedSize
    }));

    // Some creators name the first instalment only after publishing Parts 2+.
    // Attach one unnumbered, same-channel candidate when its subject clearly
    // overlaps and the numbered sequence starts after episode 1.
    if (members[0].part.season || members.some(({ part }) => part.position === 1)) continue;
    const referenceWords = new Set(members[0].part.words);
    const referenceChannel = channelKey(catalog[members[0].index]);
    const candidate = catalog
      .map((video, index) => ({ video, index, words: normalizedWords(video.title) }))
      .filter(({ video, index }) => !annotations.has(index) && !numberedSeriesPart(video.title) && channelKey(video) === referenceChannel)
      .map((item) => ({
        ...item,
        overlap: item.words.filter((word) => referenceWords.has(word)).length
      }))
      .filter((item) => item.overlap >= 2 && item.overlap / Math.min(item.words.length, referenceWords.size) >= 0.4)
      .sort((left, right) => right.overlap - left.overlap)[0];
    if (candidate) annotations.set(candidate.index, {
      seriesId: `series:${referenceChannel}:${members[0].part.key}`,
      seriesPosition: 1,
      seriesSize: detectedSize
    });
  }

  const annotationsById = new Map([...annotations].map(([index, annotation]) => [catalog[index].id, annotation]));
  result.forEach((video) => Object.assign(video, annotationsById.get(video.id) || {}));
  return result;
}

export function materializeDetectedSeriesGroups(videos = []) {
  const visibleSizes = videos.reduce((sizes, video) => {
    if (video.seriesId && !video.videoGroupId) sizes.set(video.seriesId, (sizes.get(video.seriesId) || 0) + 1);
    return sizes;
  }, new Map());
  return videos.map((video) => {
    const visibleSize = visibleSizes.get(video.seriesId) || 0;
    if (video.videoGroupId || visibleSize < 2) return video;
    return {
      ...video,
      videoGroupId: `detected-${video.seriesId}`,
      videoGroupOrder: Number(video.seriesPosition || 0),
      videoGroupSize: visibleSize,
      detectedVideoGroup: true
    };
  });
}

export { numberedSeriesPart };
