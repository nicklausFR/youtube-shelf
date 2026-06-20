# YouTube Channel Shelf

YouTube Channel Shelf is a Chrome Manifest V3 extension for keeping a personal shelf of YouTube channels, organizing them by category, and browsing their latest videos from a focused side-panel interface.

Public repository: <https://github.com/nicklausFR/youtube-channel-shelf>

## Status

Current version: `1.0.0`.

This version is functional and ready for public source release. Dedicated `New videos` management is not implemented yet and is planned for a later version.

## Features

- Organize YouTube channels with editable categories.
- Browse channels as icons, multi-column cards, or a single-column list.
- Open a channel and browse its latest RSS feed videos.
- Switch video results between wide columns, dense columns, and one-column cards.
- Search across channels, channel metadata, category names, and loaded video titles.
- Search inside the selected channel's loaded videos.
- Save videos to `Watch later`.
- Mark watched videos and remove watched `Watch later` entries.
- Import and export the extension configuration.
- Import subscriptions from YouTube-style or FreeTube-style exports.
- Keep local personal data outside the public repository.

## Not Included Yet

- Dedicated `New videos` category and new-video workflow.
- Cloud sync beyond Chrome extension storage/local files.
- Store packaging automation.

## Local Installation

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select this repository folder.
5. Open YouTube or the extension side panel.

## Data And Privacy

This repository is prepared for public release and does not include personal subscriptions.

Tracked public files:

- `data/config.default.json`: default public configuration.
- `public/subscriptions.example.json`: empty example subscription file.

Ignored local personal files:

- `data/config.json`
- `public/subscriptions.json`
- exported/imported local data files matching `.gitignore`

At runtime, the extension tries to load `data/config.json` first. If it does not exist, it falls back to `data/config.default.json`.

## Development Notes

The extension is plain JavaScript, HTML, and CSS. There is no build step.

Useful checks:

```powershell
node --check public/app.js
node --check public/data-popup.js
node --check background.js
node --check youtube-page.js
node --check youtube-live.js
```

JSON files can be validated with:

```powershell
@'
const fs = require('fs');
for (const file of ['manifest.json', 'data/config.default.json', 'public/subscriptions.example.json']) {
  JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(file + ' OK');
}
'@ | node -
```

## Repository Safety

Before publishing or pushing:

```powershell
git status --short --ignored
```

Make sure personal files such as `data/config.json` and `public/subscriptions.json` are ignored and not staged.

## License

Copyright (C) 2026 nicklausFR

This project is free software distributed under the GNU General Public License, version 3 or later. See `LICENSE`.
