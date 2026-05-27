/**
 * Manifest schema per pattern guide §3.1.
 *
 * Each silk component exports a `manifest: Manifest` from
 * `components/<name>/manifest.ts`. The CLI (separate workstream, not in
 * scope for Phase 4) consumes these to resolve and install files into
 * consumer projects.
 *
 * Created Phase 4 item 4 alongside button's manifest. Items 5–10 add
 * manifests for the components they touch as the API stabilizes; item 11
 * adds manifests for the rest mechanically.
 */

export type ManifestVisibility = 'public' | 'internal';

export type Manifest = {
	/** Component identifier — matches folder name under components/. */
	name: string;
	/** Semver string. Bumps follow pattern guide §4. */
	version: string;
	/**
	 * `public` components are directly installable via the CLI.
	 * `internal` components install only as transitive dependencies of
	 * other components and cannot be addressed as install targets.
	 */
	visibility: ManifestVisibility;
	/**
	 * Files the CLI copies into the consumer project, relative to the
	 * silk root. Includes underscore-prefixed files (e.g. `_state.ts`)
	 * that are installed as part of the component but not separately
	 * addressable.
	 */
	files: string[];
	/**
	 * Other silk components the CLI auto-pulls. Exact-version pins per
	 * pattern guide §4.4 (no ranges).
	 */
	components: string[];
	/**
	 * Shared utilities or internals the CLI installs. Two forms accepted:
	 * - `utils.<symbol>` — install the specific symbol from `utils.ts`.
	 * - `internals/<module>` — install the named module file.
	 */
	shared: string[];
	/**
	 * npm peer dependencies the consumer must have installed. The CLI
	 * warns if a peer is missing.
	 */
	peerDependencies: Record<string, string>;
	/** Optional human-readable summary surfaced by CLI listing. */
	description?: string;
	/** Optional WAI-ARIA role(s) the component implements (informational). */
	role?: string | string[];
	/** Optional test-tier marker (`tier-1` | `tier-2` | `tier-3`). */
	tier?: 'tier-1' | 'tier-2' | 'tier-3';
};
