import { browser } from '$app/environment';
import type { ThemeDraft, ThemeBasePalette } from '$lib/silk/themes/presets';

const STORAGE_KEY = 'silk-live-theme-css';
const STYLE_ID = 'silk-live-theme-style';
const STUDIO_STATE_KEY = 'silk-theme-studio-state';

export type ThemeStudioState = {
	selectedPresetSlug: string;
	editorTheme: ThemeDraft;
	editorName: string;
	headerFontSelection: string;
	bodyFontSelection: string;
	lightBasePalette: ThemeBasePalette;
	darkBasePalette: ThemeBasePalette;
};

/** Converts the theme export format into a live-applicable root block. */
function normalizeThemeCss(css: string) {
	return css.replace('@theme', ':root');
}

/** Returns the shared live-theme style tag, creating it when needed. */
function getStyleTag() {
	if (!browser) return null;

	let tag = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
	if (tag) return tag;

	tag = document.createElement('style');
	tag.id = STYLE_ID;
	document.head.appendChild(tag);
	return tag;
}

/** Applies live theme CSS to the document and persists it for reloads. */
export function applyLiveThemeCss(css: string) {
	if (!browser) return;
	const normalized = normalizeThemeCss(css);
	const tag = getStyleTag();
	if (!tag) return;
	tag.textContent = normalized;
	localStorage.setItem(STORAGE_KEY, normalized);
}

/** Restores the last saved live theme CSS during app startup. */
export function hydrateLiveThemeCss() {
	if (!browser) return;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (!stored) return;
	const tag = getStyleTag();
	if (!tag) return;
	tag.textContent = stored;
}

/** Returns the currently persisted live theme CSS override, if one exists. */
export function getStoredLiveThemeCss() {
	if (!browser) return null;
	return localStorage.getItem(STORAGE_KEY);
}

/** Persists the current theme studio draft for later restoration. */
export function saveThemeStudioState(state: ThemeStudioState) {
	if (!browser) return;
	localStorage.setItem(STUDIO_STATE_KEY, JSON.stringify(state));
}

/** Restores the last saved theme studio draft when one is available. */
export function loadThemeStudioState() {
	if (!browser) return null;

	const stored = localStorage.getItem(STUDIO_STATE_KEY);
	if (!stored) return null;

	try {
		return JSON.parse(stored) as ThemeStudioState;
	} catch {
		localStorage.removeItem(STUDIO_STATE_KEY);
		return null;
	}
}

/** Removes the live theme override from the document and storage. */
export function clearLiveThemeCss() {
	if (!browser) return;
	localStorage.removeItem(STORAGE_KEY);
	const tag = document.getElementById(STYLE_ID);
	tag?.remove();
}
