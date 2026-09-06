import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { annotateVideoSeries, materializeDetectedSeriesGroups, numberedSeriesPart } from "../public/video-series.js";

assert.deepEqual(numberedSeriesPart("Massive Repair on BROKEN Bulldozer Blade | Part 2 | Drilling, Gouging & Welding"), {
  position: 2,
  words: ["massive", "repair", "broken", "bulldozer", "blade"],
  key: "massive repair broken bulldozer blade"
});
assert.equal(numberedSeriesPart("THE SAMURAI WOOD CHISEL!!!!! | Part 1").position, 1);
assert.equal(numberedSeriesPart("A standalone documentary"), null);

const bulldozerParts = [
  { id: "GHNwchzyx0c", channelId: "engineering", title: "Massive Repair on BROKEN Bulldozer Blade | Part 1 | Gouging & Welding" },
  { id: "blade-2", channelId: "engineering", title: "Massive Repair on BROKEN Bulldozer Blade | Part 2 | Drilling, Gouging & Welding" },
  { id: "VvDNckmlN2o", channelId: "engineering", title: "Massive Repair on BROKEN Bulldozer Blade COMPLETED! | Part 3" }
];
for (const catalog of [bulldozerParts, [...bulldozerParts].reverse()]) {
  const annotated = annotateVideoSeries(catalog);
  assert.equal(new Set(annotated.map((video) => video.seriesId)).size, 1);
  assert.deepEqual(annotated.map((video) => video.seriesPosition).sort(), [1, 2, 3]);
  assert.ok(annotated.every((video) => video.seriesSize === 3));
}
const updatedBlade = annotateVideoSeries(
  annotateVideoSeries([bulldozerParts[0]], bulldozerParts.slice(0, 2)), bulldozerParts
);
assert.equal(updatedBlade[0].seriesSize, 3);
const distinctRepair = annotateVideoSeries([
  ...bulldozerParts,
  { id: "bucket", channelId: "engineering", title: "Massive Repair on BROKEN Bulldozer Bucket COMPLETED! | Part 3" },
  { ...bulldozerParts[2], id: "other-channel", channelId: "other" }
]);
assert.notEqual(distinctRepair[0].seriesId, distinctRepair[3].seriesId);
assert.notEqual(distinctRepair[0].seriesId, distinctRepair[4].seriesId);

const videos = annotateVideoSeries([
  { id: "part-2", channelId: "engineering", title: "Massive Repair on BROKEN Bulldozer Blade | Part 2 | Drilling, Gouging & Welding" },
  { id: "unrelated", channelId: "cinema", title: "Terminator, des machines et des hommes" },
  { id: "part-1", channelId: "engineering", title: "Massive Repair on BROKEN Bulldozer Blade | Part 1 | Gouging & Welding" },
  { id: "samurai", channelId: "forge", title: "THE SAMURAI WOOD CHISEL!!!!! | Part 1" }
]);
assert.deepEqual(videos.filter((video) => video.channelId === "engineering").map((video) => [video.seriesPosition, video.seriesSize]), [[2, 2], [1, 2]]);
assert.equal(videos[1].seriesPosition, undefined);
assert.deepEqual([videos[3].seriesPosition, videos[3].seriesSize], [1, 1]);

const evolving = annotateVideoSeries([
  { id: "first", channelId: "forge", title: "I've Dreamt of Owning This Hammer Since I Was 11" },
  { id: "second", channelId: "forge", title: "My Dream Power Hammer Restoration! Part 2" },
  { id: "third", channelId: "forge", title: "My Dream Power Hammer Restoration! Part 3" }
]);
assert.deepEqual(evolving.map((video) => [video.seriesPosition, video.seriesSize]), [[1, 3], [2, 3], [3, 3]]);

const firstOnly = annotateVideoSeries(
  [{ id: "first", channelId: "forge", title: "I've Dreamt of Owning This Hammer Since I Was 11" }],
  [
    { id: "first", channelId: "forge", title: "I've Dreamt of Owning This Hammer Since I Was 11" },
    { id: "second", channelId: "forge", title: "My Dream Power Hammer Restoration! Part 2" },
    { id: "third", channelId: "forge", title: "My Dream Power Hammer Restoration! Part 3" },
    { id: "fourth", channelId: "forge", title: "My Dream Power Hammer Restoration! Part 4" }
  ]
);
assert.deepEqual([firstOnly[0].seriesPosition, firstOnly[0].seriesSize], [1, 4]);

const grouped = materializeDetectedSeriesGroups(videos);
const engineeringGroup = grouped.filter((video) => video.channelId === "engineering");
assert.equal(engineeringGroup[0].videoGroupId, engineeringGroup[1].videoGroupId);
assert.deepEqual(engineeringGroup.map((video) => [video.videoGroupOrder, video.videoGroupSize]), [[2, 2], [1, 2]]);
assert.equal(grouped[1].videoGroupId, undefined);
assert.equal(grouped[3].videoGroupId, undefined);

const playlist = annotateVideoSeries([
  { id: "a", title: "Unnumbered", playlistId: "PL1", playlistTitle: "Course", playlistIndex: 4 },
  { id: "b", title: "Another", playlistId: "PL1", playlistTitle: "Course", playlistIndex: 5 }
]);
assert.deepEqual(playlist.map((video) => [video.playlistTitle, video.seriesPosition, video.seriesSize]), [["Course", 4, 5], ["Course", 5, 5]]);

const appSource = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
assert.match(appSource, /\["newVideos", "youtubeHome"\]\.includes\(activeView\)/);
assert.match(appSource, /activePrimarySection === "channels" && activeChannel/);
assert.match(appSource, /openVideoSeries\(video\)/);
assert.doesNotMatch(appSource, /materializeDetectedSeriesGroups/);

console.log("automatic evolving series badges and fresh-age scope tests passed");
