import type { Manifest } from '$lib/silk/_manifest/types';

/**
 * Dropdown menu.
 *
 * 1.0.0 — implicit initial.
 * 2.0.0 — Phase 4 item 2 a11y fix: aria-allowed-attr resolved by
 *         conditional aria-modal in Popover.Content (now only applied
 *         for role="dialog"/"alertdialog", not for role="menu").
 */
export const manifest: Manifest = {
	name: 'dropdown-menu',
	version: '2.0.0',
	visibility: 'public',
	description: 'Click-triggered menu popover with items, labels, separators, and nested submenus.',
	role: 'menu',
	files: [
		'components/dropdown-menu/dropdown-menu.svelte',
		'components/dropdown-menu/dropdown-menu-trigger.svelte',
		'components/dropdown-menu/dropdown-menu-content.svelte',
		'components/dropdown-menu/dropdown-menu-item.svelte',
		'components/dropdown-menu/dropdown-menu-label.svelte',
		'components/dropdown-menu/dropdown-menu-separator.svelte',
		'components/dropdown-menu/dropdown-menu-sub.svelte',
		'components/dropdown-menu/dropdown-menu-sub-trigger.svelte',
		'components/dropdown-menu/dropdown-menu-sub-content.svelte',
		'components/dropdown-menu/index.ts',
		'components/dropdown-menu/manifest.ts'
	],
	components: ['popover', 'button'],
	shared: ['utils.cn', 'internals/state'],
	peerDependencies: {
		clsx: '^2.0.0',
		'tailwind-merge': '^3.0.0',
		svelte: '^5.0.0'
	}
};
