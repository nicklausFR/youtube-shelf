const assert = require("node:assert/strict");
const { chromium } = require("playwright");

(async () => {
  const executablePath = process.env.YOUTUBE_SHELF_BROWSER_PATH;
  assert.ok(executablePath, "YOUTUBE_SHELF_BROWSER_PATH must point to a Chromium browser");
  const browser = await chromium.launch({ headless: true, executablePath });
  try {
    const page = await browser.newPage({ viewport: { width: 560, height: 760 } });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error));
    await page.goto("http://127.0.0.1:4173/public/index.html", { waitUntil: "domcontentloaded" });
    await page.locator("#appLoading").waitFor({ state: "hidden" });

    const videoId = "urFIHf5coxE";
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const feedback = await page.evaluate((value) => {
      const transfer = new DataTransfer();
      transfer.setData("text/uri-list", value);
      const event = new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: transfer });
      document.querySelector("#searchInput").dispatchEvent(event);
      return {
        accepted: event.defaultPrevented,
        active: document.body.classList.contains("isYoutubeSearchDropTarget"),
        message: getComputedStyle(document.body, "::after").content
      };
    }, url);
    assert.equal(feedback.accepted, true);
    assert.equal(feedback.active, true);
    assert.match(feedback.message, /YouTube video/);

    const dropAccepted = await page.evaluate((value) => {
      const transfer = new DataTransfer();
      transfer.setData("text/uri-list", value);
      const event = new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer });
      document.querySelector("#searchInput").dispatchEvent(event);
      return event.defaultPrevented;
    }, url);
    assert.equal(dropAccepted, true);
    try {
      await page.locator(`.video[data-video-id="${videoId}"]`).waitFor({ state: "visible", timeout: 5000 });
    } catch (error) {
      const diagnostics = await page.evaluate(() => ({
        bodyClass: document.body.className,
        searchValue: document.querySelector("#searchInput")?.value,
        header: document.querySelector("#channelTitle")?.textContent,
        status: document.querySelector("#status")?.textContent,
        resultCount: document.querySelectorAll(".video").length,
        resultHtml: document.querySelector("#channels")?.innerHTML?.slice(0, 1000)
      }));
      throw new Error(`${error.message}\nPage errors: ${pageErrors.map((item) => item.stack || item.message).join("\n")}\nState: ${JSON.stringify(diagnostics)}`);
    }

    assert.equal(await page.locator(`.video[data-video-id="${videoId}"]`).count(), 1);
    assert.equal(await page.locator("body.isYoutubeSearchDropTarget").count(), 0);
    assert.deepEqual(pageErrors.map((error) => error.message), []);
    console.log("Direct YouTube URL produces one visible result card in the complete UI");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
