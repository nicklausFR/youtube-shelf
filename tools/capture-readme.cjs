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
            favorites() { activeFavoriteCategoryId="music"; renderFavoritesHome(); },
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
    async function open(layout='columns', width=420, height=900, pageMode=false) {
      await page.setViewportSize({width,height});
      await page.goto(base+'/public/index.html?layout='+layout+(pageMode?'&mode=page':''));
      await page.locator('.newVideos .video').first().waitFor();
      await page.evaluate(()=>document.fonts.ready);
    }
    for (const layout of ['icons','columns','single','titles','compactTitles']) {
      await open(layout, layout === "columns" ? 720 : 420);
      const suffix=layout==='compactTitles'?'compact-titles':layout;
      await capture('youtube-shelf-panel-'+suffix+'.png');
    }
    await open('columns');
    await capture('youtube-shelf-current-weekly.png');
    await page.locator('[data-section="channels"]').click();
    await page.locator('.channel').first().waitFor();
    await capture('youtube-shelf-panel-channels.png');
    await capture('youtube-shelf-current-channels.png');
    await page.locator('[data-section="favorites"]').click();
    await page.evaluate(()=>readmeCapture.favorites());
    await page.locator('.video').first().waitFor();
    await capture('youtube-shelf-panel-favorites.png');
    await page.locator('[data-section="watchLater"]').click();
    await page.locator('.video').first().waitFor();
    await capture('youtube-shelf-panel-watch-later.png');
    await open('columns',1280,800,true);
    await capture('youtube-shelf-full-page.png');
    await open('columns',1080,700);
    await capture('youtube-shelf-wide.png');
    await open('columns',360,800);
    await capture('youtube-shelf-narrow.png');
    await page.setViewportSize({width:1920,height:900});
    await page.goto(base+'/__side-panel-context?panel=youtube-shelf-panel-single.png');
    await page.locator('.panel img').waitFor();
    await page.waitForFunction(()=>[...document.images].every(image=>image.complete));
    await capture('youtube-shelf-side-panel-context.png');
    await open('columns',660,650);
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
    console.log('All README display modes, sections and feature screenshots captured from production UI with fictional fixtures.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
