---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/architecture.md']
---

# dev-tab-organizer - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for dev-tab-organizer, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Auto-detect already-open `localhost:*` tabs on extension install and rewrite titles. (Matches architecture FR3)
FR2: Detect tab URL and title changes via Chrome MV3 background service worker using `chrome.tabs.onUpdated`.
FR3: Rewrite tab titles to include a configurable prefix (e.g., `⚡ 3000 — React`) using `chrome.scripting.executeScript`.
FR4: Preserve SPA dynamic title mutations by detecting changes and safely re-applying the prefix (without infinite loops or flickering). (Matches architecture FR8)
FR5: Implement a default, standalone port-to-name mapping configuration (`port-map.js`) that covers common default stacks.
FR6: Deliver zero-config first value immediately upon extension installation matching the default mappings.
FR7: Provide a popup UI that displays a list of active localhost tabs.
FR8: Allow users to click-to-edit name mappings inline via the popup UI.
FR9: Persist custom port-to-name mapping overrides across browser sessions to `chrome.storage.sync`.
FR10: Update tab titles in real-time immediately when a mapping is changed within the popup.
FR11: Display a dedicated empty state message in the popup when there are no active localhost tabs, rather than rendering an empty list.
FR12: Provide a global toggle in the popup to pause/resume the extension (prevents future title rewrites without active reverting of existing tabs, saving memory overhead).

### NonFunctional Requirements

NFR1-4 (Performance): Title rewriting must operate in under 100ms; popup UI must render in under 200ms.
NFR5-8 (Security): Minimal permissions constraint (`tabs`, `scripting`, `storage`, and scoped localhost host matching). Zero network requests.
NFR9-11 (Reliability): Must handle tab-close race conditions silently. Titles must be successfully preserved/restored if possible.
NFR12-14 (Accessibility): Popup UI must be fully keyboard-navigable, WCAG 2.1 AA compliant, and have properly labelled DOM inputs.
NFR15-17 (Maintainability): Extension must have zero external libraries/dependencies, be less than 50KB unzipped, and keep core logic under 100 lines.

### Additional Requirements

- **Starter Template:** **Manual MV3 Vanilla JS Scaffold** (Important for Epic 1 Story 1).
- **Background Worker Type:** The background service worker must be registered with `"type": "module"` in `manifest.json` to support direct imports.
- **Architectural Constraint:** Tab title rewriting must exclusively use background worker-injected `chrome.scripting.executeScript`. Content script mutation is strictly prohibited.
- **Data Architecture:** Custom configurations must be stored as a flat `portMappings` object in `chrome.storage.sync` with port numbers as keys.
- **UI Architecture:** Popup rendering must update targeted specific DOM nodes for inline editing. Complete `innerHTML` replacement is prohibited to prevent input focus loss.
- **Open Source:** The default port map must be abstracted into a clear `port-map.js` module to simplify open source community contribution.

### FR Coverage Map

**Epic 1: Zero-Config Tab Rewriting**
- **FR1:** Epic 1 - Auto-detect already-open tabs on install.
- **FR2:** Epic 1 - Detect tab URL/title changes via `onUpdated`.
- **FR3:** Epic 1 - Rewrite tab titles using `executeScript`.
- **FR4:** Epic 1 - Preserve SPA dynamic title mutations safely.
- **FR5:** Epic 1 - Implement standalone `port-map.js`.
- **FR6:** Epic 1 - Deliver zero-config first value.

**Epic 2: Custom Mappings & Popup UI**
- **FR7:** Epic 2 - Provide popup UI displaying active tabs.
- **FR8:** Epic 2 - Allow click-to-edit inline name mappings.
- **FR9:** Epic 2 - Persist custom overrides to `chrome.storage.sync`.
- **FR10:** Epic 2 - Update tab titles in real-time on mapping change.
- **FR11:** Epic 2 - Present an empty-state message when no tabs exist.
- **FR12:** Epic 2 - Provide global toggle to pause/resume future tab rewrites.

## Epic List

### Epic 1: Zero-Config Tab Rewriting (Core Engine & Immediate Value)
A developer installs the extension and immediately sees their existing and new `localhost` tabs properly labeled based on the default port map, with no configuration required.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6

### Epic 2: Custom Mappings & Popup UI (Power User Customization)
A developer can click the extension icon to view their active localhost tabs, instantly rename a port mapping inline, toggle the global active/paused state, and have that custom configuration persist across browser sessions.
**FRs covered:** FR7, FR8, FR9, FR10, FR11, FR12

## Epic 1: Zero-Config Tab Rewriting (Core Engine & Immediate Value)

A developer installs the extension and immediately sees their existing and new `localhost` tabs properly labeled based on the default port map, with no configuration required.

### Story 1.1: Initialize MV3 Background Architecture & Port Map

As a browser extension developer,
I want to scaffold the required MV3 project structure, manifest, empty service worker, and the standalone default port map module,
So that the extension has the architectural foundation required to receive user configurations and tab events.

**Acceptance Criteria:**

**Given** an empty repository,
**When** the developer creates the scaffold,
**Then** a `manifest.json` exists declaring MV3, declaring the service worker (`background.js`) as `type: "module"`, and requesting `tabs`, `scripting`, and `storage` permissions,
**And** a `port-map.js` exists defining an exported `DEFAULT_PORT_MAP` object covering standard stacks.

### Story 1.2: Implement Real-Time Tab Rewriting Logic

As a full-stack developer with many local tabs,
I want my newly opened and updating localhost tab titles to be rewritten to include their respective port environments,
So that I know exactly which local app tab is which at a glance.

**Acceptance Criteria:**

**Given** the extension is installed,
**When** a user navigates to `localhost:3000` or the page dynamically updates its title,
**Then** `background.js` listens to `chrome.tabs.onUpdated` exactly for localhost/127.0.0.1,
**And** it accurately matches the port against the default port map and injects `chrome.scripting.executeScript` correctly.

### Story 1.3: Prevent SPA Double-Rewrites (Flicker Guard)

As a developer working on a React/NextJS SPA,
I want my tab titles to maintain the prefix gracefully even when my local app mutates its own `document.title` on client-side routing,
So that I don't get infinite title loops or compound strings.

**Acceptance Criteria:**

**Given** an already-tagged SPA tab,
**When** the SPA client-side engine changes `document.title`,
**Then** the `background.js` `onUpdated` handler intercepts,
**And** strictly verifies if the target tab title already contains the formatting prefix string to avoid loops.

### Story 1.4: Auto-Process Existing Tabs on Install

As a developer discovering this tool mid-workday with 10 existing tabs,
I want my currently open tabs to be retroactively labeled the moment I install the extension,
So that I experience the "zero-config magic" without having to refresh my whole environment.

**Acceptance Criteria:**

**Given** a user has multiple active `localhost` tabs currently open,
**When** the extension is installed or reloaded,
**Then** `chrome.runtime.onInstalled` fires and actively queries all existing tabs matching localhost,
**And** runs the existing `executeScript` rewriting function against each valid tab immediately.

## Epic 2: Custom Mappings & Popup UI (Power User Customization)

A developer can click the extension icon to view their active localhost tabs, instantly rename a port mapping inline, toggle the global active/paused state, and have that custom configuration persist across browser sessions.

### Story 2.1: Render Base Popup UI & Empty States

As a generic developer who clicks the newly installed extension icon,
I want to see a clean, keyboard-navigable popup interface that tells me what to do if I have no running tabs, or lists my active ports if I do,
So that I understand the status of my extension immediately.

**Acceptance Criteria:**

**Given** no active `localhost` tabs are open,
**When** the human clicks the extension icon,
**Then** `popup.html` loads, running `chrome.tabs.query` to realize 0 tabs exist,
**And** precisely alters a target DOM ID to render an informational empty state ("No localhost tabs open yet").
**When** localhost tabs are detected, it dynamically constructs an unordered list UI indicating the active port numbers and current active rule names.

### Story 2.2: Implement Inline Name Editing & Storage Persistence

As a power-user developer managing un-mapped custom ports,
I want to edit the displayed port mappings inline within the popup list and have it saved automatically,
So that my settings persist seamlessly without complex modal configurations.

**Acceptance Criteria:**

**Given** the popup menu list of recognized ports is rendered,
**When** a user clicks/tabs into an input field next to a port and types a custom name (on `<input>` blur or 'Enter' keypress),
**Then** `popup.js` detects the event without a complete `innerHTML` replacement (focus remains intact),
**And** it merges the `{ "port_num": "User Name" }` override into a persistent `portMappings` dictionary object stored into `chrome.storage.sync.set()`,
**And** tests confirm it seamlessly merges the user-override array over the `DEFAULT_PORT_MAP` when read for rendering.

### Story 2.3: Wire Storage to Real-Time Title Engine

As a power-user assigning a new alias (`Payment API`) to an active port,
I want the tab's physical title in my browser to reflect my immediate edit a split-second after I save it,
So that I don't have to awkwardly refresh external tabs manually.

**Acceptance Criteria:**

**Given** a user successfully updates a custom mapping in `Story 2.2`,
**When** the persistence logic commits to `chrome.storage.sync.set()`,
**Then** a background storage listener mechanism or immediate re-trigger event informs the active `tabs.query`,
**And** loops instantly over matching open local tabs, forcefully replacing the old mapped prefix string with the correct, newly defined string.

### Story 2.4: Implement Global Pause/Resume Toggle

As a developer temporarily recording a screen-share,
I want to be able to temporarily pause the extension's background service without completely uninstalling the tool,
So that my tabs behave natively while disabled.

**Acceptance Criteria:**

**Given** a user opens the popup,
**When** they click a global 'Pause / Resume' toggle UI element,
**Then** the `isEnabled` (boolean defaults to true) flag flips within `chrome.storage.sync`,
**And** `background.js` checks this flag before resolving any `executeScript` modifications,
**And** if `isEnabled === false`, the background process returns immediately without renaming tabs moving forward.