const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFile, mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

(async () => {
  const server = createServer(async (req, res) => {
    if (['/web-feed-cache.js', '/sync-schema.js'].includes(req.url)) {
      res.setHeader('Content-Type', 'text/javascript');
      res.end(await readFile(join(__dirname, '../public', req.url.slice(1))));
    } else res.end('<!doctype html><title>Feed cache test</title>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const profile = await mkdtemp(join(tmpdir(), 'shelf-cache-test-'));
  let context;
  const launch = () => chromium.launchPersistentContext(profile, {
    headless: true, ...(process.env.CAPTURE_BROWSER ? { executablePath: process.env.CAPTURE_BROWSER } : {})
  });
  try {
    context = await launch();
    let page = await context.newPage();
    await page.goto(url);
    const first = await page.evaluate(async () => {
      const { createConfigurationStore } = await import('/web-feed-cache.js');
      const writes = [];
      const remote = { channels: [{ id: 'a', title: 'Original' }], updatedAt: '2026-09-07' };
      const store = createConfigurationStore({ isWeb: true,
        readConfiguration: async () => remote,
        writeConfiguration: async (_, value) => writes.push(value)
      }, 'config');
      const value = await store.read();
      const channel = { ...value.channels[0], feedVideos: [{ id: 'v', title: 'Cached' }],
        feedCheckedAt: new Date().toISOString() };
      await store.rememberChannels([channel]);
      await store.write({ ...value, channels: [channel] });
      const refreshWrites = writes.length;
      await store.write({ ...value, channels: [channel], favorites: { v: { title: 'Saved' } } });
      return { refreshWrites, writes };
    });
    assert.equal(first.refreshWrites, 0, 'Feed-only refresh must not upload configuration');
    assert.equal(first.writes.length, 1);
    assert.equal(first.writes[0].channels[0].feedVideos, undefined);
    assert.equal(first.writes[0].favorites.v.title, 'Saved');
    await context.close();
    context = await launch();
    page = await context.newPage();
    await page.goto(url);
    const reopened = await page.evaluate(async () => {
      const { createConfigurationStore, createWebFeedCache } = await import('/web-feed-cache.js');
      const cache = createWebFeedCache();
      const store = createConfigurationStore({ isWeb: true,
        readConfiguration: async () => ({ channels: [{ id: 'a', title: 'Renamed remotely' }, { id: 'b' }] })
      }, 'config', cache);
      const restored = await store.read();
      // A completed channel survives interruption before the batch save.
      await store.rememberChannels([{ id: 'b', feedVideos: [], feedCheckedAt: '2026-09-07' }]);
      const partial = await cache.restore({ channels: [{ id: 'b' }] });
      const removed = await cache.restore({ channels: [{ id: 'a' }] });
      let authenticatedReadFailed = false;
      try {
        await createConfigurationStore({ isWeb: true,
          readConfiguration: async () => { throw new Error('401'); }
        }, 'config', cache).read();
      } catch { authenticatedReadFailed = true; }
      return { restored, partial, removed, authenticatedReadFailed };
    });
    assert.equal(reopened.restored.channels[0].feedVideos[0].id, 'v');
    assert.equal(reopened.restored.channels[0].title, 'Renamed remotely');
    assert.ok(reopened.restored.channels[0].feedCheckedAt);
    assert.equal(reopened.restored.channels[1].feedVideos, undefined);
    assert.deepEqual(reopened.partial.channels[0].feedVideos, []);
    assert.equal(reopened.removed.channels[0].feedVideos, undefined);
    assert.equal(reopened.authenticatedReadFailed, true);
    const failures = await page.evaluate(async () => {
      const { createConfigurationStore, createWebFeedCache } = await import('/web-feed-cache.js');
      let attempts = 0;
      const cache = createWebFeedCache({ databaseName: 'failure-test' });
      const store = createConfigurationStore({ isWeb: true,
        readConfiguration: async () => ({ channels: [] }),
        writeConfiguration: async () => { attempts++; if (attempts === 1) throw new Error('409'); }
      }, 'config', cache);
      await store.read();
      const changed = { channels: [], favorites: { v: true } };
      try { await store.write(changed); } catch {}
      await store.write(changed);
      const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'indexedDB');
      Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: undefined });
      let uncached;
      try {
        await cache.remember([{ id: 'a', feedVideos: [] }]);
        uncached = await cache.restore({ channels: [{ id: 'a' }] });
      } finally { Object.defineProperty(globalThis, 'indexedDB', descriptor); }
      let extensionValue;
      await createConfigurationStore({ isWeb: false,
        writeConfiguration: async (_, value) => { extensionValue = value; }
      }, 'config').write({ channels: [{ id: 'a', feedVideos: [] }] });
      return { attempts, uncached, extensionValue };
    });
    assert.equal(failures.attempts, 2, 'A failed remote write must remain retryable');
    assert.deepEqual(failures.uncached.channels, [{ id: 'a' }]);
    assert.deepEqual(failures.extensionValue.channels[0].feedVideos, []);
    console.log('Web feed cache: browser restart, partial saves, remote edits, pruning and authentication passed.');
  } finally {
    await context?.close();
    await new Promise(resolve => server.close(resolve));
    await rm(profile, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
