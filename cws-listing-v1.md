# Chrome Web Store listing copy for v1.0

Use this when editing the listing at https://chrome.google.com/webstore/devconsole (Edit → **Detailed description**). Do not change the short description, title, or remove existing v0.1 screenshots.

---

## Short description (unchanged from v0.1)

```
Instantly label localhost tabs by service name — ⚡ 3000 → React, ⚡ 8080 → Spring Boot. Zero config.
```

---

## Detailed description (paste this into the store listing)

```
Dev Tab Organizer automatically rewrites your localhost tab titles to include the port number
and service name, so you can identify each local service at a glance.

✅ Zero configuration — works immediately on install with 10+ default port mappings
✅ Custom names — rename any port inline from the popup (e.g., 3001 → "Payment API")
✅ Persistent mappings — custom names sync across browser restarts and Chrome profile devices
✅ Pause/Resume — temporarily suppress title rewriting without uninstalling
✅ Handles SPA navigation — no flickering or double-prefixes on client-side route changes
✅ Minimal permissions — only accesses localhost and 127.0.0.1 tabs, zero network requests

HOW IT WORKS
When you navigate to localhost:3000, the tab title changes from "My App" to "⚡ 3000 — My App"
automatically. Open the popup to rename ports, clear custom names to revert to defaults,
or pause the extension during screen recordings.

DEFAULT PORT MAP
3000 → React | 5173 → Vite | 4200 → Angular | 4000 → Phoenix | 8000 → Django
5000 → Flask | 8080 → Spring Boot | 8888 → Jupyter | 1234 → Parcel | 9000 → Webpack

PRIVACY
This extension stores no personal data. Custom port name mappings are saved locally in
Chrome's built-in sync storage and never transmitted to any external server.

Source code: https://github.com/Gancio-xyz/dev-tab-organizer
```

---

## Checklist when updating the store

- [ ] Log in to Chrome Web Store Developer Console
- [ ] Find **Dev Tab Organizer** → **Edit**
- [ ] Replace **Detailed description** with the text above (do not change short description or title)
- [ ] Upload new popup screenshot (`screenshot-popup-v1.png`) — add alongside existing v0.1 screenshots; do not remove them
- [ ] Click **Publish update**
