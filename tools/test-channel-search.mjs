import assert from "node:assert/strict";
import { searchTextMatchesQuery } from "../public/youtube-channel-search.js";

assert.equal(
  searchTextMatchesQuery("How Did We Get the Days of the Week?", "day week name"),
  true
);
assert.equal(
  searchTextMatchesQuery("How Did We Get the Days of the Week?", "day name"),
  false
);
assert.equal(
  searchTextMatchesQuery("The names of every weekday", "day week name"),
  true
);
assert.equal(searchTextMatchesQuery("Unrelated astronomy video", "day week name"), false);

console.log("channel search tests passed");
