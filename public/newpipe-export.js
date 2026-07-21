export function newPipeSubscriptionData(channels = [], appVersion = "") {
  const seenChannelIds = new Set();
  const subscriptions = [];

  for (const channel of Array.isArray(channels) ? channels : []) {
    const channelId = String(channel?.id || "").trim();
    if (!/^UC[-_a-zA-Z0-9]{20,}$/.test(channelId) || seenChannelIds.has(channelId)) continue;
    seenChannelIds.add(channelId);
    subscriptions.push({
      service_id: 0,
      url: `https://www.youtube.com/channel/${channelId}`,
      name: String(channel?.title || channelId).trim() || channelId
    });
  }

  subscriptions.sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }));

  return {
    app_version: appVersion ? `YouTube Shelf ${appVersion}` : "YouTube Shelf",
    app_version_int: 1,
    subscriptions
  };
}

export function newPipeSubscriptionFilename(date = new Date()) {
  const timestamp = date.toISOString().replace(/\D/g, "").slice(0, 14);
  return `newpipe_subscriptions_${timestamp}.json`;
}
