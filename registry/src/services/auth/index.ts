import { Elysia, status } from 'elysia';
import { createAdminToken } from '@lib/token';
import { isAdminEnabled } from '@lib/admin-enabled';
import {
	loginBodySchema,
	loginErrorSchema,
	loginResponseSchema,
	type LoginBody
} from './model';

const TOKEN_TTL_SECONDS = 4 * 60 * 60;

function timingSafeStringEqual(a: string, b: string) {
	if (a.length !== b.length) return false;
	let mismatch = 0;
	for (let i = 0; i < a.length; i++) {
		mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return mismatch === 0;
}

function verifyCredentials({ username, password }: LoginBody) {
	const expectedUser = process.env.ADMIN_USERNAME;
	const expectedPass = process.env.ADMIN_PASSWORD;
	if (!expectedUser || !expectedPass) {
		throw status(503, { error: 'Admin login is not configured on the server.' });
	}
	const userOk = timingSafeStringEqual(username, expectedUser);
	const passOk = timingSafeStringEqual(password, expectedPass);
	return userOk && passOk;
}

export const authController = new Elysia({ prefix: '/auth', tags: ['auth'] }).post(
	'/login',
	({ body }) => {
		// Admin off (e.g. production without ADMIN_ENABLED=true): pretend the
		// endpoint doesn't exist so scanners don't even learn it's here.
		if (!isAdminEnabled()) {
			throw status(404, { error: 'Not found.' });
		}
		if (!verifyCredentials(body)) {
			throw status(401, { error: 'Invalid username or password.' });
		}
		const token = createAdminToken(body.username, TOKEN_TTL_SECONDS);
		const expiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000).toISOString();
		return { token, expiresAt };
	},
	{
		body: loginBodySchema,
		detail: { summary: 'Exchange admin credentials for a signed bearer token.' },
		response: {
			200: loginResponseSchema,
			401: loginErrorSchema,
			404: loginErrorSchema,
			503: loginErrorSchema
		}
	}
);
