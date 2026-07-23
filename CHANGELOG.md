# Changelog

## 3.1 - 2026-07-23

- Added additive Nextcloud bookmark imports for categorized YouTube favorites.
- Separated favorite subcategories into a dedicated section and added persistent drag-and-drop ordering.
- Added title-only and compact thumbnail-and-title video display modes.
- Added an animated indicator in the YouTube results area while searching.
- Improved category zoom icons and favorite/Watch later presentation.

## 3.0.1 - 2026-07-21

- Reorganized the interface around tabs.
- Added YouTube search management.
- Added categorized video favorites.
- Renamed the extension to YouTube Shelf.

## 2.2 - 2026-07-18

- Corrections uniquement.

## 2.1 - 2026-07-17

- Added NewPipe-compatible JSON subscription export without groups.
- Added an experimental NewPipe-style Innertube channel-video pagination module and live probe.
- Added selectable hybrid, Innertube-only, and RSS-only channel video sources.
- Added in-extension channel pagination with a `Load more videos` card and RSS fallback in hybrid mode.
- Grouped metadata sniffing and channel video source settings in a dedicated `YouTube data options` dialog.
- Added an MV3 header rule so YouTube accepts extension requests to YouTube endpoints.
- Restricted shelf search to channel names, identifiers, categories, tags, and descriptions.
- Added automatic exhaustive search in the selected channel by traversing its complete Innertube video pagination and filtering the available video metadata locally.
- Made channel names on video cards open that channel's video list inside the extension.
- Kept watched videos in `This week`; the view now strictly represents the last seven days instead of hiding videos after channel activity.
- Made category chips on the selected channel navigate to that category's channel list; right-click still edits classification.
- Added bidirectional WebDAV synchronization with Nextcloud-compatible application-password authentication.
- Added newest-revision reconciliation, delayed writes, periodic remote checks, and conditional ETag updates.
- Added WebDAV connection testing and local credential removal on disconnect.
- Restricted synchronized data to channels, categories, seen videos, and Watch later; appearance preferences remain local.
- Reserved synchronization-file history metadata for future restore points.

## 2.0.1 - 2026-07-02

- Added the ability to exclude specific channels from `New videos`.
- Added a `New videos` exclusion manager so excluded channels can be restored later.

## 1.1.0 - 2026-06-24

- Added the automatic `New videos` workflow and video list rendering.
- Added shared responsive icon/list display behavior for channel lists, `New videos`, and `Watch later`.
- Added a separator between search/category controls and the channel or hosted video list.
- Added empty-area context menu support for adding a channel.
- Added channel context action to open the official YouTube channel page.
- Added an RSS feed limit card linking to the official YouTube channel page.
- Improved `Watch later` and `New videos` card layout stability.

## 1.0.0 - 2026-06-21

- Released the first functional version of the extension.
- Prepared the public Git repository, now named `nicklausFR/youtube-shelf`.
- Added README, GPL notice, changelog, and ignore rules.
- Removed personal subscriptions and local watch history from distributed data.
- Split public default data from ignored local personal data.
- Added responsive channel-list and video-list display modes.
- Added channel/category search, internal shelf navigation history, Watch later handling, and import/export helpers.
- Not yet included: dedicated `New videos` management.
