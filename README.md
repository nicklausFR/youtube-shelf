# YouTube Shelf

<p align="center">
  <img src="icons/icon-128.png" width="96" height="96" alt="YouTube Shelf icon">
</p>

<p align="center">
  English and French · GPL-3.0-or-later
</p>

YouTube Shelf brings channels, recent videos, favorites, and a watch-later list together in a compact interface with search, filtering, and sorting options. Channels and favorites can be organized into categories and subcategories, descriptions can be added, and videos can be grouped into series.

Currently only available for Chromium-based browsers, it opens in a side panel or a full-page view with adjustable layouts. Subscriptions can be copied in either direction between Shelf and a YouTube account. Data is stored locally, with optional WebDAV synchronization across multiple computers.

> All screenshots below show the current interface, using fictional channels, videos and placeholder thumbnails. The YouTube page in contextual captures is deliberately blurred.

## Side panel

The screenshot below shows the side panel at **420 px** width.

![YouTube Shelf displayed as a narrow side panel beside a blurred YouTube video](docs/screenshots/youtube-shelf-side-panel-context.png)

## Features

- Channel search and recent uploads filtered by week, channel, or category.
- Ordered categories and subcategories for channels and favorites.
- Favorites with notes, drag-and-drop grouping, and bulk category assignment or deletion.
- Separate `Watch later` list.
- Series and playlist discovery with numbered episode lists.
- Configurable display modes and sorting by name, date, subscribers, views, or date added.
- Local playback positions retained for up to seven days.
- YouTube page controls for hiding comments or suggestions.
- English and French interface translations.
- JSON backup and restore, FreeTube subscription import, and NewPipe subscription export.
- Optional WebDAV/Nextcloud synchronization.

## Interface

### Main sections

| YouTube / weekly uploads | Channels |
| --- | --- |
| <img src="docs/screenshots/youtube-shelf-current-weekly.png" alt="YouTube tab with weekly uploads, search and refresh"> | <img src="docs/screenshots/youtube-shelf-panel-channels.png" alt="Channels, categories and age badges"> |

| Favorites | Watch later |
| --- | --- |
| <img src="docs/screenshots/youtube-shelf-panel-favorites.png" alt="Favorites with categories, subcategories and personal notes"> | <img src="docs/screenshots/youtube-shelf-panel-watch-later.png" alt="Watch later with personal notes and video cards"> |

Favorites use ordered categories and subcategories.

Search, sorting, notes, bulk selection and drag-and-drop grouping complement these views. On YouTube, clicking the dimmed weekly label clears the search and returns to weekly uploads.

### Full-page workspace

The toolbar button switches between the browser side panel and a larger workspace. Video playback remains available inside full-page mode.

![YouTube Shelf full-page workspace](docs/screenshots/youtube-shelf-full-page.png)

### Video display modes

Each list can use thumbnails only, adaptive columns, a single column, titles only, or compact titles with small thumbnails. Layout and zoom can be adjusted independently for each section.

| Thumbnails | Adaptive columns |
| --- | --- |
| <img src="docs/screenshots/youtube-shelf-panel-icons.png" alt="Thumbnail-only video layout"> | <img src="docs/screenshots/youtube-shelf-panel-columns.png" alt="Adaptive-column video layout"> |

| Single column | Titles only |
| --- | --- |
| <img src="docs/screenshots/youtube-shelf-panel-single.png" alt="Single-column video layout"> | <img src="docs/screenshots/youtube-shelf-panel-titles.png" alt="Title-only video layout"> |

#### Compact titles with small thumbnails

![Compact video titles with small thumbnails](docs/screenshots/youtube-shelf-panel-compact-titles.png)

<details>
<summary>Series and playlist discovery</summary>

Right-click a video to search for related parts, then open its title badge to view numbered episodes.

<img src="docs/screenshots/youtube-shelf-current-series.png" width="600" alt="Series list with numbers over thumbnails">

</details>

### Responsive layouts

YouTube Shelf adapts from a narrow browser panel to a wide layout. The four icon tabs share a single toolbar row when space allows.

<p align="center">
  <img src="docs/screenshots/youtube-shelf-wide.png" width="62%" alt="YouTube Shelf wide split layout">
  <img src="docs/screenshots/youtube-shelf-narrow.png" width="28%" alt="YouTube Shelf narrow side-panel layout">
</p>

## Installation

The current target is Chromium (Brave, Chrome, Edge). Firefox support is not implemented.

The project is structured to allow future versions for other browsers or a web/PWA version.

1. Download or clone this repository.
2. Open the extension management page for your browser:
   - Brave: `brave://extensions`
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the repository folder containing `manifest.json`.
6. Pin YouTube Shelf if you want quick access, then click its toolbar icon to open the side panel.

Updates installed from this repository are manual: replace the files, then use **Reload** on the browser's extension management page.

## Usage

1. Open YouTube Shelf from the browser toolbar.
2. Search for a channel or paste a supported YouTube channel URL.
3. Add the channel and optionally assign one or more categories.
4. Open **YouTube** to browse recent videos.
5. Use the star action to save a video under **Favorites**, or add it to **Watch later**.
6. Configure display mode and sorting using the controls above each list.

YouTube fullscreen hides Shelf and restores it on exit; if the browser requires a gesture, the next page click restores it.

The back and forward buttons navigate within the extension. The expand button opens full-page mode; the adjacent focus control changes how much of the surrounding YouTube page remains visible.

## Data and interoperability

### Local storage

Channels, categories, favorites, watched state, `Watch later`, preferences, and recent playback positions are stored in the browser's local extension storage.

The import/export dialog can:

- create a complete YouTube Shelf JSON backup;
- restore or merge a YouTube Shelf backup;
- import subscriptions from FreeTube;
- export subscriptions in NewPipe-compatible JSON.

Keep exported backups private if they contain personal notes or viewing organization.

### YouTube account (optional)

The **YouTube account** dialog compares Shelf channels with subscriptions retrieved from the existing YouTube session. **Check subscriptions** loads YouTube channels progressively. Copy actions add one or all missing channels without removing the source; repeated additions are deduplicated. The context menu supports unsubscribing on YouTube or removing/classifying a Shelf channel. The extension does not access the YouTube password; optional history remains local.

<img src="docs/screenshots/youtube-shelf-current-account.png" width="680" alt="YouTube and Shelf subscription columns with copy arrows">

### WebDAV synchronization

Open **Settings → WebDAV synchronization**, then enter the full URL of the synchronization file, your Nextcloud username, and a dedicated application password. The default filename is:

```text
youtube-shelf-synchronized-data.json
```

Use **Test connection** before enabling synchronization. Credentials remain in the extension's local browser storage and are never included in synchronized data or exports. **Disconnect** removes the stored application password.

Synchronization includes content data—categories, channels, favorites, seen videos, and `Watch later`. Appearance, zoom, layout preferences, and regenerable YouTube feed caches remain local to each browser.

The newest configuration wins using its update timestamp, revision, and device identifier. Local changes are grouped for 10 seconds, remote changes are checked every 60 seconds while the panel is open, and conditional WebDAV writes use ETags to reduce overwrite conflicts.

## Privacy and permissions

YouTube Shelf has no analytics and no mandatory remote account. Its regular network access is limited to the resources needed to read YouTube pages, channel feeds, thumbnails, and release information. Reading account subscriptions uses the existing `youtube.com` website session only after an explicit action, and optional WebDAV access is requested only for the server origin chosen by the user.

The extension permissions are used to:

- store configuration and playback state locally;
- open and coordinate the side panel, full-page view, and YouTube tabs;
- adjust the YouTube page for focus and playback integration;
- add toolbar context-menu actions;
- access YouTube content and thumbnails;
- read account subscriptions from an explicitly opened, signed-in YouTube tab;
- check GitHub release metadata;
- connect to an explicitly configured HTTPS WebDAV server.

See [CHANGELOG.md](CHANGELOG.md) for release history.

## License

Copyright © 2026 nicklausFR

Licensed under [GPL-3.0-or-later](LICENSE).
