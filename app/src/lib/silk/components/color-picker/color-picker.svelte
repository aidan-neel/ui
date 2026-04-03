<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import Pipette from '@lucide/svelte/icons/pipette';
	import { Input } from '$lib/silk/components/input';
	import * as Popover from '$lib/silk/components/popover';
	import * as Select from '$lib/silk/components/select';
	import { cn } from '$lib/silk/utils';

	export type ColorOption = {
		label: string;
		value: string;
	};

	type Props = {
		label?: string;
		value: string;
		onValueChange?: (value: string) => void;
		options?: Array<ColorOption | string>;
		showSelect?: boolean;
		class?: string;
	};

	const {
		label,
		value,
		onValueChange,
		options = [
			{ label: 'Blue', value: '#155eef' },
			{ label: 'Green', value: '#2f7a54' },
			{ label: 'Copper', value: '#a44a2f' },
			{ label: 'Charcoal', value: '#101828' },
			{ label: 'White', value: '#ffffff' }
		],
		showSelect = true,
		class: className
	}: Props = $props();

	let copied = $state(false);
	let colorArea = $state<HTMLDivElement | undefined>();
	let hue = $state(220);
	let saturation = $state(0.91);
	let brightness = $state(0.94);
	let hexInput = $state('');

	const CUSTOM_LABEL = 'Custom';

	const normalizedOptions = $derived(
		options.map((option) =>
			typeof option === 'string' ? { label: option.toUpperCase(), value: option } : option
		)
	);

	const selectedOptionLabel = $derived(
		normalizedOptions.find((option) => option.value.toLowerCase() === value.toLowerCase())?.label ??
			CUSTOM_LABEL
	);

	const hueColor = $derived(hsvToHex(hue, 1, 1));
	const thumbLeft = $derived(`${saturation * 100}%`);
	const thumbTop = $derived(`${(1 - brightness) * 100}%`);

	/** Clamps a numeric value into a safe range. */
	function clamp(number: number, min: number, max: number) {
		return Math.min(max, Math.max(min, number));
	}

	/** Normalizes a hex string to six-digit lowercase form. */
	function normalizeHex(input: string) {
		const trimmed = input.trim();
		if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed.toLowerCase();
		if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
			const [, r, g, b] = trimmed;
			return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
		}
		return null;
	}

	/** Converts a hex color to RGB channels. */
	function hexToRgb(hex: string) {
		const normalized = normalizeHex(hex) ?? '#000000';
		return {
			r: Number.parseInt(normalized.slice(1, 3), 16),
			g: Number.parseInt(normalized.slice(3, 5), 16),
			b: Number.parseInt(normalized.slice(5, 7), 16)
		};
	}

	/** Converts RGB channels into a hex string. */
	function rgbToHex(r: number, g: number, b: number) {
		return `#${[r, g, b]
			.map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0'))
			.join('')}`;
	}

	/** Converts RGB channels into HSV values. */
	function rgbToHsv(r: number, g: number, b: number) {
		const red = r / 255;
		const green = g / 255;
		const blue = b / 255;
		const max = Math.max(red, green, blue);
		const min = Math.min(red, green, blue);
		const delta = max - min;
		let nextHue = 0;

		if (delta !== 0) {
			if (max === red) nextHue = ((green - blue) / delta) % 6;
			else if (max === green) nextHue = (blue - red) / delta + 2;
			else nextHue = (red - green) / delta + 4;
		}

		return {
			h: (nextHue * 60 + 360) % 360,
			s: max === 0 ? 0 : delta / max,
			v: max
		};
	}

	/** Converts HSV values into a hex string. */
	function hsvToHex(nextHue: number, nextSaturation: number, nextBrightness: number) {
		const chroma = nextBrightness * nextSaturation;
		const segment = nextHue / 60;
		const secondary = chroma * (1 - Math.abs((segment % 2) - 1));
		const match = nextBrightness - chroma;

		let red = 0;
		let green = 0;
		let blue = 0;

		if (segment >= 0 && segment < 1) [red, green, blue] = [chroma, secondary, 0];
		else if (segment < 2) [red, green, blue] = [secondary, chroma, 0];
		else if (segment < 3) [red, green, blue] = [0, chroma, secondary];
		else if (segment < 4) [red, green, blue] = [0, secondary, chroma];
		else if (segment < 5) [red, green, blue] = [secondary, 0, chroma];
		else [red, green, blue] = [chroma, 0, secondary];

		return rgbToHex((red + match) * 255, (green + match) * 255, (blue + match) * 255);
	}

	/** Syncs the HSV controls from the current hex value. */
	function syncPickerState(nextValue: string) {
		const normalized = normalizeHex(nextValue);
		if (!normalized) return;
		const { r, g, b } = hexToRgb(normalized);
		const hsv = rgbToHsv(r, g, b);
		hue = hsv.h;
		saturation = hsv.s;
		brightness = hsv.v;
		hexInput = normalized.toUpperCase();
	}

	/** Emits a valid color change and updates the local picker state. */
	function commitColor(nextValue: string) {
		const normalized = normalizeHex(nextValue);
		if (!normalized) return;
		onValueChange?.(normalized);
		syncPickerState(normalized);
	}

	/** Updates the current HSV values and emits the derived hex color. */
	function setPickerColor(nextHue: number, nextSaturation: number, nextBrightness: number) {
		hue = clamp(nextHue, 0, 360);
		saturation = clamp(nextSaturation, 0, 1);
		brightness = clamp(nextBrightness, 0, 1);
		const nextValue = hsvToHex(hue, saturation, brightness);
		onValueChange?.(nextValue);
		hexInput = nextValue.toUpperCase();
	}

	/** Updates the picker from a pointer event inside the saturation area. */
	function updateFromArea(event: PointerEvent) {
		if (!colorArea) return;
		const rect = colorArea.getBoundingClientRect();
		const nextSaturation = clamp((event.clientX - rect.left) / rect.width, 0, 1);
		const nextBrightness = 1 - clamp((event.clientY - rect.top) / rect.height, 0, 1);
		setPickerColor(hue, nextSaturation, nextBrightness);
	}

	/** Starts a pointer drag for the saturation area. */
	function startAreaDrag(event: PointerEvent) {
		event.preventDefault();
		updateFromArea(event);

		const move = (nextEvent: PointerEvent) => updateFromArea(nextEvent);
		const stop = () => {
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', stop);
		};

		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', stop);
	}

	/** Copies the current hex value to the clipboard when possible. */
	async function copyHex() {
		if (!navigator?.clipboard) return;
		await navigator.clipboard.writeText(value.toUpperCase());
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 1400);
	}

	$effect(() => {
		syncPickerState(value);
	});
</script>

<div class={cn(className, 'grid gap-2')}>
	{#if label}
		<span class="text-sm font-medium text-foreground">{label}</span>
	{/if}

	<div
		class={cn(
			'items-center gap-2',
			showSelect ? 'grid grid-cols-[minmax(0,1fr)_2.9rem]' : 'flex justify-start'
		)}
	>
		{#if showSelect}
			<Select.Root value={selectedOptionLabel} class="">
				<Select.Trigger class="w-full" variant="outlined">Choose a color</Select.Trigger>
				<Select.Content class="">
					{#each normalizedOptions as option}
						<Select.Item value={option.value} onclick={() => commitColor(option.value)}>
							{option.label}
						</Select.Item>
					{/each}
					<Select.Item value={`${label?.toLowerCase() ?? 'color'}-custom`}
						>{CUSTOM_LABEL}</Select.Item
					>
				</Select.Content>
			</Select.Root>
		{/if}

		<Popover.Root placement="bottom">
			<Popover.Trigger
				variant="outlined"
				class="size-[2.3rem] rounded-xl border border-[var(--field-border)] p-0 shadow-[inset_0_-1.5px_3px_rgba(16,24,40,0.12),inset_0_1px_0_rgba(255,255,255,0.16)]"
				style={`background:${value};`}
				aria-label={`Open ${label?.toLowerCase() ?? 'color'} picker`}
			/>
			<Popover.Content class="w-[17rem] overflow-hidden p-3">
				<div class="grid gap-3">
					<div
						bind:this={colorArea as HTMLDivElement}
						class="relative h-52 overflow-hidden rounded-[0.8rem] border border-border/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
						style={`background:
							linear-gradient(180deg, transparent, #000),
							linear-gradient(90deg, #fff, ${hueColor});`}
						onpointerdown={startAreaDrag}
						role="presentation"
					>
						<div
							class="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_1px_6px_rgba(16,24,40,0.25)]"
							style={`left:${thumbLeft};top:${thumbTop};`}
						></div>
					</div>

					<input
						type="range"
						min="0"
						max="360"
						step="1"
						value={hue}
						oninput={(event) => {
							setPickerColor(Number(event.currentTarget.value), saturation, brightness);
						}}
						class="h-3 w-full appearance-none rounded-full border border-border/60 bg-transparent"
						style="background: linear-gradient(90deg, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);"
						aria-label={`${label ?? 'Color'} hue`}
					/>

					<div class="grid gap-1.5">
						<span
							class="text-[0.72rem] font-medium uppercase tracking-[0.12em] text-foreground-muted"
						>
							Hex
						</span>
						<Input
							variant="outlined"
							value={hexInput}
							class="font-mono text-sm"
							oninput={(event) => {
								hexInput = event.currentTarget.value.toUpperCase();
								const normalized = normalizeHex(event.currentTarget.value);
								if (normalized) {
									commitColor(normalized);
								}
							}}
						/>
					</div>

					<div class="grid grid-cols-[2.75rem_2.75rem_minmax(0,1fr)] gap-2">
						<button
							type="button"
							class="inline-flex h-11 items-center justify-center rounded-[0.8rem] border border-border/60 bg-card text-foreground-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] transition-colors hover:bg-secondary/40"
							onclick={copyHex}
							aria-label={`Copy ${label?.toLowerCase() ?? 'color'} hex value`}
						>
							{#if copied}
								<Check size={16} />
							{:else}
								<Copy size={16} />
							{/if}
						</button>

						<label
							class="relative inline-flex h-11 items-center justify-center overflow-hidden rounded-[0.8rem] border border-border/60 bg-card text-foreground-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] transition-colors hover:bg-secondary/40"
						>
							<Pipette size={16} />
							<input
								type="color"
								value={normalizeHex(value) ?? '#155eef'}
								oninput={(event) => commitColor(event.currentTarget.value)}
								class="absolute inset-0 cursor-pointer opacity-0"
								aria-label={`Open native ${label?.toLowerCase() ?? 'color'} picker`}
							/>
						</label>

						<div
							class="h-11 rounded-[0.8rem] border border-border/60 shadow-[inset_0_-1.5px_3px_rgba(16,24,40,0.12),inset_0_1px_0_rgba(255,255,255,0.16)]"
							style={`background:${value};`}
							aria-hidden="true"
						></div>
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>
	</div>

	<span
		class="w-fit rounded-md border border-border/55 bg-secondary/28 px-2.5 py-1 font-mono text-[0.74rem] text-foreground-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]"
	>
		{value.toUpperCase()}
	</span>
</div>
