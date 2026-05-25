import { generatePaletteFromBase, type ThemeDraft } from '$lib/silk/themes/presets';

export const preset: ThemeDraft = {
	slug: 'supabase',
	name: 'Supabase',
	description: 'Emerald accent on near-black surfaces — inspired by Supabase',
	publisher: 'Silk UI',
	fontSans: 'Inter, sans-serif',
	fontMono: '"JetBrains Mono", monospace',
	fontHeader: 'Inter, sans-serif',
	radiusBase: '0.4rem',
	radiusSm: '0.18rem',
	radiusMd: '0.4rem',
	radiusLg: '0.5rem',
	radiusXl: '0.62rem',
	primaryButtonOutline: false,
	invertedPanels: false,
	durationPreset: 'default',
	motion: {
		hoverDuration: '200ms',
		menuDuration: '140ms',
		panelDuration: '220ms',
		sheetDuration: '300ms',
		overlayDuration: '140ms',
		tooltipDuration: '120ms',
		toastInDuration: '400ms',
		toastOutDuration: '320ms',
		panelX: 0,
		panelY: 4,
		panelBlur: 0,
		panelScaleStart: 0.99,
		sheetOffset: 132,
		overlayBlur: 0
	},
	light: generatePaletteFromBase(
		{
			background: '#ffffff',
			card: '#fafafa',
			text: '#1c1c1c',
			primary: '#249361',
			secondary: '#f1f1f1'
		},
		'light'
	),
	dark: generatePaletteFromBase(
		{
			background: '#0a0a0a',
			card: '#1a1a1a',
			text: '#ededed',
			primary: '#3ecf8e',
			secondary: '#222222'
		},
		'dark'
	)
};
