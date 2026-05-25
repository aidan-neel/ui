import { env } from '$env/dynamic/private';
import type { ThemeDraft } from '$lib/silk/themes/presets';

export type RegistryTheme = ThemeDraft & {
	id: string;
	createdAt: string;
	updatedAt: string;
};

export type AdminLoginResponse = {
	token: string;
	expiresAt: string;
};

const DEFAULT_REGISTRY_URL = 'http://localhost:4100';

export class RegistryRequestError extends Error {
	constructor(
		public readonly status: number,
		message: string
	) {
		super(message);
	}
}

function getRegistryBaseUrl() {
	return (env.THEME_REGISTRY_URL || DEFAULT_REGISTRY_URL).replace(/\/+$/, '');
}

async function parseErrorMessage(response: Response) {
	const body = await response.text();
	return body.trim() || `Registry request failed with status ${response.status}`;
}

function adminHeaders(token: string | null | undefined): Record<string, string> {
	return token ? { authorization: `Bearer ${token}` } : {};
}

export async function listRegistryThemes(fetchImpl: typeof fetch) {
	const response = await fetchImpl(`${getRegistryBaseUrl()}/themes`);
	if (!response.ok) {
		throw new RegistryRequestError(response.status, await parseErrorMessage(response));
	}

	const data = (await response.json()) as RegistryTheme[];
	return data.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getRegistryThemeBySlug(fetchImpl: typeof fetch, slug: string) {
	const response = await fetchImpl(`${getRegistryBaseUrl()}/themes/${encodeURIComponent(slug)}`);
	if (!response.ok) {
		throw new RegistryRequestError(response.status, await parseErrorMessage(response));
	}

	return (await response.json()) as RegistryTheme;
}

export async function publishRegistryTheme(fetchImpl: typeof fetch, theme: ThemeDraft) {
	const response = await fetchImpl(`${getRegistryBaseUrl()}/themes`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify(theme)
	});

	if (!response.ok) {
		throw new RegistryRequestError(response.status, await parseErrorMessage(response));
	}

	return (await response.json()) as {
		success: boolean;
		message: 'Successfully published theme!';
	};
}

export async function adminLogin(
	fetchImpl: typeof fetch,
	credentials: { username: string; password: string }
): Promise<AdminLoginResponse> {
	const response = await fetchImpl(`${getRegistryBaseUrl()}/auth/login`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(credentials)
	});
	if (!response.ok) {
		let message = `Login failed with status ${response.status}`;
		try {
			const body = (await response.json()) as { error?: string };
			if (body?.error) message = body.error;
		} catch {
			/* leave default */
		}
		throw new RegistryRequestError(response.status, message);
	}
	return (await response.json()) as AdminLoginResponse;
}

export async function deleteRegistryTheme(
	fetchImpl: typeof fetch,
	slug: string,
	token: string | null | undefined
) {
	const response = await fetchImpl(`${getRegistryBaseUrl()}/themes/${encodeURIComponent(slug)}`, {
		method: 'DELETE',
		headers: adminHeaders(token)
	});
	if (!response.ok) {
		throw new RegistryRequestError(response.status, await parseErrorMessage(response));
	}
	return (await response.json()) as { success: true; message: string };
}

export async function updateRegistryTheme(
	fetchImpl: typeof fetch,
	slug: string,
	patch: Partial<ThemeDraft>,
	token: string | null | undefined
) {
	const response = await fetchImpl(`${getRegistryBaseUrl()}/themes/${encodeURIComponent(slug)}`, {
		method: 'PATCH',
		headers: { 'content-type': 'application/json', ...adminHeaders(token) },
		body: JSON.stringify(patch)
	});
	if (!response.ok) {
		throw new RegistryRequestError(response.status, await parseErrorMessage(response));
	}
	return (await response.json()) as RegistryTheme;
}
