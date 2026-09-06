const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const { readFileSync, mkdirSync } = require('node:fs');
const { resolve } = require('node:path');
const root = resolve(__dirname, '..');
const base = 'http://127.0.0.1:4173';
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CAPTURE_BROWSER ? { executablePath: process.env.CAPTURE_BROWSER } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 480, height: 850 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', async route => {
      const url = route.request().url();
      if (!url.startsWith(base + '/')) return route.abort();
      if (url === base + '/public/youtube-channel-videos.js') return route.fulfill({contentType:'text/javascript',body:'export async function fetchYoutubeChannelVideosPage(){return {videos:[],continuation:""}}; export async function fetchYoutubePlaylistPage(){return {videos:globalThis.__readmeEpisodes || [],continuation:""}};'});
      if (url === base + '/public/app.js') {
        const hooks = `
          globalThis.readmeCapture = {
            series() {
              const thumb = allChannels[0].thumbnail;
              globalThis.__readmeEpisodes = [1,2,3].map(n => ({id:'demopart00'+n, title:'Building a Workshop Table | Part '+n, playlistIndex:n, thumbnail:thumb}));
              openVideoSeries({id:'demopart001',playlistId:'PL_DEMO',playlistTitle:'Building a Workshop Table'});
            },
            account() {
              youtubeAccountState={connected:true,accountTitle:'YouTube',trackingEnabled:false,history:[]};
              youtubeSubscriptionsLoaded=true;
              currentYoutubeSubscriptions=[allChannels[0],{id:'UC_DEMO_YOUTUBE',title:'Design Notebook',thumbnail:allChannels[1].thumbnail}];
              openYoutubeAccountDialog();
            }
          };
        `;
        return route.fulfill({ contentType:'text/javascript', body:readFileSync(resolve(root,'public/app.js'),'utf8')+hooks });
      }
      return route.continue();
    });
    const out=resolve(root,'docs/screenshots');mkdirSync(out,{recursive:true});
    const capture=async(name)=>page.screenshot({path:resolve(out,name),animations:'disabled'});
    await page.goto(base+'/public/index.html?layout=single');
    await page.locator('.newVideos .video').first().waitFor();
    await capture('youtube-shelf-current-weekly.png');
    await page.locator('[data-section="channels"]').click();
    await page.locator('.channel').first().waitFor();
    await capture('youtube-shelf-current-channels.png');
    await page.setViewportSize({width:1080,height:760});
    await page.goto(base+'/public/index.html?layout=columns');
    await page.locator('.newVideos .video').first().waitFor();
    await page.setViewportSize({width:660,height:650});
    await page.evaluate(()=>readmeCapture.series());
    await page.locator('.seriesEpisodeList li').nth(2).waitFor();
    await page.waitForFunction(()=>document.querySelector('.seriesEpisodeList').getAttribute('aria-busy')==='false');
    await capture('youtube-shelf-current-series.png');
    await page.locator('.videoSeriesDialog').evaluate(dialog=>dialog.close());
    await page.setViewportSize({width:780,height:620});
    await page.evaluate(()=>readmeCapture.account());
    await page.locator('.youtubeAccountTable').waitFor();
    await capture('youtube-shelf-current-account.png');
    if(errors.length) throw new Error(errors.join('\n'));
    console.log('Four README screenshots captured from production UI with fictional fixtures.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
