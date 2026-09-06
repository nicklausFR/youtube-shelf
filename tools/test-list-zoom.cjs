const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const root = resolve(__dirname, '..');
const base = 'http://127.0.0.1:4175';

(async () => {
  const server = spawn(process.execPath, [resolve(__dirname, 'snapshot-server.mjs')], {
    env: { ...process.env, YOUTUBE_SHELF_SNAPSHOT_PORT: '4175' }, stdio: ['ignore', 'pipe', 'inherit']
  });
  let browser;
  try {
    await once(server.stdout, 'data');
    browser = await chromium.launch({ headless: true, ...(process.env.CAPTURE_BROWSER ? { executablePath: process.env.CAPTURE_BROWSER } : {}) });
    for (const width of [1850, 420]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', route => {
        const url = route.request().url();
        if (!url.startsWith(base + '/')) return route.abort();
        if (url === base + '/public/app.js') return route.fulfill({ contentType: 'text/javascript', body:
          readFileSync(resolve(root, 'public/app.js'), 'utf8') + `
            globalThis.openZoomTestChannel = async () => {
              loadFeed = async () => renderChannelVideos(Array.from({length:30}, (_, i) => ({
                ...allChannels[0].feedVideos[i % allChannels[0].feedVideos.length], id:'zoomvideo'+i
              })));
              await selectChannel(allChannels[0]);
            };
          ` });
        return route.continue();
      });
      await page.goto(base + '/public/index.html?layout=' + (width > 500 ? 'icons' : 'compactTitles') + '&mode=page');
      await page.locator('.newVideos .video').first().waitFor();
      await page.evaluate(() => openZoomTestChannel());
      await page.locator('#videos .video').first().waitFor();
      const sizes = () => page.evaluate(() => ({
        channelZoom: Number(getComputedStyle(document.querySelector('#channels')).zoom),
        videoZoom: Number(getComputedStyle(document.querySelector('#videos')).zoom),
        channelHeight: document.querySelector('.channel.is-active')?.getBoundingClientRect().height,
        videoHeight: document.querySelector('#videos .video')?.getBoundingClientRect().height
      }));
      const initial = await sizes();
      await page.locator('#channelZoomIn').click();
      const lower = await sizes();
      assert.equal(lower.channelHeight, initial.channelHeight, 'Lower zoom must leave the active channel unchanged');
      assert(lower.videoZoom > initial.videoZoom, 'Lower zoom must enlarge videos');
      assert(lower.videoHeight > initial.videoHeight, JSON.stringify({width, initial, lower}));
      await page.locator('.pathCategoryZoomIn').first().click();
      const upper = await sizes();
      assert(upper.channelHeight > lower.channelHeight, 'Upper zoom must enlarge the active channel');
      assert.equal(upper.videoZoom, lower.videoZoom, 'Upper zoom must leave video zoom unchanged');
      await page.locator('#channelZoomOut').click();
      assert.equal((await sizes()).videoZoom, initial.videoZoom);
      await page.locator('.pathCategoryZoomOut').first().click();
      assert.equal((await sizes()).channelZoom, initial.channelZoom);
      await page.locator('[data-section="channels"]').click();
      await page.locator('#channelZoomIn').click();
      assert.equal((await sizes()).channelZoom, lower.videoZoom, 'Normal channel lists must still use lower zoom');
      await page.locator('[data-section="favorites"]').click();
      await page.locator('.favoriteVideos .video').first().waitFor();
      assert.equal((await sizes()).channelZoom, lower.videoZoom, 'Favorites retain list zoom after navigation');
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('Independent channel/category and video zoom passed at 1850px and 420px, including navigation.');
  } finally {
    await browser?.close();
    server.kill();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
