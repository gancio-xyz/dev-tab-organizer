# Story 1.1: Scaffold Extension Foundation with Default Port Labeling

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer who just installed the extension,
I want the extension to load immediately with a working default port map,
So that my localhost tabs are labeled from the first moment the extension is active, with no setup required.

## Acceptance Criteria

1. A `manifest.json` exists at the project root declaring MV3, registering `background.js` as a service worker with `"type": "module"`, and requesting only `tabs`, `scripting`, and `storage` permissions scoped to `http://localhost/*` and `http://127.0.0.1/*`.
2. A `port-map.js` exists at the project root using the exact named export `export const DEFAULT_PORT_MAP = { ... }` covering at least 10 common developer frameworks (including React, Vite, Angular, Phoenix, Django/FastAPI, Node, and Flask) with port numbers as **string keys**.
3. Adding a new port mapping to `port-map.js` requires exactly one line (e.g., `"5001": "My Service"`).

## Tasks / Subtasks

- [ ] Create full project directory structure (AC: 1, 2, 3)
  - [ ] Create root source files: `manifest.json`, `background.js`, `port-map.js`, `popup.html`, `popup.js`
  - [ ] Create `icons/` directory with solid-color PNG placeholders at 16×16, 48×48, 128×128
  - [ ] Create `tests/` directory with empty placeholder test files: `background.test.js`, `port-map.test.js`, `popup.test.js`
  - [ ] Create `.gitignore` (at minimum exclude: `.DS_Store`, `extension.zip`)
- [ ] Implement `manifest.json` to spec (AC: 1)
  - [ ] Set `"manifest_version": 3`
  - [ ] Set `"name": "Dev Tab Organizer"`, `"version": "0.1.0"`, `"description"`
  - [ ] Register background service worker: `"background": { "service_worker": "background.js", "type": "module" }`
  - [ ] Set `"permissions": ["tabs", "scripting", "storage"]` — exactly these three, no others
  - [ ] Set `"host_permissions": ["http://localhost/*", "http://127.0.0.1/*"]` — no wildcard beyond localhost
  - [ ] Register popup action with icon paths referencing `icons/` directory
- [ ] Implement `port-map.js` with correct export and 10+ entries (AC: 2, 3)
  - [ ] Use exact export form: `export const DEFAULT_PORT_MAP = { ... };`
  - [ ] All port number keys must be **strings** (e.g., `"3000"`, not `3000`)
  - [ ] Include at minimum: React (3000), Vite (5173), Angular (4200), Phoenix/Elixir (4000), Django (8000), FastAPI (8000 alt), Flask (5000), Node alternate (3001), Spring Boot (8080), Jupyter (8888), Parcel (1234), Webpack dev (9000)
  - [ ] Module must be side-effect free — no function calls, no Chrome API access, only the exported const
  - [ ] Verify that a new entry (e.g., `"4321": "My Service"`) can be added as exactly one line inside the object
- [ ] Create importable stub files for remaining source files (AC: 1 — extension must load cleanly)
  - [ ] `background.js`: `import { DEFAULT_PORT_MAP } from './port-map.js';` at top + an empty (no-op) `chrome.tabs.onUpdated.addListener` call so the service worker registers cleanly. No title rewriting logic yet — that is Story 1.2.
  - [ ] `popup.html`: valid HTML5 shell including `<div id="tab-list"></div>`, `<div id="empty-state"></div>`, and `<script src="popup.js" type="module"></script>`. No inline scripts.
  - [ ] `popup.js`: `import { DEFAULT_PORT_MAP } from './port-map.js';` at top + empty `init()` async function stub. No logic yet — that is Story 3.1.
- [ ] Verify extension loads without errors
  - [ ] Load unpacked in `chrome://extensions` → Load unpacked → select project root
  - [ ] Confirm no manifest validation errors (red error badge)
  - [ ] Inspect service worker via Extensions page → Inspect views: service worker → confirm no console errors on startup
  - [ ] Confirm `DEFAULT_PORT_MAP` is importable without errors (verify via service worker console: `import('./port-map.js').then(m => console.log(m.DEFAULT_PORT_MAP))`)

## Dev Notes

### Critical Architecture Constraints (MUST FOLLOW — deviations break later stories)

**Service Worker Module Type (CRITICAL)**
The background service worker MUST be registered with `"type": "module"` in `manifest.json`. This is required for ES `import` statements to work in `background.js`. Without it, `import { DEFAULT_PORT_MAP } from './port-map.js'` throws a SyntaxError and the entire extension silently fails.

```json
// manifest.json — CORRECT
"background": {
  "service_worker": "background.js",
  "type": "module"
}
```

Do NOT use `importScripts()` — that is the MV2/legacy pattern and is incompatible with the ES module approach used throughout this project.

**port-map.js Export Form (CRITICAL — exact string must match across all files)**

```js
// CORRECT — named export, const, string keys
export const DEFAULT_PORT_MAP = {
  "3000": "React",
  "5173": "Vite",
  // ...
};

// WRONG variants — all break downstream imports
export default { ... }           // breaks named import in background.js and popup.js
const DEFAULT_PORT_MAP = { ... } // not exported — invisible to importers
window.DEFAULT_PORT_MAP = { ... } // MV2 pattern — fails in service worker
```

**Port Numbers as Strings (CRITICAL — type consistency rule)**

All port keys in `DEFAULT_PORT_MAP` must be strings. Chrome URL parsing produces strings. Storage serializes to JSON. Mixing string/integer keys causes silent lookup failures.

```js
// CORRECT
"3000": "React"

// WRONG — integer key
3000: "React"
```

**Permission Scope (CRITICAL — Chrome Web Store requirement)**

The `host_permissions` array must contain exactly `["http://localhost/*", "http://127.0.0.1/*"]`. Do not add `https://` variants (localhost is HTTP only in development) or wildcard `<all_urls>` — the latter will cause Chrome Web Store rejection.

**No Content Scripts (ARCHITECTURAL CONSTRAINT — applies to all stories)**

Content scripts are explicitly prohibited for title rewriting per PRD and architecture. Do not add a `content_scripts` key to `manifest.json` now or in any future story. Title rewriting is done exclusively via `chrome.scripting.executeScript` from the service worker.

### File Responsibilities (strict — no logic bleeding between files)

| File | Owns | Must NOT contain |
|---|---|---|
| `manifest.json` | Permissions, entry points, metadata | Any logic |
| `port-map.js` | Default port→name map only | Chrome API calls, functions, side effects |
| `background.js` | `onUpdated` listener, `executeScript` call | DOM manipulation |
| `popup.html` | Markup shell, accessibility labels | Inline scripts |
| `popup.js` | Popup render, storage read/write | `chrome.tabs.onUpdated` listener |

This story creates all five files. Only `manifest.json` and `port-map.js` have real content yet. The others are valid stubs that allow the extension to load cleanly.

### Project Structure Notes

The full target directory structure (from architecture) is:

```
dev-tab-organizer/             ← project root = extension root (no src/ nesting)
├── manifest.json
├── background.js
├── port-map.js
├── popup.html
├── popup.js
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── tests/
│   ├── background.test.js
│   ├── port-map.test.js
│   └── popup.test.js
├── .gitignore
└── README.md                  ← created in Epic 2, not this story
```

**No build step.** The extension directory IS the source directory. Chrome loads it directly via "Load unpacked". Do not add `package.json`, `node_modules`, a `dist/` folder, or any bundler config — these are not needed and add noise.

**No TypeScript.** The entire project uses vanilla ES2020+ JavaScript as specified in the architecture. Do not add `.ts` files, `tsconfig.json`, or type annotations.

**Icon placeholders:** Solid-color PNGs (e.g., 16×16 blue square) are fully acceptable for this story. The extension will not load without icon files referenced in `manifest.json`. Use any simple image tool or even a tiny base64-encoded PNG embedded in a script. Final icons are a polish concern for Epic 2+.

### DOM IDs — Reserved for Future Stories

Even though popup logic is not implemented in this story, `popup.html` must use these exact IDs. Stories 3.1–3.4 depend on them:

```
#tab-list          — container for all tab rows
#empty-state       — empty state message element
.tab-row           — individual tab row class (added dynamically in Story 3.1)
.tab-name-input    — editable name field class (added dynamically in Story 3.1)
[data-port]        — attribute on each row (added dynamically in Story 3.1)
```

Minimal `popup.html` skeleton:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dev Tab Organizer</title>
</head>
<body>
  <div id="tab-list" role="list" aria-label="Active localhost tabs"></div>
  <div id="empty-state" aria-live="polite"></div>
  <script src="popup.js" type="module"></script>
</body>
</html>
```

### Suggested DEFAULT_PORT_MAP Entries (minimum 10 required)

Include at minimum the following (add more if desired — one line each):

```js
export const DEFAULT_PORT_MAP = {
  "1234": "Parcel",
  "3000": "React",
  "3001": "Node / API",
  "4000": "Phoenix",
  "4200": "Angular",
  "5000": "Flask",
  "5173": "Vite",
  "8000": "Django",
  "8080": "Spring Boot",
  "8888": "Jupyter",
  "9000": "Webpack",
};
```

This covers the PRD's stated requirement of 10+ common frameworks. More entries are welcome and lower-friction to add (that's the point of the module design).

### References

- Architecture: project structure, manifest format, ES module approach [Source: `_bmad-output/planning-artifacts/architecture.md#Selected Starter: Manual MV3 Vanilla JS Scaffold`]
- Architecture: port numbers as strings, `DEFAULT_PORT_MAP` export form [Source: `_bmad-output/planning-artifacts/architecture.md#Naming Patterns`]
- Architecture: component boundaries, file responsibility table [Source: `_bmad-output/planning-artifacts/architecture.md#Structure Patterns`]
- Architecture: Gap 4 — icon placeholder resolution [Source: `_bmad-output/planning-artifacts/architecture.md#Gap Analysis & Resolutions`]
- Architecture: Gap 3 — testability setup (stubs referenced here, implemented in Story 1.2+) [Source: `_bmad-output/planning-artifacts/architecture.md#Gap Analysis & Resolutions`]
- Epics: Story 1.1 ACs [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.1`]
- PRD FRs covered: FR10 (default port map), FR14 (standalone config file), FR25 (single-line addition) [Source: `_bmad-output/planning-artifacts/epics.md#Epic 1 FR Coverage Map`]

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_None yet_

### Completion Notes List

_To be filled by dev agent after implementation_

### File List

_Files created/modified by dev agent:_

- `manifest.json` (create)
- `port-map.js` (create)
- `background.js` (create — stub)
- `popup.html` (create — stub)
- `popup.js` (create — stub)
- `icons/icon-16.png` (create — placeholder)
- `icons/icon-48.png` (create — placeholder)
- `icons/icon-128.png` (create — placeholder)
- `tests/background.test.js` (create — empty placeholder)
- `tests/port-map.test.js` (create — empty placeholder)
- `tests/popup.test.js` (create — empty placeholder)
- `.gitignore` (create)
