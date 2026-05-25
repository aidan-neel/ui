<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/silk/components/button';
	import { Input } from '$lib/silk/components/input';
	import { Badge } from '$lib/silk/components/badge';
	import * as Select from '$lib/silk/components/select';
	import * as Alert from '$lib/silk/components/alert';
	import { toast } from '$lib/silk/components/toast';
	import { applyLiveThemeCss, saveThemeStudioState } from '$lib/silk/themes/live';
	import {
		themeToCss,
		type ThemeBasePalette,
		type ThemeDraft,
		type ThemePalette
	} from '$lib/silk/themes/presets';
	import type { RegistryTheme } from '$lib/server/theme-registry';

	import Search from '@lucide/svelte/icons/search';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Wand from '@lucide/svelte/icons/wand-sparkles';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import User from '@lucide/svelte/icons/user';
	import Calendar from '@lucide/svelte/icons/calendar';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Inbox from '@lucide/svelte/icons/inbox';

	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	type SortKey = 'recent' | 'name' | 'oldest';

	let searchQuery = $state('');
	let sortBy = $state<SortKey>('recent');

	const sortLabels: Record<SortKey, string> = {
		recent: 'Newest first',
		name: 'Alphabetical',
		oldest: 'Oldest first'
	};

	const filteredThemes = $derived.by(() => {
		const needle = searchQuery.trim().toLowerCase();
		const base = data.themes.filter((theme) => {
			if (!needle) return true;
			const haystack = [theme.name, theme.description, theme.publisher ?? '']
				.join(' ')
				.toLowerCase();
			return haystack.includes(needle);
		});
		const sorted = [...base];
		if (sortBy === 'name') {
			sorted.sort((a, b) => a.name.localeCompare(b.name));
		} else if (sortBy === 'oldest') {
			sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
		} else {
			sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
		}
		return sorted;
	});

	function formatPublishedDate(iso: string) {
		const date = new Date(iso);
		if (Number.isNaN(date.getTime())) return 'Unknown';
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function basePaletteFrom(palette: ThemePalette): ThemeBasePalette {
		return {
			background: palette.background,
			card: palette.card,
			text: palette.foreground,
			primary: palette.primary,
			secondary: palette.secondary,
			border: palette.border
		};
	}

	function fontPrimaryLabel(fontValue: string) {
		return fontValue.split(',')[0].trim().replace(/^["']|["']$/g, '');
	}

	function applyTheme(theme: ThemeDraft) {
		applyLiveThemeCss(themeToCss(theme));
		toast({
			title: `${theme.name} applied`,
			description: 'Live tokens updated across the app.',
			duration: 2000,
			type: 'success'
		});
	}

	function openInStudio(theme: ThemeDraft) {
		// The studio's onMount restores from `silk-theme-studio-state` first and
		// only falls back to the live CSS, so we have to seed the full state to
		// guarantee the picked theme actually loads.
		saveThemeStudioState({
			selectedPresetSlug: theme.slug,
			editorTheme: JSON.parse(JSON.stringify(theme)) as ThemeDraft,
			editorName: theme.name,
			headerFontSelection: fontPrimaryLabel(theme.fontHeader),
			bodyFontSelection: fontPrimaryLabel(theme.fontSans),
			lightBasePalette: basePaletteFrom(theme.light),
			darkBasePalette: basePaletteFrom(theme.dark)
		});
		applyLiveThemeCss(themeToCss(theme));
		void goto('/themes/studio');
	}
</script>

<svelte:head>
	<title>Silk · Theme Registry</title>
	<meta
		name="description"
		content="Browse community themes published to the Silk UI registry."
	/>
</svelte:head>

<div class="mt-16 min-h-[calc(100vh-4rem)] bg-background">
	<!-- ─── Hero ─── -->
	<section class="border-b border-border/60">
		<div class="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-14 md:px-8 md:py-20">
			<div class="flex flex-col gap-3">
				<div
					class="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/80 bg-card/60 px-2.5 py-1 text-[0.7rem] font-medium text-foreground-muted backdrop-blur"
				>
					<Sparkles size={11} class="text-primary" />
					Community registry
				</div>
				<h1
					class="m-0 text-[2.4rem] font-medium leading-[1.05] tracking-tight md:text-[3rem]"
					style="font-family: var(--font-header);"
				>
					Themes from the community.
				</h1>
				<p class="m-0 max-w-[42rem] text-[0.95rem] leading-relaxed text-foreground-muted">
					Explore unofficial themes published by Silk users. Apply one with a click, or open it in
					the studio to make it your own.
				</p>
			</div>

			<div class="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
				<div class="relative flex-1">
					<Search
						size={14}
						class="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-foreground-muted"
					/>
					<Input
						variant="outlined"
						class="pl-9"
						placeholder="Search themes, authors, descriptions…"
						bind:value={searchQuery}
					/>
				</div>
				<div class="flex items-center gap-2">
					<Select.Root value={sortBy} class="">
						<Select.Trigger
							class="h-9 min-w-[10rem] gap-1.5 text-[0.82rem]"
							variant="outlined"
						>
							{sortLabels[sortBy]}
						</Select.Trigger>
						<Select.Content class="">
							<Select.Item value="recent" onclick={() => (sortBy = 'recent')}>
								{sortLabels.recent}
							</Select.Item>
							<Select.Item value="name" onclick={() => (sortBy = 'name')}>
								{sortLabels.name}
							</Select.Item>
							<Select.Item value="oldest" onclick={() => (sortBy = 'oldest')}>
								{sortLabels.oldest}
							</Select.Item>
						</Select.Content>
					</Select.Root>
					<Button
						variant="primary"
						size="sm"
						class="h-9 gap-1.5 text-[0.82rem]"
						onclick={() => void goto('/themes/studio')}
					>
						<Wand size={13} />
						Open studio
					</Button>
				</div>
			</div>

			<div class="flex flex-wrap items-center gap-3 text-[0.78rem] text-foreground-muted">
				<span>
					<span class="font-semibold text-foreground">{data.themes.length}</span>
					{data.themes.length === 1 ? 'theme' : 'themes'} in the registry
				</span>
				{#if searchQuery.trim()}
					<span aria-hidden="true">·</span>
					<span>
						<span class="font-semibold text-foreground">{filteredThemes.length}</span> matching
						"{searchQuery.trim()}"
					</span>
				{/if}
			</div>
		</div>
	</section>

	<!-- ─── Grid ─── -->
	<section class="mx-auto w-full max-w-[1600px] px-4 py-10 md:px-8 md:py-14">
		{#if !data.registryAvailable}
			<Alert.Root variant="warning">
				<Alert.Title>Registry unavailable</Alert.Title>
				<Alert.Description>
					Couldn't reach the theme registry. Check that the service is running, then refresh.
				</Alert.Description>
			</Alert.Root>
		{:else if filteredThemes.length === 0}
			<div
				class="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-border/80 bg-card/40 px-6 py-14 text-center"
			>
				<div
					class="grid size-12 place-items-center rounded-full bg-secondary text-foreground-muted"
				>
					<Inbox size={20} />
				</div>
				<div class="flex flex-col gap-1">
					<p class="m-0 text-[1rem] font-medium">No themes match your search</p>
					<p class="m-0 text-[0.84rem] text-foreground-muted">
						{searchQuery.trim()
							? 'Try a different keyword, or clear your search.'
							: 'The registry is empty right now. Publish one from the studio to seed it.'}
					</p>
				</div>
				{#if searchQuery.trim()}
					<Button variant="ghost" size="sm" onclick={() => (searchQuery = '')}>
						Clear search
					</Button>
				{:else}
					<Button size="sm" onclick={() => void goto('/themes/studio')}>
						<Wand size={13} />
						Publish from studio
					</Button>
				{/if}
			</div>
		{:else}
			<ul
				class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
			>
				{#each filteredThemes as theme (theme.slug)}
					{@const publisher = theme.publisher?.trim() || 'Anonymous'}
					{@const published = formatPublishedDate(theme.createdAt)}
					<li
						class="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card transition-[border-color,box-shadow,transform] [transition-duration:var(--motion-duration-hover)] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-sm)]"
					>
						<!-- Preview tile -->
						<div class="grid grid-cols-2 gap-px bg-border/60">
							<!-- Light mode -->
							<div
								class="flex flex-col gap-3 px-3 py-4"
								style={`background:${theme.light.background};color:${theme.light.foreground};`}
							>
								<div class="flex items-center justify-between">
									<span class="inline-flex items-center gap-1 text-[0.62rem] font-medium opacity-70">
										<Sun size={10} />
										Light
									</span>
									<span
										class="size-2 rounded-full"
										style={`background:${theme.light.primary};`}
										aria-hidden="true"
									></span>
								</div>
								<div class="flex flex-1 items-end gap-1">
									<span
										class="h-6 flex-1 rounded-[3px]"
										style={`background:${theme.light.primary};`}
										aria-hidden="true"
									></span>
									<span
										class="h-6 flex-1 rounded-[3px]"
										style={`background:${theme.light.secondary};`}
										aria-hidden="true"
									></span>
									<span
										class="h-6 flex-1 rounded-[3px]"
										style={`background:${theme.light.card};border:1px solid ${theme.light.border};`}
										aria-hidden="true"
									></span>
									<span
										class="h-6 flex-1 rounded-[3px]"
										style={`background:${theme.light.accent};`}
										aria-hidden="true"
									></span>
								</div>
								<span
									class="truncate text-[0.7rem] font-medium"
									style={`font-family:${theme.fontHeader};`}
								>
									Aa Bb · 123
								</span>
							</div>
							<!-- Dark mode -->
							<div
								class="flex flex-col gap-3 px-3 py-4"
								style={`background:${theme.dark.background};color:${theme.dark.foreground};`}
							>
								<div class="flex items-center justify-between">
									<span class="inline-flex items-center gap-1 text-[0.62rem] font-medium opacity-70">
										<Moon size={10} />
										Dark
									</span>
									<span
										class="size-2 rounded-full"
										style={`background:${theme.dark.primary};`}
										aria-hidden="true"
									></span>
								</div>
								<div class="flex flex-1 items-end gap-1">
									<span
										class="h-6 flex-1 rounded-[3px]"
										style={`background:${theme.dark.primary};`}
										aria-hidden="true"
									></span>
									<span
										class="h-6 flex-1 rounded-[3px]"
										style={`background:${theme.dark.secondary};`}
										aria-hidden="true"
									></span>
									<span
										class="h-6 flex-1 rounded-[3px]"
										style={`background:${theme.dark.card};border:1px solid ${theme.dark.border};`}
										aria-hidden="true"
									></span>
									<span
										class="h-6 flex-1 rounded-[3px]"
										style={`background:${theme.dark.accent};`}
										aria-hidden="true"
									></span>
								</div>
								<span
									class="truncate text-[0.7rem] font-medium"
									style={`font-family:${theme.fontHeader};`}
								>
									Aa Bb · 123
								</span>
							</div>
						</div>

						<!-- Body -->
						<div class="flex flex-1 flex-col gap-3 px-4 py-4">
							<div class="flex items-start justify-between gap-2">
								<div class="min-w-0">
									<h3
										class="m-0 truncate text-[1rem] font-medium leading-tight tracking-tight"
										style="font-family: var(--font-header);"
									>
										{theme.name}
									</h3>
									<p class="m-0 mt-0.5 text-[0.72rem] text-foreground-muted">
										{theme.slug}
									</p>
								</div>
								<Badge variant="outlined" class="shrink-0 text-[0.66rem]">
									{theme.durationPreset}
								</Badge>
							</div>
							<p
								class="m-0 text-[0.82rem] leading-relaxed text-foreground-muted line-clamp-2 min-h-[2.6rem]"
							>
								{theme.description}
							</p>
							<div
								class="flex items-center gap-3 text-[0.72rem] text-foreground-muted"
							>
								<span class="inline-flex items-center gap-1">
									<User size={11} />
									{publisher}
								</span>
								<span aria-hidden="true">·</span>
								<span class="inline-flex items-center gap-1">
									<Calendar size={11} />
									{published}
								</span>
							</div>
						</div>

						<!-- Actions -->
						<div
							class="mt-auto flex items-center justify-between gap-2 border-t border-border/70 px-3 py-2.5"
						>
							<Button
								variant="ghost"
								size="sm"
								class="h-8 text-[0.78rem]"
								onclick={() => applyTheme(theme)}
							>
								Apply
							</Button>
							<Button
								variant="outlined"
								size="sm"
								class="h-8 gap-1.5 text-[0.78rem]"
								onclick={() => openInStudio(theme)}
							>
								Open in studio
								<ArrowUpRight size={12} />
							</Button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
