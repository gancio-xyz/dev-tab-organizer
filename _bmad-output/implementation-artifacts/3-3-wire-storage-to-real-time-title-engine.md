# Story 3.3: Wire Storage to Real-Time Title Engine

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a power-user who has just assigned a new alias to an active port,
I want the physical tab title in my browser to reflect my edit within moments of saving,
So that I don't have to manually refresh any tabs to see my changes.

## Acceptance Criteria

1. Given a user successfully updates a custom mapping in Story 3.2, when `chrome.storage.sync.set()` commits the change, then all matching open localhost tabs update their title to reflect the new mapping (e.g., `⚡ 3001 — Payment API`) within 100ms of the save action, without requiring any page reload.
2. Given a user clears a custom mapping (Story 3.2 deletes the key from storage), when `chrome.storage.sync.set()` commits, then the affected tab title reverts to the default port map name, or port-only format if no default exists (e.g., `⚡ 3001`), within 100ms.
3. Given the extension receives a storage change for any key other than `portMappings`, the `onChanged` handler exits without taking any action.

## Tasks / Subtasks

- [ ] Add `chrome.storage.onChanged` listener to `background.js` (AC: 1, 2, 3)
  - [ ] Register handler: `chrome.storage.onChanged.addListener(handleStorageChange)`
  - [ ] Guard: if `area !== 'sync'` → return immediately
  - [ ] Guard: if `!changes.portMappings` → return immediately (AC: 3)
  - [ ] Extract `newPortMappings` from `changes.portMappings.newValue ?? {}`
  - [ ] Query all open localhost tabs: `await chrome.tabs.query({ url: ['*://localhost/*', '*://127.0.0.1/*'] })`
  - [ ] For each tab: `extractPort(tab.url)` → if null, skip
  - [ ] For each tab with valid port: resolve new title with `buildTitle(port, resolvePortName(port, newPortMappings, DEFAULT_PORT_MAP))`
  - [ ] Call `chrome.scripting.executeScript` to set `document.title` (same injection pattern as `onUpdated` handler)
  - [ ] Wrap entire handler in `try/catch` — silent fail per NFR9
- [ ] Add unit tests in `tests/background.test.js` (AC: 1, 2, 3)
  - [ ] Test: `onChanged` updates title for matching port when `portMappings` changes
  - [ ] Test: `onChanged` reverts to default name when custom override is deleted (`newValue` is `{}`)
  - [ ] Test: `onChanged` does nothing when `area !== 'sync'`
  - [ ] Test: `onChanged` does nothing when `changes.portMappings` is absent
  - [ ] Run: `node --test tests/background.test.js` → zero failures
- [ ] Manual verification (AC: 1, 2)
  - [ ] Open localhost:3001 tab, open popup, type custom name "Payment API", press Enter → tab title changes to `⚡ 3001 — Payment API` within 100ms without page reload
  - [ ] Clear the custom name → press Enter → tab title reverts to default (e.g., `⚡ 3001 — Node / API`) within 100ms
  - [ ] Open `chrome://extensions` → Inspect service worker → confirm no console errors during storage change handling

## Dev Notes

### Critical Context: What Stories 3.1 & 3.2 Established

Story 3.1 and 3.2 are the prerequisite for this story. At implementation time, `background.js` will have:
- `import { DEFAULT_PORT_MAP } from './port-map.js';`
- `extractPort(url)` pure function — extracts port string from localhost URL, returns `null` for non-localhost
- `resolvePortName(port, userMappings, defaultMap)` pure function — returns custom name > default name > undefined
- `buildTitle(port, name)` pure function — returns `'⚡ PORT — NAME'` or `'⚡ PORT'` if name is falsy
- `chrome.tabs.onUpdated.addListener(...)` — the existing title-rewriting listener with double-prefix guard

`popup.js` (Story 3.2) writes storage as:
```js
await chrome.storage.sync.set({ portMappings: { "3001": "Payment API" } });
```

The `chrome.storage.onChanged` event fires in the background service worker automatically after this write.

### Implementing `handleStorageChange` — Exact Pattern

```js
// ADD to background.js — register alongside the onUpdated listener:

async function handleStorageChange(changes, area) {
  if (area !== 'sync') return;
  if (!changes.portMappings) return;

  const newPortMappings = changes.portMappings.newValue ?? {};

  try {
    const tabs = await chrome.tabs.query({
      url: ['*://localhost/*', '*://127.0.0.1/*']
    });

    for (const tab of tabs) {
      const port = extractPort(tab.url);
      if (!port) continue;

      const name = resolvePortName(port, newPortMappings, DEFAULT_PORT_MAP);
      const newTitle = buildTitle(port, name);

      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (title) => { document.title = title; },
          args: [newTitle]
        });
      } catch (_) {
        // Tab may have closed between query and inject — silent fail per NFR9
      }
    }
  } catch (_) {
    // Silent fail per NFR9
  }
}

chrome.storage.onChanged.addListener(handleStorageChange);
```

**Key differences from `onUpdated` handler:**
- NO double-prefix guard (`if (!tab.title.startsWith('⚡'))`) — we intentionally want to rewrite already-prefixed titles with the new name
- Inner `try/catch` per-tab to handle individual tab-close race conditions (NFR9)
- Outer `try/catch` covers the query itself
- `newValue ?? {}` — if the entire `portMappings` key was deleted, treat as empty object (falls back to defaults for all tabs)

### Why NOT to Check the Double-Prefix Guard Here

The `onUpdated` handler guards against SPA re-triggers by skipping if title already starts with `⚡`. The `onChanged` handler has the OPPOSITE requirement: it MUST rewrite even if the title starts with `⚡`, because the stored name has changed and the existing prefixed title is now stale.

After `executeScript` sets `document.title = '⚡ 3001 — Payment API'`, `chrome.tabs.onUpdated` will fire with this new title. The `onUpdated` guard (`!tab.title.startsWith('⚡')`) will see `⚡` and SKIP reinject. The loop terminates — no infinite loop.

### Registration Order in `background.js`

```js
// Correct order in background.js:
chrome.tabs.onUpdated.addListener(handleTabUpdated);   // existing
chrome.storage.onChanged.addListener(handleStorageChange);  // ADD this line

// Both listeners registered at module level (service worker startup)
```

### `changes.portMappings.newValue` Shape

```js
// When user SETS a custom name:
changes = {
  portMappings: {
    oldValue: { "3000": "My React App" },
    newValue: { "3000": "My React App", "3001": "Payment API" }
  }
}
// newValue contains ALL current custom overrides, not just the changed entry

// When user CLEARS a custom name (Story 3.2 deletes the key):
changes = {
  portMappings: {
    oldValue: { "3001": "Payment API" },
    newValue: {}   // or undefined if portMappings key was deleted entirely
  }
}
// Use ?? {} to handle undefined newValue
```

**CRITICAL:** `newValue` is always the FULL current state of `portMappings`, not just the diff. Use it directly with `resolvePortName` — no merging needed.

### Testing Pattern — Mock `chrome.storage.onChanged`

Tests mock the storage change by directly invoking the registered handler:

```js
// tests/background.test.js additions
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Extend existing chrome mock:
let onChangedCallback = null;
globalThis.chrome = {
  tabs: {
    onUpdated: { addListener: () => {} },
    query: async () => [
      { id: 1, url: 'http://localhost:3001/', title: '⚡ 3001 — Node / API' }
    ]
  },
  scripting: {
    executeScript: async ({ args }) => { lastInjectedTitle = args[0]; }
  },
  storage: {
    sync: {
      get: async () => ({ portMappings: {} }),
      set: async () => {}
    },
    onChanged: {
      addListener: (cb) => { onChangedCallback = cb; }
    }
  }
};

import '../background.js';  // registers listeners via side effect

let lastInjectedTitle = null;

test('onChanged: updates tab title when portMappings changes', async () => {
  lastInjectedTitle = null;
  await onChangedCallback(
    { portMappings: { oldValue: {}, newValue: { '3001': 'Payment API' } } },
    'sync'
  );
  assert.equal(lastInjectedTitle, '⚡ 3001 — Payment API');
});

test('onChanged: reverts to default when custom override deleted', async () => {
  lastInjectedTitle = null;
  await onChangedCallback(
    { portMappings: { oldValue: { '3001': 'Payment API' }, newValue: {} } },
    'sync'
  );
  assert.equal(lastInjectedTitle, '⚡ 3001 — Node / API');
});

test('onChanged: ignores non-sync area', async () => {
  lastInjectedTitle = null;
  await onChangedCallback(
    { portMappings: { oldValue: {}, newValue: { '3001': 'X' } } },
    'local'
  );
  assert.equal(lastInjectedTitle, null);
});

test('onChanged: ignores changes without portMappings key', async () => {
  lastInjectedTitle = null;
  await onChangedCallback({ isEnabled: { oldValue: true, newValue: false } }, 'sync');
  assert.equal(lastInjectedTitle, null);
});
```

Note: The `globalThis.chrome` mock must be set BEFORE `import '../background.js'` — use the same pattern established in the existing `background.test.js`.

### Architectural Constraints (MUST FOLLOW)

| Rule | Why |
|------|-----|
| Title rewriting ONLY via `chrome.scripting.executeScript` | Architecture decision — content script mutation explicitly rejected |
| Port numbers as **strings** throughout | `'3001'` not `3001` — Chrome URL parsing returns strings; storage keys are strings |
| Storage key is exactly `'portMappings'` | Any variant (`portMap`, `port_mappings`) breaks the `popup.js` ↔ `background.js` contract |
| `async/await` + `try/catch` (no callbacks, no `.then()`) | Architecture-mandated pattern — see Communication Patterns |
| Silent `catch` — no `console.error`, no rethrow | NFR9 — tab-close race conditions must never surface as errors |

### Files to Modify

| File | Change |
|------|--------|
| `background.js` | Add `handleStorageChange` function + `chrome.storage.onChanged.addListener(handleStorageChange)` |
| `tests/background.test.js` | Add 4 tests covering `onChanged` behavior |

**Do NOT touch:** `popup.js`, `popup.html`, `port-map.js`, `manifest.json` — this story is entirely within `background.js`.

### What Story 3.4 Will Add (Not This Story)

Story 3.4 adds an `isEnabled` flag to `chrome.storage.sync`. When `isEnabled = false`, the title engine should pause. Story 3.4 will ADD this check to BOTH the `onUpdated` handler AND the `handleStorageChange` handler. Do NOT pre-implement the `isEnabled` check in this story — it would create an untestable dependency on a not-yet-implemented feature.

### References

- Architecture: `chrome.storage.onChanged` is the correct MV3 API for cross-context reactive storage updates [Source: `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`]
- Architecture: `executeScript` is the ONLY permitted title rewriting method [Source: `_bmad-output/planning-artifacts/architecture.md#Cross-Cutting Concerns`]
- Architecture: silent `try/catch` pattern for tab-close race conditions [Source: `_bmad-output/planning-artifacts/architecture.md#Communication Patterns`]
- Architecture: storage key `portMappings` exact string [Source: `_bmad-output/planning-artifacts/architecture.md#Naming Patterns`]
- Architecture: port numbers as strings [Source: `_bmad-output/planning-artifacts/architecture.md#Format Patterns`]
- Architecture: pure functions `extractPort`, `resolvePortName`, `buildTitle` — defined in Gap 3 resolution [Source: `_bmad-output/planning-artifacts/architecture.md#Gap Analysis & Resolutions`]
- Epics: Story 3.3 AC — 100ms update, no page reload required [Source: `_bmad-output/planning-artifacts/epics.md#Story 3.3`]
- PRD FRs covered: FR18 (name changes reflected in tab title immediately) [Source: `_bmad-output/planning-artifacts/epics.md#Epic 3 FR Coverage Map`]
- Story 3.2 Dev Notes: "Story 3.3 wires background.js to pick up storage changes" [Source: `_bmad-output/implementation-artifacts/3-2-implement-inline-name-editing-storage-persistence.md#What Story 3.3 Handles`]

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_None yet_

### Completion Notes List

_To be filled by dev agent after implementation_

### File List

_Files created/modified by dev agent:_

- `background.js` (modify — add `handleStorageChange` function and `chrome.storage.onChanged` registration)
- `tests/background.test.js` (modify — add 4 onChanged unit tests)
