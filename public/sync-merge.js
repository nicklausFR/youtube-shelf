const MISSING = Symbol("missing");

function sameValue(left, right) {
  if (left === MISSING || right === MISSING) return left === right;
  return JSON.stringify(left) === JSON.stringify(right);
}

function valueKey(value) {
  return value && typeof value === "object" ? JSON.stringify(value) : `${typeof value}:${String(value)}`;
}

function unionArray(left, right) {
  const result = [];
  const seen = new Set();
  for (const value of [...(Array.isArray(left) ? left : []), ...(Array.isArray(right) ? right : [])]) {
    const key = valueKey(value);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function mergeValue(base, local, remote, preferRemote) {
  if (sameValue(local, remote)) return local;
  if (sameValue(local, base)) return remote;
  if (sameValue(remote, base)) return local;
  if (local === MISSING) return remote;
  if (remote === MISSING) return local;
  if (Array.isArray(local) && Array.isArray(remote)) return unionArray(local, remote);
  if (local && remote && typeof local === "object" && typeof remote === "object") {
    const result = {};
    const baseObject = base && base !== MISSING && typeof base === "object" ? base : {};
    const keys = new Set([...Object.keys(baseObject), ...Object.keys(local), ...Object.keys(remote)]);
    for (const key of keys) {
      const merged = mergeValue(
        Object.hasOwn(baseObject, key) ? baseObject[key] : MISSING,
        Object.hasOwn(local, key) ? local[key] : MISSING,
        Object.hasOwn(remote, key) ? remote[key] : MISSING,
        preferRemote
      );
      if (merged !== MISSING) result[key] = merged;
    }
    return result;
  }
  return preferRemote ? remote : local;
}

function keyedMap(items) {
  return new Map((Array.isArray(items) ? items : []).filter((item) => item?.id).map((item) => [item.id, item]));
}

function orderedIds(base, local, remote) {
  return [...new Set([
    ...(Array.isArray(base) ? base : []).map((item) => item?.id),
    ...(Array.isArray(local) ? local : []).map((item) => item?.id),
    ...(Array.isArray(remote) ? remote : []).map((item) => item?.id)
  ].filter(Boolean))];
}

function mergeKeyedArray(base, local, remote, preferRemote) {
  const baseMap = keyedMap(base);
  const localMap = keyedMap(local);
  const remoteMap = keyedMap(remote);
  const result = [];
  for (const id of orderedIds(base, local, remote)) {
    const merged = mergeValue(
      baseMap.has(id) ? baseMap.get(id) : MISSING,
      localMap.has(id) ? localMap.get(id) : MISSING,
      remoteMap.has(id) ? remoteMap.get(id) : MISSING,
      preferRemote
    );
    if (merged !== MISSING) result.push(merged);
  }
  return result;
}

function mergeRecord(base, local, remote, preferRemote) {
  const baseRecord = base && typeof base === "object" ? base : {};
  const localRecord = local && typeof local === "object" ? local : {};
  const remoteRecord = remote && typeof remote === "object" ? remote : {};
  const result = {};
  const keys = new Set([...Object.keys(baseRecord), ...Object.keys(localRecord), ...Object.keys(remoteRecord)]);
  for (const key of keys) {
    const merged = mergeValue(
      Object.hasOwn(baseRecord, key) ? baseRecord[key] : MISSING,
      Object.hasOwn(localRecord, key) ? localRecord[key] : MISSING,
      Object.hasOwn(remoteRecord, key) ? remoteRecord[key] : MISSING,
      preferRemote
    );
    if (merged !== MISSING) result[key] = merged;
  }
  return result;
}

export function mergeSynchronizationData(base, local, remote, mergedAt = new Date().toISOString()) {
  const baseData = base && typeof base === "object" ? base : {};
  const localData = local && typeof local === "object" ? local : {};
  const remoteData = remote && typeof remote === "object" ? remote : {};
  const preferRemote = Date.parse(remoteData.updatedAt || "") >= Date.parse(localData.updatedAt || "");
  return {
    version: 1,
    categories: mergeKeyedArray(baseData.categories, localData.categories, remoteData.categories, preferRemote),
    favoriteCategories: mergeKeyedArray(
      baseData.favoriteCategories,
      localData.favoriteCategories,
      remoteData.favoriteCategories,
      preferRemote
    ),
    channels: mergeKeyedArray(baseData.channels, localData.channels, remoteData.channels, preferRemote),
    favorites: mergeRecord(baseData.favorites, localData.favorites, remoteData.favorites, preferRemote),
    seenVideos: mergeRecord(baseData.seenVideos, localData.seenVideos, remoteData.seenVideos, preferRemote),
    watchLater: mergeRecord(baseData.watchLater, localData.watchLater, remoteData.watchLater, preferRemote),
    updatedAt: mergedAt
  };
}

export function synchronizationContentChanged(previous, next) {
  return JSON.stringify({ ...(previous || {}), updatedAt: "" })
    !== JSON.stringify({ ...(next || {}), updatedAt: "" });
}
