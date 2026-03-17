# Story 4.1: Publish Contribution Guide (CONTRIBUTING.md)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an open-source developer who wants to add a missing port to the default map,
I want a clear, minimal contribution guide in the repository,
So that I can open a pull request in under 10 minutes without needing to ask anyone for help.

## Acceptance Criteria

1. A `CONTRIBUTING.md` file exists at the project root that explains — in plain language — how to add a new port mapping, showing the exact one-line change required in `port-map.js`.
2. `CONTRIBUTING.md` explains how to load the extension unpacked for local development and testing.
3. `CONTRIBUTING.md` describes the PR review process and includes a note that all contributions are accepted under the MIT license.
4. A developer with no prior knowledge of the codebase can read `CONTRIBUTING.md` and open a valid port-map PR without asking any questions.

## Tasks / Subtasks

- [x] Create `CONTRIBUTING.md` at the project root (AC: 1, 2, 3, 4)
  - [x] Include section: how to add a port mapping with the exact one-line example
  - [x] Include section: how to load unpacked in Chrome, how to refresh after edits, how to view logs
  - [x] Include section: how to run tests (`node --test tests/*.test.js`)
  - [x] Include section: PR workflow (fork, branch, change, test, open PR)
  - [x] Include MIT license note — all contributions licensed under MIT by submitting a PR
  - [x] Include "In scope / Out of scope" brief guidance so contributors don't propose incompatible changes
- [x] Manual verification (AC: 4)
  - [x] Read the finished `CONTRIBUTING.md` end to end — confirm a new contributor can follow it to completion without outside help
  - [x] Confirm the port-map example uses a real-looking port number NOT already in `port-map.js` (e.g., `"4321": "Astro"`)
  - [x] Confirm file is at project root (not in a subdirectory)

## Dev Notes

### This Story Is Documentation Only

**No source code changes.** Do NOT modify `background.js`, `popup.js`, `popup.html`, `port-map.js`, `manifest.json`, or any test file. The only output of this story is one new Markdown file: `CONTRIBUTING.md` at the project root.

### File Location

```
dev-tab-organizer/
├── CONTRIBUTING.md   ← CREATE THIS FILE (at root, alongside LICENSE and README.md)
├── manifest.json
├── background.js
...
```

The architecture specifies `CONTRIBUTING.md` at the project root. It is automatically excluded from the Chrome Web Store zip artifact (the architecture excludes all `*.md` files from the CWS bundle).

### CWS Zip Exclusion (No Action Required)

The CI/CD workflow (Story 4.2) will zip with:
```sh
zip -r extension.zip . -x "tests/*" ".github/*" "*.md" ".gitignore"
```
The `*.md` glob excludes `CONTRIBUTING.md` automatically — no special handling needed.

### Current `port-map.js` — Use This for the Exact Example

```js
export const DEFAULT_PORT_MAP = {
  "1234": "Parcel",
  "3000": "React",
  "3001": "Node / API",
  "4000": "Phoenix",
  "4200": "Angular",
  "5000": "Flask",
  "5173": "Vite",
  "8000": "Django / FastAPI",
  "8080": "Spring Boot",
  "8888": "Jupyter",
  "9000": "Webpack"
};
```

Use `"4321": "Astro"` as the example contribution — it's a real popular framework port not yet in the default map. Show it being inserted in ascending port-number order (between `"4200"` and `"5000"`).

### Complete `CONTRIBUTING.md` Content to Write

Write the file with exactly this content (you may make minor prose improvements but preserve all technical accuracy):

```markdown
# Contributing to Dev Tab Organizer

Thanks for your interest in contributing! This project is intentionally simple — no build step, no dependencies, vanilla JavaScript only. Most contributions are a one-line change in a single file.

All contributions are accepted under the [MIT license](LICENSE).

---

## The Most Common Contribution: Adding a Port Mapping

The default port map lives in [`port-map.js`](port-map.js). Adding a new framework is exactly **one line** inside the exported object:

```js
export const DEFAULT_PORT_MAP = {
  "1234": "Parcel",
  "3000": "React",
  "3001": "Node / API",
  "4000": "Phoenix",
  "4200": "Angular",
  "4321": "Astro",       // ← add your entry here
  "5000": "Flask",
  "5173": "Vite",
  "8000": "Django / FastAPI",
  "8080": "Spring Boot",
  "8888": "Jupyter",
  "9000": "Webpack"
};
```

**Rules for port map entries:**
- Port must be a **string key** (e.g., `"4321"`, not `4321`)
- Value is a short, human-readable name (1–3 words max)
- Insert in ascending port-number order to keep the file readable

Open a pull request with just this one-line change — that's all that's needed for a port map contribution.

---

## Running the Extension Locally

No build step required. Load it directly in Chrome:

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the root folder of this repository (the folder containing `manifest.json`)
5. The extension icon appears in your Chrome toolbar immediately

**To reload after making a change:** click the refresh ↺ icon next to the extension on `chrome://extensions`.

**Viewing service worker logs (`background.js`):**
- On `chrome://extensions`, click **"service worker"** under Dev Tab Organizer to open DevTools

**Viewing popup logs (`popup.js`):**
- Right-click the extension icon in the toolbar → **Inspect**

---

## Running Tests

Tests use the built-in Node.js test runner — no `npm install` required:

```sh
node --test tests/*.test.js
```

All tests must pass before opening a PR.

---

## Opening a Pull Request

1. Fork the repository and create a branch (e.g., `add-port-astro-4321`)
2. Make your change
3. Run `node --test tests/*.test.js` — confirm zero failures
4. Open a PR with a clear title (e.g., `"Add Astro port 4321 to default map"`)
5. PRs are typically reviewed and merged within a few days

By submitting a PR you agree your contribution is licensed under the MIT license.

---

## Scope

**In scope:** default port→name mappings, bug fixes, accessibility improvements to the popup UI.

**Out of scope:** external dependencies, build tooling, features requiring a backend or network requests, configuration beyond port→name mappings.

When in doubt, open an issue to discuss before implementing.
```

### No README.md Yet

At current project state, `README.md` does not yet exist (it was planned for Story 2.1). `CONTRIBUTING.md` can link to `LICENSE` without depending on `README.md`. Do not create `README.md` as part of this story — that belongs to Story 2.1.

### No Tests for This Story

This story creates a Markdown file. There are no automated tests to write. The verification is manual (read the file, confirm it meets AC: 4 — a new contributor can follow it without external help).

### References

- Epics: Story 4.1 ACs — plain language, one-line port addition, load unpacked, PR review, MIT license note, zero-question contributor path [Source: `_bmad-output/planning-artifacts/epics.md#Story 4.1`]
- PRD: FR26 — Repository includes contribution guide (CONTRIBUTING.md) [Source: `_bmad-output/planning-artifacts/epics.md#Epic 4 FR Coverage Map`]
- Architecture: `CONTRIBUTING.md` at project root [Source: `_bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure`]
- Architecture: `*.md` files excluded from CWS zip [Source: `_bmad-output/planning-artifacts/architecture.md#File Organization Patterns`]
- Architecture: single-line port map addition as a core maintainability goal (NFR25) [Source: `_bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation`]

## Dev Agent Record

### Agent Model Used

Antigravity

### Debug Log References

_None_

### Completion Notes List

- Created `CONTRIBUTING.md` at the project root.
- Included exact port map example `"4321": "Astro"`.
- Instructions for unpacked extension, test execution, and PR workflow added.
- In-scope/Out-of-scope guidance included.
- Content manually checked to be plain language, with MIT license mentioned.
- **AI Review Fixes (Story 4.1):** Corrected file references to `extension/port-map.js` and extension root path instructions in `CONTRIBUTING.md`.

### File List

- `CONTRIBUTING.md` (modified — fixed paths)
