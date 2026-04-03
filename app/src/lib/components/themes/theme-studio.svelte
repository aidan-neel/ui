<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import WandSparkles from '@lucide/svelte/icons/wand-sparkles';
	import * as Alert from '$lib/silk/components/alert';
	import { Badge } from '$lib/silk/components/badge';
	import { Button } from '$lib/silk/components/button';
	import * as Card from '$lib/silk/components/card';
	import { Checkbox } from '$lib/silk/components/checkbox';
	import { ColorPicker, type ColorOption } from '$lib/silk/components/color-picker';
	import { Input } from '$lib/silk/components/input';
	import * as Select from '$lib/silk/components/select';
	import { Switch } from '$lib/silk/components/switch';
	import { Textarea } from '$lib/silk/components/textarea';
	import * as Tooltip from '$lib/silk/components/tooltip';
	import { toast } from '$lib/silk/components/toast';
	import {
		applyLiveThemeCss,
		getStoredLiveThemeCss,
		loadThemeStudioState,
		saveThemeStudioState
	} from '$lib/silk/themes/live';
	import {
		durationPresets,
		generatePaletteFromBase,
		getDurationPreset,
		themePresets,
		themeToCss,
		type ThemeBasePalette,
		type ThemeDraft,
		type ThemeDurationPreset,
		type ThemeMotion,
		slugifyThemeName
	} from '$lib/silk/themes/presets';

	type FontOption = {
		label: string;
		value: string;
	};

	type RadiusOption = {
		label: string;
		value: string;
	};

	type DurationOption = {
		label: string;
		value: string;
	};

	type PanelStyleOption = {
		label: string;
		value: 'standard' | 'inverted';
	};

	type MotionField = {
		key: keyof ThemeMotion;
		label: string;
		min: number;
		max: number;
		step: number;
		suffix?: string;
	};

	type BasePaletteKey = keyof ThemeBasePalette;

	type StudioSnapshot = {
		selectedPresetSlug: string;
		editorTheme: ThemeDraft;
		editorName: string;
		headerFontSelection: string;
		bodyFontSelection: string;
		lightBasePalette: ThemeBasePalette;
		darkBasePalette: ThemeBasePalette;
	};

	const fontOptions: FontOption[] = [
		{ label: 'Geist', value: 'Geist, sans-serif' },
		{ label: 'Instrument Sans', value: '"Instrument Sans", sans-serif' },
		{ label: 'Manrope', value: 'Manrope, sans-serif' },
		{ label: 'DM Sans', value: '"DM Sans", sans-serif' },
		{ label: 'Plus Jakarta Sans', value: '"Plus Jakarta Sans", sans-serif' },
		{ label: 'Outfit', value: 'Outfit, sans-serif' },
		{ label: 'Space Grotesk', value: '"Space Grotesk", sans-serif' },
		{ label: 'Sora', value: 'Sora, sans-serif' },
		{ label: 'IBM Plex Sans', value: '"IBM Plex Sans", sans-serif' },
		{ label: 'Lora', value: 'Lora, serif' },
		{ label: 'Source Serif 4', value: '"Source Serif 4", serif' },
		{ label: 'Fraunces', value: 'Fraunces, serif' },
		{ label: 'Newsreader', value: 'Newsreader, serif' },
		{ label: 'Geist Mono', value: '"Geist Mono", monospace' },
		{ label: 'IBM Plex Mono', value: '"IBM Plex Mono", monospace' }
	];

	const radiusOptions: RadiusOption[] = [
		{ label: 'Compact', value: '0.34rem' },
		{ label: 'Balanced', value: '0.45rem' },
		{ label: 'Soft', value: '0.58rem' },
		{ label: 'Rounded', value: '0.72rem' }
	];

	const durationOptions: DurationOption[] = [
		{ label: '100ms', value: '100ms' },
		{ label: '140ms', value: '140ms' },
		{ label: '180ms', value: '180ms' },
		{ label: '220ms', value: '220ms' },
		{ label: '260ms', value: '260ms' },
		{ label: '320ms', value: '320ms' },
		{ label: '380ms', value: '380ms' }
	];

	const panelStyleOptions: PanelStyleOption[] = [
		{ label: 'Standard', value: 'standard' },
		{ label: 'Inverted', value: 'inverted' }
	];

	const lightBackgroundOptions: ColorOption[] = [
		{ label: 'Paper', value: '#fcfcfd' },
		{ label: 'Cloud', value: '#f8fafc' },
		{ label: 'Mist', value: '#f6f8fb' },
		{ label: 'Warm', value: '#fdfaf6' }
	];

	const lightSurfaceOptions: ColorOption[] = [
		{ label: 'White', value: '#ffffff' },
		{ label: 'Soft', value: '#fbfcfe' },
		{ label: 'Fog', value: '#f7f9fc' },
		{ label: 'Warm', value: '#fffdf9' }
	];

	const lightTextOptions: ColorOption[] = [
		{ label: 'Ink', value: '#101828' },
		{ label: 'Slate', value: '#162033' },
		{ label: 'Charcoal', value: '#1c2434' },
		{ label: 'Warm Ink', value: '#271d19' }
	];

	const lightPrimaryOptions: ColorOption[] = [
		{ label: 'Blue', value: '#155eef' },
		{ label: 'Graphite', value: '#4d607f' },
		{ label: 'Green', value: '#2f7a54' },
		{ label: 'Copper', value: '#a44a2f' }
	];

	const darkBackgroundOptions: ColorOption[] = [
		{ label: 'Midnight', value: '#0b0d11' },
		{ label: 'Navy', value: '#091018' },
		{ label: 'Forest', value: '#0c100d' },
		{ label: 'Ash', value: '#100e0c' }
	];

	const darkSurfaceOptions: ColorOption[] = [
		{ label: 'Panel', value: '#141b24' },
		{ label: 'Deep Navy', value: '#111824' },
		{ label: 'Soft Midnight', value: '#131922' },
		{ label: 'Forest Panel', value: '#101510' }
	];

	const darkTextOptions: ColorOption[] = [
		{ label: 'Frost', value: '#eef2f8' },
		{ label: 'Pearl', value: '#e8f4fb' },
		{ label: 'Soft White', value: '#edf5ef' },
		{ label: 'Warm Light', value: '#f6ece7' }
	];

	const darkPrimaryOptions: ColorOption[] = [
		{ label: 'Blue', value: '#528bff' },
		{ label: 'Graphite', value: '#4d607f' },
		{ label: 'Mint', value: '#63c08c' },
		{ label: 'Copper', value: '#ef8c5a' }
	];

	const motionFields: MotionField[] = [
		{ key: 'panelX', label: 'Panel X Offset', min: -24, max: 24, step: 2, suffix: 'px' },
		{ key: 'panelBlur', label: 'Panel Blur', min: 0, max: 8, step: 1, suffix: 'px' },
		{ key: 'panelScaleStart', label: 'Panel Scale Start', min: 0.94, max: 1, step: 0.005 },
		{ key: 'sheetOffset', label: 'Sheet Offset', min: 24, max: 160, step: 4, suffix: 'px' },
		{ key: 'overlayBlur', label: 'Overlay Blur', min: 0, max: 6, step: 1, suffix: 'px' }
	];

	function cloneTheme(theme: ThemeDraft): ThemeDraft {
		return JSON.parse(JSON.stringify(theme));
	}

	function normalizeGeneratedCss(css: string) {
		return css.replace('@theme', ':root');
	}

	function isMonoFont(fontValue: string) {
		return fontValue.includes('monospace');
	}

	function resolveMonoFont(headerFont: string, bodyFont: string, currentMono: string) {
		if (isMonoFont(bodyFont)) return bodyFont;
		if (isMonoFont(headerFont)) return headerFont;
		if (isMonoFont(currentMono)) return currentMono;
		return '"Geist Mono", monospace';
	}

	function getFontLabel(fontValue: string) {
		return fontOptions.find((font) => font.value === fontValue)?.label ?? fontOptions[0].label;
	}

	function getRadiusLabel(radiusValue: string) {
		return radiusOptions.find((option) => option.value === radiusValue)?.label ?? 'Balanced';
	}

	function getDurationLabel(durationValue: string) {
		return durationOptions.find((option) => option.value === durationValue)?.label ?? durationValue;
	}

	function getPanelStyleLabel(invertedPanels: boolean) {
		return invertedPanels ? 'Inverted' : 'Standard';
	}

	function createBasePalette(theme: ThemeDraft, mode: 'light' | 'dark'): ThemeBasePalette {
		const palette = theme[mode];
		return {
			background: palette.background,
			surface: palette.card,
			text: palette.foreground,
			primary: palette.primary
		};
	}

	function createStudioState(theme: ThemeDraft): StudioSnapshot {
		return {
			selectedPresetSlug: theme.slug,
			editorTheme: cloneTheme(theme),
			editorName: theme.name,
			headerFontSelection: getFontLabel(theme.fontHeader),
			bodyFontSelection: getFontLabel(theme.fontSans),
			lightBasePalette: createBasePalette(theme, 'light'),
			darkBasePalette: createBasePalette(theme, 'dark')
		};
	}

	function captureStudioSnapshot(): StudioSnapshot {
		return {
			selectedPresetSlug,
			editorTheme: cloneTheme(editorTheme),
			editorName,
			headerFontSelection,
			bodyFontSelection,
			lightBasePalette: { ...lightBasePalette },
			darkBasePalette: { ...darkBasePalette }
		};
	}

	function findPresetFromStoredCss() {
		const stored = getStoredLiveThemeCss();
		if (!stored) return null;

		return (
			themePresets.find((theme) => normalizeGeneratedCss(themeToCss(theme)) === stored) ?? null
		);
	}

	function applyStudioState(state: StudioSnapshot) {
		selectedPresetSlug = state.selectedPresetSlug;
		editorTheme = cloneTheme(state.editorTheme);
		editorName = state.editorName;
		headerFontSelection = state.headerFontSelection;
		bodyFontSelection = state.bodyFontSelection;
		lightBasePalette = state.lightBasePalette;
		darkBasePalette = state.darkBasePalette;
		editorTheme.fontMono = resolveMonoFont(
			editorTheme.fontHeader,
			editorTheme.fontSans,
			editorTheme.fontMono
		);
	}

	function loadPreset(theme: ThemeDraft, notify = true) {
		applyStudioState(createStudioState(theme));

		if (notify) {
			toast({
				title: `${theme.name} loaded`,
				description: 'The preset is now applied across the site.',
				duration: 2200,
				type: 'success'
			});
		}
	}

	function syncBasePalette(mode: 'light' | 'dark', palette: ThemeBasePalette) {
		const next = generatePaletteFromBase(palette, mode);
		if (mode === 'light') {
			lightBasePalette = { ...palette };
			editorTheme.light = next;
		} else {
			darkBasePalette = { ...palette };
			editorTheme.dark = next;
		}
		selectedPresetSlug = 'custom';
	}

	function updateBasePalette(mode: 'light' | 'dark', key: BasePaletteKey, nextValue: string) {
		const nextPalette = {
			...(mode === 'light' ? lightBasePalette : darkBasePalette),
			[key]: nextValue
		};
		syncBasePalette(mode, nextPalette);
	}

	function applyBasePalette(mode: 'light' | 'dark') {
		const palette = mode === 'light' ? lightBasePalette : darkBasePalette;
		syncBasePalette(mode, palette);
		toast({
			title: `${mode === 'light' ? 'Light' : 'Dark'} palette generated`,
			description: 'The semantic tokens were regenerated from the current base colors.',
			duration: 2200,
			type: 'success'
		});
	}

	async function copyGeneratedCss() {
		await navigator.clipboard.writeText(generatedCss);
		copiedCss = true;
		setTimeout(() => (copiedCss = false), 1800);
		toast({
			title: 'Copied CSS',
			description: 'Generated theme CSS copied to your clipboard.',
			duration: 1800,
			type: 'success'
		});
	}

	function showPreviewToast() {
		toast({
			title: 'Preview toast',
			description: 'This should still feel balanced inside the active theme.',
			duration: 2600,
			type: 'success'
		});
	}

	function updateHeaderFont(label: string) {
		const next = fontOptions.find((font) => font.label === label)?.value;
		if (!next) return;
		headerFontSelection = label;
		editorTheme.fontHeader = next;
		editorTheme.fontMono = resolveMonoFont(next, editorTheme.fontSans, editorTheme.fontMono);
		selectedPresetSlug = 'custom';
	}

	function updateBodyFont(label: string) {
		const next = fontOptions.find((font) => font.label === label)?.value;
		if (!next) return;
		bodyFontSelection = label;
		editorTheme.fontSans = next;
		editorTheme.fontMono = resolveMonoFont(editorTheme.fontHeader, next, editorTheme.fontMono);
		selectedPresetSlug = 'custom';
	}

	function updateRadius(next: string) {
		editorTheme.radiusBase = next;
		selectedPresetSlug = 'custom';
	}

	function updateDurationPreset(next: ThemeDurationPreset['slug']) {
		editorTheme.durationPreset = next;
		selectedPresetSlug = 'custom';
	}

	function updatePanelStyle(next: PanelStyleOption['value']) {
		editorTheme.invertedPanels = next === 'inverted';
		selectedPresetSlug = 'custom';
	}

	function applySnapshot(snapshot: StudioSnapshot) {
		ignoreHistory = true;
		applyStudioState(snapshot);
		lastSnapshot = captureStudioSnapshot();
		lastSnapshotSignature = JSON.stringify(lastSnapshot);
		queueMicrotask(() => {
			ignoreHistory = false;
		});
	}

	function undoHistory() {
		const previous = undoStack[undoStack.length - 1];
		if (!previous) return;
		const current = captureStudioSnapshot();
		undoStack = undoStack.slice(0, -1);
		redoStack = [...redoStack, current].slice(-40);
		applySnapshot(previous);
	}

	function redoHistory() {
		const next = redoStack[redoStack.length - 1];
		if (!next) return;
		const current = captureStudioSnapshot();
		redoStack = redoStack.slice(0, -1);
		undoStack = [...undoStack, current].slice(-40);
		applySnapshot(next);
	}

	const defaultTheme = themePresets[0];

	let selectedPresetSlug = $state(defaultTheme.slug);
	let editorTheme = $state(cloneTheme(defaultTheme));
	let editorName = $state(defaultTheme.name);
	let copiedCss = $state(false);
	let headerFontSelection = $state(getFontLabel(defaultTheme.fontHeader));
	let bodyFontSelection = $state(getFontLabel(defaultTheme.fontSans));
	let lightBasePalette = $state<ThemeBasePalette>(createBasePalette(defaultTheme, 'light'));
	let darkBasePalette = $state<ThemeBasePalette>(createBasePalette(defaultTheme, 'dark'));
	let hydrated = $state(false);
	let undoStack = $state<StudioSnapshot[]>([]);
	let redoStack = $state<StudioSnapshot[]>([]);
	let ignoreHistory = $state(false);
	let lastSnapshot = $state<StudioSnapshot>(createStudioState(defaultTheme));
	let lastSnapshotSignature = $state(JSON.stringify(createStudioState(defaultTheme)));

	const generatedCss = $derived(
		themeToCss({
			...editorTheme,
			name: editorName,
			slug: slugifyThemeName(editorName) || 'custom-theme'
		})
	);

	const activePreset = $derived(
		themePresets.find((theme) => theme.slug === selectedPresetSlug) ?? {
			...defaultTheme,
			slug: 'custom',
			name: 'Custom',
			description: 'A generated theme draft based on your current base colors and guided controls.'
		}
	);
	const activeDuration = $derived(getDurationPreset(editorTheme.durationPreset));

	onMount(() => {
		const restored = loadThemeStudioState();
		if (restored) {
			applyStudioState(restored);
		} else {
			const matchedPreset = findPresetFromStoredCss();
			if (matchedPreset) {
				loadPreset(matchedPreset, false);
			}
		}

		lastSnapshot = captureStudioSnapshot();
		lastSnapshotSignature = JSON.stringify(lastSnapshot);
		hydrated = true;
	});

	$effect(() => {
		const parsed = Number.parseFloat(editorTheme.radiusBase);
		if (!Number.isFinite(parsed)) return;
		const safe = Math.max(parsed, 0.14);
		const rounded = `${Math.round(safe * 1000) / 1000}rem`;
		if (editorTheme.radiusBase !== rounded) editorTheme.radiusBase = rounded;
		editorTheme.radiusMd = rounded;
		editorTheme.radiusSm = `${Math.round(Math.max(safe - 0.24, 0.14) * 1000) / 1000}rem`;
		editorTheme.radiusLg = `${Math.round((safe + 0.1) * 1000) / 1000}rem`;
		editorTheme.radiusXl = `${Math.round((safe + 0.22) * 1000) / 1000}rem`;
	});

	$effect(() => {
		if (!hydrated) return;
		applyLiveThemeCss(generatedCss);
	});

	$effect(() => {
		if (!hydrated || !browser) return;

		saveThemeStudioState({
			selectedPresetSlug,
			editorTheme,
			editorName,
			headerFontSelection,
			bodyFontSelection,
			lightBasePalette,
			darkBasePalette
		});
	});

	$effect(() => {
		if (!hydrated || ignoreHistory) return;

		const currentSnapshot = captureStudioSnapshot();
		const signature = JSON.stringify(currentSnapshot);
		if (signature === lastSnapshotSignature) return;

		undoStack = [...undoStack, lastSnapshot].slice(-40);
		redoStack = [];
		lastSnapshot = currentSnapshot;
		lastSnapshotSignature = signature;
	});
</script>

<div class="relative min-h-[calc(100vh-3.5rem)] overflow-hidden pb-20 pt-[5.6rem]">
	<div class="pointer-events-none absolute inset-0 -z-10">
		<div
			class="absolute inset-0"
			style="background-image:
				linear-gradient(color-mix(in srgb, var(--color-foreground) 2%, transparent) 1px, transparent 1px),
				linear-gradient(90deg, color-mix(in srgb, var(--color-foreground) 2%, transparent) 1px, transparent 1px);
				background-size: 44px 44px;
				mask-image: linear-gradient(180deg, rgb(0 0 0 / 0.16), transparent 88%);"
		></div>
	</div>

	<div class="mx-auto flex w-full max-w-none flex-col gap-6 px-4 md:px-8 xl:px-10 2xl:px-12">
		<div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
			<div class="space-y-2">
				<div
					class="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.12em] text-foreground-muted"
				>
					<span>Theme Studio</span>
					<span class="size-1 rounded-full bg-border-strong/70"></span>
					<span>{activeDuration.name}</span>
				</div>
				<h1
					class="m-0 text-[clamp(2rem,3.4vw,3rem)] font-medium tracking-[-0.05em] [font-family:var(--font-header),sans-serif]"
				>
					Build and preview a full theme in one place.
				</h1>
				<p class="m-0 max-w-[50rem] text-sm leading-7 text-foreground-muted md:text-[0.98rem]">
					Use presets, base colors, and a few guided controls on the left, then keep the component
					preview open while you shape the final feel on the right.
				</p>
			</div>
			<div class="flex flex-wrap gap-3">
				<Button href="/themes" variant="ghost" class="text-sm">
					<ChevronLeft size={14} />
					Back to Themes
				</Button>
				<Button
					onclick={undoHistory}
					variant="outlined"
					class="text-sm"
					disabled={undoStack.length === 0}
				>
					Undo
				</Button>
				<Button
					onclick={redoHistory}
					variant="outlined"
					class="text-sm"
					disabled={redoStack.length === 0}
				>
					Redo
				</Button>
				<Button onclick={copyGeneratedCss} variant="outlined" class="text-sm">
					{copiedCss ? 'Copied CSS' : 'Copy Current CSS'}
				</Button>
			</div>
		</div>

		<div class="grid items-start gap-6 xl:grid-cols-[18.5rem_minmax(0,1fr)]">
			<aside class="min-w-0 xl:sticky xl:top-[5.8rem]">
				<div class="grid gap-4">
					<section
						class="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4 shadow-[inset_0_1px_0_var(--card-highlight),var(--card-shadow)]"
					>
						<div class="flex items-center gap-2">
							<WandSparkles size={15} class="text-primary" />
							<p class="text-sm font-semibold text-foreground">Guided controls</p>
						</div>

						<div class="mt-4 grid gap-4">
							<div class="grid gap-2">
								<span class="text-xs font-medium uppercase tracking-[0.12em] text-foreground-muted">
									Theme name
								</span>
								<Input variant="outlined" bind:value={editorName} />
							</div>

							<div class="grid gap-2">
								<span class="text-xs font-medium uppercase tracking-[0.12em] text-foreground-muted">
									Preset
								</span>
								<Select.Root value={activePreset.name} class="">
									<Select.Trigger class="w-full" variant="outlined">Choose a preset</Select.Trigger>
									<Select.Content class="">
										{#each themePresets as preset}
											<Select.Item
												value={preset.name}
												onclick={() => {
													loadPreset(preset);
												}}
											>
												{preset.name}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>

							<div class="grid gap-2">
								<span class="text-xs font-medium uppercase tracking-[0.12em] text-foreground-muted">
									Corner radius
								</span>
								<Select.Root value={getRadiusLabel(editorTheme.radiusBase)} class="">
									<Select.Trigger class="w-full" variant="outlined">Choose a radius</Select.Trigger>
									<Select.Content class="">
										{#each radiusOptions as option}
											<Select.Item value={option.label} onclick={() => updateRadius(option.value)}>
												{option.label}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>

							<div class="grid gap-2">
								<span class="text-xs font-medium uppercase tracking-[0.12em] text-foreground-muted">
									Header font
								</span>
								<Select.Root value={headerFontSelection} class="">
									<Select.Trigger class="w-full" variant="outlined"
										>Choose a header font</Select.Trigger
									>
									<Select.Content class="">
										{#each fontOptions as option}
											<Select.Item
												value={option.label}
												onclick={() => updateHeaderFont(option.label)}
											>
												{option.label}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>

							<div class="grid gap-2">
								<span class="text-xs font-medium uppercase tracking-[0.12em] text-foreground-muted">
									Body font
								</span>
								<Select.Root value={bodyFontSelection} class="">
									<Select.Trigger class="w-full" variant="outlined"
										>Choose a body font</Select.Trigger
									>
									<Select.Content class="">
										{#each fontOptions as option}
											<Select.Item
												value={option.label}
												onclick={() => updateBodyFont(option.label)}
											>
												{option.label}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>

							<div class="grid gap-2">
								<span class="text-xs font-medium uppercase tracking-[0.12em] text-foreground-muted">
									Motion preset
								</span>
								<Select.Root value={activeDuration.name} class="">
									<Select.Trigger class="w-full" variant="outlined"
										>Choose a motion preset</Select.Trigger
									>
									<Select.Content class="">
										{#each durationPresets as preset}
											<Select.Item
												value={preset.name}
												onclick={() => updateDurationPreset(preset.slug)}
											>
												{preset.name}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>

							<div class="grid gap-2">
								<span class="text-xs font-medium uppercase tracking-[0.12em] text-foreground-muted">
									Popover style
								</span>
								<Select.Root value={getPanelStyleLabel(editorTheme.invertedPanels)} class="">
									<Select.Trigger class="w-full" variant="outlined"
										>Choose a panel style</Select.Trigger
									>
									<Select.Content class="">
										{#each panelStyleOptions as option}
											<Select.Item
												value={option.label}
												onclick={() => updatePanelStyle(option.value)}
											>
												{option.label}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>

							<div
								class="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-secondary/18 p-3"
							>
								<div>
									<p class="text-sm font-medium text-foreground">Primary button stroke</p>
									<p class="text-xs text-foreground-muted">Toggle the filled-button outline.</p>
								</div>
								<Switch bind:switched={editorTheme.primaryButtonOutline} class="shrink-0" />
							</div>
						</div>
					</section>

					<section
						class="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4 shadow-[inset_0_1px_0_var(--card-highlight),var(--card-shadow)]"
					>
						<div class="flex items-center justify-between gap-3">
							<div>
								<p class="text-sm font-semibold text-foreground">Current direction</p>
								<p class="mt-1 text-xs leading-5 text-foreground-muted">
									{activePreset.description}
								</p>
							</div>
							<Badge variant="secondary">{activePreset.name}</Badge>
						</div>
						<div class="mt-4 grid grid-cols-3 gap-2">
							{#each [editorTheme.light.primary, editorTheme.light.card, editorTheme.dark.primary, editorTheme.dark.card, editorTheme.light.background, editorTheme.dark.background] as color}
								<div
									class="h-10 rounded-lg border border-border/60"
									style={`background:${color};`}
								></div>
							{/each}
						</div>
					</section>

					<section
						class="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4 shadow-[inset_0_1px_0_var(--card-highlight),var(--card-shadow)]"
					>
						<div class="space-y-1">
							<p class="text-sm font-semibold text-foreground">Palette builder</p>
							<p class="text-xs leading-5 text-foreground-muted">
								Pick the main colors for light and dark mode, then regenerate the rest of the system
								from those anchors.
							</p>
						</div>

						<div class="mt-4 grid gap-4">
							<div class="grid gap-3 rounded-lg border border-border/60 bg-secondary/14 p-3">
								<div class="flex items-center justify-between gap-3">
									<div class="flex items-center gap-2">
										<Badge variant="secondary">Light</Badge>
										<p class="text-sm font-medium text-foreground">Base palette</p>
									</div>
									<Button
										variant="secondary"
										class="h-8 px-3 text-xs"
										onclick={() => applyBasePalette('light')}
									>
										Generate
									</Button>
								</div>
								<div class="grid gap-3">
									<ColorPicker
										label="Background"
										value={lightBasePalette.background}
										onValueChange={(value) => (lightBasePalette.background = value)}
									/>
									<ColorPicker
										label="Surface"
										value={lightBasePalette.surface}
										onValueChange={(value) => (lightBasePalette.surface = value)}
									/>
									<ColorPicker
										label="Text"
										value={lightBasePalette.text}
										onValueChange={(value) => (lightBasePalette.text = value)}
									/>
									<ColorPicker
										label="Primary"
										value={lightBasePalette.primary}
										onValueChange={(value) => (lightBasePalette.primary = value)}
									/>
								</div>
							</div>

							<div class="grid gap-3 rounded-lg border border-border/60 bg-secondary/14 p-3">
								<div class="flex items-center justify-between gap-3">
									<div class="flex items-center gap-2">
										<Badge variant="secondary">Dark</Badge>
										<p class="text-sm font-medium text-foreground">Base palette</p>
									</div>
									<Button
										variant="secondary"
										class="h-8 px-3 text-xs"
										onclick={() => applyBasePalette('dark')}
									>
										Generate
									</Button>
								</div>
								<div class="grid gap-3">
									<ColorPicker
										label="Background"
										value={darkBasePalette.background}
										onValueChange={(value) => (darkBasePalette.background = value)}
									/>
									<ColorPicker
										label="Surface"
										value={darkBasePalette.surface}
										onValueChange={(value) => (darkBasePalette.surface = value)}
									/>
									<ColorPicker
										label="Text"
										value={darkBasePalette.text}
										onValueChange={(value) => (darkBasePalette.text = value)}
									/>
									<ColorPicker
										label="Primary"
										value={darkBasePalette.primary}
										onValueChange={(value) => (darkBasePalette.primary = value)}
									/>
								</div>
							</div>
						</div>
					</section>

					<details class="group rounded-lg border border-border/65 bg-card/84 p-4">
						<summary
							class="flex cursor-default list-none items-center justify-between gap-3 text-sm font-semibold text-foreground"
						>
							<span>Transition details</span>
							<span class="text-xs text-foreground-muted group-open:hidden">Expand</span>
							<span class="hidden text-xs text-foreground-muted group-open:inline">Collapse</span>
						</summary>

						<div class="mt-4 grid gap-4">
							<div class="grid gap-3">
								<label class="grid gap-2">
									<span
										class="text-xs font-medium uppercase tracking-[0.12em] text-foreground-muted"
									>
										Panel duration
									</span>
									<Select.Root value={getDurationLabel(editorTheme.motion.panelDuration)} class="">
										<Select.Trigger class="w-full" variant="outlined">Panel duration</Select.Trigger
										>
										<Select.Content class="">
											{#each durationOptions as option}
												<Select.Item
													value={option.label}
													onclick={() => {
														editorTheme.motion.panelDuration = option.value;
													}}
												>
													{option.label}
												</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</label>

								<label class="grid gap-2">
									<span
										class="text-xs font-medium uppercase tracking-[0.12em] text-foreground-muted"
									>
										Sheet duration
									</span>
									<Select.Root value={getDurationLabel(editorTheme.motion.sheetDuration)} class="">
										<Select.Trigger class="w-full" variant="outlined">Sheet duration</Select.Trigger
										>
										<Select.Content class="">
											{#each durationOptions as option}
												<Select.Item
													value={option.label}
													onclick={() => {
														editorTheme.motion.sheetDuration = option.value;
													}}
												>
													{option.label}
												</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</label>

								<label class="grid gap-2">
									<span
										class="text-xs font-medium uppercase tracking-[0.12em] text-foreground-muted"
									>
										Overlay duration
									</span>
									<Select.Root
										value={getDurationLabel(editorTheme.motion.overlayDuration)}
										class=""
									>
										<Select.Trigger class="w-full" variant="outlined"
											>Overlay duration</Select.Trigger
										>
										<Select.Content class="">
											{#each durationOptions as option}
												<Select.Item
													value={option.label}
													onclick={() => {
														editorTheme.motion.overlayDuration = option.value;
													}}
												>
													{option.label}
												</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</label>
							</div>

							<div class="grid gap-3 rounded-lg border border-border/60 bg-secondary/18 p-3">
								{#each motionFields as field}
									<label class="grid gap-2">
										<div
											class="flex items-center justify-between gap-3 text-sm font-medium text-foreground"
										>
											<span>{field.label}</span>
											<span class="text-xs text-foreground-muted">
												{editorTheme.motion[field.key]}{field.suffix ?? ''}
											</span>
										</div>
										<input
											type="range"
											min={field.min}
											max={field.max}
											step={field.step}
											bind:value={editorTheme.motion[field.key]}
										/>
									</label>
								{/each}
							</div>
						</div>
					</details>
				</div>
			</aside>

			<div class="grid min-w-0 gap-6">
				<Card.Root class="rounded-lg p-5 md:p-6">
					<Card.Header class="gap-3">
						<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
							<div class="space-y-2">
								<Card.Title class="text-xl">Live component preview</Card.Title>
								<Card.Description class="leading-7">
									Keep the actual library surfaces in view while you tune the overall theme
									direction.
								</Card.Description>
							</div>
							<Button variant="secondary" onclick={showPreviewToast} class="sm:self-start"
								>Fire toast</Button
							>
						</div>
					</Card.Header>

					<Card.Content>
						<div class="grid gap-5 2xl:grid-cols-[1.35fr_0.85fr]">
							<div class="grid gap-5">
								<div class="rounded-lg bg-card/88 p-6">
									<div class="flex flex-wrap items-center gap-2">
										<Button>Primary</Button>
										<Button variant="secondary">Secondary</Button>
										<Button variant="outlined">Outlined</Button>
										<Button variant="ghost">Ghost</Button>
										<Badge>New</Badge>
										<Badge variant="secondary">Neutral</Badge>
										<Badge variant="outlined">Outline</Badge>
									</div>
								</div>

								<div class="rounded-lg bg-card/88 p-6">
									<div class="space-y-4">
										<div class="space-y-2">
											<p class="text-sm font-semibold text-foreground">Interface copy</p>
											<p class="text-[1.55rem] font-semibold tracking-[-0.03em] text-foreground">
												A theme should set the tone before you even notice the tokens.
											</p>
										</div>

										<div class="grid gap-3">
											<Input
												variant="outlined"
												placeholder="Search surfaces, color, and contrast"
											/>
											<div class="grid gap-3 md:grid-cols-2">
												<Input variant="outlined" value={editorName} />
												<Button variant="flat" class="justify-start">Save current variant</Button>
											</div>
											<Textarea
												class="min-h-32"
												placeholder="Longer notes for testing textarea contrast, borders, and comfortable reading color."
											/>
										</div>
									</div>
								</div>

								<div class="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
									<div class="rounded-lg bg-card/88 p-6">
										<p class="text-sm font-semibold text-foreground">Account access</p>
										<p class="mt-1 text-sm text-foreground-muted">
											Email, password, and account actions in a compact settings card.
										</p>
										<div class="mt-5 grid gap-3">
											<Input variant="outlined" value="artist@studio.inc" />
											<Input variant="outlined" value="••••••••••••" />
											<Button>Update security</Button>
											<Button variant="outlined" class="justify-start">Reset password</Button>
											<div class="rounded-lg border border-border/60 bg-secondary/16 p-3">
												<p class="text-sm font-medium text-foreground">Danger zone</p>
												<p class="mt-1 text-xs leading-5 text-foreground-muted">
													Archive the account or remove access after exporting project data.
												</p>
											</div>
										</div>
									</div>

									<div class="rounded-lg bg-card/88 p-6">
										<p class="text-sm font-semibold text-foreground">Billing preferences</p>
										<p class="mt-1 text-sm text-foreground-muted">
											Forms, toggles, and quiet summaries in a denser infrastructure card.
										</p>
										<div class="mt-5 grid gap-3">
											<Input variant="outlined" value="$2,500.00" />
											<Input variant="outlined" value="USD - United States Dollar" />
											<div
												class="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/18 p-3"
											>
												<div>
													<p class="text-sm font-medium text-foreground">
														Auto-save payout threshold
													</p>
													<p class="text-xs text-foreground-muted">
														Keep minimums synced across payout flows.
													</p>
												</div>
												<Switch switched={true} />
											</div>
											<Button>Save threshold</Button>
											<Button variant="outlined" class="justify-start"
												>Export billing summary</Button
											>
										</div>
									</div>
								</div>

								<div class="grid gap-4 xl:grid-cols-3">
									<div class="rounded-lg bg-card/88 p-5">
										<p class="text-sm font-semibold text-foreground">Typography</p>
										<p class="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
											Calm structure.
										</p>
										<p
											class="mt-2 text-sm leading-7 text-foreground-muted"
											style={`font-family:${editorTheme.fontSans};`}
										>
											Body copy should stay easy to read while the heading font carries the
											personality.
										</p>
									</div>
									<div class="rounded-lg bg-card/88 p-5">
										<p class="text-sm font-semibold text-foreground">Motion</p>
										<p class="mt-3 text-sm leading-6 text-foreground-muted">
											{activeDuration.description}
										</p>
										<p class="mt-3 text-xs text-foreground-muted">
											Panel {editorTheme.motion.panelDuration}, sheet {editorTheme.motion
												.sheetDuration}, overlay {editorTheme.motion.overlayDuration}
										</p>
									</div>
									<div class="rounded-lg bg-card/88 p-5">
										<p class="text-sm font-semibold text-foreground">Radius</p>
										<p class="mt-3 text-sm leading-6 text-foreground-muted">
											Base radius {editorTheme.radiusBase} with matching small and large surfaces derived
											automatically.
										</p>
										<p
											class="mt-3 text-xs text-foreground-muted"
											style={`font-family:${editorTheme.fontMono};`}
										>
											token.radius = {editorTheme.radiusBase}
										</p>
									</div>
								</div>
							</div>

							<div class="grid gap-5">
								<div class="rounded-lg bg-card/88 p-5">
									<div class="flex items-start justify-between gap-4">
										<div class="space-y-1">
											<p class="text-sm font-semibold text-foreground">Preferences</p>
											<p class="text-sm leading-6 text-foreground-muted">
												Quick checks for fields, toggles, and quiet surfaces.
											</p>
										</div>
										<Switch switched={true} />
									</div>
									<div class="mt-4 flex flex-col gap-3">
										<Checkbox
											variant="default"
											checked={true}
											label="Preserve semantic tokens"
											description="Keep the system easy to extend and remix later."
										/>
										<Checkbox
											variant="default"
											checked={false}
											label="Export component token overrides"
										/>
									</div>
								</div>

								<Alert.Root variant="info">
									<Alert.Title>Contrast check</Alert.Title>
									<Alert.Description>
										Muted text should stay readable, borders should separate quietly, and panels
										should not disappear into the page.
									</Alert.Description>
								</Alert.Root>

								<div class="grid gap-3">
									<div class="rounded-lg bg-card/88 p-4">
										<p class="text-sm font-semibold text-foreground">Light surfaces</p>
										<p class="mt-1 text-sm leading-6 text-foreground-muted">
											Should feel clean, not washed out.
										</p>
									</div>
									<div class="rounded-lg bg-card/88 p-4">
										<p class="text-sm font-semibold text-foreground">Dark surfaces</p>
										<p class="mt-1 text-sm leading-6 text-foreground-muted">
											Should be deep and calm, not overly saturated.
										</p>
									</div>
									<div class="rounded-lg bg-card/88 p-4">
										<p class="text-sm font-semibold text-foreground">Accent balance</p>
										<p class="mt-1 text-sm leading-6 text-foreground-muted">
											Primary should lead without overpowering the page.
										</p>
									</div>
								</div>

								<div class="rounded-lg bg-card/88 p-5">
									<div class="flex items-center justify-between gap-3">
										<div>
											<p class="text-sm font-semibold text-foreground">Recent activity</p>
											<p class="mt-1 text-sm text-foreground-muted">
												A small operations-style list for denser UI rhythm.
											</p>
										</div>
										<Button variant="ghost" class="h-8 px-3 text-xs">View all</Button>
									</div>
									<div class="mt-4 grid gap-3">
										{#each [['Blue Bottle Coffee', 'Food & Drink', '-$6.50'], ['Stripe payout', 'Income', '+$4,200.00'], ['Vercel Pro', 'Infrastructure', '-$20.00']] as [title, meta, amount]}
											<div
												class="flex items-center justify-between gap-4 rounded-lg border border-border/55 bg-secondary/16 px-3 py-3"
											>
												<div>
													<p class="text-sm font-medium text-foreground">{title}</p>
													<p class="text-xs text-foreground-muted">{meta}</p>
												</div>
												<p class="text-sm font-semibold text-foreground">{amount}</p>
											</div>
										{/each}
									</div>
								</div>

								<div class="rounded-lg bg-card/88 p-5">
									<p class="text-sm font-semibold text-foreground">Notification routing</p>
									<p class="mt-1 text-sm text-foreground-muted">
										An example quiet settings card built from toggles, checkboxes, and secondary
										surfaces.
									</p>
									<div class="mt-4 grid gap-3">
										<div
											class="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/18 p-3"
										>
											<div>
												<p class="text-sm font-medium text-foreground">Email alerts</p>
												<p class="text-xs text-foreground-muted">
													Weekly summaries and threshold changes.
												</p>
											</div>
											<Switch switched={true} />
										</div>
										<div
											class="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/18 p-3"
										>
											<div>
												<p class="text-sm font-medium text-foreground">Incident notifications</p>
												<p class="text-xs text-foreground-muted">
													Send urgent alerts to the whole ops team.
												</p>
											</div>
											<Switch switched={false} />
										</div>
										<div class="mt-1 flex flex-col gap-3">
											<Checkbox variant="default" checked={true} label="Include billing events" />
											<Checkbox
												variant="default"
												checked={false}
												label="Mute low-priority deploy notices"
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<details
					class="group rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-[inset_0_1px_0_var(--card-highlight),var(--card-shadow)] md:p-6"
				>
					<summary class="flex list-none items-center justify-between gap-4">
						<div class="space-y-2">
							<p class="text-xl font-medium tracking-[-0.02em] text-foreground">Generated CSS</p>
							<p class="text-sm text-foreground-muted">
								The exact CSS generated from the current editor state.
							</p>
						</div>
						<div class="flex items-center gap-2">
							<span class="text-xs text-foreground-muted group-open:hidden">Expand</span>
							<span class="hidden text-xs text-foreground-muted group-open:inline">Collapse</span>
						</div>
					</summary>
					<div class="mt-5 grid gap-4">
						<div class="flex justify-end">
							<Tooltip.Root placement="top" delay={0}>
								<Tooltip.Trigger>
									<button
										type="button"
										class="inline-flex size-9 items-center justify-center rounded-lg border border-transparent bg-[var(--button-ghost-bg)] text-[var(--button-ghost-foreground)] transition-[background-color,border-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[var(--button-ghost-hover-bg)] focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_var(--color-ring)]"
										onclick={copyGeneratedCss}
									>
										{#if copiedCss}
											<Check size={16} />
										{:else}
											<Copy size={16} />
										{/if}
									</button>
								</Tooltip.Trigger>
								<Tooltip.Content>{copiedCss ? 'Copied' : 'Copy generated CSS'}</Tooltip.Content>
							</Tooltip.Root>
						</div>
						<Textarea
							class="min-h-[24rem] font-mono text-xs leading-6"
							readonly
							value={generatedCss}
						/>
					</div>
				</details>
			</div>
		</div>
	</div>
</div>
