import type { RequestHandler } from './$types';
import { dev } from '$app/environment';
import { adminLogin, RegistryRequestError } from '$lib/server/theme-registry';
import { setAdminCookie } from '$lib/server/admin-cookie';

export const POST: RequestHandler = async ({ fetch, request, cookies }) => {
	if (!dev) return new Response('Not found', { status: 404 });

	let body: { username?: string; password?: string };
	try {
		body = await request.json();
	} catch {
		return new Response('Invalid request body.', { status: 400 });
	}

	const username = body.username?.trim() ?? '';
	const password = body.password ?? '';
	if (!username || !password) {
		return new Response('Username and password are required.', { status: 400 });
	}

	try {
		const result = await adminLogin(fetch, { username, password });
		setAdminCookie(cookies, result.token, { expiresAt: result.expiresAt });
		return new Response(JSON.stringify({ ok: true, expiresAt: result.expiresAt }), {
			headers: { 'content-type': 'application/json' }
		});
	} catch (err) {
		const status = err instanceof RegistryRequestError ? err.status : 500;
		const message = err instanceof Error ? err.message : 'Login failed.';
		return new Response(message, { status });
	}
};
