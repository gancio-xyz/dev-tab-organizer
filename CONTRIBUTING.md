# Contributing to Dev Tab Organizer

Thanks for your interest in contributing! This project is intentionally simple — no build step, no dependencies, vanilla JavaScript only. Most contributions are a one-line change in a single file.

All contributions are accepted under the [MIT license](LICENSE).

---

## The Most Common Contribution: Adding a Port Mapping

The default port map lives in [`extension/port-map.js`](extension/port-map.js). Adding a new framework is exactly **one line** inside the exported object:

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
4. Select the `extension/` folder in this repository (the folder containing `manifest.json`)
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
