export function synchronizableConfig(value = {}) {
  const channels = Array.isArray(value.channels) ? value.channels.map((channel) => {
    const {
      feedVideos: _feedVideos,
      feedVideoCount: _feedVideoCount,
      feedLatestPublished: _feedLatestPublished,
      feedLatestTitle: _feedLatestTitle,
      feedCheckedAt: _feedCheckedAt,
      channelVideoCount: _channelVideoCount,
      ...content
    } = channel || {};
    return content;
  }) : [];
  const seenVideos = Object.fromEntries(Object.entries(value.seenVideos || {}).map(([videoId, item]) => {
    if (!item || typeof item !== "object") return [videoId, Boolean(item)];
    return [videoId, {
      ...(item.savedAt ? { savedAt: item.savedAt } : {}),
      ...(item.seenAt ? { seenAt: item.seenAt } : {}),
      ...(item.channelId ? { channelId: item.channelId } : {}),
      ...(item.title ? { title: item.title } : {})
    }];
  }));
  return {
    version: 1,
    categories: Array.isArray(value.categories) ? value.categories : [],
    favoriteCategories: Array.isArray(value.favoriteCategories) ? value.favoriteCategories : [],
    channels,
    favorites: value.favorites && typeof value.favorites === "object" ? value.favorites : {},
    seenVideos,
    watchLater: value.watchLater && typeof value.watchLater === "object" ? value.watchLater : {},
    updatedAt: value.updatedAt || ""
  };
}
