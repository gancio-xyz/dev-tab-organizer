# Story 3.5: Fix Duplicate Items in Popup Menu

**Status:** ready-for-dev

## Description
As a developer using the extension popup,
I want to see exactly one entry per active localhost port in the menu,
even after I have made multiple title changes,
so that the UI remains clean and usable.

## Context
Users have reported that the extension main menu (popup) shows duplicated items after a change is made in the title text field. Initially, it's one duplicate, but it grows with each change.

## Acceptance Criteria
- [ ] Opening the popup displays exactly one row per unique localhost tab/port combo.
- [ ] Changing a port name inline and blurring/pressing Enter does not cause additional rows to appear in the list.
- [ ] Subsequent opens of the popup show a stable list without duplication.
- [ ] The "empty state" is correctly shown if all tabs are closed, even after previous duplications occurred.

## Technical Notes
- Investigate `renderTabList` in `popup.js`.
- Ensure `list.innerHTML` overwrite is working correctly and not somehow appending.
- Check if `init()` is being called multiple times or if `tabs.query` returns redundant results.
