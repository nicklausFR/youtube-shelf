import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync('background.js', 'utf8');
const start = source.indexOf('const panelPresenceSessions');
const end = source.indexOf('const THUMBNAIL_URLS', start);
let connect;
const states = [];
const context = vm.createContext({
  PANEL_OPEN_KEY: 'open', PANEL_HEARTBEAT_KEY: 'heartbeat',
  chrome: { runtime: { onConnect: { addListener(fn) { connect = fn; } } },
    storage: { local: { async set(value) { states.push(value.open); } } } }
});
vm.runInContext(source.slice(start, end), context);
function port() {
 const p = { name: 'youtube-shelf-presence', onMessage: { addListener(fn) { p.message = fn; } }, onDisconnect: { addListener(fn) { p.disconnect = fn; } } };
 connect(p); return p;
}
async function flush() { await vm.runInContext('panelPresenceWrites', context); }
const fullPage = port(); fullPage.message({ open: true }); await flush();
const hidden = port();
for (let i = 0; i < 10; i++) hidden.message({ open: false });
await flush(); assert.deepEqual(states, [true]);
hidden.disconnect(); await flush(); assert.equal(states.at(-1), true);
const panel = port(); panel.message({ open: true }); await flush();
fullPage.disconnect(); await flush(); assert.equal(states.at(-1), true);
panel.message({ open: false }); await flush(); assert.equal(states.at(-1), false);
panel.message({ open: true }); panel.disconnect(); await flush(); assert.equal(states.at(-1), false);
const live = readFileSync('youtube-live.js', 'utf8');
const fnStart = live.indexOf('function isPanelActuallyVisible()');
const fnEnd = live.indexOf('function focusFullscreenKeyboardTarget()', fnStart);
const classes = new Map();
const display = vm.createContext({
 chrome: { runtime: { id: 'extension' } }, panelOpen: true, panelHeartbeat: 1,
 shelfFullscreenActive: false, commentsModeEnabled: true, suggestionsModeEnabled: true, focusPlayerModeEnabled: true,
 document: { documentElement: { classList: { toggle(key, value) { classes.set(key, value); } } } }
});
display.liveActive = () => Boolean(display.chrome.runtime.id);
vm.runInContext(live.slice(fnStart, fnEnd), display);
display.applyDisplayOptions();
assert.equal(classes.get('yt-companion-focus-player'), true, 'An old heartbeat cannot expire an open session');
display.chrome.runtime.id = undefined;
display.panelOpen = false;
display.applyDisplayOptions();
assert.equal(classes.get('yt-companion-focus-player'), true, 'Invalidated old script must not mutate the new display');
display.chrome.runtime.id = 'extension';
display.applyDisplayOptions();
assert.equal(classes.get('yt-companion-focus-player'), false, 'Closing the final session restores normal display');
console.log('Display presence: multiple views, hidden views, disconnects, delayed timers and invalidated update context passed.');
