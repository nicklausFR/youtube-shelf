import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../public/app.js", import.meta.url), "utf8").replace(/\r\n/g, "\n");
function definition(name) {
  const start = source.search(new RegExp(`^function ${name}\\(`, "m"));
  assert.ok(start >= 0);
  return source.slice(start, source.indexOf("\n}\n", start) + 2);
}
// Only the standard ISO spelling is portable. Some engines also accept lower
// case t/z as a nonstandard fallback; do not let that mask a mobile regression.
class StrictDate extends Date {
  static parse(value) {
    if (/^\d{4}-\d{2}-\d{2}t|z$/.test(value)) return NaN;
    return Date.parse(value);
  }
  static now() { return Date.parse("2026-09-07T08:00:00Z"); }
}
const h = vm.createContext({ Date: StrictDate, mode: "date-desc",
  currentSortMode: () => h.mode, keepFavoriteVideoGroupsTogether: v => v });
vm.runInContext(["relativeDateValue", "compareOptionalNumbers", "compareTitles", "sortVideosForDisplay"]
  .map(definition).join("\n"), h);
const videos = [
  { id: "ia", title: '"L’IA, c’est avant tout une gigantesque course aux armements"', published: "2026-09-04T16:00:07+00:00" },
  { id: "cannes", title: '"Le Festival de Cannes est un rendez-vous américain"', published: "2026-09-06T16:00:34+00:00" },
  { id: "map", title: "La France s’est trompée et annonce une nouvelle carte", published: "2026-09-05T18:00:20.000Z" },
  { id: "unknown", title: "A video without a date", published: "" }
];
for (let refresh = 0; refresh < 3; refresh++) {
  const input = refresh % 2 ? videos.toReversed() : videos;
  assert.deepEqual(Array.from(h.sortVideosForDisplay(input), v => v.id), ["cannes", "map", "ia", "unknown"]);
}
h.mode = "date-asc";
assert.deepEqual(Array.from(h.sortVideosForDisplay(videos), v => v.id), ["ia", "map", "cannes", "unknown"]);
assert.equal(h.relativeDateValue("  2026-09-06T16:00:34+00:00  "), Date.parse("2026-09-06T16:00:34+00:00"));
assert.equal(h.relativeDateValue("2 DAYS AGO"), StrictDate.now() - 2 * 86400000);
assert.equal(h.relativeDateValue("IL Y A 3 HEURES"), StrictDate.now() - 3 * 3600000);
console.log("Portable ISO date sorting: Antithese/HugoDecrypte order, repeated refreshes, oldest-first and relative dates passed.");
