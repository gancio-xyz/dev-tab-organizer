# Story 1.3: Prevent SPA Double-Rewrites (Flicker Guard)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer working on a React or Next.js SPA,
I want my tab title to maintain the port prefix correctly even as my app updates `document.title` on client-side navigation,
So that I never see a doubled prefix like `⚡ 3000 — ⚡ 3000 — My App` or stale labels.

## Acceptance Criteria

1. Given a tab displaying `⚡ 3000 — My App — Dashboard`, when the SPA navigates and sets `document.title` to `My App — Settings`, the resulting tab title is `⚡ 3000 — My App — Settings` (prefix cleanly re-applied).
2. The tab title never compounds into `⚡ 3000 — ⚡ 3000 — My App — Settings` under any circumstance.
3. Rapid successive SPA navigations (multiple `document.title` changes in quick succession) do not result in a stale or doubled prefix — the final title reflects the most recent page title with a clean prefix.
4. The guard behavior is covered by unit tests that simulate the full SPA title-change cycle.

## Tasks / Subtasks

- [ ] Audit `background.js` guard from Story 1.2 against all SPA edge cases (AC: 1, 2, 3)
  - [ ] Confirm guard is on `changeInfo.title`, NOT `tab.title` (stale field)
  - [ ] Confirm guard fires BEFORE `extractPort()` (fail fast — no wasted work)
  - [ ] Verify the guard character `⚡` (U+26A1) exactly matches the character used in `buildTitle()`
  - [ ] If any deviation found, correct `background.js` now
- [ ] Add `stripPrefix(title)` pure exported function to `background.js` (AC: 1, defensive)
  - [ ] Strips the `⚡ PORT — ` prefix from a title if present, returning just the original page title
  - [ ] If the title does NOT start with `⚡`, return it unchanged
  - [ ] Signature: `export function stripPrefix(title)` — pure, no Chrome API
  - [ ] This function is used inside `executeScript` to defensively unwrap any stale prefix before re-applying (prevents compounding if guard ever misses)
- [ ] Update `executeScript` injection function in `background.js` to use `stripPrefix` defensively (AC: 2)
  - [ ] Inside the injected function, strip any existing `⚡`-prefix from `document.title` before building the new title
  - [ ] This ensures that even if a race condition delivers a still-prefixed title to `executeScript`, the output is never compounded
  - [ ] Pass `stripPrefix` logic as inline code inside the `func` (since `executeScript` runs in page context, it cannot import from `background.js` — inline the stripping logic)
- [ ] Expand `tests/background.test.js` with SPA-specific test cases (AC: 4)
  - [ ] Test `stripPrefix()`: prefixed title → returns bare title
  - [ ] Test `stripPrefix()`: unprefixed title → returns unchanged
  - [ ] Test `stripPrefix()`: empty string → returns empty string
  - [ ] Test the full SPA cycle via `buildTitle` + `stripPrefix` composition:
    - Input: page currently shows `⚡ 3000 — My App — Dashboard` (SPA not yet navigated)
    - SPA sets bare title: `My App — Settings` (guard does NOT block — no `⚡`)
    - `buildTitle('3000', stripPrefix('My App — Settings'))` → `⚡ 3000 — My App — Settings` ✓
  - [ ] Test the guard-blocks scenario (our own `executeScript` firing onUpdated again):
    - `changeInfo.title = '⚡ 3000 — My App — Settings'` → guard fires → no further processing
    - Verify `buildTitle` is never called in this path
  - [ ] Run with `node --test tests/background.test.js` — zero failures
- [ ] Create a minimal local SPA test page for manual verification (AC: 1, 3)
  - [ ] Create `tests/spa-test.html` at project root — a simple HTML page that simulates SPA title changes
  - [ ] The page should: on load set a title, then on button click cycle through 3 different titles with a 500ms interval
  - [ ] Serve via `localhost:3000` (or any mapped port) and open in Chrome with extension loaded
  - [ ] Verify: tab shows correct prefix on each navigation, never doubles, no flicker beyond the brief transition window
- [ ] Manual verification sequence (AC: 1, 2, 3)
  - [ ] Reload extension after any code changes
  - [ ] Open `tests/spa-test.html` via a local server on `localhost:3000`
  - [ ] Observe tab title through 3+ navigations — must match `⚡ 3000 — {page title}` each time, cleanly
  - [ ] Check service worker console — no errors or warnings

## Dev Notes

### What Story 1.2 Already Did (Do Not Re-Implement)

Story 1.2 introduced the foundational guard in `background.js`:
```js
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  try {
    if (!changeInfo.title) return;
    if (changeInfo.title.startsWith('⚡')) return;  // ← THE GUARD
    const port = extractPort(tab.url);
    if (!port) return;
    await chrome.scripting.executeScript({ ... });
  } catch (_) {}
});
```
This guard already prevents the infinite loop and the double-prefix in the common case. **Do not remove or re-implement this logic** — Story 1.3 only adds the defensive `stripPrefix` layer inside `executeScript` for race-condition edge cases.

### Why `stripPrefix` Is Needed Inside `executeScript` (The Race Condition)

The guard on `changeInfo.title` is reliable for the common case. However, there is a subtle race condition under rapid SPA navigation:

1. SPA sets `document.title = "Page A"` → `onUpdated` fires → `executeScript` queued
2. SPA immediately sets `document.title = "Page B"` → `onUpdated` fires → `executeScript` queued
3. First `executeScript` runs against the NOW-CURRENT `document.title` which is already `"Page B"` → sets `"⚡ 3000 — Page B"` ✓
4. Second `executeScript` runs → `document.title` is NOW `"⚡ 3000 — Page B"` → without stripping: `"⚡ 3000 — ⚡ 3000 — Page B"` ✗

The `stripPrefix` call inside the `executeScript` function body handles step 4:

```js
// CORRECT — executeScript injection function with defensive strip
func: (port) => {
  const raw = document.title;
  // Strip any existing prefix defensively (race condition protection)
  const bare = raw.startsWith('⚡')
    ? raw.replace(/^⚡\s+\d+\s+—\s+/, '')
    : raw;
  document.title = bare ? `⚡ ${port} — ${bare}` : `⚡ ${port}`;
},
args: [port]
```

Note: The strip logic is **inlined** into the `func` body — it cannot call `stripPrefix` from `background.js` because `executeScript` runs in the page's JS context, not the service worker context. The `args` mechanism only passes serializable values (strings, numbers), not functions.

### `stripPrefix` Pure Function — For Tests Only

Export `stripPrefix` from `background.js` so it can be unit-tested in isolation:

```js
export function stripPrefix(title) {
  if (!title || !title.startsWith('⚡')) return title;
  // Pattern: "⚡ PORT — TITLE" — strip the prefix up to and including " — "
  return title.replace(/^⚡\s+\d+\s+—\s+/, '');
}
```

This is the exported testable version. The inline version inside `executeScript.func` must be copied from this logic (since it cannot import it).

### SPA Test Page

Create `tests/spa-test.html` to enable reproducible manual testing without needing a real SPA framework:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SPA Flicker Test — Page 1</title>
</head>
<body>
  <h1 id="page-label">Page 1</h1>
  <button onclick="navigate()">Navigate to next page</button>
  <p>Current title: <code id="title-display"></code></p>
  <script>
    const pages = ['SPA Test — Page 1', 'SPA Test — Page 2', 'SPA Test — Page 3'];
    let current = 0;

    function navigate() {
      current = (current + 1) % pages.length;
      document.title = pages[current];
      document.getElementById('page-label').textContent = pages[current];
      document.getElementById('title-display').textContent = document.title;
    }

    document.getElementById('title-display').textContent = document.title;
  </script>
</body>
</html>
```

Serve this with any static server on port 3000 (e.g., `python3 -m http.server 3000` from the project root or `tests/` directory). Then open `http://localhost:3000/tests/spa-test.html` in Chrome with the extension loaded.

**What to verify:**
1. On load: tab shows `⚡ 3000 — SPA Flicker Test — Page 1`
2. Click "Navigate": tab transitions to `⚡ 3000 — SPA Test — Page 2` (brief flash of unprefixed title is acceptable — must resolve within 100ms)
3. Click again: `⚡ 3000 — SPA Test — Page 3` — no doubling
4. Keep clicking rapidly — never see `⚡ 3000 — ⚡ 3000 — ...`

### Guard Character Consistency Verification

The guard, `buildTitle`, and `stripPrefix` all depend on the exact character `⚡` (U+26A1). A common mistake is copy-pasting a visually similar character. Verify in Node REPL:

```js
> '⚡ 3000 — Test'.startsWith('⚡')
true
> '⚡ 3000 — Test'.codePointAt(0).toString(16)
'26a1'   // must be 26a1, not anything else
```

If the guard returns `false` for a title that clearly starts with `⚡`, there is a character mismatch — check the codepoint.

### Previous Story Context (Stories 1.1 & 1.2)

- Story 1.1: Scaffold — all 5 source files exist, extension loads cleanly
- Story 1.2: Real `onUpdated` listener + `extractPort` + `buildTitle` pure functions exported, guard (`changeInfo.title.startsWith('⚡')`) already in place
- `tests/background.test.js`: already has tests for `extractPort` and `buildTitle` from Story 1.2 — this story ADDS to those tests, does not replace them

### Files Touched

Only `background.js` and `tests/background.test.js` are modified. A new file `tests/spa-test.html` is created. No other files change.

### References

- Architecture: SPA double-prefix guard pattern (`tab.title.startsWith('⚡')`) [Source: `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`]
- Architecture: race condition on rapid tab/title changes — cross-cutting concern [Source: `_bmad-output/planning-artifacts/architecture.md#Cross-Cutting Concerns Identified`]
- Architecture: `executeScript` args pattern (serializable values only, no function references) [Source: `_bmad-output/planning-artifacts/architecture.md#Gap Analysis & Resolutions` — Gap 3]
- Architecture: title prefix exact format `⚡ PORT — NAME` [Source: `_bmad-output/planning-artifacts/architecture.md#Naming Patterns`]
- Epics: Story 1.3 ACs, E-FR4 (SPA prefix guard — no loops, no flicker) [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.3`]
- PRD FRs covered: FR8 (re-apply prefix after SPA title mutation), FR9 (no visible flicker on rapid SPA navigation) [Source: `_bmad-output/planning-artifacts/epics.md#Epic 1 FR Coverage Map`]

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_None yet_

### Completion Notes List

_To be filled by dev agent after implementation_

### File List

_Files created/modified by dev agent:_

- `background.js` (modify — add `stripPrefix` export + update `executeScript` func body with inline strip)
- `tests/background.test.js` (modify — add SPA cycle tests and `stripPrefix` unit tests)
- `tests/spa-test.html` (create — manual SPA simulation test page)
