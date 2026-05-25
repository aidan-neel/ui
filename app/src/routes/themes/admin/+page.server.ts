import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import {
	RegistryRequestError,
	listRegistryThemes,
	type RegistryTheme
} from '$lib/server/theme-registry';
import { clearAdminCookie, getAdminToken } from '$lib/server/admin-cookie';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	if (!dev) error(404, 'Not found');

	const token = getAdminToken(cookies);
	if (!token) {
		return { authed: false as const };
	}

	let themes: RegistryTheme[] = [];
	let registryAvailable = true;
	try {
		themes = await listRegistryThemes(fetch);
	} catch (err) {
		if (err instanceof RegistryRequestError && err.status === 401) {
			clearAdminCookie(cookies);
			return { authed: false as const };
		}
		registryAvailable = false;
	}

	return {
		authed: true as const,
		themes,
		registryAvailable
	};
};
