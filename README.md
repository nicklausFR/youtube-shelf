# YouTube Channel Shelf

Browser extension for managing a personal YouTube channel shelf from the side panel.

Current version: `1.2.1`.

## Main Features

- Add YouTube channels by drag and drop or by searching YouTube from the extension.
- Add and manage categories from the extension UI.
- Classify channels into categories.
- Show recent videos from the week in `New`.
- Browse each channel's latest RSS videos.
- Save videos to `Watch later`.
- Search channels and videos using titles, declared tags, keywords, topics, categories, and type metadata when available.
- Switch display between icon, multi-column, and single-column views.
- Zoom the channel/video list area locally.
- Hide YouTube comments and suggestion lists while the extension panel is active.
- Toggle a focused YouTube player view from the side panel toolbar.
- Open the official YouTube channel page when the RSS feed limit is reached.
- Import and export the extension configuration.

## Local Installation

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click `Load Temporary Add-on...`.
3. Select `manifest.json` from this repository folder.
4. Open YouTube and click the extension icon.

### Chromium-based Browsers

1. Open the browser extension management page.
2. Enable developer mode.
3. Load this repository folder as an unpacked extension.
4. Open YouTube and click the extension icon.

## Local Data

The extension stores channels, categories, watched state, and `Watch later` locally.

For development, `data/config.json` can be used as a private local configuration file. It is ignored by Git. If absent, the extension falls back to `data/config.default.json`.

## Development

No build step is required.

Useful checks:

```powershell
node --check public/app.js
node --check background.js
node --check youtube-live.js
```

## License

Copyright (C) 2026 nicklausFR

GPL-3.0-or-later. See `LICENSE`.
