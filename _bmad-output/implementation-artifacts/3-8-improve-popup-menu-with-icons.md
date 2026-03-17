# Story 3.8: Improve Popup Menu with Icons/Emojis

Status: review

## Story

As a developer using the extension,
I want to see a recognizable icon (emoji) next to each port in the popup menu,
So that I can quickly identify my projects at a glance and customize them to my liking.

## Acceptance Criteria

1. Every port row in the popup UI must display an emoji.
2. The default emoji for all ports is ⚡ (Lightning Bolt), unless a specific default is defined in `port-map.js`.
3. Users can set a custom emoji for any port.
4. Custom emojis are persisted in `chrome.storage.sync` alongside the custom port name.
5. In the popup UI, the emoji appears to the left of the port label.
6. The user can edit the emoji through a dedicated small input field (max 1-2 characters). *Decision: Option A selected.*

## Tasks / Subtasks

- [x] Update `port-map.js` to support default emojis for specific ports:
    - ⚛️ 3000 (React)
    - 🚀 5173 (Vite)
    - 📦 8080 (Webpack/Spring Boot)
    - 🟢 3001 (Node.js)
    - 🐍 8000 (Python)
    - 🐦 4000 (Phoenix)
    - 🐘 8000 (PHP)
    - ⚡ Default
- [x] Modify `popup.js` `renderTabList` to include an emoji in each row.
- [x] Update `popup.js` `saveMapping` and `attachEditListeners` to handle the new emoji input field.
- [x] Update `popup.html` / `popup.css` to accommodate the new emoji input field (proper spacing, alignment).
- [x] Update `popup.html` / `popup.css` to make the emoji input field editable with only one emoji.
- [x] Ensure `background.js` (or wherever title rewriting happens) doesn't break if the storage structure for `portMappings` changes.
- [x] Ensure the tab title gets wrote consistently and it does not duplicate title, emojis or port numbers.

## Dev Notes

### Storage Compatibility
Currently `portMappings` stores `{ "3000": "My App" }`. 
To support emojis, we will transition to `{ "3000": { "name": "My App", "emoji": "🚀" } }`. 
**CRITICAL:** We must maintain backward compatibility. If `portMappings[port]` is a string, it represents the name, and the emoji should fall back to the default for that port.

### UI Layout
New row structure:
```html
<div class="tab-row" data-port="3000" role="listitem">
  <input class="emoji-input" data-port="3000" type="text" maxlength="2" placeholder="⚡">
  <label for="input-3000">Port 3000</label>
  <input id="input-3000" class="tab-name-input" ...>
</div>
```

---

## Dev Agent Record

### Implementation Plan
- Added `DEFAULT_EMOJI_MAP` and `getDefaultEmoji(port)` in `port-map.js` for port-specific default emojis (⚛️ 3000, 🟢 3001, 🐦 4000, 🚀 5173, 🐍 8000, 📦 8080; ⚡ default). One default per port (8000 uses 🐍 for Django/FastAPI).
- Storage: normalized to `{ "port": { name, emoji } }` with backward compat: legacy string values treated as name-only, emoji from default.
- `popup.js`: `normalizePortMappings(raw)` for reading; `applyNameMapping` / `applyEmojiMapping` for writes; `renderTabList` builds row with `.emoji-input` (maxlength=2), label, `.tab-name-input`; `saveMapping` and new `saveEmojiMapping` persist via apply*; `attachEditListeners` wires both inputs (blur/Enter).
- `popup.css`: `.emoji-input` width 2.2em, centered, focus ring.
- `background.js`: `resolvePortName` accepts both string and `{ name, emoji }` and returns only the name (tab title unchanged; no emoji in title).

### Completion Notes
- All ACs satisfied: every row shows emoji; defaults from port-map; custom emoji persisted in sync storage; emoji left of label; editable via small input (max 2 chars).
- Backward compatibility: string `portMappings[port]` still resolved as name; new writes use object form.
- Tab title remains "⚡ port — name" only; custom emoji is popup-only, so no duplication.

### File List
- extension/port-map.js (modified)
- extension/popup.js (modified)
- extension/popup.css (modified)
- extension/background.js (modified)
- tests/port-map.test.js (modified)
- tests/popup.test.js (modified)
- tests/background.test.js (modified)

### Change Log
- 2026-03-17: Story 3.8 implemented — popup emoji per port, DEFAULT_EMOJI_MAP, normalizePortMappings, applyNameMapping/applyEmojiMapping, resolvePortName backward compat, tests added.
