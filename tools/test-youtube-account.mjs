import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  compareSubscriptionSets,
  normalizeYoutubeSubscription,
  shelfChannelsMissingFromSubscriptions,
  subscriptionsMissingFromShelf
} from "../public/youtube-account.js";

const item = (id, title = id) => ({ id, title, thumbnail: `https://example.test/${id}.jpg` });

assert.equal(normalizeYoutubeSubscription(item("UC_one", "One")).title, "One");
assert.equal(normalizeYoutubeSubscription(item("not-a-channel")), null);

const subscriptions = [item("UC_one", "One"), item("UC_two", "Two")]
  .map(normalizeYoutubeSubscription);

const changes = compareSubscriptionSets(
  [{ id: "UC_old", title: "Old" }, { id: "UC_same", title: "Same" }],
  [{ id: "UC_new", title: "New" }, { id: "UC_same", title: "Same" }]
);
assert.deepEqual(changes.added.map(({ id }) => id), ["UC_new"]);
assert.deepEqual(changes.removed.map(({ id }) => id), ["UC_old"]);
assert.deepEqual(
  subscriptionsMissingFromShelf(subscriptions, [{ id: "UC_two" }]).map(({ id }) => id),
  ["UC_one"]
);
assert.deepEqual(
  shelfChannelsMissingFromSubscriptions([{ id: "UC_two" }, { id: "UC_three" }], subscriptions).map(({ id }) => id),
  ["UC_three"]
);

const liveSource = readFileSync(new URL("../youtube-live.js", import.meta.url), "utf8");
const confirmationFunctionStart = liveSource.indexOf("function youtubeShelfSubscriptionIsConfirmed()");
const confirmationFunctionEnd = liveSource.indexOf("\nfunction youtubeShelfButtonText", confirmationFunctionStart);
assert.ok(confirmationFunctionStart >= 0 && confirmationFunctionEnd > confirmationFunctionStart);
const confirmationFunctionSource = liveSource.slice(confirmationFunctionStart, confirmationFunctionEnd);
const confirmationDocument = {
  buttons: [],
  querySelector: () => null,
  querySelectorAll() {
    return this.buttons.map((textContent) => ({
      textContent,
      getAttribute: () => null
    }));
  }
};
const subscriptionIsConfirmed = Function(
  "document",
  `${confirmationFunctionSource}; return youtubeShelfSubscriptionIsConfirmed;`
)(confirmationDocument);
for (const label of ["Abonné", "Abonnée", "Subscribed", "Unsubscribe"]) {
  confirmationDocument.buttons = [label];
  assert.equal(subscriptionIsConfirmed(), true, `Expected confirmed state for ${label}`);
}
for (const label of ["S'abonner", "Subscribe", "287 k abonnés"]) {
  confirmationDocument.buttons = [label];
  assert.equal(subscriptionIsConfirmed(), false, `Expected unconfirmed state for ${label}`);
}

console.log("youtube-account tests passed");
