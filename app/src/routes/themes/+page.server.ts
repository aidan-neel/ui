import { builtInThemePresets } from '$lib/silk/themes/builtin-presets';
import { listRegistryThemes, type RegistryTheme } from '$lib/server/theme-registry';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	let themes: RegistryTheme[] = [];
	let registryAvailable = true;

	try {
		const all = await listRegistryThemes(fetch);
		const builtInSlugs = new Set(builtInThemePresets.map((preset) => preset.slug));
		themes = all.filter((theme) => !builtInSlugs.has(theme.slug));
	} catch {
		registryAvailable = false;
	}

	return {
		themes,
		registryAvailable
	};
};
