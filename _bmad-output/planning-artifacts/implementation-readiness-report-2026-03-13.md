---
stepsCompleted: ['step-01-document-discovery', 'step-02-prd-analysis', 'step-03-epic-coverage-validation', 'step-04-ux-alignment', 'step-05-epic-quality-review', 'step-06-final-assessment']
status: complete
workflowType: 'implementation-readiness'
documentsInventoried:
  prd: '_bmad-output/planning-artifacts/prd.md'
  architecture: '_bmad-output/planning-artifacts/architecture.md'
  epics: '_bmad-output/planning-artifacts/epics.md'
  ux: null
---

# Implementation Readiness Assessment Report

**Date:** March 13, 2026
**Project:** dev-tab-organizer

---

## PRD Analysis

### Functional Requirements

**Tab Detection & Monitoring**

- FR1: The extension can detect when any tab navigates to a `localhost:*` or `127.0.0.1:*` URL
- FR2: The extension can detect when the title of a monitored localhost tab changes (to handle SPA navigation)
- FR3: The extension can detect localhost tabs that are already open at the time the extension is installed or enabled
- FR4: The extension can extract the port number from a localhost URL

**Title Rewriting**

- FR5: The extension can rewrite the displayed tab title of a localhost tab to include the port number as a prefix
- FR6: The extension can rewrite the displayed tab title to include a user-defined service name in place of or alongside the port number
- FR7: The extension preserves the original page title as a suffix when rewriting (e.g., `⚡ 3000 — Original Title`)
- FR8: The extension re-applies the title prefix after a SPA updates `document.title` (title changes do not strip the prefix permanently)
- FR9: The extension applies the title rewrite without causing visible flicker on rapid SPA navigation

**Port Mapping Configuration**

- FR10: The extension ships with a default port-to-name mapping covering common developer frameworks (React, Vite, Angular, Phoenix, Django/FastAPI, Node, etc.)
- FR11: Users can define a custom name for any port number
- FR12: Users can remove a custom port name mapping, reverting to the default name or port number
- FR13: Custom port name mappings take precedence over default port map entries
- FR14: The default port map is defined in a standalone, human-readable config file separate from core extension logic

**Popup Interface**

- FR15: Users can open a popup interface from the Chrome toolbar extension icon
- FR16: The popup displays the currently active localhost tabs with their port numbers and current assigned names
- FR17: Users can edit the name assigned to any port directly within the popup
- FR18: Name changes made in the popup are reflected in the tab title immediately without requiring a page reload
- FR19: The popup remains usable when no localhost tabs are currently open (shows empty state)

**Storage & Persistence**

- FR20: User-defined port name mappings persist across browser restarts
- FR21: User-defined port name mappings sync across the user's Chrome profile on different devices
- FR22: The extension stores configuration without requiring user account creation or external services

**Distribution & Open Source**

- FR23: The extension is installable from the Chrome Web Store
- FR24: The extension source code is publicly available on GitHub under the MIT license
- FR25: The default port map config file is structured such that adding a new entry requires only a single-line change
- FR26: The repository includes a contribution guide explaining how to add port mappings

**Total FRs: 26**

---

### Non-Functional Requirements

**Performance**

- NFR1: Tab title rewriting must complete within 100ms of a `chrome.tabs.onUpdated` event firing
- NFR2: The background service worker must not measurably increase page load time (<5ms overhead)
- NFR3: Rapid SPA navigation (route changes within 200ms of each other) must not cause flickering or stale labels
- NFR4: The popup must open and render its full state within 200ms of the user clicking the toolbar icon

**Security**

- NFR5: The extension must declare only the minimum permissions required: `tabs`, `scripting`, `storage`, and host permissions scoped exclusively to `http://localhost/*` and `http://127.0.0.1/*`
- NFR6: The extension must not make any external network requests
- NFR7: No user data may be transmitted to any external server
- NFR8: The Chrome Web Store listing must include an accurate privacy policy stating no data is collected or transmitted

**Reliability**

- NFR9: If the extension encounters an unexpected error, it must fail silently without affecting the page or throwing uncaught errors to the console
- NFR10: Disabling or uninstalling the extension must fully restore original tab title behavior
- NFR11: The extension must function correctly across Chrome browser updates without requiring a new release

**Accessibility**

- NFR12: The popup UI must be keyboard-navigable — all actions completable without a mouse
- NFR13: The popup must meet WCAG 2.1 Level AA minimum contrast requirements
- NFR14: Input fields in the popup must have associated labels readable by screen readers

**Maintainability**

- NFR15: Total extension bundle size must remain under 50KB (unzipped)
- NFR16: Core title-rewriting logic must be contained in a single file under 100 lines
- NFR17: The codebase must be understandable without inline documentation for any developer experienced with the Chrome Extensions API

**Total NFRs: 17**

---

### Additional Requirements / Constraints

- **MV3 Constraint:** Content script approach explicitly rejected — background service worker (`chrome.tabs.onUpdated` + `chrome.scripting.executeScript`) is the required MV3 pattern
- **Zero Dependencies:** No npm dependencies in production bundle; vanilla JS only; no build step required for core functionality
- **Bundle Size Cap:** Under 50KB unzipped
- **Chrome Version:** Minimum Chrome 88+ (MV3 + `scripting` API)
- **Chrome Web Store:** Must pass automated review (no remote code execution, no obfuscated code, minimal permissions justification)
- **Title Format Default:** `⚡ PORT — Original Title`
- **Storage:** `chrome.storage.sync` only; 100KB sync limit; no backend, no accounts
- **Browser Scope:** Chrome primary; Edge (Chromium) likely compatible; Firefox and Safari out of scope for v1
- **Explicitly Out of MVP:** Color-coded favicon badges, port number in favicon, configurable title format, Firefox/Edge-specific testing, export/import config

---

### PRD Completeness Assessment

The PRD is **thorough and well-structured**. Requirements are clearly numbered, categorized, and traceable to user journeys. The following observations are noted:

- **Strengths:** Explicit FR/NFR numbering (FR1–FR26, NFR1–NFR17); strong user journey coverage; technical constraints clearly articulated; MVP scope is explicitly bounded.
- **Minor Gaps:** No explicit UX design document exists — popup UI behavior is described in the PRD but there is no separate UX spec with wireframes or interaction states. This is low-risk given the simplicity of the UI.
- **FR18 (real-time title update on popup edit):** This requires a specific IPC mechanism between popup and background worker — the implementation approach is implied but not fully specified in the PRD. Worth flagging in epic coverage.

---

## Epic Coverage Validation

> ⚠️ **CRITICAL TRACEABILITY NOTE:** The epics document uses its own internal FR numbering (FR1–FR12) that is **entirely different** from the PRD's FR numbering (FR1–FR26). Both systems use "FR1", "FR2", etc. to mean completely different requirements. This is a significant documentation risk — a developer reading just the coverage map could confuse which requirement is being addressed.

### Coverage Matrix

| PRD FR | PRD Requirement (Summary) | Epic Coverage | Status |
|--------|---------------------------|---------------|--------|
| FR1 | Detect tab navigation to `localhost:*` / `127.0.0.1:*` | Epic 1 / Story 1.2 (Epics-FR2) | ✓ Covered |
| FR2 | Detect title changes on monitored localhost tabs (SPA) | Epic 1 / Story 1.2 (Epics-FR2) | ✓ Covered |
| FR3 | Detect already-open localhost tabs at install/enable | Epic 1 / Story 1.4 (Epics-FR1) | ✓ Covered |
| FR4 | Extract port number from localhost URL | Epic 1 / Story 1.2 (implied) | ⚠️ Implied, not explicitly stated in any AC |
| FR5 | Rewrite tab title to include port number as prefix | Epic 1 / Story 1.2 (Epics-FR3) | ✓ Covered |
| FR6 | Rewrite tab title to include user-defined service name | Epic 1 / Story 1.2 + Epic 2 / Story 2.3 | ✓ Covered |
| FR7 | Preserve original page title as suffix (`⚡ PORT — Title`) | Epic 1 / Story 1.2 (implied by format) | ⚠️ Implied, no AC explicitly verifies suffix preservation |
| FR8 | Re-apply title prefix after SPA updates `document.title` | Epic 1 / Story 1.3 (Epics-FR4) | ✓ Covered |
| FR9 | No visible flicker on rapid SPA navigation | Epic 1 / Story 1.3 (Epics-FR4 — "without flickering") | ✓ Covered |
| FR10 | Ship with default port-to-name mapping (10+ frameworks) | Epic 1 / Story 1.1 (Epics-FR5) | ✓ Covered |
| FR11 | Users can define custom name for any port | Epic 2 / Story 2.2 (Epics-FR8) | ✓ Covered |
| FR12 | Users can **remove** a custom mapping (revert to default) | Epic 2 / Story 2.2 (implicit) | ⚠️ Not explicitly modelled — Story 2.2 only covers adding/editing |
| FR13 | Custom mappings take precedence over default port map | Epic 2 / Story 2.2 ("merges override over DEFAULT_PORT_MAP") | ✓ Covered (AC mentions merge precedence) |
| FR14 | Default port map in standalone, human-readable config file | Epic 1 / Story 1.1 (Epics-FR5, `port-map.js`) | ✓ Covered |
| FR15 | Open popup from Chrome toolbar icon | Epic 2 / Story 2.1 (Epics-FR7) | ✓ Covered |
| FR16 | Popup displays active localhost tabs with port + name | Epic 2 / Story 2.1 (Epics-FR7) | ✓ Covered |
| FR17 | Edit port name directly within the popup | Epic 2 / Story 2.2 (Epics-FR8) | ✓ Covered |
| FR18 | Name changes reflected in tab title immediately | Epic 2 / Story 2.3 (Epics-FR10) | ✓ Covered |
| FR19 | Popup empty state when no localhost tabs open | Epic 2 / Story 2.1 (Epics-FR11) | ✓ Covered |
| FR20 | Mappings persist across browser restarts | Epic 2 / Story 2.2 (Epics-FR9) | ✓ Covered |
| FR21 | Mappings sync across user's Chrome profile/devices | Epic 2 / Story 2.2 (`chrome.storage.sync` usage) | ✓ Covered |
| FR22 | No account creation or external services required | Epic 2 / Story 2.2 (implied by storage.sync usage) | ✓ Covered |
| FR23 | Extension installable from Chrome Web Store | **NOT FOUND** | ❌ MISSING |
| FR24 | Source code on GitHub under MIT license | **NOT FOUND** | ❌ MISSING |
| FR25 | Single-line change to add a port map entry | Epic 1 / Story 1.1 (implied by `port-map.js` structure) | ⚠️ Implied, no AC validates contribution ease |
| FR26 | Repository includes contribution guide | **NOT FOUND** | ❌ MISSING |

---

### Missing Requirements

#### Critical Missing FRs

**FR23: Chrome Web Store distribution**
- **Impact:** This is the primary distribution channel for the extension. Without a story or task, it may be overlooked until the very end of development with no testing or preparation.
- **Recommendation:** Add a story (likely in Epic 2 or a new Epic 3 "Launch & Distribution") covering: Web Store developer account setup, privacy policy page, store listing copy, screenshots, and first submission.

**FR24: GitHub open-source repository under MIT**
- **Impact:** Open sourcing is a stated product goal and enables the community contribution path (Journey 4). Without a story, there is no checkpoint to ensure this is done before launch.
- **Recommendation:** Add a story covering: GitHub repo creation, MIT `LICENSE` file, `README.md` with install steps and default port map list.

**FR26: Contribution guide (CONTRIBUTING.md)**
- **Impact:** Directly blocks the "OSS Contributor" journey (Journey 4 — Hana). Without this, the open source community has no clear entry point.
- **Recommendation:** Add an AC to the GitHub story (FR24) or a standalone story: create `CONTRIBUTING.md` explaining how to add port mappings, the PR process, and code review expectations.

#### Warnings — Partially Covered FRs

**FR4: Port number extraction from URL**
- Story 1.2 implements this implicitly (you cannot rewrite the title without extracting the port), but no AC explicitly validates that port extraction works correctly for edge cases (e.g., `127.0.0.1:8080`, non-standard ports like `5432`).
- **Recommendation:** Add an explicit AC to Story 1.2 covering port extraction from both `localhost:PORT` and `127.0.0.1:PORT` URL formats.

**FR7: Preserve original page title as suffix**
- Story 1.2 mentions correct injection but no AC explicitly verifies the output format: `⚡ PORT — Original Title`. This is a critical UX requirement — if the original title is dropped, the value proposition is degraded.
- **Recommendation:** Add an explicit AC: "Given a tab with title 'My App — Dashboard' on localhost:3000, When the extension rewrites, Then the tab title becomes '⚡ 3000 — My App — Dashboard'."

**FR12: Remove/revert a custom mapping**
- Story 2.2 handles adding and editing custom names but does not model the delete/revert-to-default scenario. A user who set `3000 → "Old Project"` and wants to go back to the default `React` has no described workflow.
- **Recommendation:** Add an explicit AC to Story 2.2: "Given a custom mapping exists, When the user clears the input field and saves, Then the custom override is removed and the default port map name is used."

**FR25: Single-line port map contribution**
- Implied by the `port-map.js` structure but not validated. No AC verifies the format simplicity.
- **Recommendation:** Add an AC to Story 1.1: "Given the `port-map.js` file, When a new framework port is added, Then it requires only one line: `PORT: 'FrameworkName'`."

---

#### Out-of-PRD Features Found in Epics

**Epics-FR12 / Story 2.4: Global Pause/Resume Toggle**
- This feature (a global `isEnabled` toggle in the popup) has **no corresponding PRD requirement**. It was added during epic design without PRD backing.
- **Assessment:** The feature is pragmatically useful (screen recording scenario described in Story 2.4) and does not conflict with any PRD requirement. However, it represents scope added without formal requirements coverage.
- **Recommendation:** Either (a) add a corresponding FR to the PRD retroactively, or (b) document this as a known scope addition in the epics frontmatter with a note explaining the rationale. Do not remove the story — the feature is sensible — but close the traceability gap.

---

### Coverage Statistics

- **Total PRD FRs:** 26
- **Fully covered in epics:** 18
- **Implied / partially covered (no explicit AC):** 5 (FR4, FR7, FR12, FR22, FR25)
- **Not covered at all:** 3 (FR23, FR24, FR26)
- **Coverage percentage (full):** 69%
- **Coverage percentage (full + implied):** 88%

---

## UX Alignment Assessment

### UX Document Status

**Not Found.** No dedicated UX design document exists in the planning artifacts folder.

### UX Implied Assessment

A user-facing UI **is clearly implied** by the PRD and epics:
- FR15–FR19 define a popup interface with tab listing, inline editing, and empty state behavior
- NFR12–NFR14 define explicit accessibility requirements (keyboard navigation, WCAG 2.1 AA contrast, labelled inputs)
- Story 2.1–2.4 describe popup interaction patterns in detail (click-to-edit inline, blur/Enter save, global toggle)
- The PRD user journeys describe the popup interaction (Priya, Journey 2) with enough fidelity to substitute for wireframes

### Alignment Issues

**UX ↔ PRD Alignment**

| Area | Status | Notes |
|---|---|---|
| Popup renders active localhost tabs | ✓ Aligned | FR16 ↔ Story 2.1 AC |
| Inline click-to-edit name field | ✓ Aligned | FR17 ↔ Story 2.2 AC (blur or Enter save) |
| Empty state when no tabs | ✓ Aligned | FR19 ↔ Story 2.1 AC |
| Real-time title update on save | ✓ Aligned | FR18 ↔ Story 2.3 |
| Keyboard navigation | ✓ PRD NFR12, no conflict | No UX doc to cross-check |
| WCAG 2.1 AA contrast | ✓ PRD NFR13, no conflict | No visual spec to validate against |
| Remove/revert custom mapping via UI | ⚠️ Gap | PRD FR12 not modelled in popup UX — user workflow for clearing a name is not described |
| Pause/Resume toggle | ⚠️ Not in PRD | Story 2.4 feature has no PRD backing — the UX of this toggle (placement, label, icon) is unspecified anywhere |

**UX ↔ Architecture Alignment**

| Area | Status | Notes |
|---|---|---|
| Popup DOM rendering strategy | ✓ Aligned | Architecture explicitly requires targeted DOM updates (not innerHTML) to preserve focus — consistent with keyboard-navigable requirement |
| `chrome.storage.sync` async reads | ✓ Aligned | Architecture mandates awaited reads; popup render is async-safe |
| Real-time title update on popup save | ✓ Aligned | Architecture specifies live tab query + `executeScript` re-trigger path (Story 2.3) |
| WCAG contrast requirements | ⚠️ No spec | Architecture is silent on color choices/contrast. Without a visual design spec, no one can validate NFR13 until runtime |
| Focus management on inline edit | ✓ Aligned | Architecture explicitly prohibits full `innerHTML` re-render to preserve focus integrity |

### Warnings

- ⚠️ **No UX wireframes or visual spec exist.** For this project's complexity (a simple list-based popup), this is **low risk** — the PRD's journey descriptions are sufficient to implement from. However, NFR13 (WCAG 2.1 AA contrast) cannot be pre-validated without a visual design artifact.
- ⚠️ **The Pause/Resume toggle (Story 2.4) has no documented UX placement.** The story describes the behavior but not where in the popup the toggle lives, what it looks like, or what state it displays when paused. This is an implementation-time decision that may cause churn.
- ⚠️ **FR12 (remove custom mapping) has no defined UX flow.** How does a user revert a custom name to the default? Clear the input and hit Enter? A dedicated delete button? This needs to be decided before Story 2.2 is implemented.
- ℹ️ **Overall UX risk is LOW** given the simplicity of the popup UI (a single-screen list of ports). The missing UX document is not a blocker for implementation but the three warnings above should be resolved in Story planning.

---

## Epic Quality Review

Beginning **Epic Quality Review** against create-epics-and-stories standards.

Validating:
- Epics deliver user value (not technical milestones)
- Epic independence (no forward dependencies)
- Story dependencies (backward only)
- Proper story sizing, user personas, and AC completeness

---

### Best Practices Compliance Checklist

#### Epic 1: Zero-Config Tab Rewriting (Core Engine & Immediate Value)

| Check | Status | Notes |
|---|---|---|
| Epic delivers user value | ✓ Pass | "Developer immediately sees localhost tabs properly labeled" is clear user value |
| Epic can function independently | ✓ Pass | Epic 1 requires no other epic; delivers standalone value |
| Stories appropriately sized | ⚠️ Warning | Story 1.1 is a technical setup story (see Major Issues) |
| No forward dependencies | ✓ Pass | Stories depend only on prior stories in the same epic |
| Clear acceptance criteria | ⚠️ Warning | Stories 1.2, 1.3, 1.4 ACs describe implementation, not user outcomes |
| Traceability to FRs maintained | ⚠️ Warning | FR4, FR7 not explicitly addressed in any AC |

#### Epic 2: Custom Mappings & Popup UI (Power User Customization)

| Check | Status | Notes |
|---|---|---|
| Epic delivers user value | ✓ Pass | Customization + persistence is clear user value |
| Epic can function independently | ⚠️ Warning | Epic 2 depends on Epic 1 being complete — acceptable sequential dependency, but popup tab listing requires background worker to be running |
| Stories appropriately sized | ✓ Pass | Stories are well-scoped and independently completable |
| No forward dependencies | ✓ Pass | Story 2.3 references Story 2.2 as a prerequisite — acceptable backward reference |
| Clear acceptance criteria | ⚠️ Warning | ACs mix implementation details with behavior (see Major Issues) |
| Traceability to FRs maintained | ❌ Fail | FR12 (remove mapping) has no story; Story 2.4 (pause toggle) has no PRD FR |

---

### Quality Violations

#### 🟠 Major Issues

**Issue M1 — Story 1.1: Technical Setup Story Naming**
- **Violation:** Story 1.1 is titled "Initialize MV3 Background Architecture & Port Map" and its "As a" persona is "browser extension developer" (the author building the extension, not the end user). The ACs validate file existence (`manifest.json` exists, `port-map.js` exists) — these are technical deliverables, not user outcomes.
- **Standard Violated:** Stories must deliver user value, not technical milestones.
- **Severity:** Major — the story is acceptable for greenfield setup but needs reframing.
- **Remediation:** Rename to "Set Up Extension Foundation to Deliver Zero-Config Tab Labeling" with persona "As a developer who just installed the extension, I want the extension to load and apply default port labels immediately, So that I get value before any configuration." The ACs remain technically valid but should include the outcome: "Given the extension is installed, Then it launches without errors and the background service worker registers."

**Issue M2 — FR12 Uncovered: No Story for Removing Custom Mappings**
- **Violation:** PRD FR12 ("Users can remove a custom port name mapping, reverting to the default name or port number") has no story and no AC in Story 2.2 that covers this user flow.
- **Standard Violated:** Every PRD FR must be traceable to a story.
- **Severity:** Major — this is a user-facing feature gap that will be discovered during dev (what happens when a user clears an input field?) and may be handled inconsistently without an explicit decision.
- **Remediation:** Add an AC to Story 2.2: "Given a custom mapping `3000 → 'My App'` exists, When the user clears the name input and saves (blur or Enter), Then the custom override is removed from `chrome.storage.sync` and the tab title reverts to the default port map name (or port number if no default exists)."

**Issue M3 — Story 2.4: Undocumented Scope Addition**
- **Violation:** Story 2.4 (Global Pause/Resume Toggle) has no corresponding PRD Functional Requirement. It was added during epics design without PRD backing.
- **Standard Violated:** Stories should trace to PRD requirements; undocumented scope additions bypass product review.
- **Severity:** Major — the feature itself is pragmatically sound, but it adds scope that was never formally validated.
- **Remediation:** Either (a) add FR27 to the PRD retroactively: "Users can globally pause/resume the extension's title-rewriting behavior from the popup" — or (b) add a note to the epics frontmatter explicitly labelling this as a scope extension beyond the PRD. Do NOT remove Story 2.4; the feature is useful and well-implemented.

**Issue M4 — CI/CD Pipeline: Architectural Decision with No Story**
- **Violation:** The Architecture document explicitly states "CI/CD: GitHub Actions workflow for auto-zip + auto-publish to Chrome Web Store on tag push" as in-scope for MVP. There is no story in either epic covering CI/CD pipeline setup.
- **Standard Violated:** All architectural decisions that require implementation work must be represented as stories.
- **Severity:** Major — without a story, CI/CD will either be skipped or added as a rushed last-minute task with no AC validation.
- **Remediation:** Add Story 2.5 (or a new Epic 3 story): "As the project maintainer, I want a GitHub Actions workflow that auto-zips the extension and publishes to the Chrome Web Store on version tag push, So that releases are consistent and do not require manual packaging steps."

---

#### 🟡 Minor Concerns

**Issue m1 — Story 1.2 AC: Vague "injects correctly" Outcome**
- **Finding:** The AC states background.js "accurately matches the port against the default port map and injects `chrome.scripting.executeScript` correctly." "Correctly" is not testable.
- **Remediation:** Add specific outcome: "Then the tab title becomes `⚡ [PORT] — [DEFAULT_NAME]` (e.g., `⚡ 3000 — React`) within 100ms."

**Issue m2 — Stories 1.3, 1.4 ACs: Implementation-Described Rather Than Outcome-Described**
- **Finding:** Story 1.3 AC says "strictly verifies if the target tab title already contains the formatting prefix string." Story 1.4 AC says "runs the existing executeScript rewriting function." These describe HOW, not WHAT the user observes.
- **Remediation:** Reframe as: Story 1.3 — "Then the tab title does NOT become `⚡ 3000 — ⚡ 3000 — My App`." Story 1.4 — "Then all open localhost tabs display the port prefix without requiring a page refresh."

**Issue m3 — Story 2.1 Persona: "Generic Developer" is a Weak Persona**
- **Finding:** "As a generic developer" is not a specific enough persona. Compare to other stories' personas (full-stack developer, power-user developer, React/NextJS developer).
- **Remediation:** Rename to "As a developer who has just installed the extension and opens it for the first time."

**Issue m4 — Story 2.2 AC: Testing Language in AC**
- **Finding:** "tests confirm it seamlessly merges the user-override array over the `DEFAULT_PORT_MAP`" uses the word "tests" in an AC body — ACs should describe observable behavior, not testing methodology.
- **Remediation:** Replace with: "Given a custom mapping `{ '3001': 'Auth' }` is saved, When the popup re-renders, Then port `3001` displays `Auth` (not the default map value)."

**Issue m5 — Story 2.3 AC: Mechanism-Described Rather Than Time-Bound Outcome**
- **Finding:** AC describes storage listener and tab query loop mechanism rather than the user-observable result with a time constraint (NFR1: <100ms).
- **Remediation:** Add: "Then the tab title for port 3001 updates to `⚡ 3001 — Payment API` within 100ms of the save action, without requiring a page reload."

**Issue m6 — Story 2.4 AC: Pause Behavior on Existing Tabs Not Defined**
- **Finding:** When paused, the AC only states "background process returns immediately without renaming tabs moving forward." It does not specify what happens to already-renamed tabs. Do they stay renamed? Do they revert?
- **Remediation:** Add AC: "Given the extension is paused, Then already-renamed tabs retain their custom titles (no active reversion). When the extension is resumed, Then the next title change event triggers normal rewriting behavior."

**Issue m7 — FR Numbering Collision (Traceability Risk)**
- **Finding:** The epics document defines its own FR1–FR12 numbering that refers to completely different requirements than the PRD's FR1–FR26. Both documents use the same "FR#" notation for different concepts.
- **Remediation:** Rename the epics' internal FR references to "E-FR1" through "E-FR12" (or similar prefix) to distinguish them from PRD FRs. Alternatively, ensure the Coverage Map references PRD FRs directly by number.

---

### Epic Quality Summary

| Metric | Count |
|---|---|
| Epics reviewed | 2 |
| 🔴 Critical violations | 0 |
| 🟠 Major issues | 4 (M1–M4) |
| 🟡 Minor concerns | 7 (m1–m7) |
| Stories reviewed | 8 |
| Stories with AC quality issues | 5 (1.2, 1.3, 1.4, 2.2, 2.3) |
| PRD FRs missing story coverage | 3 (FR12, FR23–FR24, FR26) |

---

## Summary and Recommendations

### Overall Readiness Status

## 🟠 NEEDS WORK

The project has a solid foundation — the PRD is thorough, the architecture is well-reasoned, and the core epic/story structure correctly captures the primary user journeys. **No critical violations were found.** However, four major issues must be addressed before implementation begins to avoid mid-sprint rework, uncovered requirements, and scope surprises.

---

### Issues at a Glance

| Category | Critical | Major | Minor |
|---|---|---|---|
| FR Coverage | — | 4 gaps | 1 gap |
| UX Alignment | — | — | 3 warnings |
| Epic Quality | — | 4 violations | 7 concerns |
| **Total** | **0** | **8** | **11** |

---

### Critical Issues Requiring Immediate Action

> These 4 major issues should be resolved before the first implementation story is started.

**1. Missing Distribution & Open Source Stories (PRD FR23, FR24, FR26)**
The PRD defines three requirements with no corresponding epic or story:
- FR23: Chrome Web Store distribution
- FR24: GitHub open-source repository under MIT license
- FR26: Contribution guide (CONTRIBUTING.md)

These are the launch deliverables that define the project's reach and community viability. Without stories, they will either be forgotten or rushed at the end with no acceptance criteria. **Add a new Epic 3: "Publish & Open Source" or append stories to Epic 2** covering: GitHub repo setup, MIT license, README, CONTRIBUTING.md, Web Store developer account, privacy policy, and store listing submission.

**2. Remove/Revert Custom Mapping Not Modelled (PRD FR12)**
Story 2.2 handles adding and editing custom names but has no AC for the revert scenario. How a user removes an override is undefined — this will be discovered mid-implementation and likely handled inconsistently. **Add an AC to Story 2.2** for the clear-input-and-save flow that removes the custom entry from `chrome.storage.sync` and reverts to the default port map name.

**3. CI/CD Pipeline Has No Story (Architecture Decision)**
The Architecture document explicitly includes "GitHub Actions workflow for auto-zip + auto-publish to Chrome Web Store on tag push" in scope for MVP. There is no story for this. **Add Story 2.5** (or place it in Epic 3) covering the GitHub Actions workflow setup.

**4. Pause/Resume Toggle Is Undocumented Scope (Story 2.4)**
Story 2.4 introduces a global pause/resume toggle that has no PRD Functional Requirement. The feature is sensible but it constitutes scope added without formal product review. **Either add FR27 to the PRD** ("Users can globally pause/resume the extension's title-rewriting behavior") or add a scope note to the epics frontmatter explicitly documenting this as an intentional extension beyond PRD scope.

---

### Recommended Next Steps

1. **Add Epic 3 / Distribution Stories** — Cover FR23 (Web Store submission), FR24 (GitHub + MIT), FR26 (CONTRIBUTING.md). These can be done in parallel with development but need to be planned now.

2. **Amend Story 2.2 AC** — Add the revert/remove custom mapping scenario (FR12). Single sentence addition — 5-minute fix.

3. **Resolve Story 2.4 scope status** — Choose: add FR27 to the PRD, or annotate the epics frontmatter. Either resolution is acceptable; the ambiguity is the problem.

4. **Add CI/CD Story** — Add Story 2.5 or Epic 3 story for GitHub Actions auto-zip/publish pipeline.

5. **Strengthen 5 Story ACs** — Stories 1.2, 1.3, 1.4, 2.2, 2.3 have ACs that describe implementation mechanics rather than user-observable outcomes. Each requires 1–2 sentence additions to make them testable (see Minor Concern details m1–m5).

6. **Fix FR Numbering Collision** — Rename the epics' internal FR references (FR1–FR12) to a distinct prefix (e.g., E-FR1–E-FR12) to avoid confusion with PRD FR1–FR26. This is a documentation hygiene fix, not a functional change.

7. **(Optional / Low Risk)** Define the Pause Toggle UX — Document where in the popup the toggle lives, its visual state when paused, and whether it affects currently renamed tabs (see Issue m6, UX warning).

---

### Final Note

This assessment identified **19 issues** across **4 categories** (0 critical, 8 major, 11 minor/warnings). The core planning artifacts are sound — this is a well-scoped, low-complexity project with clear user journeys and solid architecture. The gaps are predominantly in distribution planning, a small number of missing ACs, and one undocumented scope addition. None of the issues require rearchitecting or re-writing existing documents from scratch.

**Estimated remediation effort:** 2–3 hours to address all major issues (adding missing stories and ACs, resolving scope annotation).

---

*Assessment completed: March 13, 2026*
*Assessor: AI Product Manager & Scrum Master (BMAD)*
*Report location: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-03-13.md`*
