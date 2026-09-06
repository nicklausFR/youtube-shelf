import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { fetchWeeklyChannelVideos, weeklyVideoSummary } from "../public/weekly-videos.js";

const now = Date.parse("2026-09-05T08:00:00Z");
const telescope = { id: "telescope", title: "Telescope NASA", published: "2026-09-01T16:56:12Z" };
const periodic = { id: "periodic", title: "Tableau periodique", published: "2026-09-03T21:46:13Z" };
const config = { feedVideos: [telescope] };
const defaults = {
  channelId: "UCqoAEDirJPjEUFcF2FklnBA", parseFeed: JSON.parse, now,
  fetchImpl: async () => ({ ok: true, text: async () => JSON.stringify([telescope]) })
};
// Reproduce the user's discrepancy: forced RSS still stops at Telescope NASA,
// while the channel page includes Tableau periodique. The weekly list must include both.
{
  const result = await fetchWeeklyChannelVideos({ ...defaults,
    fetchPage: async ({ sort }) => {
      assert.equal(sort, "latest");
      return { videos: [periodic, telescope], continuation: "" };
    }
  });
  assert.equal(result.complete, true);
  const summary = weeklyVideoSummary(config, result, now);
  assert.deepEqual(summary.feedVideos.map(v => v.id), ["periodic", "telescope"]);
  assert.equal(summary.feedLatestTitle, periodic.title);
  // Even another stale RSS response cannot erase the discovered upload.
  const next = weeklyVideoSummary(summary, { rssVideos: [telescope] }, now);
  assert.equal(next.feedVideos[0].id, "periodic");
}
// Continue beyond the first page when uploads from this week fill that page.
{
  const tokens = [];
  const result = await fetchWeeklyChannelVideos({ ...defaults, fetchPage: async ({ continuation }) => {
    tokens.push(continuation);
    if (!continuation) return { videos: [periodic], continuation: "page-2" };
    if (continuation === "page-2") return { videos: [telescope], continuation: "page-3" };
    return { videos: [{ id: "old", published: "2026-08-01T00:00:00Z" }], continuation: "older" };
  }});
  assert.deepEqual(tokens, ["", "page-2", "page-3"]);
  assert.equal(result.complete, true);
  assert.ok(result.youtubeVideos.some(v => v.id === "telescope"));
}
// Exact RSS dates win over rounded YouTube dates. Rounded dates never creep forward.
{
  const youtube = { ...periodic, published: "2026-09-03T08:00:00Z", publishedText: "2 days ago" };
  const first = weeklyVideoSummary({}, { youtubeVideos: [youtube] }, now);
  const later = weeklyVideoSummary(first, { youtubeVideos: [{ ...youtube, published: "2026-09-03T09:00:00Z" }] }, now);
  assert.equal(later.feedVideos[0].published, youtube.published);
  const exact = weeklyVideoSummary(later, { rssVideos: [periodic] }, now);
  assert.equal(exact.feedVideos[0].published, periodic.published);
  assert.equal(exact.feedVideos[0].publishedIsApproximate, false);
  assert.equal(weeklyVideoSummary(exact, { youtubeVideos: [youtube] }, now).feedVideos[0].published, periodic.published);
}
// Partial failures retain successful discoveries and report incomplete verification.
{
  let page = 0;
  const result = await fetchWeeklyChannelVideos({ ...defaults, fetchPage: async () => {
    if (page++) throw new Error("Page unavailable");
    return { videos: [periodic], continuation: "next" };
  }});
  assert.equal(result.complete, false);
  assert.equal(weeklyVideoSummary(config, result, now).feedVideos[0].id, periodic.id);
  const rssFailed = await fetchWeeklyChannelVideos({ ...defaults,
    fetchImpl: async () => { throw new Error("RSS unavailable"); },
    fetchPage: async () => ({ videos: [periodic], continuation: "" })
  });
  assert.equal(rssFailed.complete, false);
  assert.equal(rssFailed.youtubeVideos[0].id, periodic.id);
  await assert.rejects(fetchWeeklyChannelVideos({ ...defaults,
    fetchImpl: async () => { throw new Error("RSS unavailable"); },
    fetchPage: async () => { throw new Error("YouTube unavailable"); }
  }), /Neither RSS nor YouTube/);
}
// Both source deadlines apply through reading the response, without losing the other source.
{
  const result = await fetchWeeklyChannelVideos({ ...defaults, timeoutMs: 5,
    fetchImpl: async (_, { signal }) => ({ ok: true, text: () => new Promise((_, reject) => {
      signal.addEventListener("abort", () => reject(new Error("Timeout")), { once: true });
    }) }),
    fetchPage: async () => ({ videos: [periodic], continuation: "" })
  });
  assert.equal(result.complete, false);
  assert.equal(result.youtubeVideos[0].id, periodic.id);
}
// Repeated tokens or the safety limit cannot masquerade as a complete week.
for (const maxPages of [1, 10]) {
  const result = await fetchWeeklyChannelVideos({ ...defaults, maxPages,
    fetchPage: async () => ({ videos: [periodic], continuation: "repeated" })
  });
  assert.equal(result.complete, false);
}
// Exercise the app's real channel-view cache integration and weekly filtering.
{
  const source = readFileSync(new URL("../public/app.js", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const definition = (name) => {
    const start = source.search(new RegExp(`^(?:async )?function ${name}\\(`, "m"));
    assert.ok(start >= 0);
    return source.slice(start, source.indexOf("\n}\n", start) + 2);
  };
  let saves = 0;
  const h = { allChannels: [{ id: "StarTalk", ...config }], activeChannel: null, weeklyVideoSummary,
    weeklyShowShorts: true, youtubeShorts: { known: video => video.isShort },
    saveConfig: async () => { saves++; }, renderCategories: () => {}, activeView: "channels",
    channelMatchesWeeklyCategories: () => true, shouldGroupWeeklyVideos: () => false,
    videoWithChannel: v => v, Date: class extends Date { static now() { return now; } }
  };
  vm.createContext(h);
  for (const name of ["rememberChannelWeeklyVideos", "replaceChannelSummary", "feedSummaryChanged",
    "isWithinNewVideosRange", "isNewerThanReset", "isVideoNewForChannel", "collectNewVideos"]) {
    vm.runInContext(definition(name), h);
  }
  await h.rememberChannelWeeklyVideos("StarTalk", [periodic], [telescope]);
  assert.equal(saves, 1);
  assert.equal(h.allChannels[0].feedCheckedAt, undefined); // One page is not a full weekly check.
  assert.deepEqual(Array.from(h.collectNewVideos(), v => v.id), ["periodic", "telescope"]);
  for (const name of ["loadFeed", "loadMoreChannelVideos", "loadChannelVideosForYoutubeOrder"]) {
    assert.match(definition(name), /await rememberChannelWeeklyVideos\(/);
  }
}
console.log("weekly source and channel cache regression tests passed");
