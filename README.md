# YouTube Channel Shelf

Browser extension for managing a personal YouTube channel shelf from the side panel.

Current version: `2.2`.

## Main Features

- Add YouTube channels by drag and drop or by searching YouTube from the extension.
- Add, rename, and manage categories from the extension UI.
- Classify channels into categories with context menus or drag and drop.
- Show recent videos from the week in `This week`.
- Browse each channel's latest RSS videos.
- Save videos to `Watch later`.
- Search channels and videos using titles, declared tags, keywords, topics, categories, and type metadata when available.
- Switch display between icon, multi-column, and single-column views, with separate local preferences per list context.
- Zoom the channel/video list area locally.
- Hide YouTube comments and suggestion lists while the extension panel is active.
- Toggle a focused YouTube player view from the side panel toolbar.
- Synchronize configuration data bidirectionally with a WebDAV server such as Nextcloud.

## Local Installation

This extension currently targets Chrome-based browsers, such as Chrome, Brave, and Edge.

Firefox compatibility is planned for a later version.

### Chrome-based Browsers

1. Open the browser extension management page.
2. Enable developer mode.
3. Load this repository folder as an unpacked extension.

## Local Data

The extension stores channels, categories, watched state, and `Watch later` in browser local storage.

Use the extension import/export actions to back up or transfer your configuration.

### WebDAV synchronization

Open `Settings > WebDAV synchronization`, then enter the full URL of the synchronization file, your Nextcloud username, and a dedicated application password. The default file name is:

`youtube-channel-shelf-synchronized-data.json`

Use `Test connection` before enabling synchronization. The browser asks for access only to the WebDAV server origin. Credentials remain in the extension's local browser storage and are never included in the synchronized file or exports. `Disconnect` forgets the application password.

Only content data is synchronized: categories, channels, seen videos, and `Watch later`. Appearance, layout, zoom, display preferences, and regenerable YouTube feed caches remain local to each browser. Seen-video entries are reduced to their identifier, date, channel, and title to keep the WebDAV file small.

The newest configuration wins, using its update timestamp, revision, and device identifier. Local changes are grouped for 10 seconds to reduce network traffic. Conditional WebDAV writes use ETags to avoid overwriting a file changed by another browser during synchronization.

Synchronization runs while the extension panel is open and checks for remote changes every 60 seconds. WebDAV requests stop with an explicit error if the server does not respond within 15 seconds.

The file format reserves a `history` collection for future restore points. Version history and rollback controls are not implemented yet.

## Development

No build step is required.

## License

Copyright (C) 2026 nicklausFR

GPL-3.0-or-later. See `LICENSE`.
