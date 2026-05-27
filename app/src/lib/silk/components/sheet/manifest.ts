import type { Manifest } from '$lib/silk/_manifest/types';

/**
 * Sheet — side-anchored slide-in panel. Composes `_internal/overlay` for
 * the shared focus-trap / click-outside / Escape / body-scroll-lock
 * concerns; owns its own CSS animation surface (slide-in from `side`)
 * and an outro `visible` flag tied to `animationend`.
 *
 * Version history:
 *   1.0.0 — Phase 4 item 6 initial manifest. Sheet-content was refactored
 *           to consume `_internal/overlay` (resolves F-30). The public
 *           component API (Root, Content, Trigger, Title, Description,
 *           Header, Footer, Close) and the `side`/`allowClickOutside`
 *           props are unchanged from the pre-Phase-4 state.
 */
export const manifest: Manifest = {
	name: 'sheet',
	version: '1.0.0',
	visibility: 'public',
	description:
		'Side-anchored drawer overlay (left | right). Slide-in animation with outro on animationend. Composes _internal/overlay for shared mechanics.',
	role: 'dialog',
	files: [
		'components/sheet/sheet.svelte',
		'components/sheet/sheet-content.svelte',
		'components/sheet/sheet-trigger.svelte',
		'components/sheet/sheet-title.svelte',
		'components/sheet/sheet-description.svelte',
		'components/sheet/sheet-header.svelte',
		'components/sheet/sheet-footer.svelte',
		'components/sheet/sheet-close.svelte',
		'components/sheet/index.ts',
		'components/sheet/manifest.ts'
	],
	components: ['button', '_internal/overlay'],
	shared: ['utils.cn', 'internals/state'],
	peerDependencies: {
		'@lucide/svelte': '^1.0.0',
		clsx: '^2.0.0',
		'tailwind-merge': '^3.0.0',
		svelte: '^5.0.0'
	}
};
