// Chromium MV3 service-worker entry point. Keep this revision synchronized
// with the manifest so every release changes the top-level worker itself.
const BACKGROUND_BUILD_REVISION = "3.3.26";
void BACKGROUND_BUILD_REVISION;

import "./public/platform-chromium.js";
import "./public/watch-history.js";
import "./background-core.js";
