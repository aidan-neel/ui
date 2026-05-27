import type { Manifest } from '$lib/silk/_manifest/types';

/**
 * Toast.
 *
 * 1.0.0 — implicit pre-Phase-4. Module-level singleton (P3-F12 bug).
 * 2.0.0 — Phase 4 item 1 (P3-F12 resolution): per-Toaster-mount state.
 *         Module-level singleton removed. Free-function `toast(...)` is a
 *         no-op when no Toaster is mounted (e.g., SSR). Breaking change:
 *         the `toastUIState` named export is gone; consumers reading
 *         state directly switch to `getToastUIState()`.
 */
export const manifest: Manifest = {
	name: 'toast',
	version: '2.0.0',
	visibility: 'public',
	description:
		'Toast notification system with Toaster portal, free-function toast() API, and per-Toaster-mount state isolation (SSR-safe).',
	files: [
		'components/toast/lib.svelte.ts',
		'components/toast/toaster.svelte',
		'components/toast/toast.svelte',
		'components/toast/index.ts',
		'components/toast/manifest.ts'
	],
	components: ['button'],
	shared: ['utils.cn', 'internals/state', 'internals/transition'],
	peerDependencies: {
		'@lucide/svelte': '^1.0.0',
		clsx: '^2.0.0',
		'tailwind-merge': '^3.0.0',
		svelte: '^5.0.0'
	}
};
