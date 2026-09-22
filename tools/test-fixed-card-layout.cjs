const assert = require("node:assert/strict");
const { resolve } = require("node:path");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");

const root = resolve(__dirname, "..");
const base = "http://127.0.0.1:4177";

(async () => {
  const server = spawn(process.execPath, [resolve(__dirname, "snapshot-server.mjs")], {
    env: { ...process.env, YOUTUBE_SHELF_SNAPSHOT_PORT: "4177" },
    stdio: ["ignore", "pipe", "inherit"]
  });
  let browser;
  try {
    await once(server.stdout, "data");
    browser = await chromium.launch({
      headless: true,
      ...(process.env.CAPTURE_BROWSER ? { executablePath: process.env.CAPTURE_BROWSER } : {})
    });
    const page = await browser.newPage({ viewport: { width: 760, height: 760 } });
    await page.setContent(`
      <!doctype html>
      <html><head><link rel="stylesheet" href="${base}/public/styles.css"></head>
      <body class="pageMode channelListColumns">
        <main style="width:700px;padding:16px">
          <div class="channels" id="channelFixture">
            ${channelCard("Short channel", "1 M subscribers", "")}
            ${channelCard("A channel title that is deliberately much too long to fit", "250 k subscribers", "Music")}
            ${channelCard("Three categories", "42 k subscribers", "News|Science|Documentary|Interviews")}
            ${channelCard("No category", "900 k subscribers", "")}
          </div>
          <div class="channels videoListHost" style="margin-top:20px">
            <div class="videos newVideos" id="videoFixture">
              ${videoCard("A short title", false)}
              ${videoCard("A very long title that used to grow the card because it occupied four or five lines in a narrow column", true)}
              ${videoCard("Another short title", false)}
              ${videoCard("Last title", false)}
            </div>
          </div>
        </main>
      </body></html>
    `, { waitUntil: "networkidle" });

    const result = await page.evaluate(() => {
      const boxes = (selector) => [...document.querySelectorAll(selector)].map((element) => {
        const box = element.getBoundingClientRect();
        return { top: box.top, bottom: box.bottom, height: box.height };
      });
      const longTitle = document.querySelector("#videoFixture .video:nth-child(2) .videoTitle");
      const categoryList = document.querySelector("#channelFixture .channel:nth-child(3) .channelCategoryList");
      categoryList.classList.toggle("is-overflowing", categoryList.scrollWidth > categoryList.clientWidth + 1);
      const seriesButton = document.querySelector("#videoFixture .video:nth-child(2) .videoSeriesButton");
      const seriesCard = document.querySelector("#videoFixture .video:nth-child(2)").getBoundingClientRect();
      const seriesBox = seriesButton.getBoundingClientRect();
      return {
        channels: boxes("#channelFixture > .channel"),
        videos: boxes("#videoFixture > .video"),
        titleHeight: longTitle.getBoundingClientRect().height,
        titleLineHeight: parseFloat(getComputedStyle(longTitle).lineHeight),
        categoryOverflow: categoryList.scrollWidth > categoryList.clientWidth,
        categoryMask: getComputedStyle(categoryList).maskImage || getComputedStyle(categoryList).webkitMaskImage,
        seriesInsideCard: seriesBox.top >= seriesCard.top && seriesBox.bottom <= seriesCard.bottom
      };
    });

    assert.deepEqual(result.channels.map(({ height }) => height), [76, 76, 76, 76]);
    assert.deepEqual(result.videos.map(({ height }) => height), [134, 134, 134, 134]);
    assert.equal(result.channels[2].top, result.channels[3].top, "Channel columns must remain row-aligned");
    assert.equal(result.videos[2].top, result.videos[3].top, "Video columns must remain row-aligned");
    assert(result.titleHeight <= result.titleLineHeight * 2 + 1, "Long video titles must be limited to two lines");
    assert.equal(result.categoryOverflow, true);
    assert.notEqual(result.categoryMask, "none", "Overflowing categories must fade at the edge");
    assert.equal(result.seriesInsideCard, true, "The Series action must remain inside the fixed card");

    if (process.env.CARD_LAYOUT_SCREENSHOT) {
      await page.screenshot({ path: process.env.CARD_LAYOUT_SCREENSHOT, fullPage: true });
    }
    console.log("Fixed channel and video card geometry passed, including title clamp and category fade.");
  } finally {
    await browser?.close();
    server.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

function channelCard(title, meta, categories) {
  const chips = categories.split("|").filter(Boolean)
    .map((category) => `<span class="channelCategoryChip">${category}</span>`).join("");
  return `<button class="channel" type="button">
    <div class="channelFallback">${title[0]}</div>
    <div class="channelBody">
      <div class="channelTitleRow"><div class="channelName">${title}</div></div>
      <div class="channelMeta">${meta}</div>
      <div class="channelCategoryList">${chips}</div>
    </div>
  </button>`;
}

function videoCard(title, series) {
  return `<div class="video">
    <div class="thumbFrame"><div class="thumb"></div></div>
    <div class="videoDetails">
      <div class="videoTitle"><span class="videoTitleText">${title}</span></div>
      <div class="meta"><div>Example channel</div><div>16 Sept 2026 - 12k views</div></div>
    </div>
    <div class="videoActions">
      ${series ? '<button class="videoSeriesButton">Series</button>' : ""}
      <button class="favoriteButton">☆</button><button class="watchLaterButton">Watch later</button>
    </div>
  </div>`;
}
