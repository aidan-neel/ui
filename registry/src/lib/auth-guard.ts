import { Elysia, status } from 'elysia';
import { verifyAdminToken } from './token';
import { isAdminEnabled } from './admin-enabled';

function extractToken(headers: Record<string, string | undefined>) {
	const header = headers.authorization;
	if (!header) return null;
	const [scheme, token] = header.split(' ');
	if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
	return token;
}

/**
 * Resolves `admin` on the request context and exposes `requireAdmin()` for
 * routes that must be protected. When admin is disabled (production by
 * default), `requireAdmin()` returns 404 so the endpoint surface looks like it
 * doesn't exist.
 */
export const authGuard = new Elysia({ name: 'auth-guard' }).derive(
	{ as: 'scoped' },
	({ headers }) => {
		const enabled = isAdminEnabled();
		const token = enabled
			? extractToken(headers as Record<string, string | undefined>)
			: null;
		const admin = enabled ? verifyAdminToken(token) : null;
		return {
			admin,
			requireAdmin() {
				if (!enabled) {
					throw status(404, 'Not found.' as const);
				}
				if (!admin) {
					throw status(401, 'Admin authentication is required.' as const);
				}
				return admin;
			}
		};
	}
);
