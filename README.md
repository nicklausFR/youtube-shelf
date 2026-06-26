# YouTube Channel Shelf

Browser extension for managing a personal YouTube channel shelf from the side panel.

Current version: `1.2.3`.

## Main Features

- Add YouTube channels by drag and drop or by searching YouTube from the extension.
- Add and manage categories from the extension UI.
- Classify channels into categories.
- Show recent videos from the week in `New`.
- Browse each channel's latest RSS videos.
- Save videos to `Watch later`.
- Search channels and videos using titles, declared tags, keywords, topics, categories, and type metadata when available.
- Switch display between icon, multi-column, and single-column views, with separate local preferences per list context.
- Zoom the channel/video list area locally.
- Hide YouTube comments and suggestion lists while the extension panel is active.
- Toggle a focused YouTube player view from the side panel toolbar.
- Open the official YouTube channel page when the RSS feed limit is reached.
- Import and export the extension configuration.

## Local Installation

This extension currently targets Chrome-based browsers, such as Chrome, Brave, and Edge.

Firefox compatibility is planned for a later version.

### Chrome-based Browsers

1. Open the browser extension management page.
2. Enable developer mode.
3. Load this repository folder as an unpacked extension.
4. Open YouTube and click the extension icon.

## Local Data

The extension stores channels, categories, watched state, and `Watch later` in browser local storage.

No personal configuration file is committed to Git. Use the extension import/export actions to back up or transfer your configuration.

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
