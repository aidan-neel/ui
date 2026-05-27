import type { Manifest } from '$lib/silk/_manifest/types';

/**
 * Modal — centered dialog overlay. Composes `_internal/overlay` for the
 * shared focus-trap / click-outside / Escape / body-scroll-lock concerns;
 * owns its own portal, flyAndScale animation, and centered positioning.
 *
 * Wrapped by `alert-dialog` (kept post-Phase-4 per pattern guide §16.2).
 * `dialog` is deleted in Phase 4 item 8.
 *
 * Version history:
 *   1.0.0 — Phase 4 item 6 initial manifest. Modal-content was refactored
 *           to consume `_internal/overlay` (resolves F-30). The public
 *           component API (Root, Content, Trigger, Title, Description,
 *           Header, Body, Close, Footer, Confirm) is unchanged from the
 *           pre-Phase-4 state.
 */
export const manifest: Manifest = {
	name: 'modal',
	version: '1.0.0',
	visibility: 'public',
	description:
		'Centered dialog overlay with portal, focus trap, and click-outside. Composes _internal/overlay for shared mechanics; owns its own animation surface.',
	role: 'dialog',
	files: [
		'components/modal/modal.svelte',
		'components/modal/modal-content.svelte',
		'components/modal/modal-trigger.svelte',
		'components/modal/modal-title.svelte',
		'components/modal/modal-description.svelte',
		'components/modal/modal-header.svelte',
		'components/modal/modal-footer.svelte',
		'components/modal/modal-body.svelte',
		'components/modal/modal-close.svelte',
		'components/modal/modal-confirm.svelte',
		'components/modal/index.ts',
		'components/modal/manifest.ts'
	],
	components: ['button', '_internal/overlay'],
	shared: ['utils.cn', 'internals/state', 'internals/transition'],
	peerDependencies: {
		clsx: '^2.0.0',
		'tailwind-merge': '^3.0.0',
		svelte: '^5.0.0'
	}
};
