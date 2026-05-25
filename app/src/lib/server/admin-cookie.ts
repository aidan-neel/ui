import type { Cookies } from '@sveltejs/kit';

export const ADMIN_COOKIE = 'silk-admin-token';

type SetOptions = {
	expiresAt?: string;
};

export function setAdminCookie(cookies: Cookies, token: string, options: SetOptions = {}) {
	const expires = options.expiresAt ? new Date(options.expiresAt) : undefined;
	cookies.set(ADMIN_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !process.env.SILK_INSECURE_COOKIES,
		...(expires && !Number.isNaN(expires.getTime()) ? { expires } : { maxAge: 60 * 60 * 24 })
	});
}

export function clearAdminCookie(cookies: Cookies) {
	cookies.delete(ADMIN_COOKIE, { path: '/' });
}

export function getAdminToken(cookies: Cookies) {
	return cookies.get(ADMIN_COOKIE) ?? null;
}
