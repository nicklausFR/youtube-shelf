import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync('youtube-live.js', 'utf8');
const prefix = source.slice(0, source.indexOf('const COMMENTS_MODE_KEY'));
const timers = new Map();
let next = 0, calls = 0, version = '1';
const listeners = new Set();
const event = { addListener(fn) { listeners.add(fn); }, removeListener(fn) { listeners.delete(fn); } };
const target = new EventTarget();
const ctx = vm.createContext({
 chrome: { runtime: { id: 'extension', getManifest: () => ({version}) } },
 window: {
  setInterval(fn) { timers.set(++next, fn); return next; }, clearInterval(id) { timers.delete(id); },
  setTimeout(fn) { timers.set(++next, fn); return next; }, clearTimeout(id) { timers.delete(id); }
 }, event, target, record() { calls++; }, stopTrackingVideo() {}, hideFullscreenEscapeHint() {}
});
const install = () => vm.runInContext(prefix + '\nliveInterval(record, 1000); liveChromeListener(event, record); liveListener(target, "test", record); liveTimeout(record, 100); })();', ctx);
install();
const oldCallbacks = [...timers.values(), ...listeners];
assert.equal(timers.size, 2); assert.equal(listeners.size, 1);
install(); assert.equal(timers.size, 2); assert.equal(listeners.size, 1);
version = '2'; install();
assert.equal(timers.size, 2); assert.equal(listeners.size, 1);
for (const fn of oldCallbacks) fn();
assert.equal(calls, 0, 'Queued callbacks from a replaced version must do nothing');
target.dispatchEvent(new Event('test')); assert.equal(calls, 1, 'Only one DOM listener survives replacement');
ctx.chrome.runtime.id = undefined;
for (const fn of [...timers.values()]) fn();
assert.equal(timers.size, 0); assert.equal(listeners.size, 0);
target.dispatchEvent(new Event('test')); assert.equal(calls, 1);
assert.ok(!source.includes('liveInterval(applyDisplayOptions'));
console.log('Live lifecycle: idempotent injection, version replacement, queued callbacks and invalidation cleanup passed.');
