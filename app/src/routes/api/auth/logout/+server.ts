import type { RequestHandler } from './$types';
import { dev } from '$app/environment';
import { clearAdminCookie } from '$lib/server/admin-cookie';

export const POST: RequestHandler = async ({ cookies }) => {
	if (!dev) return new Response('Not found', { status: 404 });
	clearAdminCookie(cookies);
	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'content-type': 'application/json' }
	});
};
