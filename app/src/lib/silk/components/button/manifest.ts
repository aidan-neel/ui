import type { Manifest } from '$lib/silk/_manifest/types';

/**
 * Button is the stability anchor of the silk library (pattern guide §13).
 * Fan-in ~12 — every interactive component pulls it.
 *
 * Version history:
 *   1.0.0 — implicit pre-Phase-4 state.
 *   2.0.0 — Phase 4 item 4:
 *           - Rename `onhover` → `onpointerenter` (DOM-aligned naming).
 *           - Rename `onhoverend` → `onpointerleave`.
 *           - DOM event listener switched from `mouseenter`/`mouseleave`
 *             to `pointerenter`/`pointerleave`.
 *           - Remove the vestigial `ButtonState` exported type.
 *           - Document the `element` union narrowing pattern in JSDoc.
 *   3.0.0 — Phase 4 item 7 (§13.5 resolution):
 *           - Delete the typed `onpointerenter` / `onpointerleave` props
 *             from `ButtonProps` entirely. Empirical grep verification
 *             across the entire codebase showed zero call-sites — the
 *             hooks were dead API even after the rename. Consumers
 *             needing pointer-event callbacks can pass them through the
 *             standard HTML attribute spread (`...HTMLButtonAttributes`
 *             or `...HTMLAnchorAttributes`); the dedicated typed props
 *             are gone.
 *           - Coordinated with item 7's F-29 collapse of tooltip and
 *             hover-card into popover wrappers.
 *
 * After 3.0.0, button is FROZEN for the rest of Phase 4.
 */
export const manifest: Manifest = {
	name: 'button',
	version: '3.0.0',
	visibility: 'public',
	description:
		'Click target with 10 variants and 4 sizes. Renders as <button> by default; renders as <a> when `href` is provided. Universal trigger primitive — pulled by every interactive silk component.',
	files: [
		'components/button/button.svelte',
		'components/button/index.ts',
		'components/button/variants.ts',
		'components/button/manifest.ts'
	],
	components: [],
	shared: ['utils.cn', 'internals/state'],
	peerDependencies: {
		clsx: '^2.0.0',
		'tailwind-merge': '^3.0.0',
		'tailwind-variants': '^3.0.0',
		svelte: '^5.0.0'
	}
};
