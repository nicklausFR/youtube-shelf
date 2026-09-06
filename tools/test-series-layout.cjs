const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const { readFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const source = readFileSync('public/app.js', 'utf8').replace(/\r\n/g, '\n');
const start = source.indexOf('function openVideoSeries(seed)');
const definition = source.slice(start, source.indexOf('\nfunction createVideoCard', start));
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CAPTURE_BROWSER ? { executablePath: process.env.CAPTURE_BROWSER } : {}) });
  try {
    for (const width of [480, 900]) {
      const page = await browser.newPage({ viewport: { width, height: 850 } });
      await page.route('**/*', route => route.abort());
      await page.setContent('<html><body></body></html>');
      await page.addStyleTag({ content: readFileSync('public/styles.css', 'utf8') });
      await page.addScriptTag({ content: `
        const favorites = {}, watchLater = {}, seenVideos = {};
        const discoveredSeriesVideos = new Map(); let cardSeriesAnnotations;
        const seriesCatalog = () => Array.from({length:160}, (_, i) => ({ id:'video'+i, title:'Episode title | S8, EP'+(i+1), channelId:'creator', seriesId:'season8', seriesPosition:i+1 }));
        const annotateVideoSeries = videos => videos;
        const uiMessage = key => key;
        const applyWatchLaterButtonProgress = () => {};
        const fetchYoutubeChannelVideosPage = async () => ({videos:[], continuation:''});
        ${definition}
        openVideoSeries(seriesCatalog()[0]);
      ` });
      await page.waitForFunction(() => document.querySelector('.seriesEpisodeList').getAttribute('aria-busy') === 'false');
      const measure = () => {
        const list = document.querySelector('.seriesEpisodeList');
        const rows = [...list.children].map(row => row.getBoundingClientRect().height);
        const close = document.querySelector('.seriesToolbar button').getBoundingClientRect();
        return { minRow: Math.min(...rows), scrollHeight:list.scrollHeight, height:list.clientHeight, closeTop:close.top, closeBottom:close.bottom };
      };
      const before = await page.evaluate(measure);
      assert.ok(before.minRow >= 90, JSON.stringify({width, ...before}));
      assert.ok(before.scrollHeight > before.height * 10);
      await page.evaluate(() => { const list = document.querySelector('.seriesEpisodeList'); list.scrollTop = list.scrollHeight; });
      const after = await page.evaluate(measure);
      assert.equal(after.closeTop, before.closeTop);
      assert.ok(after.closeTop >= 0 && after.closeBottom <= 850);
      console.log(JSON.stringify({width, ...after}));
      await page.close();
    }
  } finally { await browser.close(); }
})();
