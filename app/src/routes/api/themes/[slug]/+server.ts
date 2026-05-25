import type { RequestHandler } from './$types';
import { dev } from '$app/environment';
import {
	RegistryRequestError,
	deleteRegistryTheme,
	getRegistryThemeBySlug,
	updateRegistryTheme
} from '$lib/server/theme-registry';
import { getAdminToken } from '$lib/server/admin-cookie';

function failure(err: unknown, fallback: string) {
	const status = err instanceof RegistryRequestError ? err.status : 500;
	const message = err instanceof Error ? err.message : fallback;
	return new Response(message, { status });
}

export const GET: RequestHandler = async ({ fetch, params }) => {
	try {
		const theme = await getRegistryThemeBySlug(fetch, params.slug);
		return new Response(JSON.stringify(theme), {
			headers: { 'content-type': 'application/json; charset=utf-8' }
		});
	} catch (err) {
		return failure(err, 'Failed to fetch theme.');
	}
};

export const DELETE: RequestHandler = async ({ fetch, params, cookies }) => {
	if (!dev) return new Response('Not found', { status: 404 });
	const token = getAdminToken(cookies);
	if (!token) return new Response('Admin authentication is required.', { status: 401 });
	try {
		const result = await deleteRegistryTheme(fetch, params.slug, token);
		return new Response(JSON.stringify(result), {
			headers: { 'content-type': 'application/json; charset=utf-8' }
		});
	} catch (err) {
		return failure(err, 'Failed to delete theme.');
	}
};

export const PATCH: RequestHandler = async ({ fetch, params, request, cookies }) => {
	if (!dev) return new Response('Not found', { status: 404 });
	const token = getAdminToken(cookies);
	if (!token) return new Response('Admin authentication is required.', { status: 401 });
	let patch: Record<string, unknown>;
	try {
		patch = await request.json();
	} catch {
		return new Response('Invalid request body.', { status: 400 });
	}
	try {
		const updated = await updateRegistryTheme(fetch, params.slug, patch, token);
		return new Response(JSON.stringify(updated), {
			headers: { 'content-type': 'application/json; charset=utf-8' }
		});
	} catch (err) {
		return failure(err, 'Failed to update theme.');
	}
};
