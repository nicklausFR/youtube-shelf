# Changelog

## 3.3.13 - 2026-07-25

- Added progressive YouTube-powered searches within channels, with immediate local title matches and duplicate-free result merging.
- Followed YouTube search continuations to return older matching videos instead of only the first result page.
- Added compact animated search dots and fixed stale channel-list messages while searching channel videos.
- Improved YouTube search reliability with service-worker transport, retries, and complete WEB client context.

## 3.3.12 - 2026-07-25

- Kept the video-list presentation controls visible when the extension is narrowed to a single-column layout.

## 3.3.11 - 2026-07-25

- Added a compact YouTube network-activity meter with request and transferred-data totals, including thumbnails.
- Added a configurable blank YouTube home, with context-menu actions to hide or restore the weekly channel view.
- Made the weekly channel button force a feed refresh and removed its video counter.
- Fixed opening videos after navigating from Favorites to a channel that is not yet in the shelf.
- Added a clear “Add to my channels” action for external channels.
- Moved list display controls above the active channel’s video list and refined their compact layout.

## 3.3.10 - 2026-07-25

- Replaced whole-snapshot winner selection with a three-way merge that preserves additions made on different devices.
- Added a per-device synchronization base so later additions, edits, and deletions can be reconciled safely.
- Prevented YouTube feed-cache refreshes from making stale synchronized content appear newer.
- Added the five previous remote snapshots to the synchronization file for recovery.

## 3.3.9 - 2026-07-25

- Fixed WebDAV synchronization through servers that reject conditional `PUT` requests.
- Kept concurrent-change detection by verifying the remote snapshot immediately before each write.

## 3.3.8 - 2026-07-25

- Fixed repeated WebDAV conflicts on servers that expose weak ETags.

## 3.3.7 - 2026-07-25

- Improved adaptive display behavior and scoped channel search.
- Made YouTube channel video loading and refreshes more resilient and configurable.
- Reorganized YouTube sniff and display options with clearer refresh controls.
- Fixed missing weekly videos when a channel's local feed cache is unavailable.

## 3.3.4 - 2026-07-23

- Added YouTube-native Popular and Latest ordering with continuation pagination for channel videos.
- Added date-added sorting to Favorites and Watch later.
- Displayed channel videos before loading optional metadata and avoided redundant metadata requests.

## 3.3.3 - 2026-07-23

- Localized sorting options and highlighted the active sort without check marks.
- Reworked category assignment as a compact, collapsible tree with aligned controls.

## 3.3.2 - 2026-07-23

- Made YouTube the default tab and moved the weekly subscribed-channel video list there.
- Added weekly-list zeroing, restoration, exclusion controls, and an accurate video counter.
- Added list-toolbar actions for creating channels and adding Favorite or Watch later videos.
- Removed the weekly list from Channels and moved Watch later to the final tab position.

## 3.3.1 - 2026-07-23

- Kept favorite subcategories visible independently from the main category overflow.
- Localized the subcategory section title and matched its justification to category rows.

## 3.3 - 2026-07-23

- Added collapsible favorite video groups with visible sequence positions and drag-and-drop reordering.
- Added multiple selection with `Ctrl`+click or a selection rectangle.
- Added bulk favorite deletion and bulk category assignment, including complete grouped-series drops.
- Fixed opening videos from expanded favorite groups and immediate list refresh after deletion.

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
