const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");

(async () => {
  const executablePath = process.env.YOUTUBE_SHELF_BROWSER_PATH;
  assert.ok(executablePath, "YOUTUBE_SHELF_BROWSER_PATH must point to a Chromium browser");
  const browser = await chromium.launch({ headless: true, executablePath });
  try {
    const page = await browser.newPage({ viewport: { width: 560, height: 760 } });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error));
    await page.route("https://www.youtube.com/oembed?**", (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ title: "Original title", author_name: "Test channel" })
    }));
    await page.route("https://www.youtube.com/embed/**", (route) => route.abort());
    await page.route("**/public/index.html*", async (route) => {
      const response = await route.fetch();
      const history = [
        {
          id: "session-new",
          sessionId: "session-new",
          videoId: "abcdefghijk",
          title: "Repeated video",
          channel: "Test channel",
          startedAt: "2026-09-11T11:00:00.000Z",
          updatedAt: "2026-09-11T11:00:30.000Z",
          playedSeconds: 30,
          duration: 100,
          ranges: [[0, 30]],
          completed: false
        },
        {
          id: "session-old",
          sessionId: "session-old",
          videoId: "abcdefghijk",
          title: "Repeated video",
          channel: "Test channel",
          startedAt: "2026-09-11T10:00:00.000Z",
          updatedAt: "2026-09-11T10:00:20.000Z",
          playedSeconds: 20,
          duration: 100,
          ranges: [[40, 60]],
          completed: false
        }
      ];
      const seed = `<script>localStorage.setItem("youtubeChannelShelfTitleLanguage", "original");chrome.storage.local.set({youtubeChannelShelfWatchHistoryEnabled:true,youtubeChannelShelfWatchHistory:${JSON.stringify(history)}});</script>`;
      const body = (await response.text()).replace('<script src="watch-history.js"></script>', `${seed}<script src="watch-history.js"></script>`);
      await route.fulfill({ response, body });
    });

    await page.goto("http://127.0.0.1:4173/public/index.html?mode=page", { waitUntil: "domcontentloaded" });
    await page.locator("#appLoading").waitFor({ state: "hidden" });
    await page.locator("#topOptions").click();
    assert.deepEqual(await page.locator(".contextMenu:not([hidden]) > button").allTextContents(), [
      "Interface",
      "Display",
      "Local watch history",
      "Data",
      "About"
    ]);
    await page.getByRole("menuitem", { name: "Interface" }).click();
    assert.deepEqual(await page.locator(".contextSubmenu:not([hidden]) > button").allTextContents(), [
      "Language and translations",
      "Channel updates"
    ]);
    await page.getByRole("menuitem", { name: "Data" }).click();
    assert.deepEqual(await page.locator(".contextSubmenu:not([hidden]) > button").allTextContents(), [
      "YouTube account and subscriptions",
      "Synchronization",
      "Backup and restore",
      "Reset Shelf content…"
    ]);
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#watchHistoryTab").isVisible(), true, "enabled history shows the fifth tab");
    await page.locator("#watchHistoryTab").click();
    await page.locator(".historyVideos").waitFor();
    assert.equal(await page.locator('.historyVideos .video[data-video-id="abcdefghijk"]').count(), 2, "repeat views remain separate rows");
    await page.locator(".historyVideos .videoTitleText").first().waitFor({ state: "visible" });
    await page.waitForFunction(() => document.querySelector(".historyVideos .videoTitleText")?.textContent === "Original title");
    assert.equal(await page.locator("#sidePanelPath").evaluate((element) => getComputedStyle(element).display), "none", "history has no left category area");
    assert.equal(await page.locator("#toggleExcludedContent").isHidden(), true, "history always shows Shorts and private videos without a filter button");
    assert.equal(await page.locator(".historyVideos .watchLaterButton").count(), 0, "history uses drag and drop instead of Watch later buttons");
    assert.equal(await page.locator(".historyVideos .videoActions").count(), 0, "history cards do not reserve an empty action row");
    assert.deepEqual(await page.locator(".historyVideos .historyProgress").evaluateAll((elements) => elements.map((element) => ({
      value: element.getAttribute("aria-valuenow"),
      label: element.getAttribute("aria-label"),
      width: element.firstElementChild?.style.width
    }))), [
      { value: "30", label: "Viewed 30 s · 30%", width: "30%" },
      { value: "20", label: "Viewed 20 s · 20%", width: "20%" }
    ]);
    const historyCardHeight = await page.locator(".historyVideos .video").first().evaluate((card) => card.getBoundingClientRect().height);
    const historyThumbnailHeight = await page.locator(".historyVideos .thumbFrame").first().evaluate((thumb) => thumb.getBoundingClientRect().height);
    assert.ok(historyCardHeight <= 112, `history cards keep the compact list height (received ${historyCardHeight}px)`);
    assert.equal(historyThumbnailHeight, 84, "history thumbnails use the same stable compact height as other video lists");

    await page.locator("#watchHistoryTab").click({ button: "right" });
    assert.deepEqual(await page.locator(".contextMenu:not([hidden]) > button").allTextContents(), [
      "Reset watch history…",
      "Disable watch history"
    ]);

    await page.locator('.historyVideos .video[data-video-id="abcdefghijk"]').first().click();
    await page.evaluate(() => {
      const player = document.querySelector("#player");
      const emit = (data) => window.dispatchEvent(new MessageEvent("message", {
        source: player.contentWindow,
        origin: "https://www.youtube.com",
        data
      }));
      emit({ event: "onStateChange", info: 1 });
      emit({ event: "infoDelivery", info: { currentTime: 20, duration: 100 } });
    });
    await page.waitForFunction(async () => {
      const stored = await chrome.storage.local.get("youtubeChannelShelfWatchHistory");
      return stored.youtubeChannelShelfWatchHistory?.length === 3;
    });

    await page.evaluate(() => { document.querySelector("#watchHistoryOptionsPrompt").hidden = false; });
    assert.equal(await page.locator("#youtubeDataOptionsPrompt").isHidden(), true, "history option is separate from Channel updates");
    assert.equal(await page.locator("#watchHistoryEnabledOption").isChecked(), true);
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#resetWatchHistory").click();
    assert.equal(await page.locator(".historyVideos .video").count(), 0, "reset clears every session");
    assert.equal(await page.locator("#resetWatchHistory").isDisabled(), true);

    await page.locator("#watchHistoryTab").click({ button: "right" });
    await page.getByRole("menuitem", { name: "Disable watch history" }).click();
    assert.equal(await page.locator("#watchHistoryTab").isHidden(), true, "disabled history removes the tab");
    assert.equal(await page.locator("#toggleExcludedContent").evaluate((element) => element.hidden), false, "leaving history restores the shared content filter");
    assert.equal(pageErrors.length, 0, pageErrors.map((error) => error.message).join("\n"));
    console.log("Watch history browser behavior passed");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
