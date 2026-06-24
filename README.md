# YouTube Channel Shelf

Browser extension for managing a personal YouTube channel shelf from the side panel.

Current version: `1.1.0`.

## Main Features

- Add YouTube channels by drag and drop.
- Classify channels into categories.
- Show recent videos from the week in `New`.
- Browse each channel's latest RSS videos.
- Save videos to `Watch later`.
- Switch display between icon, multi-column, and single-column views.
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

Useful check:

```powershell
node --check public/app.js
```

## License

GPL-3.0-or-later. See `LICENSE`.
