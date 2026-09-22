// Chromium entry point.
// Keep the version on every imported worker resource. Chromium can retain an
// importScripts response when the unpacked extension is reloaded while the
// top-level worker changes little or not at all.
importScripts(
  "public/platform-chromium.js?v=3.3.23",
  "public/watch-history.js?v=3.3.23",
  "background-core.js?v=3.3.23"
);
