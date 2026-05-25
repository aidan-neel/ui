import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const ALGORITHM = 'HS256';
const ISSUER = 'silk-registry';
const AUDIENCE = 'silk-admin';
const MIN_SECRET_LENGTH = 32;
const CLOCK_SKEW_SECONDS = 60;

type JwtHeader = { alg: string; typ: string };
type JwtPayload = {
	sub: string;
	iss: string;
	aud: string;
	iat: number;
	exp: number;
	jti: string;
};

function getSecret() {
	const secret = process.env.ADMIN_TOKEN_SECRET;
	if (!secret || secret.length < MIN_SECRET_LENGTH) {
		throw new Error(
			`ADMIN_TOKEN_SECRET is missing or too short (need at least ${MIN_SECRET_LENGTH} chars).`
		);
	}
	return secret;
}

function base64urlJson(input: object) {
	return Buffer.from(JSON.stringify(input)).toString('base64url');
}

function jsonFromBase64url<T>(input: string): T | null {
	try {
		return JSON.parse(Buffer.from(input, 'base64url').toString('utf8')) as T;
	} catch {
		return null;
	}
}

function sign(signingInput: string) {
	return createHmac('sha256', getSecret()).update(signingInput).digest('base64url');
}

/** Issues a compact JWS (header.payload.signature) using HS256. */
export function createAdminToken(subject: string, ttlSeconds = 4 * 60 * 60) {
	const now = Math.floor(Date.now() / 1000);
	const header: JwtHeader = { alg: ALGORITHM, typ: 'JWT' };
	const payload: JwtPayload = {
		sub: subject,
		iss: ISSUER,
		aud: AUDIENCE,
		iat: now,
		exp: now + ttlSeconds,
		jti: randomBytes(16).toString('hex')
	};
	const headerSegment = base64urlJson(header);
	const payloadSegment = base64urlJson(payload);
	const signing = `${headerSegment}.${payloadSegment}`;
	const signature = sign(signing);
	return `${signing}.${signature}`;
}

export type VerifiedToken = { subject: string; expiry: number; jti: string };

/** Returns the verified payload, or null on any kind of failure. */
export function verifyAdminToken(token: string | null | undefined): VerifiedToken | null {
	if (!token) return null;
	const parts = token.split('.');
	if (parts.length !== 3) return null;
	const [headerSegment, payloadSegment, signature] = parts;

	// Pin algorithm — defends against `alg: none` and family-confusion attacks.
	const header = jsonFromBase64url<JwtHeader>(headerSegment);
	if (!header || header.alg !== ALGORITHM || header.typ !== 'JWT') return null;

	const expectedSignature = sign(`${headerSegment}.${payloadSegment}`);
	const a = Buffer.from(signature);
	const b = Buffer.from(expectedSignature);
	if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

	const payload = jsonFromBase64url<JwtPayload>(payloadSegment);
	if (!payload) return null;
	if (payload.iss !== ISSUER) return null;
	if (payload.aud !== AUDIENCE) return null;
	if (typeof payload.sub !== 'string' || payload.sub.length === 0) return null;
	if (typeof payload.jti !== 'string' || payload.jti.length === 0) return null;

	const now = Math.floor(Date.now() / 1000);
	if (typeof payload.exp !== 'number' || now >= payload.exp) return null;
	if (typeof payload.iat !== 'number' || now < payload.iat - CLOCK_SKEW_SECONDS) return null;

	return {
		subject: payload.sub,
		expiry: payload.exp * 1000,
		jti: payload.jti
	};
}
