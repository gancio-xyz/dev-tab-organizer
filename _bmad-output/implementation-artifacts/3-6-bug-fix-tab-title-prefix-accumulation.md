# Story 3.6: Fix Tab Title Prefix Accumulation

**Status:** ready-for-dev

## Description
As a developer using the extension,
I want my tab titles to have exactly one `⚡ [port]` prefix,
even if the page title is dynamically updated or I change the port mapping,
so that the tab bar remains readable.

## Context
A bug exists where the prefix is prepended repeatedly if the existing title does not exactly match the separator pattern (e.g., `⚡ 3000` becomes `⚡ 3000 — ⚡ 3000`). This happens because the current regex in `background.js` expects a ` — ` separator which may be missing in short titles.

## Acceptance Criteria
- [ ] Tab titles never contain more than one `⚡` emoji or port number.
- [ ] The `stripPrefix` function (and equivalent regex in `executeScript`) correctly identifies valid prefixes even without a dash separator.
- [ ] Dynamic title updates by SPAs do not result in prefix doubling.
- [ ] Changing a port mapping in the popup correctly replaces the old prefix with the new one.

## Technical Notes
- Update the regex in `background.js` and `popup.js` (if applicable) to be more robust: `/^⚡\s+\d+\s*(?:—\s*)?/`.
- Ensure `bare` title extraction handles cases both with and without the separator.
