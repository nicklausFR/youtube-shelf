const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const root = resolve(__dirname, '..');
const base = 'http://127.0.0.1:4176';

(async () => {
  const server = spawn(process.execPath, [resolve(__dirname, 'snapshot-server.mjs')], {
    env: { ...process.env, YOUTUBE_SHELF_SNAPSHOT_PORT: '4176' }, stdio: ['ignore', 'pipe', 'inherit']
  });
  let browser;
  try {
    await once(server.stdout, 'data');
    browser = await chromium.launch({ headless: true, ...(process.env.CAPTURE_BROWSER ? { executablePath: process.env.CAPTURE_BROWSER } : {}) });
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    let incoming = null;
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', async route => {
      const url = route.request().url();
      if (!url.startsWith(base + '/')) return route.abort();
      if (url.startsWith(base + '/public/index.html')) {
        const response = await route.fetch();
        const html = (await response.text()).replace('const listeners = new Set();',
          `data.youtubeChannelShelfModeHandoff = ${JSON.stringify(incoming)}; const listeners = new Set();`);
        return route.fulfill({ response, body: html });
      }
      if (url === base + '/public/app.js') return route.fulfill({ contentType: 'text/javascript', body:
        readFileSync(resolve(root, 'public/app.js'), 'utf8') + `
          globalThis.captureHandoff = async (target, videoId) => {
            if (activePrimarySection === 'channels') showChannelListState('science');
            if (activePrimarySection === 'favorites') { activeFavoriteCategoryId='music'; renderFavoritesHome(); }
            // Reproduce an old history entry left behind by a tab change.
            historyStack = [{type:'youtubeHome',id:'youtube'}]; historyIndex = 0;
            await writeModeHandoff(target, {videoId});
            return (await host.storage.local.get(MODE_HANDOFF_KEY))[MODE_HANDOFF_KEY];
          };
        ` });
      return route.continue();
    });
    for (const section of ['youtube', 'channels', 'favorites', 'watchLater']) {
      for (const target of ['page', 'panel']) {
        incoming = null;
        await page.goto(base + '/public/index.html' + (target === 'panel' ? '?mode=page' : ''));
        await page.locator('.newVideos .video').first().waitFor();
        await page.locator(`[data-section="${section}"]`).click();
        incoming = await page.evaluate(target => captureHandoff(target, ''), target);
        assert.equal(incoming.section, section);
        await page.goto(base + '/public/index.html' + (target === 'page' ? '?mode=page' : ''));
        await page.waitForFunction(section => document.querySelector(`[data-section="${section}"]`).classList.contains('is-active'), section);
        if (section === 'channels') await page.locator('.channel').first().waitFor();
        else await page.locator('.video').first().waitFor();
        if (section === 'channels' || section === 'favorites') {
          assert.equal(incoming.entry.id, section === 'channels' ? 'science' : 'music');
        }
      }
    }
    // A transferred YouTube video skips list rendering at startup; the selected
    // tab must still be restored instead of retaining the default YouTube tab.
    for (const section of ['channels', 'favorites', 'watchLater']) {
      incoming = null;
      await page.goto(base + '/public/index.html');
      await page.locator('.newVideos .video').first().waitFor();
      await page.locator(`[data-section="${section}"]`).click();
      incoming = await page.evaluate(() => captureHandoff('page', 'snapdemo001'));
      await page.goto(base + '/public/index.html?mode=page');
      await page.waitForFunction(section => document.querySelector(`[data-section="${section}"]`).classList.contains('is-active'), section);
      await page.locator('#player').waitFor();
    }
    assert.deepEqual(errors, []);
    console.log('Mode changes preserve all four tabs in both directions, selected categories, and tabs during video transfer.');
  } finally {
    await browser?.close();
    server.kill();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
