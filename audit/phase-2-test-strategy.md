# Silk Test Strategy (Phase 2)

**Status:** r2. Sequence: Phase 3 writes tests against this strategy → Phase 4 refactors with tests as the safety net.

## Revision history

- **r1**: initial test strategy.
- **r2 (this revision)**: reviewer cleanup, 8 items:
  - **1** — overlay dropped as a separate Tier 1 row. Internal primitives (per pattern guide §2.5) don't get standalone test rows; they're tested transitively through their public consumers. Modal/sheet tests run in Sprint 2 against current implementations and stay green when F-30 extraction lands.
  - **2** — tooltip and hover-card moved from Tier 2 to Tier 3. Post-F-29 collapse they're config wrappers over popover; behavioral surfaces are popover's. Tier 3 is visual snapshot + axe role check.
  - **3** — Sprint 3 no longer references tooltip/hover-card. F-29 collapse does NOT gate Sprint 3. Tooltip/hover-card land in Sprint 6 against post-collapse wrapper shape.
  - **4** — SSR `states` registry leak test specifies two concrete failure modes (memory growth, deterministic-key state bleed) with named assertions. Phase 4 escalation criteria added.
  - **5** — Manual SR five components named: modal, sheet, dropdown-menu, combobox, toast. Rationale documented.
  - **6** — New §1.1 lists what axe-core does NOT cover, with the right tool for each gap.
  - **7** — themes/presets Tier 1 scope clarified: programmatic surface only (CSS string parse, palette derivation, function output equality). Visual rendering under presets is Tier 3 snapshot territory.
  - **8** — New §9 CI policy spelling out which tiers gate merge vs. release.

**Inputs:**
- Phase 1 audit r4 (`audit/phase-1-audit.md`) — what's broken, what's load-bearing.
- Phase 1.5 pattern guide r2 (`audit/phase-1.5-pattern-guide.md`) — what the post-Phase-4 API surface looks like.
- §14 of pattern guide — committed a11y and SSR tiers, including the normative tooling-to-check mapping.

**What this document is:** a tiered, per-component test plan that names the stable boundary to test, the tool that tests it, and the order Phase 3 writes the tests in.

**What this document is NOT:** the tests themselves, infrastructure setup, or CI wiring. Phase 3 owns those.

**Hard rule: tests pin post-Phase-4 behavior, not current implementation.** Tests written against today's `dialog`, `tooltip`, `hover-card`, or popover's three-mode state will be thrown away in Phase 4. Tests written against the *consolidated* post-Phase-4 surface survive the refactor and become the safety net. This means a few Phase 4 changes (the wrapper collapses for F-29/F-30) need test specs written for components that don't fully exist yet — that's deliberate.

---

## 1. Tier definitions

| Tier | Criterion | Phase 3 priority | Tools |
|---|---|---|---|
| **Tier 1 — Critical** | Component owns state machinery, focus management, keyboard interactions, async lifecycle, OR is in the F-3/F-29/F-30 collapse path. A regression here breaks consumer apps. | Write first. Must pass before any Phase 4 refactor of the affected primitive begins. | Vitest (logic/state), Playwright (interaction/focus/keyboard), axe-core (a11y rules), manual (screen reader). |
| **Tier 2 — Integration** | Component composes primitives or has structural responsibilities, but failure surfaces as visual/UX issues, not consumer-app breakage. | Write after Tier 1. May run in CI as a separate gate. | Mostly Playwright; some Vitest for derived state. |
| **Tier 3 — Presentation** | Component is variant-driven rendering. Failure is visual. | Write after Tier 2. Visual snapshots only; no behavioral assertions. | Playwright snapshots, release-build cadence (not every PR). |
| **Skip — Trivial** | Component is a thin wrapper around a native element or a presentational div. Failure mode is "the prop didn't reach the DOM" which is caught by TypeScript at the call site. | Do not write. | None. |

**Tooling-per-check (from pattern guide §14.1, restated here as binding for Phase 3):**

| Check | Tool | Coverage |
|---|---|---|
| Pure functions, state derivation, prop reactivity | **Vitest** | Logic only; no DOM. |
| Keyboard nav, focus, click-outside, Escape | **Playwright** | Real browser, real event ordering. |
| ARIA attributes, role validity, color contrast at default theme | **axe-core inside Playwright** | WCAG SC subset only. |
| Visible behavior post-transition (component mounted, content rendered, animation complete) | **Playwright with `waitFor`** | Avoids timing flakes. |
| SSR render + hydration drift | **SvelteKit `vite-node` SSR + Playwright DOM compare** | Phase 2-specified SSR tier. |
| Screen reader announcements | **Manual** (NVDA + VoiceOver) | Top 5 components per release; documented script. |
| Reduced motion honoring | **Playwright with `prefers-reduced-motion: reduce`** | Asserts no animation or within reduced-motion budget. |
| Visual regression | **Playwright snapshot** | Tier 3 only, release-build cadence. |

**The pattern guide's "no axe = a11y solved" rule applies:** tests citing a11y coverage must name the specific check and tool. "axe passes" is not a sufficient a11y claim.

### 1.1 What axe-core does NOT cover (resolves reviewer item 6)

axe-core is a rule engine that catches **automatable WCAG violations**. It does not — and cannot — cover everything a11y. Explicit out-of-scope items, so Phase 3 doesn't over-rely on it:

| Check | Why axe can't | Where it's covered |
|---|---|---|
| **Focus-order correctness** (Tab visits the right elements in the right sequence) | axe inspects static DOM; tab order is a runtime behavior dependent on event handlers and focus traps. | Playwright keyboard scripts. |
| **Screen-reader announcement quality** (does the announcement convey the right meaning?) | Subjective semantics; no rule engine can grade announcement clarity. | Manual SR pass (§5.4). |
| **Live region timing** (does an `aria-live` region announce at the right moment, with the right politeness?) | axe checks `aria-live` is present; can't verify timing or queue behavior. | Playwright DOM-update timing assertions + manual SR for queue behavior (toast). |
| **Color contrast under non-default themes** | axe checks contrast for the rendered theme only. Silk has many themes (`themes/presets/`); axe at default theme misses contrast bugs in dark mode, custom presets, or user-authored themes. | Playwright with explicit theme switching, asserting axe at each. Phase 3 wires this as a parameterized test. |
| **Keyboard interaction semantics** (does Space activate a button-shaped div? Does Enter submit a form-shaped widget?) | axe checks role validity; it doesn't simulate keyboard input. | Playwright keyboard scripts. |
| **Programmatic focus management** (focus moves to the correct element on state change) | axe sees static state. | Playwright assertion on `document.activeElement` after state change. |
| **Reduced-motion honoring** | axe doesn't simulate `prefers-reduced-motion`. | Playwright with `emulateMedia({ reducedMotion: 'reduce' })`. |
| **Component composition semantics** (e.g. `aria-labelledby` actually points to a meaningful label, not just any element with that id) | axe checks the id resolves; can't grade whether the label is the right one. | Playwright DOM query + manual SR. |

Phase 3 a11y test plans MUST cite the correct tool for each check. A test row that says "axe handles a11y" gets sent back for revision.

---

## 2. Stable boundaries — what tests target

A **stable boundary** is a surface that, after Phase 4 refactor, still looks the same from a consumer's perspective. Tests target stable boundaries so they survive refactors.

**What is a stable boundary:**

1. **Bindable props at the component's public surface.** `open`, `value`, `checked`, `pressed`, `switched`, `page`.
2. **ARIA roles and attributes the component is documented to expose.** `role="dialog"`, `aria-checked`, `aria-expanded`, `aria-selected`.
3. **Keyboard contracts.** Tab order, Escape closes, Enter/Space activates, arrow keys navigate (where the component owns that responsibility).
4. **Focus management.** Where focus goes on open, where it returns on close, what gets the initial focus.
5. **Visible side effects of public props.** Setting `open=true` causes the content to mount and be visible. Setting `disabled=true` makes the control unresponsive.
6. **Public callback firing.** `onValueChange` fires when value changes via user input. Does NOT fire when value changes programmatically (or document the inverse).

**What is NOT a stable boundary (tests MUST NOT pin these):**

1. **Internal state shape.** `uiState.data.open`, the `states` global registry, any `$state` field on a component.
2. **Internal helpers.** `_state.ts`, `_helpers.ts` exports.
3. **Specific transition names, durations, or animation API.** `themedSlide`, `flyAndScale`, `--motion-duration-panel` — these can be retuned in Phase 4 without breaking the contract.
4. **Component composition.** Whether `combobox` wraps `popover`, whether `alert-dialog` wraps `modal`. These compositions are pattern-guide-mandated post-Phase-4 but the tests should hit the wrapper's public surface, not the primitive's.
5. **Specific class names or DOM structure.** Tests targeting `class="silk-modal-overlay"` will break the moment Tailwind classes change.
6. **`Math.random()` keys, generated IDs.** Stable-by-value, not stable-by-position.

**Example — modal:**

- ✅ Test: setting `open={true}` on `Modal.Root` causes `Modal.Content` to be present in the DOM and visible.
- ✅ Test: pressing Escape with focus inside `Modal.Content` closes the modal.
- ✅ Test: clicking outside `Modal.Content` closes the modal (unless `allowClickOutside={false}`).
- ✅ Test: focus is trapped inside `Modal.Content` while open (Tab cycles through focusables; Shift+Tab cycles backward).
- ✅ Test: focus returns to the previously-focused element when modal closes.
- ✅ Test: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby` are present.
- ❌ Do not test: the modal portals to `<body>` (implementation; overlay primitive may change).
- ❌ Do not test: a specific transition name or animation duration.
- ❌ Do not test: the modal uses `useState` or `states` registry.

This same lens applies to every Tier 1 component.

---

## 3. Per-component categorization

42 components, organized by tier. Each row names the stable boundary, the test tool, and any notes specific to Phase 4 refactor impact.

### 3.1 Tier 1 — Critical

| Component | Stable boundary | Tools | Phase 4 impact |
|---|---|---|---|
| **button** | Renders as `<button>` or `<a>` based on `href`; click fires `onclick`; pointer events fire `onpointerenter`/`onpointerleave` (post-§13.1 rename); variants render distinct classes; sizes render distinct heights; `disabled` prevents click; `aria-label` etc. spread correctly. | Vitest (variant→class mapping), Playwright (click, keyboard activation, focus). | §13.1 rename: tests use post-rename names. §13.5 (hover-hook ownership): if hooks move to popover, those specific tests move with them. |
| **popover** | `open` bindable opens/closes the panel; `placement` positions correctly; Escape closes; click-outside closes (unless suppressed); `hoverable=true` opens on hover with `delay`, closes after `closeDelay`; focus returns to trigger on close. | Playwright (real browser positioning, real event timing), axe (role validity on content). | Post-collapse popover has only `open` public — tests already write against that. `state_key`/`state` props ARE NOT tested. |
| **modal** | `open` bindable mounts/unmounts content; Escape closes; click-outside closes (unless suppressed); focus trapped inside while open; focus returns to opener on close; `role="dialog"` (or `"alertdialog"` from `alert-dialog` wrapper); `aria-modal="true"`; body scroll locked while open. | Playwright (focus, keyboard, body-overflow assertion), axe (ARIA correctness). | F-30 overlay extraction is internal — modal's public surface is unchanged. Tests written in Sprint 2 against today's modal-content stay green when the overlay primitive lands. **No separate overlay test row** (per pattern guide §2.5, internal primitives are tested through their public consumers). |
| **sheet** | Same as modal but: opens from `side` (`'left' \| 'right'`); slide-in transition completes before content is interactive. | Playwright. | F-30 overlay extraction is internal; sheet's public surface unchanged. Sprint 2 tests stay green post-extraction. |
| **combobox** | `open` opens results; search input filters items by `threshold`; arrow keys navigate results; Enter selects (fires `callback`); Esc closes; results announce count to AT. | Playwright (full keyboard nav), axe (combobox role). | Post-Phase 4 uses simplified popover state. Tests don't touch `state_key`. |
| **command** | Same as combobox but: fuzzy filter (specify threshold semantics); groups render with separators; selecting an item fires its `callback`. | Playwright. | Same as combobox. |
| **context-menu** | Right-click on trigger opens menu at pointer (virtual element); items activate on click and keyboard; sub-menus open on hover/focus; checkbox-items toggle. | Playwright (context-menu event simulation, sub-menu positioning). | Post-Phase 4 uses simplified popover state. |
| **dropdown-menu** | Trigger click/keyboard opens menu; items activate on click and Enter/Space; arrow keys navigate; Escape closes; sub-menus open with arrow-right, close with arrow-left. | Playwright. | Same. |
| **select** | Trigger opens listbox; arrow keys move highlight; Enter selects; type-ahead jumps to matching items; selected value displays in trigger; `aria-activedescendant` updates on highlight. | Playwright, axe (listbox/option roles). | Same. |
| **tabs** | Trigger click activates tab; arrow keys move focus through tabs (in `orientation`); Home/End jump to first/last; only active tab's content renders (unless `forceMount`); `aria-selected` and `aria-controls` correct. | Playwright. | None — tabs is stable. |
| **toggle** | `pressed` bindable; click toggles; `aria-pressed` matches state; disabled prevents toggle; `onPressedChange` fires on user change. | Vitest (state derivation), Playwright (click + a11y). | None. |
| **toggle-group** | `single` mode: only one item active; `multiple` mode: array value; arrow keys navigate; `onValueChange` fires. | Playwright. | None. |
| **accordion** | `single` vs `multiple` modes; `collapsible` controls whether single can fully close; bindable `value`; trigger click toggles item; transition completes before content interactive; `aria-expanded` correct. | Playwright. | None. |
| **collapsible** | Same as accordion but single-item: bindable `open`; trigger toggles; transition completes; `aria-expanded` correct. | Playwright. | None. |
| **input** | Bindable `value` updates on user input; `type="checkbox"` uses `checked`; `type="file"` uses `files`; `placeholder`, `disabled`, native attributes spread. | Vitest (binding logic via Svelte testing utils), Playwright (real input events). | Variants move to `_shared/` (F-31). Tests target the input component's public surface, not variants file. |
| **textarea** | Bindable `value`; `min-h`/`resize-y` styling; variant rendering. | Vitest (binding), Playwright (resize behavior — sanity only). | Shares variants with input post-Phase 4. |
| **checkbox** | Bindable `checked`; label coupling (`<label>` wraps `<input>`); `disabled` prevents toggle; `aria-checked`. | Playwright (click + space-bar), axe. | F-23: prop type uses `DefaultProps` (Phase 4 cleanup). Tests don't care which type spec is used; they target behavior. |
| **radio-group** + **radio-group-item** | One item active at a time within a group; arrow keys navigate; `aria-checked` on item; `disabled` per item; bindable group `value`. | Playwright, axe (radio-group semantics). | None. |
| **switch** | Bindable `switched`; click/Space/Enter toggles; `role="switch"`, `aria-checked`; label-click also toggles. | Playwright, axe. | F-14: inline `style:transition` strings move to CSS (Phase 4). Tests pin functional behavior, not transition values. |
| **slider** | Bindable `value`; arrow keys step by `step`; clamped to `min`/`max`; `aria-valuenow`/`aria-valuemin`/`aria-valuemax`. | Playwright. | None. |
| **calendar** | Bindable `value`; navigation buttons move month; `min`/`max` disable out-of-range days; `weekStartsOn` adjusts grid; arrow-key date navigation (full keyboard a11y). | Playwright (heavy keyboard testing), axe. | None. |
| **color-picker** | `value` is hex (6-char); changing HSV updates hex; changing hex updates HSV; invalid hex doesn't crash; option chips set value. | Vitest (color conversion functions — extract `hexToHsv` etc. for direct testing), Playwright (drag interaction). | None — but color-picker's complex state (F-internal) is a strong candidate for the §5.3 component-local migration. |
| **toast** | `toast(...)` creates a toast; `toast.success/error/warning/info/loading` apply correct `type`; `toast.promise()` transitions states; durations honored; `toast.dismiss(id)` removes; max 5 toasts (oldest auto-dismissed); pause-on-hover delays dismissal. | Vitest (lifecycle, timer math), Playwright (visual + hover-pause). | F-12 (magic-string `'toast'` key), F-25 (magic durations), F-26 (missing guard) — all fixed in Phase 4. Tests pin observable behavior, not internal key/duration. |

### 3.2 Tier 2 — Integration

| Component | Stable boundary | Tools | Phase 4 impact |
|---|---|---|---|
| **alert-dialog** | Wraps modal with `role="alertdialog"`; default `allowClickOutside=false`; exposes `Exit`/`Confirm` (no `Close`). | Playwright. | F-3 kept. Tests target alert-dialog's distinctive contract (role, click-outside default). |
| **avatar** + **avatar-image** + **avatar-fallback** | `imageLoaded` state coordinates image/fallback visibility; image load failure shows fallback. | Playwright (image-load events). | None. |
| **pagination** | `page`/`total`/`siblings` produce expected page-button set; `onPageChange` fires on click; Prev/Next disable at bounds. | Vitest (pagination math), Playwright (click). | None. |
| **scroll-area** | `orientation` prop sets correct overflow rule. | Playwright (visual check + scrollbar presence). | None. |

### 3.3 Tier 3 — Presentation

Visual snapshot only. Snapshots taken in release builds, not per-PR (to limit churn). Plus axe-core ARIA check on rendered output where role/semantics matter.

| Component | What's snapshotted | Tool |
|---|---|---|
| **alert** | All variants (`info`, `error`, `success`, `warning`) at default theme; light and dark. | Playwright snapshot. |
| **badge** | All 7 variants; with and without icon; with and without href. | Playwright snapshot. |
| **card** + **card-header** + **card-title** + **card-description** + **card-content** + **card-footer** | One composed card example with all parts. | Playwright snapshot. |
| **breadcrumb** + **breadcrumb-item** + **breadcrumb-separator** | Three-level breadcrumb example. | Playwright snapshot. |
| **progress** | Determinate (multiple values) and indeterminate. | Playwright snapshot. |
| **marquee** | Static snapshot at one frame (visual sanity only, not animation testing). | Playwright snapshot. |
| **tooltip** *(post-collapse from F-29)* | Default styled `Tooltip.Content` rendered in open state. axe-core check confirms `role="tooltip"` is set. | Playwright snapshot + axe. |
| **hover-card** *(post-collapse from F-29)* | Default styled `HoverCard.Content` rendered in open state. axe-core check confirms `role` is set as decided in Phase 4 a11y review. | Playwright snapshot + axe. |

**Rationale for tooltip/hover-card placement in Tier 3** (resolves reviewer item 2): post-F-29 collapse, both are popover wrappers that hardcode `hoverable: true`, set a default `delay`, apply a `role`, and ship default `Content` styling. All behavioral surfaces (hover-delay, escape, click-outside, focus, positioning) are popover's, tested in popover's Tier 1 row. What's wrapper-specific is preset configuration and styling — that's visual + axe role check, which is exactly Tier 3.

### 3.4 Skip — Trivial

These components are thin wrappers around native elements or pure presentational divs. TypeScript catches the prop-forwarding case at the call site.

| Component | Justification for skip |
|---|---|
| **label** | Thin `<label>` wrapper; native HTML behavior. |
| **separator** | Presentational; `role="separator"` is set declaratively. |
| **skeleton** | Pure CSS animation; no logic. |
| **shortcut** | Pure presentational. |
| **modal-trigger / modal-close / modal-confirm**, **dialog-trigger / dialog-exit / dialog-confirm**, **alert-dialog-{title,description,header,footer,trigger,exit,confirm}**, **sheet-{trigger,header,footer,close,title,description}** | Sub-parts of compound components; their behavior is covered by the parent component's Tier 1 test (e.g. modal's "click close button → modal closes" test exercises `modal-close`). |
| **all `*-title`, `*-description`, `*-header`, `*-footer` parts** of compound components | Same reasoning. They render their content; their semantics are tested via parent compound tests where the ARIA labelling is asserted. |

---

## 4. Utilities and internals

| Module | Tier | Stable boundary | Tools |
|---|---|---|---|
| **utils.cn** | 1 | Class string output for known input shapes (clsx + twMerge composition); does not lose Tailwind classes that should win conflict resolution. | Vitest. |
| **utils.trapFocus** | 1 | Tab/Shift+Tab cycles inside container; Esc does NOT close (caller's responsibility); `initialFocus` honored; cleanup restores previous focus. | Playwright. |
| **utils.clickOutside** | 1 | Callback fires on click outside the node; does NOT fire for clicks inside `exclude` nodes; does NOT fire for clicks on `[data-floating-content]`. | Playwright. |
| **utils.getFocusableElements** | 2 | Returns expected focusable nodes for a known DOM tree; filters disabled, aria-hidden, and offscreen non-fixed elements. | Vitest with jsdom (DOM query only, no layout). |
| **utils.positionFloatingPanel** | 2 | Floating-ui composition produces valid positions; sets `--popover-available-width/height` CSS vars. | Playwright (real layout). |
| **utils.focusFirstDescendant** | Skip | Used only internally by `trapFocus`; covered transitively. Phase 4 unexports per F-20. | — |
| **internals/state.svelte.ts** | 2 | `useState` returns a registered entity; `destroy()` removes from registry; same key returns same instance. Note: tests do not pin the global `states` registry shape — they pin observable behavior of `useState`. | Vitest. |
| **internals/transition.ts** | 3 | `getCssDuration` reads CSS vars correctly; `flyAndScale`/`themedFade`/etc. return valid TransitionConfig objects. | Vitest for `getCssDuration`/`getCssNumber`; Playwright snapshot for visual transitions (one per transition function). |
| **themes/presets.ts** | 1 | **Programmatic surface only** — `themeToCss(ThemeDraft)` produces a valid CSS string (parse the output, assert `@theme` block contains expected vars, assert `.dark` block exists when dark palette differs); `generatePaletteFromBase(base)` derives expected palette from a 5-color base (assert key-value structure, assert luminance contrast within tolerance); `resolveThemeMotion(preset, overrides)` merges presets correctly (deep equality on output); `slugifyThemeName` handles edge cases (empty, all special chars, very long, unicode); `themeToTypeScriptPreset(ThemeDraft)` returns parseable TS source (Vitest can `eval` or use TS compiler API for validation). **Visual rendering under each preset is NOT in scope here** — that would be snapshot infrastructure which Tier 3 defers to release cadence. Tier 1 covers the pure-function output shape and value correctness; visual confirmation that the generated CSS produces the intended look is a Tier 3 concern (one snapshot per built-in preset, release-build cadence). | Vitest. (Resolves reviewer item 7.) |
| **themes/live.ts** | 2 | `applyLiveThemeCss` injects style tag; `hydrateLiveThemeCss` restores from localStorage; `saveThemeStudioState` round-trips. | Playwright (localStorage + DOM injection). |
| **themes/builtin-presets.ts** | 3 | Returns at least one preset; default slug='default' is sorted first. | Vitest. |
| **themes/transitions** | 3 | Each preset's motion object validates against `ThemeMotion`. | Vitest (schema check). |

---

## 5. A11y tier specification (committed in pattern guide §14)

Tier 1 a11y test plans, per component group:

### 5.1 Overlay components (modal, sheet, alert-dialog, all popover wrappers)

| Check | Tool | Assertion |
|---|---|---|
| `role` is dialog / alertdialog / menu / listbox / etc. (component-specific) | axe inside Playwright | Role present and valid for usage. |
| `aria-modal="true"` on dialog/alertdialog | axe + Playwright | Attribute present. |
| `aria-labelledby` resolves to a title element with text | Playwright (DOM query) | Title element exists, has text content. |
| `aria-describedby` resolves (when description present) | Playwright | Same. |
| Tab cycles through focusables inside overlay | Playwright keyboard test | Focus stays inside while open. |
| Shift+Tab cycles backward | Playwright | Same. |
| Escape closes | Playwright | Component closes. |
| Focus returns to opener on close | Playwright (assert `document.activeElement` post-close) | Focus restored. |
| Initial focus lands on first focusable inside (or `initialFocus` if specified) | Playwright | `document.activeElement` matches expected after open transition. |
| Color contrast at default theme (light + dark) passes WCAG AA | axe with theme switch | axe returns 0 violations. |

### 5.2 Input components (input, textarea, checkbox, radio-group, switch, slider)

| Check | Tool | Assertion |
|---|---|---|
| Label association (`for`/`id` or wrapping) | axe | Every interactive has a label. |
| `aria-checked` / `aria-pressed` reflects state | Playwright | Attribute matches bindable value. |
| `aria-disabled` reflects `disabled` prop | Playwright | Attribute set when disabled. |
| Keyboard activation (Space for checkbox/switch, Enter+Space for button-like, Arrow keys for slider/radio-group) | Playwright | State changes from keyboard alone. |
| Required vs optional state announced (where relevant) | Manual SR | NVDA + VoiceOver script. |

### 5.3 Floating components (popover, combobox, command, dropdown-menu, context-menu, select)

| Check | Tool | Assertion |
|---|---|---|
| Trigger has `aria-haspopup`, `aria-expanded` reflects open state | Playwright + axe | Attributes update on open/close. |
| Content has appropriate `role` (`menu`, `listbox`, `dialog`) | axe | Role present. |
| Active item has `aria-current` or `aria-selected` or focus | Playwright | Highlighted item marked. |
| Type-ahead works (select, dropdown-menu, command) | Playwright | Typing letters jumps focus. |
| Arrow-key navigation includes Home/End | Playwright | Home → first; End → last. |

### 5.4 Manual screen-reader pass (top 5 per release)

The five components requiring manual NVDA + VoiceOver verification before each release:

1. **modal** — focus management, dialog announcement on open, label/description read correctly, focus restoration on close.
2. **sheet** — same set as modal but verifying role correctness and side-anchored variant.
3. **dropdown-menu** — menu announcement on open, item navigation feedback, sub-menu announcement, "selected"/"focused" item disambiguation.
4. **combobox** — typed-character feedback, result count announcement, selection announcement, "no results" state announcement.
5. **toast** — live region announcement on appear; `aria-live="assertive"` on errors vs `"polite"` on info; multi-toast queueing without announcement-overlap.

**Rationale (resolves reviewer item 5):** picks lean toward components with the highest-risk SR surfaces — overlays where focus management is critical (modal, sheet), navigable floating content (dropdown-menu, combobox), and live regions (toast). Popover-as-primitive is covered transitively through its wrappers (dropdown-menu, combobox). Command duplicates combobox's announcement patterns enough that one of the two covers both; combobox picked because it's slightly broader. Switch/checkbox state-change announcements are tested via Playwright DOM assertions (the announcement is rendered into `aria-live` regions that DOM-query can verify), so they don't need manual SR.

The manual script is documented in `audit/manual-a11y-script.md` (Phase 3 creates this file alongside test setup).

### 5.5 Reduced motion (committed in pattern guide §14.1)

For every component with a transition (accordion, collapsible, modal, sheet, all popover-based components, hover-card, toast), Playwright test runs with `prefers-reduced-motion: reduce` emulation enabled and asserts:

- The open/close cycle completes within 50ms of state change (effectively no transition).
- The component is interactive (focusable, clickable) at the post-transition state.

This is one shared test helper, not 20 separate tests.

---

## 6. SSR tier specification

Committed in pattern guide §14.2. Every component runs through SvelteKit SSR. The SSR test suite asserts, per component:

| Check | Mechanism | Assertion |
|---|---|---|
| Server render does not throw | `vite-node` SSR render via SvelteKit's test harness | No `document is not defined` / `window is not defined` / `localStorage is not defined` errors. |
| First-paint HTML matches hydration | Playwright captures first-paint, then waits for hydration, then captures again; compares | DOM structure unchanged. |
| Bidirectional-sync components (modal, popover, sheet, hover-card) do not show hydration drift | Same comparison, with the component in its default closed state | No mismatched attributes (e.g. `data-state="open"` on one side and `data-state="closed"` on the other). |
| Components that read `localStorage` (themes/live.ts hydration on app boot) guard with `browser` check | Code review (already enforced by `themes/live.ts:48` pattern) — plus one SSR boot test | App boots in SSR without error. |

**Note on global `states` registry SSR risk** (flagged in audit §7 SSR tier):

The module-level `states = $state<Record<string, UIState>>({})` in `internals/state.svelte.ts:30` is process-scoped. Server-side, cleanup (`onDestroy → delete states[key]`) does NOT run (no client lifecycle), so the Map only grows. Two concrete failure modes the test must assert against:

**Failure mode 1 — memory growth (unbounded `states` Map server-side).**

> **Test:** in a single Node process simulating a long-lived SSR server, render the same SvelteKit page 100 times in sequence. After each render, sample `Object.keys(states).length`. **Assertion:** `Object.keys(states).length` stays bounded across renders (no monotonic growth proportional to render count).
>
> **Current expected result:** this test fails today — every `useState()` call with a generated random key adds a new entry, and nothing removes it server-side. Documenting this here so Phase 3 can encode it as a known-fail-now, expected-pass-after-Phase-4 test.

**Failure mode 2 — request-to-request state bleed (deterministic-key collision).**

> **Test:** render a page that uses `toast` (which uses the deterministic key `'toast'` per F-12, `lib.svelte.ts:61`). Trigger a toast during SSR simulation. Render the same page again in the same process. **Assertion:** the second render's `states['toast'].data.toasts` is the initial empty array (`[]`), not carrying the toast from render 1.
>
> **Current expected result:** this test fails today because `toastUIState` is a module-level singleton. Phase 4's resolution to F-12 (rename to a Symbol or namespace) is necessary but not sufficient — the underlying issue is that any deterministic key shared across requests bleeds state.

**Phase 4 escalation criteria.** If either test fails after Phase 4's known-scope changes land (F-12 rename, F-7 deterministic-key elimination), Phase 4 expands to include per-request state isolation. This is the "Phase 4 may have to do more than planned" trigger; Phase 2 names it so it's not a surprise.

---

## 7. Visual regression and browser-runner policy

### 7.1 Browser-runner policy (added r3)

Most tests run in jsdom via `@testing-library/svelte`. Browser-mode tests run via `vitest-browser-svelte` + `@vitest/browser-playwright` (Chromium-only). The browser runner is **opt-in per file** (file naming: `*.browser.test.ts`), not the default.

**Browser-runner is justified for tests that exercise any of:**

- Mount/unmount lifecycle through a portal (overlay components — modal, sheet, popover and its wrappers).
- Focus management across portal boundaries.
- Click-outside detection (`use:clickOutside` from utils, which registers document-level listeners via `setTimeout(0)` — jsdom doesn't reliably handle the listener-install timing).
- Real keyboard event propagation through `document` (Escape, Tab cycling for focus traps).
- Transition lifecycle (Svelte 5 `transition:` directives that depend on `element.animate` and `getComputedStyle` results that jsdom returns inconsistently).

**Everything else stays in jsdom.** New tests do NOT default to browser-mode. To put a test in browser-mode, the author justifies the choice against the bulleted list. If none of those apply, the test runs in jsdom.

### 7.1.5 Query conventions (added Sprint 4 → enforced Sprint 5+)

When asserting on rendered UI:

- **Default to `getByRole`** with an accessible name. Mirrors how assistive tech finds elements; survives text-content shifts that don't change semantics.
- **Use `getByText` only when text uniqueness is structural** — section headings, single-instance labels, error messages distinct from any control.
- **Avoid `getByText` for clickable content** unless the text is provably unique within the rendered subtree. Title text and button text often collide (caught Sprint 4: `Delete project?` title + `Delete` button → routed through `getByRole('button', { name: 'Delete' })`).
- `getByTestId` remains the fallback for content that lacks both role and unique text.

The convention applies to both jsdom (`@testing-library/svelte`) and browser (`vitest-browser-svelte`) test files.

### 7.2 Visual regression

Tier 3 only, release-build cadence (not per-PR). Snapshot infrastructure:

- Playwright `toMatchSnapshot` with stable platform (Linux CI runners only — no cross-OS snapshots).
- **Chromium-only until shipping.** Revisit trigger: silk publishing to consumers, OR a real cross-browser bug surfacing in a consumer project.
- Snapshots stored in `app/tests/visual-snapshots/`.
- Threshold: `maxDiffPixelRatio: 0.005` (allows trivial subpixel differences).
- Snapshots update on `release/*` branches only; PRs against `main` don't change snapshots.

This keeps the visual-regression maintenance cost contained. Phase 2's commitment is: snapshots exist for the components in §3.3; they run on releases; mismatches block release until reviewed.

---

## 8. Phase 3 sequencing

Phase 3 writes tests in this order. Each block ends with green tests as gating criteria for the next block.

### 8.1 Sprint 1 — Utilities and pure functions (Vitest only, no DOM)

- `utils.cn`
- `themes/presets.ts` (palette derivation, CSS generation, slugify, motion resolution)
- `internals/transition.ts` (`getCssDuration`, `getCssNumber`)
- `themes/transitions` (schema validation)
- `color-picker` color-conversion helpers (`hexToHsv`, `hsvToHex`, etc. — these can be extracted to a testable module if not already).

**Gate:** Vitest infrastructure works; CI runs Vitest on every PR.

### 8.2 Sprint 2 — Foundational primitives (Tier 1, Vitest + Playwright)

In dependency-graph order, leaves first. **No overlay row** — overlay is an internal primitive per pattern guide §2.5; tests for it land transitively through modal and sheet, which work against today's duplicated implementations and stay green when F-30 extraction runs (modal/sheet public surface is unchanged).

1. **button** — covers variant rendering, dual-mode, focus, disabled.
2. **utils.trapFocus, utils.clickOutside, utils.getFocusableElements** — covers DOM helpers used by modal and sheet.
3. **internals/state.svelte.ts** — covers useState/UIState behavior.
4. **modal** — covers dialog semantics, focus trap, body-overflow, Escape, click-outside.
5. **sheet** — covers same set + slide animation + side prop.
6. **popover** — covers floating positioning + hover-delay + escape.

**Gate:** every Tier 1 foundation component has tests. Phase 4 may now refactor any of the above — including F-30 overlay extraction — with the tests as safety net.

### 8.3 Sprint 3 — Wrappers and composite Tier 1

In dependency-graph order:

8. **alert-dialog** — modal wrapper, distinctive contract.
9. **combobox, command, context-menu, dropdown-menu, select** — popover wrappers; share Playwright infrastructure.
10. **tabs**
11. **accordion, collapsible**

**Tooltip and hover-card are NOT in Sprint 3** (resolves reviewer item 3). They drop to Tier 3 per §3.3, which lives in Sprint 6. This avoids the Phase 3/Phase 4 interleaving problem: tooltip's and hover-card's behavioral surface is popover's, which is tested in Sprint 2. The wrapper-specific surface (role + default styling + default delay) is snapshot + axe in Sprint 6, written against the post-collapse wrapper shape. Sprint 3 has no dependency on F-29 collapse landing.

**Gate:** Phase 4 may now refactor F-3 (delete `dialog`) with tests as safety net. F-29 (tooltip/hover-card collapse) does NOT gate on this sprint — it can land any time before Sprint 6.

### 8.4 Sprint 4 — Input components (Tier 1)

14. **input, textarea**
15. **checkbox, radio-group, switch**
16. **slider, calendar, color-picker**
17. **toggle, toggle-group**
18. **toast**

**Gate:** every Tier 1 component covered. Phase 4 may now begin component-by-component refactor.

### 8.5 Sprint 5 — Tier 2 + a11y + SSR

19. **avatar, pagination, scroll-area**
20. **A11y tier** — axe runs on every Tier 1 test (already wired in earlier sprints); manual SR pass scheduled for the 5 components.
21. **SSR tier** — every component renders server-side; bidirectional-sync components tested for drift; multi-request `states` registry leak test.
22. **Reduced motion** — shared helper test.

**Gate:** Tier 1 + Tier 2 + a11y + SSR all green. Phase 4 refactor can proceed against full safety net.

### 8.6 Sprint 6 — Tier 3 (visual + post-collapse wrappers)

23. **Tier 3 snapshots** — alert, badge, card, breadcrumb, progress, marquee. Release-build cadence.
24. **tooltip, hover-card** — visual snapshots + axe role check on the post-F-29-collapse wrapper shape. Requires F-29 collapse to have landed; otherwise the snapshot captures the to-be-deleted standalone implementations.

**Gate (optional):** Phase 4 can begin earlier (after Sprint 5) without Sprint 6 in place; Tier 3 lands when ready. Tooltip and hover-card specifically wait for F-29 collapse.

---

## 9. CI policy (resolves reviewer item 8)

Default CI gating, so Phase 3 doesn't have to derive this:

| Tier / suite | Failure mode | Gates |
|---|---|---|
| **Tier 1 (Vitest + Playwright + automated axe)** | Any failure. | **Blocks merge to `main`.** |
| **Tier 2 (Vitest + Playwright)** | Any failure. | **Blocks release** (any branch tagged for release). Does not block PR merges by default. |
| **Tier 3 (visual snapshots)** | Snapshot diff outside threshold. | **Informational on PRs**; **blocks release** with manual review required to update snapshots. |
| **A11y — automated (axe)** | Any failure. | Same as Tier of the component being tested. |
| **A11y — manual SR pass (top 5)** | Documented announcement deviation. | **Blocks release**; failure documented in release notes if accepted as known issue. |
| **SSR tier** | First-paint vs hydration mismatch; SSR boot error. | **Blocks merge to `main`** (SSR is a CLI-distributed library hard requirement). |
| **Reduced-motion tier** | Animation runs when reduced-motion is requested. | **Blocks merge to `main`**. |
| **States-registry leak tests (§6, failure modes 1+2)** | Known-fail today. | **Reported, not gating** until Phase 4 lands its registry fixes. Once Phase 4 expected-pass criteria are documented, these flip to **block merge to `main`**. |

**Why this gating shape:** Tier 1 + SSR + reduced-motion are public contracts; breaking them on `main` means consumers of silk encounter broken behavior. Tier 2 is integration quality that surfaces as bug reports — block at release, not merge, so iteration speed isn't penalized for behavior nobody-installs-yet. Tier 3 is visual; snapshots churn on intentional design changes and shouldn't block PRs that intentionally modify visuals — but they MUST be reviewed at release time so we know what changed.

**Deferred to Phase 3 / future CI policy doc:**
- Flakiness retry policy (Playwright's `retries` config).
- Test parallelism limits.
- Branch protection rules (which branches enforce which suites).
- How snapshot updates are reviewed (PR-by-PR vs. batch at release).

Phase 3 may revise this table once concrete test runtimes are known. The values above are the starting policy, not a permanent commitment.

---

## 10. What this strategy does NOT specify

Out of scope for Phase 2; Phase 3 owns these:

- **Test file naming and location.** Phase 3 picks (likely `*.test.ts` for Vitest, `*.spec.ts` for Playwright, colocated next to components or under `app/tests/`).
- **CI configuration.** Which workflows run which suite, on what triggers.
- **Test helper modules.** Mount harnesses, theme setup, axe configuration. Phase 3 builds these as Tier 1 tests are written.
- **Snapshot management procedure.** Who reviews snapshot diffs on release branches.
- **Performance budgets.** Test runtime limits.

Out of scope for Phase 3 (deferred to a later workstream):

- **Bundle size testing** — auto-pull means there is no library bundle.
- **Cross-browser testing beyond Chromium** — Playwright supports it; commit when there's a consumer using Firefox/WebKit primarily.
- **Mobile-specific touch testing** — when silk components are validated on mobile, this becomes its own tier.

---

## 11. Sanity-check the strategy

A reviewer should be able to answer the following from this document:

- ✅ Which components have tests? (Tier 1, Tier 2, Tier 3 in §3.)
- ✅ What's the boundary the tests target? (§2, plus per-component "stable boundary" column in §3.)
- ✅ What tool tests what? (§1 table + per-component "Tools" column.)
- ✅ How do the tests survive Phase 4 refactor? (Stable-boundary rule in §2; per-component "Phase 4 impact" column in §3.)
- ✅ When does each test get written? (§8 sprints.)
- ✅ How does a11y get covered? (§5, with explicit tool-to-check mapping from pattern guide §14.)
- ✅ How does SSR get covered? (§6.)
- ✅ What is explicitly skipped? (§3.4.)

If a reviewer can't answer one of those, that's the section to fix.

---

**Phase 2 status: r2 complete, Phase 3 approved to begin.** Items 1–3 (gating sprint planning) resolved. Items 4–8 addressed in parallel with Sprint 1 per reviewer direction.
