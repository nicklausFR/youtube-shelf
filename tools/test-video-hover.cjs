const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const root = resolve(__dirname, '..');
const base = 'http://127.0.0.1:4178';

(async () => {
  const server = spawn(process.execPath, [resolve(__dirname, 'snapshot-server.mjs')], {
    env: { ...process.env, YOUTUBE_SHELF_SNAPSHOT_PORT: '4178' },
    stdio: ['ignore', 'pipe', 'inherit']
  });
  let browser;
  try {
    await once(server.stdout, 'data');
    browser = await chromium.launch({ headless: true,
      ...(process.env.CAPTURE_BROWSER ? { executablePath: process.env.CAPTURE_BROWSER } : {}) });
    for (const width of [320, 560, 1850]) {
      const page = await browser.newPage({ viewport: { width, height: 900 },
        permissions: ['clipboard-read', 'clipboard-write'] });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', route => {
        const url = route.request().url();
        if (!url.startsWith(base + '/')) return route.abort();
        if (url === base + '/public/app.js') return route.fulfill({ contentType: 'text/javascript', body:
          readFileSync(resolve(root, 'public/app.js'), 'utf8') + `
            globalThis.prepareHoverQA = () => {
              interfaceI18n.locale = 'fr';
              const sample = { id: 'hoverqa0001', title: 'Comment fabriquer un outil de précision dans son atelier',
                channel: 'Workshop & Engineering', published: new Date(Date.now() - 3600000).toISOString(),
                views: '12345', durationText: '12:34', thumbnail: allChannels[0].thumbnail };
              let list = document.querySelector('.newVideos');
              list.replaceChildren(createVideoCard(sample), createVideoCard({ ...sample, id: 'hoverqa0002',
                title: 'Comprendre les éléments radioactifs', published: new Date(Date.now() - 86400000).toISOString() }));
              globalThis.updateHoverQA = () => { sample.title = 'Titre actualisé <b>sans HTML</b>'; updateVideoHoverDetails(list.firstChild, sample); };
              globalThis.missingHoverQA = () => list.replaceChildren(createVideoCard({ id: 'hoverqa0003', title: 'Sans métadonnées' }));
              globalThis.refreshHoverQA = () => {
                sample.views = String(Number(sample.views) + 1000);
                const replacement = document.createElement('div');
                replacement.className = list.className;
                replacement.append(createVideoCard(sample), createVideoCard({ ...sample, id: 'hoverqa0002' }));
                list.replaceWith(replacement);
                list = replacement;
              };
            };
            globalThis.prepareDetailedHoverQA = ({ section, view, mode }) => {
              activePrimarySection = section;
              activeView = view;
              setListModeForScope(currentListLayoutScope(), mode);
              applyListLayout();
              document.querySelector('#detailedHoverQA')?.remove();
              const fixture = createVideoCard({ id: \`detailed-\${section}\`, title: \`Detailed \${section}\`,
                channel: 'Example channel', thumbnail: allChannels[0].thumbnail });
              fixture.id = 'detailedHoverQA';
              fixture.style.cssText = 'position:fixed;left:8px;top:8px;width:280px;z-index:1000';
              document.body.append(fixture);
            };
          ` });
        return route.continue();
      });
      await page.goto(base + '/public/index.html?layout=icons&mode=page');
      await page.locator('.newVideos .video').first().waitFor();
      await page.evaluate(() => prepareHoverQA());
      const card = page.locator('.newVideos .video').first();
      const panel = page.locator('#videoHoverDetails');
      await card.locator('.thumb').hover();
      await page.waitForTimeout(500);
      assert.equal(await panel.isVisible(), false, 'A brief hover must not open the panel');
      await page.mouse.move(0, 0);
      await page.waitForTimeout(600);
      assert.equal(await panel.isVisible(), false, 'Leaving cancels the pending opening');
      await card.locator('.thumb').hover();
      await page.waitForTimeout(500);
      assert.equal(await panel.isVisible(), false, 'Each visit requires a fresh deliberate hover');
      await panel.waitFor({ state: 'visible' });
      await page.waitForTimeout(200);
      assert.equal(await card.getAttribute('title'), null, 'No competing native tooltip');
      assert.equal(await card.getAttribute('aria-describedby'), 'videoHoverDetails');
      assert(Number(await panel.locator('.videoHoverTitle').evaluate(el => getComputedStyle(el).fontWeight)) >= 700);
      assert((await panel.innerText()).includes('12.3k'));
      assert((await panel.innerText()).includes('12:34'));
      assert.equal(await card.locator('.videoFreshAgeBadge').innerText(), '1h');
      assert.equal(await page.locator('.newVideos .video').nth(1).locator('.videoFreshAgeBadge').innerText(), '1J');
      const checkBounds = async () => {
        const bounds = await panel.boundingBox();
        assert(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= width && bounds.y + bounds.height <= 900, JSON.stringify(bounds));
      };
      await checkBounds();
      const loadingFrames = await page.evaluate(async () => {
        const panel = document.querySelector('#videoHoverDetails');
        let hiddenFrames = 0;
        let hiddenChanges = 0;
        const observer = new MutationObserver(records => {
          hiddenChanges += records.filter(record => record.attributeName === 'hidden').length;
        });
        observer.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
        for (let refresh = 0; refresh < 8; refresh++) {
          refreshHoverQA();
          await new Promise(resolve => requestAnimationFrame(resolve));
          if (panel.hidden) hiddenFrames++;
          await new Promise(resolve => setTimeout(resolve, 60));
        }
        observer.disconnect();
        return { hiddenFrames, hiddenChanges };
      });
      assert.deepEqual(loadingFrames, { hiddenFrames: 0, hiddenChanges: 0 }, 'Loading must update the open panel without hiding/reopening it');
      assert.equal(await card.getAttribute('aria-describedby'), 'videoHoverDetails');
      assert((await panel.innerText()).includes('20.3k'), 'New view counts reach the panel during loading');
      if (width === 560 && process.env.HOVER_SCREENSHOT) {
        await page.screenshot({ path: process.env.HOVER_SCREENSHOT, clip: { x: 0, y: 50, width, height: 470 } });
      }
      await page.keyboard.press('Escape');
      await page.locator('.newVideos .video').nth(1).hover();
      await panel.waitFor({ state: 'visible' });
      await card.hover();
      await page.waitForTimeout(500);
      assert.equal(await panel.isVisible(), false, 'Switching videos must also wait before showing details');
      await panel.waitFor({ state: 'visible' });
      assert.equal(await card.getAttribute('aria-describedby'), 'videoHoverDetails');
      await panel.hover();
      await page.evaluate(() => refreshHoverQA());
      await page.waitForTimeout(200);
      assert(await panel.isVisible(), 'Panel remains readable while hovered, including during loading');
      await page.mouse.move(0, 0);
      const dismissedWhileLoading = await page.evaluate(async () => {
        for (let refresh = 0; refresh < 6; refresh++) {
          refreshHoverQA();
          await new Promise(resolve => setTimeout(resolve, 20));
        }
        return document.querySelector('#videoHoverDetails').hidden;
      });
      assert(dismissedWhileLoading, 'Leaving must close the panel quickly even while the list refreshes');
      await card.hover();
      await panel.waitFor({ state: 'visible' });
      await page.keyboard.press('Escape');
      assert.equal(await panel.isVisible(), false);
      await card.focus();
      await panel.waitFor({ state: 'visible' });
      assert(await panel.isVisible(), 'Keyboard focus reveals details');
      await page.evaluate(() => updateHoverQA());
      assert.equal(await panel.locator('.videoHoverTitle').innerText(), 'Titre actualisé <b>sans HTML</b>');
      assert.equal(await panel.locator('b').count(), 0);
      await page.evaluate(() => document.dispatchEvent(new Event('scroll')));
      assert.equal(await panel.isVisible(), false);
      await page.mouse.move(0, 0);
      await card.hover();
      await panel.waitFor({ state: 'visible' });
      await page.evaluate(() => missingHoverQA());
      await panel.waitFor({ state: 'hidden' });
      await page.locator('.newVideos .video').focus();
      await panel.waitFor({ state: 'visible' });
      assert(await panel.isVisible());
      assert.equal(await panel.locator('.videoHoverStats').count(), 0);
      assert.equal(await panel.locator('.videoHoverAge').count(), 0);
      // Force the card to the bottom-right to check tooltip placement at viewport edges.
      await page.locator('.newVideos .video').evaluate(el => {
        el.style.setProperty('position', 'fixed'); el.style.setProperty('bottom', '10px');
        el.style.setProperty('right', '10px'); el.style.setProperty('width', '220px', 'important');
        el.blur();
      });
      await page.locator('.newVideos .video').focus();
      await page.waitForTimeout(150);
      await checkBounds();
      // A full card already shows its metadata, in every main section.
      for (const [section, view, mode] of [
        ['youtube', 'youtubeHome', 'columns'],
        ['youtube', 'youtubeHome', 'icons'],
        ['channels', 'newVideos', 'columns'],
        ['favorites', 'favorites', 'single'],
        ['watchLater', 'watchLater', 'columns'],
        ['history', 'history', 'columns']
      ]) {
        await page.evaluate(options => prepareDetailedHoverQA(options), { section, view, mode });
        const fixture = page.locator('#detailedHoverQA');
        await fixture.hover();
        await page.waitForTimeout(1100);
        assert.equal(await panel.isVisible(), false, `${section}: detailed card must not open hover details`);
        assert.equal(await fixture.getAttribute('aria-describedby'), null);
        await fixture.focus();
        assert.equal(await panel.isVisible(), false, `${section}: focus must not reopen hover details`);
        await fixture.click({ button: 'right' });
        const copyButton = page.locator('.contextMenu:not(.contextSubmenu) button').filter({ hasText: 'Copy video URL' });
        assert.equal(await copyButton.count(), 1, `${section}: video URL must be available from the right-click menu`);
        if (section === 'history') {
          await copyButton.click();
          assert.equal(await page.evaluate(() => navigator.clipboard.readText()),
            'https://www.youtube.com/watch?v=detailed-history');
        } else {
          await page.keyboard.press('Escape');
        }
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('Compact video hover, no hover on detailed cards in every section, and right-click video URL copy passed at 320, 560 and 1850px.');
  } finally {
    await browser?.close();
    server.kill();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
