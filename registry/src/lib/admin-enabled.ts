/**
 * Whether admin routes (login, delete, edit) should be served.
 *
 * Default policy: enabled outside production. Override with ADMIN_ENABLED:
 *   ADMIN_ENABLED=true  → force on
 *   ADMIN_ENABLED=false → force off
 */
export function isAdminEnabled() {
	const explicit = process.env.ADMIN_ENABLED?.toLowerCase();
	if (explicit === 'true' || explicit === '1') return true;
	if (explicit === 'false' || explicit === '0') return false;
	return process.env.NODE_ENV !== 'production';
}
