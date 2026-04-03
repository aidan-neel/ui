export type ThemePalette = {
	background: string;
	border: string;
	borderStrong: string;
	input: string;
	primary: string;
	foregroundOpposite: string;
	foreground: string;
	muted: string;
	popover: string;
	foregroundMuted: string;
	foregroundButton: string;
	secondary: string;
	card: string;
	accent: string;
	alternate: string;
	success: string;
	warning: string;
	error: string;
	destructive: string;
	overlay: string;
	ring: string;
};

export type ThemeDurationPreset = {
	slug: 'default' | 'snappy' | 'instant' | 'smooth';
	name: string;
	description: string;
	hover: string;
	menu: string;
	panel: string;
	sheet: string;
	overlay: string;
	tooltip: string;
	toastIn: string;
	toastOut: string;
};

export type ThemeMotion = {
	panelDuration: string;
	panelX: number;
	panelBlur: number;
	panelScaleStart: number;
	sheetDuration: string;
	sheetOffset: number;
	overlayDuration: string;
	overlayBlur: number;
};

export type ThemeBasePalette = {
	background: string;
	surface: string;
	text: string;
	primary: string;
};

export type ThemeDraft = {
	slug: string;
	name: string;
	description: string;
	publisher?: string;
	fontSans: string;
	fontMono: string;
	fontHeader: string;
	radiusBase: string;
	radiusSm: string;
	radiusMd: string;
	radiusLg: string;
	radiusXl: string;
	primaryButtonOutline: boolean;
	invertedPanels: boolean;
	durationPreset: ThemeDurationPreset['slug'];
	motion: ThemeMotion;
	light: ThemePalette;
	dark: ThemePalette;
};

export const durationPresets: ThemeDurationPreset[] = [
	{
		slug: 'default',
		name: 'Balanced',
		description: 'Matches the current Silk feel with polished but unhurried motion.',
		hover: '240ms',
		menu: '150ms',
		panel: '240ms',
		sheet: '320ms',
		overlay: '150ms',
		tooltip: '140ms',
		toastIn: '440ms',
		toastOut: '340ms'
	},
	{
		slug: 'snappy',
		name: 'Snappy',
		description: 'A little quicker across hovers, menus, and modal surfaces.',
		hover: '190ms',
		menu: '120ms',
		panel: '210ms',
		sheet: '260ms',
		overlay: '120ms',
		tooltip: '110ms',
		toastIn: '360ms',
		toastOut: '280ms'
	},
	{
		slug: 'instant',
		name: 'Instant',
		description: 'Very tight feedback for utility-first interfaces and fast workflows.',
		hover: '120ms',
		menu: '90ms',
		panel: '170ms',
		sheet: '210ms',
		overlay: '100ms',
		tooltip: '90ms',
		toastIn: '280ms',
		toastOut: '220ms'
	},
	{
		slug: 'smooth',
		name: 'Smooth',
		description: 'Softer, slower transitions for editorial or premium-feeling themes.',
		hover: '280ms',
		menu: '180ms',
		panel: '300ms',
		sheet: '380ms',
		overlay: '180ms',
		tooltip: '160ms',
		toastIn: '500ms',
		toastOut: '380ms'
	}
];

/** Rounds a radius token to a stable rem string. */
function roundRadius(value: number) {
	return `${Math.round(value * 1000) / 1000}rem`;
}

/** Derives the shared radius scale from a single base radius. */
function radiiFromBase(base: string) {
	const parsed = Number.parseFloat(base);
	const safe = Number.isFinite(parsed) ? parsed : 0.5;

	return {
		sm: roundRadius(Math.max(safe - 0.24, 0.14)),
		md: roundRadius(safe),
		lg: roundRadius(safe + 0.1),
		xl: roundRadius(safe + 0.22)
	};
}

/** Fills in a theme palette with the library defaults for omitted values. */
function palette(
	values: Partial<ThemePalette> & Pick<ThemePalette, 'background' | 'primary' | 'foreground'>
): ThemePalette {
	return {
		background: values.background,
		border: values.border ?? '#dde2ea',
		borderStrong: values.borderStrong ?? '#c9d1dc',
		input: values.input ?? values.borderStrong ?? '#c9d1dc',
		primary: values.primary,
		foregroundOpposite: values.foregroundOpposite ?? '#ffffff',
		foreground: values.foreground,
		muted: values.muted ?? '#f2f4f7',
		popover: values.popover ?? '#ffffff',
		foregroundMuted: values.foregroundMuted ?? '#667085',
		foregroundButton: values.foregroundButton ?? '#ffffff',
		secondary: values.secondary ?? '#f9fafb',
		card: values.card ?? '#ffffff',
		accent: values.accent ?? '#ffffff',
		alternate: values.alternate ?? '#2c2c2c',
		success: values.success ?? '#46ab61',
		warning: values.warning ?? '#ff9800',
		error: values.error ?? '#ef5350',
		destructive: values.destructive ?? '#fa4234',
		overlay: values.overlay ?? 'rgb(0 0 0 / 0.52)',
		ring: values.ring ?? 'rgb(21 94 239 / 0.18)'
	};
}

/** Builds the motion token set from a named duration preset plus overrides. */
function motionFromPreset(
	slug: ThemeDurationPreset['slug'],
	overrides: Partial<ThemeMotion> = {}
): ThemeMotion {
	const preset = getDurationPreset(slug);
	return {
		panelDuration: preset.panel,
		panelX: 0,
		panelBlur: 0,
		panelScaleStart: 0.99,
		sheetDuration: preset.sheet,
		sheetOffset: 132,
		overlayDuration: preset.overlay,
		overlayBlur: 0,
		...overrides
	};
}

/** Clamps a numeric value between a minimum and maximum. */
function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

/** Normalizes a hex value to six-digit lowercase form when possible. */
function normalizeHex(input: string) {
	const value = input.trim();
	if (/^#[0-9a-f]{6}$/i.test(value)) return value.toLowerCase();
	if (/^#[0-9a-f]{3}$/i.test(value)) {
		const [, r, g, b] = value;
		return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
	}
	return null;
}

/** Converts a hex color into RGB channel values. */
function hexToRgb(hex: string) {
	const normalized = normalizeHex(hex) ?? '#000000';
	return {
		r: Number.parseInt(normalized.slice(1, 3), 16),
		g: Number.parseInt(normalized.slice(3, 5), 16),
		b: Number.parseInt(normalized.slice(5, 7), 16)
	};
}

/** Converts RGB channel values into a hex color string. */
function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
	return `#${[r, g, b]
		.map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0'))
		.join('')}`;
}

/** Mixes two hex colors using a 0-1 weight. */
function mixColors(colorA: string, colorB: string, weight: number) {
	const a = hexToRgb(colorA);
	const b = hexToRgb(colorB);
	const safe = clamp(weight, 0, 1);
	return rgbToHex({
		r: a.r * (1 - safe) + b.r * safe,
		g: a.g * (1 - safe) + b.g * safe,
		b: a.b * (1 - safe) + b.b * safe
	});
}

/** Wraps a hex color in an rgb alpha string. */
function alphaColor(color: string, alpha: number) {
	const { r, g, b } = hexToRgb(color);
	return `rgb(${r} ${g} ${b} / ${clamp(alpha, 0, 1)})`;
}

/** Calculates relative luminance for contrast-aware text decisions. */
function relativeLuminance(color: string) {
	const { r, g, b } = hexToRgb(color);
	const channels = [r, g, b].map((channel) => {
		const normalized = channel / 255;
		return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** Chooses a readable foreground color for a background swatch. */
function contrastText(color: string) {
	return relativeLuminance(color) > 0.45 ? '#09090b' : '#ffffff';
}

/** Expands a small set of base colors into a full semantic palette. */
export function generatePaletteFromBase(
	base: ThemeBasePalette,
	mode: 'light' | 'dark'
): ThemePalette {
	const baseBackground = normalizeHex(base.background) ?? (mode === 'light' ? '#fcfcfd' : '#090b0f');
	const baseSurface = normalizeHex(base.surface) ?? (mode === 'light' ? '#ffffff' : '#0f1318');
	const text = normalizeHex(base.text) ?? (mode === 'light' ? '#101828' : '#eef2f8');
	const primary = normalizeHex(base.primary) ?? (mode === 'light' ? '#155eef' : '#528bff');
	const background =
		mode === 'light' ? mixColors(baseBackground, '#ffffff', 0.38) : baseBackground;
	const surface = mode === 'light' ? mixColors(baseSurface, '#ffffff', 0.16) : baseSurface;
	const border = mixColors(surface, text, mode === 'light' ? 0.12 : 0.18);
	const borderStrong = mixColors(surface, text, mode === 'light' ? 0.2 : 0.28);
	const secondary = mixColors(background, surface, mode === 'light' ? 0.44 : 0.45);
	const muted = mixColors(background, surface, mode === 'light' ? 0.28 : 0.24);
	const accent = mixColors(surface, primary, mode === 'light' ? 0.035 : 0.14);
	const foregroundMuted = mixColors(text, background, mode === 'light' ? 0.38 : 0.32);

	return palette({
		background,
		border,
		borderStrong,
		input: borderStrong,
		primary,
		foreground: text,
		foregroundOpposite: contrastText(text),
		foregroundButton: contrastText(primary),
		muted,
		popover: surface,
		foregroundMuted,
		secondary,
		card: surface,
		accent,
		alternate: mixColors(text, background, mode === 'light' ? 0.08 : 0.16),
		success: mixColors(primary, '#38a169', 0.42),
		warning: mixColors(primary, '#d97706', 0.5),
		error: mixColors(primary, '#dc2626', 0.56),
		destructive: mixColors(primary, '#b91c1c', 0.62),
		overlay: alphaColor(mode === 'light' ? text : '#000000', mode === 'light' ? 0.18 : 0.62),
		ring: alphaColor(primary, 0.2)
	});
}

export const themePresets: ThemeDraft[] = [
	{
		slug: 'default',
		name: 'Default',
		description: 'Balanced blue accents with neutral surfaces and polished contrast.',
		publisher: 'Silk UI',
		fontSans: 'Geist, sans-serif',
		fontMono: '"Geist Mono", monospace',
		fontHeader: 'Geist, sans-serif',
		radiusBase: '0.45rem',
		radiusSm: '0.2rem',
		radiusMd: '0.45rem',
		radiusLg: '0.55rem',
		radiusXl: '0.67rem',
		primaryButtonOutline: true,
		invertedPanels: false,
		durationPreset: 'default',
		motion: motionFromPreset('default'),
		light: palette({
			background: '#fcfcfd',
			border: '#dde2ea',
			borderStrong: '#c9d1dc',
			input: '#c9d1dc',
			primary: '#155eef',
			foreground: '#101828',
			foregroundButton: '#ffffff',
			muted: '#f2f4f7',
			popover: '#ffffff',
			foregroundMuted: '#667085',
			secondary: '#f9fafb',
			card: '#ffffff',
			accent: '#ffffff',
			overlay: 'rgb(16 24 40 / 0.18)',
			ring: 'rgb(21 94 239 / 0.18)'
		}),
		dark: palette({
			background: '#090b0f',
			border: '#1b2028',
			borderStrong: '#282f3a',
			input: '#262d38',
			primary: '#528bff',
			foreground: '#eef2f8',
			foregroundButton: '#eef4ff',
			muted: '#101419',
			popover: '#131922',
			foregroundMuted: '#8a94a2',
			secondary: '#151b23',
			card: '#141b24',
			accent: '#18202a',
			overlay: 'rgb(0 0 0 / 0.62)',
			ring: 'rgb(82 139 255 / 0.16)'
		})
	},
	{
		slug: 'linen',
		name: 'Linen',
		description: 'Warm paper-like neutrals with a refined rust accent.',
		publisher: 'Silk UI',
		fontSans: 'Manrope, sans-serif',
		fontMono: '"IBM Plex Mono", monospace',
		fontHeader: 'Lora, serif',
		radiusBase: '0.42rem',
		radiusSm: '0.18rem',
		radiusMd: '0.42rem',
		radiusLg: '0.58rem',
		radiusXl: '0.8rem',
		primaryButtonOutline: true,
		invertedPanels: false,
		durationPreset: 'smooth',
		motion: motionFromPreset('smooth', { panelBlur: 8, panelScaleStart: 0.955 }),
		light: palette({
			background: '#fdfaf6',
			border: '#ded4c7',
			borderStrong: '#cdbfae',
			input: '#d8cbbb',
			primary: '#a44a2f',
			foreground: '#271d19',
			foregroundButton: '#fff8f3',
			muted: '#f6efe7',
			popover: '#fffefa',
			foregroundMuted: '#7f6d62',
			secondary: '#f8f2eb',
			card: '#fffdf9',
			accent: '#fdf8f2',
			overlay: 'rgb(31 23 18 / 0.24)',
			ring: 'rgb(164 74 47 / 0.18)'
		}),
		dark: palette({
			background: '#100e0c',
			border: '#27211d',
			borderStrong: '#372f29',
			input: '#342b26',
			primary: '#f08f69',
			foreground: '#f4ece6',
			foregroundButton: '#fff1ea',
			muted: '#171310',
			popover: '#14110e',
			foregroundMuted: '#a69386',
			secondary: '#1a1512',
			card: '#15110e',
			accent: '#201915',
			overlay: 'rgb(0 0 0 / 0.68)',
			ring: 'rgb(240 143 105 / 0.18)'
		})
	},
	{
		slug: 'grove',
		name: 'Grove',
		description: 'Botanical green accents with deeper olive neutrals.',
		publisher: 'Silk UI',
		fontSans: '"Plus Jakarta Sans", sans-serif',
		fontMono: '"IBM Plex Mono", monospace',
		fontHeader: '"Plus Jakarta Sans", sans-serif',
		radiusBase: '0.4rem',
		radiusSm: '0.15rem',
		radiusMd: '0.4rem',
		radiusLg: '0.56rem',
		radiusXl: '0.8rem',
		primaryButtonOutline: true,
		invertedPanels: false,
		durationPreset: 'snappy',
		motion: motionFromPreset('snappy', { panelX: 10, panelBlur: 4, sheetOffset: 108 }),
		light: palette({
			background: '#fafcf8',
			border: '#d8e2d3',
			borderStrong: '#c2d0bb',
			input: '#c7d5c1',
			primary: '#2f7a54',
			foreground: '#18261d',
			foregroundButton: '#f4fbf6',
			muted: '#f1f5ee',
			popover: '#fcfdfb',
			foregroundMuted: '#67776d',
			secondary: '#f4f7f2',
			card: '#fbfdf9',
			accent: '#f8fbf6',
			overlay: 'rgb(13 31 22 / 0.2)',
			ring: 'rgb(47 122 84 / 0.18)'
		}),
		dark: palette({
			background: '#0c100d',
			border: '#1b241d',
			borderStrong: '#283229',
			input: '#273228',
			primary: '#63c08c',
			foreground: '#edf5ef',
			foregroundButton: '#effcf4',
			muted: '#111711',
			popover: '#0f140f',
			foregroundMuted: '#8ca092',
			secondary: '#121812',
			card: '#101510',
			accent: '#141b14',
			overlay: 'rgb(0 0 0 / 0.66)',
			ring: 'rgb(99 192 140 / 0.16)'
		})
	},
	{
		slug: 'supabase',
		name: 'Supabase',
		description: 'Crisp green product surfaces inspired by modern database tooling.',
		publisher: 'Silk UI',
		fontSans: '"Instrument Sans", sans-serif',
		fontMono: '"IBM Plex Mono", monospace',
		fontHeader: '"Instrument Sans", sans-serif',
		radiusBase: '0.38rem',
		radiusSm: '0.14rem',
		radiusMd: '0.38rem',
		radiusLg: '0.5rem',
		radiusXl: '0.68rem',
		primaryButtonOutline: false,
		invertedPanels: false,
		durationPreset: 'instant',
		motion: motionFromPreset('instant', {
			panelBlur: 2.5,
			panelScaleStart: 0.985,
			sheetOffset: 92
		}),
		light: palette({
			background: '#fbfdfb',
			border: '#d3e7da',
			borderStrong: '#bedac9',
			input: '#c4dccd',
			primary: '#1f9d62',
			foreground: '#122018',
			foregroundButton: '#f1fff7',
			muted: '#f1f7f3',
			popover: '#fdfefd',
			foregroundMuted: '#65776c',
			secondary: '#f5f9f6',
			card: '#fcfefc',
			accent: '#f8fbf8',
			overlay: 'rgb(8 24 14 / 0.18)',
			ring: 'rgb(31 157 98 / 0.18)'
		}),
		dark: palette({
			background: '#0b110d',
			border: '#18231c',
			borderStrong: '#223127',
			input: '#213026',
			primary: '#3ecf8e',
			foreground: '#ebf6ef',
			foregroundButton: '#ecfff5',
			muted: '#101610',
			popover: '#0e140f',
			foregroundMuted: '#8ea394',
			secondary: '#101710',
			card: '#0f150f',
			accent: '#132014',
			overlay: 'rgb(0 0 0 / 0.66)',
			ring: 'rgb(62 207 142 / 0.18)'
		})
	},
	{
		slug: 'shadcn-ui',
		name: 'shadcn/ui',
		description: 'Utility-first grayscale with blue focus accents and tight neutral contrast.',
		publisher: 'Silk UI',
		fontSans: 'Geist, sans-serif',
		fontMono: '"Geist Mono", monospace',
		fontHeader: 'Geist, sans-serif',
		radiusBase: '0.5rem',
		radiusSm: '0.26rem',
		radiusMd: '0.5rem',
		radiusLg: '0.62rem',
		radiusXl: '0.8rem',
		primaryButtonOutline: false,
		invertedPanels: false,
		durationPreset: 'instant',
		motion: motionFromPreset('instant', { panelBlur: 2, panelScaleStart: 0.99, overlayBlur: 2 }),
		light: palette({
			background: '#ffffff',
			border: '#e5e7eb',
			borderStrong: '#d1d5db',
			input: '#d1d5db',
			primary: '#18181b',
			foreground: '#09090b',
			foregroundButton: '#fafafa',
			muted: '#f4f4f5',
			popover: '#ffffff',
			foregroundMuted: '#71717a',
			secondary: '#f4f4f5',
			card: '#ffffff',
			accent: '#fafafa',
			alternate: '#18181b',
			overlay: 'rgb(9 9 11 / 0.14)',
			ring: 'rgb(59 130 246 / 0.18)'
		}),
		dark: palette({
			background: '#080809',
			border: '#232326',
			borderStrong: '#35353a',
			input: '#242428',
			primary: '#fafafa',
			foreground: '#fafafa',
			foregroundOpposite: '#09090b',
			foregroundButton: '#09090b',
			muted: '#151518',
			popover: '#0b0b0d',
			foregroundMuted: '#a1a1aa',
			secondary: '#141417',
			card: '#0c0c0f',
			accent: '#151518',
			alternate: '#fafafa',
			overlay: 'rgb(0 0 0 / 0.72)',
			ring: 'rgb(96 165 250 / 0.18)'
		})
	},
	{
		slug: 'aurora',
		name: 'Aurora',
		description: 'Soft mint-and-sky surfaces with brighter layered contrast.',
		publisher: 'Silk UI',
		fontSans: 'Sora, sans-serif',
		fontMono: '"IBM Plex Mono", monospace',
		fontHeader: '"Space Grotesk", sans-serif',
		radiusBase: '0.52rem',
		radiusSm: '0.28rem',
		radiusMd: '0.52rem',
		radiusLg: '0.64rem',
		radiusXl: '0.82rem',
		primaryButtonOutline: true,
		invertedPanels: false,
		durationPreset: 'smooth',
		motion: motionFromPreset('smooth', { panelX: 8, panelBlur: 10, overlayBlur: 6 }),
		light: generatePaletteFromBase(
			{ background: '#f6fbff', surface: '#ffffff', text: '#122033', primary: '#0f8db8' },
			'light'
		),
		dark: generatePaletteFromBase(
			{ background: '#091018', surface: '#0e1621', text: '#e8f4fb', primary: '#4bc4f0' },
			'dark'
		)
	},
	{
		slug: 'ember',
		name: 'Ember',
		description: 'Cinder neutrals with copper heat and stronger editorial contrast.',
		publisher: 'Silk UI',
		fontSans: 'DM Sans, sans-serif',
		fontMono: '"IBM Plex Mono", monospace',
		fontHeader: 'Fraunces, serif',
		radiusBase: '0.46rem',
		radiusSm: '0.22rem',
		radiusMd: '0.46rem',
		radiusLg: '0.58rem',
		radiusXl: '0.76rem',
		primaryButtonOutline: true,
		invertedPanels: false,
		durationPreset: 'default',
		motion: motionFromPreset('default', { panelBlur: 7, panelScaleStart: 0.95, sheetOffset: 118 }),
		light: generatePaletteFromBase(
			{ background: '#f8f2ec', surface: '#fffaf6', text: '#2a1d18', primary: '#c4683d' },
			'light'
		),
		dark: generatePaletteFromBase(
			{ background: '#0e0a08', surface: '#17110e', text: '#f6ece7', primary: '#ef8c5a' },
			'dark'
		)
	},
	{
		slug: 'graphite',
		name: 'Graphite',
		description: 'A grayscale riff on the default theme with darker floating menus and panels.',
		publisher: 'Silk UI',
		fontSans: 'Geist, sans-serif',
		fontMono: '"Geist Mono", monospace',
		fontHeader: 'Geist, sans-serif',
		radiusBase: '0.45rem',
		radiusSm: '0.2rem',
		radiusMd: '0.45rem',
		radiusLg: '0.55rem',
		radiusXl: '0.67rem',
		primaryButtonOutline: true,
		invertedPanels: true,
		durationPreset: 'default',
		motion: motionFromPreset('default'),
		light: palette({
			background: '#fcfcfd',
			border: '#e5e9f0',
			borderStrong: '#d7dee8',
			input: '#d7dee8',
			primary: '#4d607f',
			foreground: '#111827',
			foregroundButton: '#ffffff',
			muted: '#f4f6fa',
			popover: '#ffffff',
			foregroundMuted: '#667085',
			secondary: '#f8f9fb',
			card: '#ffffff',
			accent: '#fbfcfe',
			alternate: '#20283a',
			overlay: 'rgb(17 24 39 / 0.16)',
			ring: 'rgb(77 96 127 / 0.18)'
		}),
		dark: palette({
			background: '#0b0d11',
			border: '#1d2430',
			borderStrong: '#2b3442',
			input: '#293240',
			primary: '#4d607f',
			foreground: '#eef2f8',
			foregroundButton: '#ffffff',
			muted: '#10151d',
			popover: '#111824',
			foregroundMuted: '#8d97a7',
			secondary: '#141c27',
			card: '#131b26',
			accent: '#17202c',
			alternate: '#eef2f8',
			overlay: 'rgb(0 0 0 / 0.62)',
			ring: 'rgb(77 96 127 / 0.18)'
		})
	}
];

/** Turns a free-form theme name into a filesystem-friendly slug. */
export function slugifyThemeName(name: string) {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** Returns the matching duration preset or falls back to the default preset. */
export function getDurationPreset(slug: ThemeDurationPreset['slug']) {
	return durationPresets.find((preset) => preset.slug === slug) ?? durationPresets[0];
}

/** Chooses which palette should drive floating panel surfaces for a given mode. */
function getPanelPalette(theme: ThemeDraft, mode: 'light' | 'dark') {
	return mode === 'light' && theme.invertedPanels ? theme.dark : theme[mode];
}

/** Serializes the floating-surface tokens derived from the active panel palette. */
function panelTokensToCss(theme: ThemeDraft, mode: 'light' | 'dark') {
	const panel = getPanelPalette(theme, mode);
	const isInvertedLight = mode === 'light' && theme.invertedPanels;
	const panelForeground = isInvertedLight ? mixColors(panel.foreground, '#ffffff', 0.04) : panel.foreground;
	const panelBorder = isInvertedLight
		? alphaColor(mixColors(panel.borderStrong, panel.foreground, 0.18), 0.42)
		: `color-mix(in srgb, ${panel.borderStrong} 88%, transparent)`;
	const menuItemHoverBorder = isInvertedLight
		? alphaColor(mixColors(panel.borderStrong, panel.foreground, 0.14), 0.24)
		: `color-mix(in srgb, ${panel.borderStrong} 30%, transparent)`;
	const highlight =
		isInvertedLight
			? 'rgb(120 130 148 / 0.07)'
			: mode === 'dark'
				? 'rgb(120 130 148 / 0.07)'
				: 'rgb(255 255 255 / 0.58)';

	return `\t--color-floating-panel: ${panel.popover};
\t--color-floating-panel-foreground: ${panelForeground};
\t--floating-panel-border: ${panelBorder};
\t--floating-panel-highlight: ${highlight};
\t--floating-menu-item-foreground: ${panelForeground};
\t--floating-menu-item-hover-bg: color-mix(in srgb, ${panel.secondary} 42%, transparent);
\t--floating-menu-item-hover-border: ${menuItemHoverBorder};
\t--floating-menu-item-active-bg: color-mix(in srgb, ${panel.primary} 10%, transparent);`;
}

/** Serializes a palette into CSS variable declarations. */
function paletteToCss(palette: ThemePalette) {
	return `\t--color-background: ${palette.background};
\t--color-border: ${palette.border};
\t--color-border-strong: ${palette.borderStrong};
\t--color-input: ${palette.input};
\t--color-primary: ${palette.primary};
\t--color-foreground-opposite: ${palette.foregroundOpposite};
\t--color-foreground: ${palette.foreground};
\t--color-muted: ${palette.muted};
\t--color-popover: ${palette.popover};
\t--color-foreground-muted: ${palette.foregroundMuted};
\t--color-foreground-btn: ${palette.foregroundButton};
\t--color-secondary: ${palette.secondary};
\t--color-card: ${palette.card};
\t--color-accent: ${palette.accent};
\t--color-alternate: ${palette.alternate};
\t--color-success: ${palette.success};
\t--color-warning: ${palette.warning};
\t--color-error: ${palette.error};
\t--color-destructive: ${palette.destructive};
\t--color-overlay: ${palette.overlay};
\t--color-ring: ${palette.ring};`;
}

/** Converts a theme draft into the CSS shipped by the preset endpoints and studio. */
export function themeToCss(theme: ThemeDraft) {
	const radii = radiiFromBase(theme.radiusBase || theme.radiusMd);
	const durations = getDurationPreset(theme.durationPreset);
	const motion = theme.motion ?? motionFromPreset(theme.durationPreset);
	return `@theme {
\t--font-sans: ${theme.fontSans};
\t--font-mono: ${theme.fontMono};
\t--font-header: ${theme.fontHeader};
\t--radius-sm: ${radii.sm};
\t--radius-md: ${radii.md};
\t--radius-lg: ${radii.lg};
\t--radius-xl: ${radii.xl};
\t--radius-btn: var(--radius-lg);
\t--motion-duration-hover: ${durations.hover};
\t--motion-duration-menu: ${durations.menu};
\t--motion-duration-panel: ${motion.panelDuration};
\t--motion-duration-sheet: ${motion.sheetDuration};
\t--motion-duration-overlay: ${motion.overlayDuration};
\t--motion-duration-tooltip: ${durations.tooltip};
\t--motion-duration-toast-in: ${durations.toastIn};
\t--motion-duration-toast-out: ${durations.toastOut};
\t--motion-panel-x: ${motion.panelX}px;
\t--motion-panel-blur: ${motion.panelBlur}px;
\t--motion-panel-scale-start: ${motion.panelScaleStart};
\t--motion-sheet-offset: ${motion.sheetOffset}px;
\t--motion-overlay-blur: ${motion.overlayBlur}px;
\t--button-primary-border: ${theme.primaryButtonOutline ? `color-mix(in srgb, ${theme.light.primary} 76%, #1237b9)` : 'transparent'};
\t--text-xs: 12px;
\t--text-sm: 14px;
${paletteToCss(theme.light)}
${panelTokensToCss(theme, 'light')}
}

.dark {
\t--font-sans: ${theme.fontSans};
\t--font-mono: ${theme.fontMono};
\t--font-header: ${theme.fontHeader};
\t--radius-sm: ${radii.sm};
\t--radius-md: ${radii.md};
\t--radius-lg: ${radii.lg};
\t--radius-xl: ${radii.xl};
\t--motion-duration-hover: ${durations.hover};
\t--motion-duration-menu: ${durations.menu};
\t--motion-duration-panel: ${motion.panelDuration};
\t--motion-duration-sheet: ${motion.sheetDuration};
\t--motion-duration-overlay: ${motion.overlayDuration};
\t--motion-duration-tooltip: ${durations.tooltip};
\t--motion-duration-toast-in: ${durations.toastIn};
\t--motion-duration-toast-out: ${durations.toastOut};
\t--motion-panel-x: ${motion.panelX}px;
\t--motion-panel-blur: ${motion.panelBlur}px;
\t--motion-panel-scale-start: ${motion.panelScaleStart};
\t--motion-sheet-offset: ${motion.sheetOffset}px;
\t--motion-overlay-blur: ${motion.overlayBlur}px;
\t--button-primary-border: ${theme.primaryButtonOutline ? `color-mix(in srgb, ${theme.dark.primary} 76%, #7aa2ff)` : 'transparent'};
${paletteToCss(theme.dark)}
${panelTokensToCss(theme, 'dark')}
}`;
}

export const themePresetMap = Object.fromEntries(
	themePresets.map((theme) => [theme.slug, themeToCss(theme)])
);
