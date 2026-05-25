import { t, type Static } from 'elysia';

export const loginBodySchema = t.Object({
	username: t.String({ minLength: 1 }),
	password: t.String({ minLength: 1 })
});

export const loginResponseSchema = t.Object({
	token: t.String(),
	expiresAt: t.String()
});

export const loginErrorSchema = t.Object({
	error: t.String()
});

export type LoginBody = Static<typeof loginBodySchema>;
export type LoginResponse = Static<typeof loginResponseSchema>;
