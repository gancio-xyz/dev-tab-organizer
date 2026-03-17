# Story 3.7: Fix Initial Name Resolution on Load

**Status:** ready-for-dev

## Description
As a developer opening a localhost tab,
I want the tab title to include the resolved service name (e.g., "React") immediately,
even if I haven't manually edited the mapping in the popup,
so that the extension provides immediate value from the default port map.

## Context
Alessandro reported that on initial page load (e.g., `localhost:3000`), the title only shows `⚡ 3000 — [Title]`. The word "React" only appears after a change is made in the extension menu. This is because the `onUpdated` listener in `background.js` does not currently resolve the port name for the initial rewrite.

## Acceptance Criteria
- [ ] Newly opened localhost tabs immediately display the resolved service name from the default port map (e.g., `⚡ 3000 — React — My App`).
- [ ] The resolution logic correctly accounts for both `DEFAULT_PORT_MAP` and any custom overrides in `chrome.storage.sync`.
- [ ] SPA title updates also preserve/re-resolve the service name correctly.

## Technical Notes
- Refactor `chrome.tabs.onUpdated` in `background.js` to call `resolvePortName` and `buildTitle`.
- Ensure storage is queried to fetch custom mappings before renaming.
