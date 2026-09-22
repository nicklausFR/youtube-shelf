const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const { resolve } = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");

const root = resolve(__dirname, "..");
const port = "4178";
const base = `http://127.0.0.1:${port}`;

(async () => {
  const server = spawn(process.execPath, [resolve(__dirname, "snapshot-server.mjs")], {
    cwd: root,
    env: { ...process.env, YOUTUBE_SHELF_SNAPSHOT_PORT: port },
    stdio: ["ignore", "pipe", "inherit"]
  });
  let browser;
  try {
    await once(server.stdout, "data");
    browser = await chromium.launch({
      headless: true,
      ...(process.env.CAPTURE_BROWSER ? { executablePath: process.env.CAPTURE_BROWSER } : {})
    });

    async function verifyDrop({ name, prepare, sourceSelector, targetSection, collection, listSelector }) {
      const page = await browser.newPage({ viewport: { width: 720, height: 900 } });
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      try {
        await page.goto(`${base}/public/index.html`, { waitUntil: "domcontentloaded" });
        await page.locator("#appLoading").waitFor({ state: "hidden" });
        if (prepare) await prepare(page);

        const source = page.locator(sourceSelector).first();
        await source.waitFor({ state: "visible" });
        const sourceState = await source.evaluate((control) => ({
          draggable: control.draggable,
          videoId: control.closest(".video")?.dataset.videoId || ""
        }));
        assert.equal(sourceState.draggable, true, `${name}: the inner control must initiate a native drag`);
        assert.ok(sourceState.videoId, `${name}: source control must belong to a video card`);

        const targetTab = page.locator(`[data-section="${targetSection}"]`);
        await source.dragTo(targetTab);
        await page.waitForFunction(async ({ key, videoId }) => {
          const stored = await chrome.storage.local.get("youtubeChannelShelfConfig");
          return Boolean(stored.youtubeChannelShelfConfig?.[key]?.[videoId]);
        }, { key: collection, videoId: sourceState.videoId }, { timeout: 5000 });

        await targetTab.click();
        await page.waitForFunction((section) => (
          document.querySelector(`[data-section="${section}"]`)?.classList.contains("is-active")
        ), targetSection, { timeout: 5000 });
        await page.locator(`${listSelector} .video[data-video-id="${sourceState.videoId}"]`)
          .waitFor({ state: "visible", timeout: 5000 });
        assert.deepEqual(pageErrors, [], `${name}: no page error expected`);
      } finally {
        await page.close();
      }
    }

    await verifyDrop({
      name: "YouTube channel label to Watch later",
      sourceSelector: '.video[data-video-id="extra000000"] .videoChannelMeta',
      targetSection: "watchLater",
      collection: "watchLater",
      listSelector: ".watchLaterVideos"
    });
    await verifyDrop({
      name: "YouTube action button to Favorites",
      sourceSelector: '.video[data-video-id="extra000001"] .favoriteButton',
      targetSection: "favorites",
      collection: "favorites",
      listSelector: ".favoriteVideos"
    });
    await verifyDrop({
      name: "Favorites category chip to Watch later",
      prepare: async (page) => {
        await page.locator('[data-section="favorites"]').click();
        await page.locator(".favoriteVideos .video").first().waitFor({ state: "visible" });
      },
      sourceSelector: ".favoriteVideos .video .channelCategoryChip",
      targetSection: "watchLater",
      collection: "watchLater",
      listSelector: ".watchLaterVideos"
    });
    await verifyDrop({
      name: "Watch later channel label to Favorites",
      prepare: async (page) => {
        await page.locator('[data-section="watchLater"]').click();
        await page.locator(".watchLaterVideos .video").first().waitFor({ state: "visible" });
      },
      sourceSelector: ".watchLaterVideos .video .videoChannelMeta",
      targetSection: "favorites",
      collection: "favorites",
      listSelector: ".favoriteVideos"
    });

    const externalDropPage = await browser.newPage({ viewport: { width: 720, height: 900 } });
    try {
      await externalDropPage.goto(`${base}/public/index.html`, { waitUntil: "domcontentloaded" });
      await externalDropPage.locator("#appLoading").waitFor({ state: "hidden" });
      const externalVideoId = "dropfast001";
      await externalDropPage.evaluate((videoId) => {
        const transfer = new DataTransfer();
        transfer.setData("text/plain", `https://www.youtube.com/watch?v=${videoId}`);
        document.querySelector('[data-section="favorites"]').dispatchEvent(new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer
        }));
      }, externalVideoId);

      const feedback = externalDropPage.locator("#infoPrompt");
      await feedback.waitFor({ state: "visible", timeout: 500 });
      assert.equal(
        await feedback.evaluate((element) => getComputedStyle(element).pointerEvents),
        "none",
        "drop feedback must not block the next drag and drop"
      );
      await externalDropPage.waitForFunction(async (videoId) => {
        const stored = await chrome.storage.local.get("youtubeChannelShelfConfig");
        return Boolean(stored.youtubeChannelShelfConfig?.favorites?.[videoId]);
      }, externalVideoId, { timeout: 1000 });
    } finally {
      await externalDropPage.close();
    }

    async function verifyDirectCategoryHover({ section, parentLabel, childLabel, url }) {
      const page = await browser.newPage({ viewport: { width: 720, height: 900 } });
      try {
        await page.goto(`${base}/public/index.html`, { waitUntil: "domcontentloaded" });
        await page.locator("#appLoading").waitFor({ state: "hidden" });
        await page.locator(`[data-section="${section}"]`).click();
        assert.equal(
          await page.locator(`.pathButton[aria-label="${childLabel}"]`).count(),
          0,
          `${section}: the subcategory should initially be collapsed`
        );
        await page.evaluate(({ parentLabel, url }) => {
          const transfer = new DataTransfer();
          transfer.setData("text/plain", url);
          document.querySelector(`.pathButton[aria-label="${parentLabel}"]`).dispatchEvent(new DragEvent("dragover", {
            bubbles: true,
            cancelable: true,
            dataTransfer: transfer
          }));
        }, { parentLabel, url });
        await page.locator(`.pathButton[aria-label="${childLabel}"]`).waitFor({ state: "visible", timeout: 1000 });
      } finally {
        await page.close();
      }
    }

    await verifyDirectCategoryHover({
      section: "favorites",
      parentLabel: "Learning",
      childLabel: "Design",
      url: "https://www.youtube.com/watch?v=dropfast001"
    });
    await verifyDirectCategoryHover({
      section: "channels",
      parentLabel: "Science",
      childLabel: "Physics",
      url: "https://www.youtube.com/@example"
    });

    const categoryDropPage = await browser.newPage({ viewport: { width: 720, height: 900 } });
    try {
      await categoryDropPage.goto(`${base}/public/index.html`, { waitUntil: "domcontentloaded" });
      await categoryDropPage.locator("#appLoading").waitFor({ state: "hidden" });
      await categoryDropPage.locator('[data-section="favorites"]').click();
      const source = categoryDropPage.locator('.video[data-video-id="snapfav0002"] .videoChannelMeta');
      const target = categoryDropPage.locator('.pathButton[aria-label="Review later"]');
      await source.dragTo(target);
      await categoryDropPage.waitForFunction(async () => {
        const stored = await chrome.storage.local.get("youtubeChannelShelfConfig");
        return stored.youtubeChannelShelfConfig?.favorites?.snapfav0002?.categories?.includes("later");
      }, null, { timeout: 1000 });
    } finally {
      await categoryDropPage.close();
    }

    const clickPage = await browser.newPage({ viewport: { width: 720, height: 900 } });
    try {
      await clickPage.goto(`${base}/public/index.html`, { waitUntil: "domcontentloaded" });
      await clickPage.locator("#appLoading").waitFor({ state: "hidden" });
      await clickPage.locator('.video[data-video-id="extra000000"] .videoChannelMeta').click();
      await clickPage.locator('[data-section="channels"].is-active').waitFor({ state: "visible" });
      assert.equal(
        await clickPage.locator('.channel[data-channel-id="UC_SNAPSHOT_ALPHA"].is-active').count(),
        1,
        "A regular channel-label click must still open the channel"
      );
    } finally {
      await clickPage.close();
    }

    console.log("Tab and category drops persist immediately with non-blocking feedback, while ordinary channel-label clicks still navigate.");
  } finally {
    await browser?.close();
    server.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
