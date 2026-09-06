export const YOUTUBE_ACCOUNT_STORAGE_KEY = "youtubeChannelShelfYoutubeAccountV1";
export function normalizeYoutubeSubscription(item = {}) {
  const channelId = String(item.id || "").trim();
  if (!/^UC[-_a-zA-Z0-9]+$/.test(channelId)) return null;
  return {
    id: channelId,
    title: String(item.title || channelId).trim(),
    thumbnail: String(item.thumbnail || "").trim()
  };
}

export function compareSubscriptionSets(previous = [], current = []) {
  const previousById = new Map(previous.map((channel) => [channel.id, channel]));
  const currentById = new Map(current.map((channel) => [channel.id, channel]));
  return {
    added: [...currentById.values()].filter((channel) => !previousById.has(channel.id)),
    removed: [...previousById.values()].filter((channel) => !currentById.has(channel.id))
  };
}

export function subscriptionsMissingFromShelf(subscriptions = [], shelfChannels = []) {
  const shelfIds = new Set(shelfChannels.map((channel) => channel.id));
  return subscriptions.filter((channel) => !shelfIds.has(channel.id));
}

export function shelfChannelsMissingFromSubscriptions(shelfChannels = [], subscriptions = []) {
  const subscriptionIds = new Set(subscriptions.map((channel) => channel.id));
  return shelfChannels.filter((channel) => !subscriptionIds.has(channel.id));
}
