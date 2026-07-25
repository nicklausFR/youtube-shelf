# YouTube Shelf

Browser extension for managing YouTube channels and favorite videos from the side panel.

Current version: `3.3.9`.

## Main Features

- Navigate channels, recent videos, favorites, and other views through tabs.
- Search YouTube in the detected query language while keeping original video titles, and add channels from the results.
- Save favorite videos, organize them into categories, group episodes or parts of a series in sequence (`1/X`, `2/X`, etc.), and use multiple selection for bulk actions.
- Translate the interface automatically into English or French, with locally editable translation catalogs.
- Add personal comments to favorite and `Watch later` videos.
- Organize channels into categories and browse their latest videos.
- Sort channels alphabetically, by latest-video date or subscriber count, and sort videos alphabetically, by publication date, view count, or date added.
- Automatically resume YouTube videos from their last locally saved position for up to seven days.
- Synchronize content between browsers through a WebDAV server such as Nextcloud.

## Local Installation

This extension currently targets Chrome-based browsers, such as Chrome, Brave, and Edge.

Firefox compatibility is planned for a later version.

### Chrome-based Browsers

1. Open the browser extension management page.
2. Enable developer mode.
3. Load this repository folder as an unpacked extension.

## Local Data

The extension stores channels, categories, watched state, `Watch later`, and video playback positions in browser local storage.

Use the extension import/export actions to back up or transfer your configuration.

### WebDAV synchronization

Open `Settings > WebDAV synchronization`, then enter the full URL of the synchronization file, your Nextcloud username, and a dedicated application password. The default file name is:

`youtube-shelf-synchronized-data.json`

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
