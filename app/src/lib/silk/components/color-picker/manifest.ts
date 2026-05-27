import type { Manifest } from '$lib/silk/_manifest/types';

/**
 * Color picker.
 *
 * 1.0.0 — implicit initial.
 * 2.0.0 — Phase 4 item 10b (P3-F3): conversion helpers (hexToHsv,
 *         hsvToHex, hexToHsl, hslToHex, isValidHex) extracted to
 *         `conversions.ts`. No public-API change; internal refactor
 *         for testability. Bump for the new file in the manifest.
 */
export const manifest: Manifest = {
	name: 'color-picker',
	version: '2.0.0',
	visibility: 'public',
	description:
		'Popover-based color picker with SB drag, hue strip, hex input, and HSL sliders. Optional preset swatches.',
	files: [
		'components/color-picker/color-picker.svelte',
		'components/color-picker/conversions.ts',
		'components/color-picker/index.ts',
		'components/color-picker/manifest.ts'
	],
	components: ['popover', 'button'],
	shared: ['utils.cn', 'internals/state'],
	peerDependencies: {
		'@lucide/svelte': '^1.0.0',
		clsx: '^2.0.0',
		'tailwind-merge': '^3.0.0',
		svelte: '^5.0.0'
	}
};
