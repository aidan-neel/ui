<script lang="ts">
	import type { Action } from 'svelte/action';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import Layers from '@lucide/svelte/icons/layers-3';
	import SwatchBook from '@lucide/svelte/icons/swatch-book';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Command from '@lucide/svelte/icons/command';
	import Keyboard from '@lucide/svelte/icons/keyboard';
	import Palette from '@lucide/svelte/icons/palette';
	import Bell from '@lucide/svelte/icons/bell';
	import Mail from '@lucide/svelte/icons/mail';
	import Search from '@lucide/svelte/icons/search';
	import { Badge } from '$lib/silk/components/badge';
	import { Button } from '$lib/silk/components/button';
	import { Input } from '$lib/silk/components/input';
	import { Switch } from '$lib/silk/components/switch';

	const heroHeadline = 'Svelte components that feel designed, not generated.';
	const heroWords = heroHeadline.split(' ');

	const installCommand = 'npx @aidan-neel/ui add button';
	let copied = $state(false);
	let notifications = $state(true);
	let emailEnabled = $state(false);

	function copyInstall() {
		if (typeof navigator === 'undefined' || !navigator.clipboard) return;
		void navigator.clipboard.writeText(installCommand);
		copied = true;
		setTimeout(() => (copied = false), 1600);
	}

	type RevealParams = {
		delay?: number;
		threshold?: number;
		rootMargin?: string;
		once?: boolean;
	};

	const revealOnScroll: Action<HTMLElement, RevealParams> = (node, params = {}) => {
		let observer: IntersectionObserver | undefined;

		const applyConfig = (config: RevealParams) => {
			node.style.setProperty('--reveal-delay', `${config.delay ?? 0}ms`);

			if (typeof window === 'undefined') return;

			if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
				node.dataset.revealed = 'true';
				return;
			}

			if (typeof IntersectionObserver === 'undefined') {
				node.dataset.revealed = 'true';
				return;
			}

			observer?.disconnect();
			observer = new IntersectionObserver(
				([entry]) => {
					if (entry?.isIntersecting) {
						node.dataset.revealed = 'true';

						if (config.once !== false) {
							observer?.disconnect();
						}
					} else if (config.once === false) {
						node.dataset.revealed = 'false';
					}
				},
				{
					threshold: config.threshold ?? 0.2,
					rootMargin: config.rootMargin ?? '0px 0px -10% 0px'
				}
			);
			observer.observe(node);
		};

		applyConfig(params);

		return {
			update(nextParams) {
				applyConfig(nextParams ?? {});
			},
			destroy() {
				observer?.disconnect();
			}
		};
	};
</script>

<svelte:head>
	<title>Silk UI</title>
	<meta
		name="description"
		content="Svelte 5 components with calmer defaults and a real theming system. Token-first, accessible, and easy to make your own."
	/>
</svelte:head>

<div class="home-page-bg" aria-hidden="true"></div>

<div
	class="relative min-h-[calc(100vh-3.5rem)] overflow-clip pb-24 pt-[6.5rem] max-md:pt-[5.75rem]"
>
	<!-- Ambient background -->
	<div
		class="pointer-events-none absolute left-1/2 top-[2rem] h-[40rem] w-[60rem] -translate-x-1/2 rounded-[999px] bg-[radial-gradient(closest-side,rgb(21_94_239_/_0.14),transparent_72%)] blur-[40px]"
	></div>
	<div
		class="pointer-events-none absolute right-[-8rem] top-[18rem] h-[22rem] w-[22rem] rounded-[999px] bg-[radial-gradient(closest-side,rgb(45_212_191_/_0.10),transparent_70%)] blur-[60px]"
	></div>
	<div
		class="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgb(16_24_40_/_0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(16_24_40_/_0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_50%_0%,black_30%,transparent_75%)]"
	></div>

	<!-- HERO -->
	<section class="relative z-[1] mx-auto flex w-full max-w-[1600px] justify-center px-4 md:px-8">
		<div
			class="flex max-w-[82rem] flex-col items-center gap-9 text-center max-[1100px]:pt-2"
		>
			<div class="fade-up" use:revealOnScroll={{ delay: 60, threshold: 0.9 }}>
				<Badge href="/docs/changelog" variant="outlined" class="w-fit gap-2 px-3 text-[0.8rem]">
					<span class="relative flex size-1.5">
						<span
							class="absolute inset-0 inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"
						></span>
						<span class="relative inline-flex h-full w-full rounded-full bg-primary"></span>
					</span>
					v0.4.2 — Bun-ready, tokenized
					<ArrowRight size={14} />
				</Badge>
			</div>

			<div class="flex flex-col items-center gap-5">
				<h1
					class="hero-title fade-up m-0 w-full max-w-[22ch] text-balance text-[clamp(2.7rem,7.4vw,5.25rem)] font-medium leading-[0.96] tracking-[-0.045em] [font-family:var(--font-header),sans-serif]"
					use:revealOnScroll={{ delay: 120, threshold: 0.85 }}
				>
					{#each heroWords as word, index}
						<span class="hero-word" style={`--word-delay:${index * 55}ms`}>
							{word}{index < heroWords.length - 1 ? ' ' : ''}
						</span>
					{/each}
				</h1>
				<p
					class="fade-up m-0 max-w-[44rem] text-balance text-[1.05rem] leading-7 text-foreground-muted"
					use:revealOnScroll={{ delay: 240, threshold: 0.85 }}
				>
					Silk UI gives you customizable Svelte 5 primitives, calmer defaults, and a styling system
					designed to be remixed instead of fought.
				</p>
			</div>

			<div
				class="fade-up flex flex-wrap items-center justify-center gap-2.5"
				use:revealOnScroll={{ delay: 320, threshold: 0.8 }}
			>
				<Button href="/docs/components/alert" class="text-sm">
					Browse Components
					<ArrowRight size={14} />
				</Button>
				<Button href="/docs/introduction" variant="ghost" class="text-sm">Read the docs</Button>
			</div>

			<!-- Install command -->
			<div
				class="fade-up mt-1 flex items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-surface/60 py-1.5 pl-3.5 pr-1.5 font-mono text-[0.82rem] text-foreground-muted shadow-[inset_0_1px_0_var(--card-highlight)] backdrop-blur"
				use:revealOnScroll={{ delay: 400, threshold: 0.8 }}
			>
				<span class="select-none text-foreground-muted/70">$</span>
				<span class="text-foreground">{installCommand}</span>
				<button
					type="button"
					onclick={copyInstall}
					class="ml-1 inline-flex size-7 items-center justify-center rounded-md text-foreground-muted transition-colors hover:bg-secondary hover:text-foreground"
					aria-label="Copy install command"
				>
					{#if copied}
						<Check size={14} />
					{:else}
						<Copy size={14} />
					{/if}
				</button>
			</div>
		</div>
	</section>

	<!-- LIVE SHOWCASE CARD -->
	<section
		class="relative z-[1] mx-auto mt-[5.5rem] w-full max-w-[1600px] px-4 md:px-8"
	>
		<div
			class="fade-up relative mx-auto max-w-[64rem]"
			use:revealOnScroll={{ delay: 80, threshold: 0.15 }}
		>
			<!-- Soft glow behind the card -->
			<div
				class="pointer-events-none absolute inset-x-12 -top-10 bottom-0 -z-10 rounded-[2rem] bg-[radial-gradient(closest-side,rgb(21_94_239_/_0.18),transparent_70%)] blur-2xl"
			></div>

			<div
				class="relative overflow-hidden rounded-[1.4rem] border border-border bg-[var(--card-bg)] shadow-[inset_0_1px_0_var(--card-highlight),0_30px_60px_-30px_rgb(16_24_40_/_0.35)]"
			>
				<!-- Window chrome -->
				<div
					class="flex items-center justify-between gap-3 border-b border-border/70 bg-surface/60 px-4 py-2.5"
				>
					<div class="flex items-center gap-1.5">
						<span class="size-2.5 rounded-full bg-[#ff5f57]/80"></span>
						<span class="size-2.5 rounded-full bg-[#febc2e]/80"></span>
						<span class="size-2.5 rounded-full bg-[#28c840]/80"></span>
					</div>
					<div
						class="flex h-7 max-w-[18rem] flex-1 items-center gap-2 rounded-md border border-border/70 bg-background/60 px-2.5 text-[0.75rem] text-foreground-muted"
					>
						<Search size={12} />
						<span class="truncate">silk-ui.dev / playground</span>
					</div>
					<div class="hidden items-center gap-1.5 sm:flex">
						<span class="size-7"></span>
					</div>
				</div>

				<!-- App body -->
				<div class="grid grid-cols-[14rem_1fr] max-md:grid-cols-1">
					<!-- Sidebar -->
					<aside
						class="hidden border-r border-border/70 bg-surface/40 p-3 md:flex md:flex-col md:gap-0.5"
					>
						{#each [{ label: 'Overview', icon: Sparkles, active: true }, { label: 'Components', icon: Layers, active: false }, { label: 'Theming', icon: Palette, active: false }, { label: 'Shortcuts', icon: Keyboard, active: false }] as item}
							<button
								class={`flex h-8 items-center gap-2.5 rounded-md px-2.5 text-left text-[0.82rem] transition-colors ${item.active ? 'bg-secondary text-foreground' : 'text-foreground-muted hover:bg-secondary/60 hover:text-foreground'}`}
							>
								<item.icon size={14} />
								<span>{item.label}</span>
							</button>
						{/each}

						<div class="mt-3 border-t border-border/60 pt-3">
							<p
								class="px-2.5 text-[0.66rem] font-medium uppercase tracking-[0.12em] text-foreground-muted/80"
							>
								Workspace
							</p>
							<div class="mt-1.5 flex items-center gap-2 rounded-md px-2.5 py-1.5">
								<span
									class="grid size-6 place-items-center rounded-md bg-primary/15 text-[0.7rem] font-semibold text-primary"
									>SK</span
								>
								<span class="text-[0.82rem] text-foreground">Silk Team</span>
							</div>
						</div>
					</aside>

					<!-- Main pane -->
					<div class="flex flex-col gap-5 p-5 md:p-6">
						<div class="flex items-start justify-between gap-3">
							<div>
								<p
									class="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-foreground-muted"
								>
									Playground
								</p>
								<h3 class="m-0 mt-1 text-[1.05rem] font-medium tracking-[-0.02em]">
									Compose real components, live
								</h3>
							</div>
							<div class="flex items-center gap-1.5">
								<Badge variant="flat" class="gap-1.5 px-2 text-[0.7rem]">
									<span class="size-1.5 rounded-full bg-[#28c840]"></span>
									Live
								</Badge>
								<Button variant="outlined" size="sm" class="h-8 gap-1.5 text-[0.78rem]">
									<Command size={12} />
									<span class="max-sm:hidden">Open</span>
									<kbd
										class="rounded border border-border/70 bg-surface/60 px-1 font-mono text-[0.65rem] text-foreground-muted"
										>⌘K</kbd
									>
								</Button>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
							<!-- Form card -->
							<div
								class="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border/70 bg-background/40 p-3.5"
							>
								<div class="flex items-center justify-between">
									<p class="m-0 text-[0.82rem] font-medium">Account</p>
									<Badge variant="ghost" class="px-1.5 text-[0.65rem]">Beta</Badge>
								</div>
								<Input placeholder="aidan@silk-ui.dev" type="email" />
								<div class="flex items-center justify-between rounded-md px-1 py-0.5">
									<div class="flex items-center gap-2">
										<Bell size={14} class="text-foreground-muted" />
										<span class="text-[0.82rem]">Notifications</span>
									</div>
									<Switch bind:switched={notifications} aria-label="Toggle notifications" />
								</div>
								<div class="flex items-center justify-between rounded-md px-1 py-0.5">
									<div class="flex items-center gap-2">
										<Mail size={14} class="text-foreground-muted" />
										<span class="text-[0.82rem]">Email digest</span>
									</div>
									<Switch bind:switched={emailEnabled} aria-label="Toggle email digest" />
								</div>
								<div class="flex items-center justify-end gap-2 pt-1">
									<Button variant="ghost" size="sm" class="h-8 text-[0.78rem]">Cancel</Button>
									<Button size="sm" class="h-8 text-[0.78rem]">Save changes</Button>
								</div>
							</div>

							<!-- Buttons + badges card -->
							<div
								class="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border/70 bg-background/40 p-3.5"
							>
								<div class="flex items-center justify-between">
									<p class="m-0 text-[0.82rem] font-medium">Variants</p>
									<span class="text-[0.7rem] text-foreground-muted">8 button styles</span>
								</div>
								<div class="flex flex-wrap gap-1.5">
									<Button size="sm" class="h-7 text-[0.75rem]">Primary</Button>
									<Button size="sm" variant="secondary" class="h-7 text-[0.75rem]">Secondary</Button>
									<Button size="sm" variant="outlined" class="h-7 text-[0.75rem]">Outlined</Button>
									<Button size="sm" variant="ghost" class="h-7 text-[0.75rem]">Ghost</Button>
								</div>
								<div class="flex flex-wrap gap-1.5">
									<Badge variant="primary" class="px-2 text-[0.7rem]">Primary</Badge>
									<Badge variant="secondary" class="px-2 text-[0.7rem]">Secondary</Badge>
									<Badge variant="outlined" class="px-2 text-[0.7rem]">Outlined</Badge>
									<Badge variant="destructive" class="px-2 text-[0.7rem]">Destructive</Badge>
								</div>
								<div
									class="mt-auto flex items-center justify-between rounded-md border border-border/60 bg-surface/60 px-2.5 py-1.5 text-[0.75rem] text-foreground-muted"
								>
									<span class="font-mono">variants.ts</span>
									<span class="text-foreground-muted/70">tailwind-variants</span>
								</div>
							</div>
						</div>

						<!-- Token preview row -->
						<div
							class="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border/70 bg-background/40 p-3.5 max-sm:flex-col max-sm:items-start"
						>
							<div class="flex items-center gap-2.5">
								<SwatchBook size={16} class="text-primary" />
								<div>
									<p class="m-0 text-[0.82rem] font-medium">Semantic tokens</p>
									<p class="m-0 mt-0.5 text-[0.72rem] text-foreground-muted">
										Re-skin every component from one place
									</p>
								</div>
							</div>
							<div class="flex items-center gap-1">
								{#each ['#155EEF', '#2DD4BF', '#F59E0B', '#EF4444', '#0F172A', '#E2E8F0'] as swatch}
									<span
										class="size-6 rounded-md border border-border/60 shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.1)]"
										style={`background:${swatch}`}
									></span>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- BENTO -->
	<section class="relative z-[1] mx-auto mt-[8rem] w-full max-w-[1600px] px-4 md:px-8">
		<div class="mx-auto flex max-w-[42rem] flex-col items-center gap-3 text-center">
			<span
				class="fade-up text-[0.72rem] font-medium uppercase tracking-[0.14em] text-foreground-muted"
				use:revealOnScroll={{ delay: 40 }}>What makes it distinct</span
			>
			<h2
				class="fade-up m-0 text-balance text-[clamp(1.8rem,3vw,2.4rem)] font-medium leading-[1.05] tracking-[-0.04em] [font-family:var(--font-header),sans-serif]"
				use:revealOnScroll={{ delay: 120 }}
			>
				A calmer UI foundation that stays flexible as your product gets more specific.
			</h2>
		</div>

		<div class="mt-10 grid grid-cols-6 gap-3 max-md:grid-cols-1">
			<!-- Composable -->
			<article
				class="fade-up group relative col-span-3 flex flex-col gap-4 overflow-hidden rounded-[var(--card-radius)] border border-border bg-[var(--card-bg)] p-6 shadow-[inset_0_1px_0_var(--card-highlight),var(--card-shadow)] max-md:col-span-1"
				use:revealOnScroll={{ delay: 120, threshold: 0.25 }}
			>
				<div class="flex items-center gap-2.5">
					<div class="grid size-9 place-items-center rounded-[0.7rem] bg-primary/10 text-primary">
						<Layers size={16} />
					</div>
					<h3 class="m-0 text-[1.02rem] font-medium tracking-[-0.01em]">Composable by default</h3>
				</div>
				<p class="m-0 max-w-[34rem] text-[0.92rem] leading-[1.6] text-foreground-muted">
					Drop primitives in as-is, or reshape them into product-specific patterns without
					rewriting the stack underneath.
				</p>
				<!-- Live demo: stacked button row -->
				<div
					class="mt-auto flex flex-wrap items-center gap-2 rounded-[var(--radius-lg)] border border-border/70 bg-background/40 p-3"
				>
					<Button size="sm" class="h-8 gap-1.5 text-[0.78rem]">
						<Sparkles size={12} />
						Compose
					</Button>
					<Button size="sm" variant="outlined" class="h-8 text-[0.78rem]">Extend</Button>
					<Button size="sm" variant="ghost" class="h-8 text-[0.78rem]">Override</Button>
					<span class="ml-auto text-[0.72rem] text-foreground-muted">3 of 25 components</span>
				</div>
			</article>

			<!-- Theming -->
			<article
				class="fade-up relative col-span-3 flex flex-col gap-4 overflow-hidden rounded-[var(--card-radius)] border border-border bg-[var(--card-bg)] p-6 shadow-[inset_0_1px_0_var(--card-highlight),var(--card-shadow)] max-md:col-span-1"
				use:revealOnScroll={{ delay: 200, threshold: 0.25 }}
			>
				<div class="flex items-center gap-2.5">
					<div class="grid size-9 place-items-center rounded-[0.7rem] bg-primary/10 text-primary">
						<SwatchBook size={16} />
					</div>
					<h3 class="m-0 text-[1.02rem] font-medium tracking-[-0.01em]">Real theming system</h3>
				</div>
				<p class="m-0 max-w-[34rem] text-[0.92rem] leading-[1.6] text-foreground-muted">
					Semantic tokens, cleaner presets, and enough hooks to make the library feel like your
					own design language.
				</p>
				<div
					class="mt-auto flex items-center gap-2 rounded-[var(--radius-lg)] border border-border/70 bg-background/40 p-3"
				>
					<div class="flex -space-x-1">
						{#each ['#155EEF', '#7C3AED', '#2DD4BF', '#F59E0B', '#EF4444'] as c, i}
							<span
								class="size-7 rounded-full border-2 border-[var(--card-bg)] shadow-sm transition-transform [transition-duration:var(--motion-duration-hover)] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
								style={`background:${c};z-index:${10 - i}`}
							></span>
						{/each}
					</div>
					<span class="text-[0.78rem] text-foreground-muted">12 presets included</span>
					<Button href="/themes" size="sm" variant="ghost" class="ml-auto h-8 text-[0.78rem]">
						Themes
						<ArrowRight size={12} />
					</Button>
				</div>
			</article>

			<!-- Accessibility -->
			<article
				class="fade-up relative col-span-2 flex flex-col gap-4 overflow-hidden rounded-[var(--card-radius)] border border-border bg-[var(--card-bg)] p-6 shadow-[inset_0_1px_0_var(--card-highlight),var(--card-shadow)] max-md:col-span-1"
				use:revealOnScroll={{ delay: 280, threshold: 0.25 }}
			>
				<div class="flex items-center gap-2.5">
					<div class="grid size-9 place-items-center rounded-[0.7rem] bg-primary/10 text-primary">
						<Check size={16} />
					</div>
					<h3 class="m-0 text-[1.02rem] font-medium tracking-[-0.01em]">Accessible</h3>
				</div>
				<p class="m-0 text-[0.92rem] leading-[1.6] text-foreground-muted">
					Tuned focus rings, keyboard semantics, and ARIA — without the over-eager outlines.
				</p>
			</article>

			<!-- Shortcuts -->
			<article
				class="fade-up relative col-span-2 flex flex-col gap-4 overflow-hidden rounded-[var(--card-radius)] border border-border bg-[var(--card-bg)] p-6 shadow-[inset_0_1px_0_var(--card-highlight),var(--card-shadow)] max-md:col-span-1"
				use:revealOnScroll={{ delay: 340, threshold: 0.25 }}
			>
				<div class="flex items-center gap-2.5">
					<div class="grid size-9 place-items-center rounded-[0.7rem] bg-primary/10 text-primary">
						<Keyboard size={16} />
					</div>
					<h3 class="m-0 text-[1.02rem] font-medium tracking-[-0.01em]">Keyboard-first</h3>
				</div>
				<p class="m-0 text-[0.92rem] leading-[1.6] text-foreground-muted">
					Built-in command menu, shortcut display, and modal stacking that just works.
				</p>
				<div class="mt-auto flex items-center gap-1">
					<kbd
						class="grid h-7 min-w-[1.75rem] place-items-center rounded-md border border-border/70 bg-surface/60 px-1.5 font-mono text-[0.78rem] text-foreground-muted"
						>⌘</kbd
					>
					<kbd
						class="grid h-7 min-w-[1.75rem] place-items-center rounded-md border border-border/70 bg-surface/60 px-1.5 font-mono text-[0.78rem] text-foreground-muted"
						>K</kbd
					>
				</div>
			</article>

			<!-- Svelte 5 -->
			<article
				class="fade-up relative col-span-2 flex flex-col gap-4 overflow-hidden rounded-[var(--card-radius)] border border-border bg-[var(--card-bg)] p-6 shadow-[inset_0_1px_0_var(--card-highlight),var(--card-shadow)] max-md:col-span-1"
				use:revealOnScroll={{ delay: 400, threshold: 0.25 }}
			>
				<div class="flex items-center gap-2.5">
					<div class="grid size-9 place-items-center rounded-[0.7rem] bg-primary/10 text-primary">
						<Sparkles size={16} />
					</div>
					<h3 class="m-0 text-[1.02rem] font-medium tracking-[-0.01em]">Svelte 5 native</h3>
				</div>
				<p class="m-0 text-[0.92rem] leading-[1.6] text-foreground-muted">
					Runes, snippets, and modern bindings — no compatibility shims or legacy patterns.
				</p>
				<div
					class="mt-auto rounded-md border border-border/60 bg-background/50 px-2.5 py-1.5 font-mono text-[0.72rem] text-foreground-muted"
				>
					let count = <span class="text-primary">$state</span>(0)
				</div>
			</article>
		</div>
	</section>

	<!-- CTA -->
	<section class="relative z-[1] mx-auto mt-[6rem] w-full max-w-[1600px] px-4 md:px-8">
		<div
			class="fade-up relative overflow-hidden rounded-[var(--card-radius)] border border-border bg-[var(--card-bg)] p-7 shadow-[inset_0_1px_0_var(--card-highlight),var(--card-shadow)] md:p-10"
			use:revealOnScroll={{ delay: 120, threshold: 0.2 }}
		>
			<div
				class="pointer-events-none absolute -left-32 -top-32 size-[20rem] rounded-full bg-[radial-gradient(closest-side,rgb(21_94_239_/_0.18),transparent_70%)] blur-2xl"
			></div>
			<div
				class="pointer-events-none absolute -bottom-24 right-[-6rem] size-[18rem] rounded-full bg-[radial-gradient(closest-side,rgb(45_212_191_/_0.16),transparent_70%)] blur-2xl"
			></div>

			<div
				class="relative flex items-center justify-between gap-6 max-md:flex-col max-md:items-start"
			>
				<div class="max-w-[34rem]">
					<span
						class="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-foreground-muted"
					>
						Start here
					</span>
					<h2
						class="m-0 mt-2 text-balance text-[clamp(1.6rem,2.5vw,2.1rem)] font-medium leading-[1.05] tracking-[-0.04em] [font-family:var(--font-header),sans-serif]"
					>
						Start from a stronger baseline.
					</h2>
					<p class="m-0 mt-2.5 text-[0.95rem] leading-[1.65] text-foreground-muted">
						Open the docs, copy a component, and customize from a better default baseline.
					</p>
				</div>
				<div class="flex flex-wrap gap-2.5">
					<Button href="/docs/introduction">
						Read the Docs
						<ArrowRight size={14} />
					</Button>
					<Button href="/docs/components/alert-dialog" variant="outlined">
						See examples
					</Button>
				</div>
			</div>
		</div>
	</section>

	<footer
		class="fade-up relative z-[1] mx-auto mt-20 flex w-full max-w-[1600px] items-center justify-between gap-4 border-t border-border-strong/60 px-4 pt-5 md:px-8 max-md:flex-col max-md:items-start"
		use:revealOnScroll={{ delay: 80, threshold: 0.01, rootMargin: '0px 0px 12% 0px' }}
	>
		<div>
			<p class="m-0 font-semibold">Silk UI</p>
			<p class="mt-[0.35rem] text-[0.92rem] text-foreground-muted">
				Calmer defaults for teams that still want control.
			</p>
		</div>

		<div class="flex flex-wrap gap-4">
			<a
				href="/docs/introduction"
				class="text-[0.92rem] text-foreground-muted no-underline transition-colors duration-200 hover:text-foreground"
				>Docs</a
			>
			<a
				href="/docs/components"
				class="text-[0.92rem] text-foreground-muted no-underline transition-colors duration-200 hover:text-foreground"
				>Components</a
			>
			<a
				href="/themes"
				class="text-[0.92rem] text-foreground-muted no-underline transition-colors duration-200 hover:text-foreground"
				>Themes</a
			>
			<a
				href="https://github.com/aidan-neel/ui"
				class="text-[0.92rem] text-foreground-muted no-underline transition-colors duration-200 hover:text-foreground"
				>GitHub</a
			>
		</div>
	</footer>
</div>

<style>
	.fade-up {
		opacity: 0;
		transform: translate3d(0, 26px, 0);
		filter: blur(8px);
		transition:
			opacity 1160ms cubic-bezier(0.16, 1, 0.3, 1),
			transform 1160ms cubic-bezier(0.16, 1, 0.3, 1),
			filter 1160ms cubic-bezier(0.16, 1, 0.3, 1);
		transition-delay: var(--reveal-delay, 0ms);
		will-change: opacity, transform, filter;
	}

	:global(.fade-up[data-revealed='true']) {
		opacity: 1;
		transform: translate3d(0, 0, 0);
		filter: blur(0);
	}

	.hero-title {
		filter: none;
	}

	.hero-word {
		display: inline-block;
		opacity: 0;
		transform: translate3d(0, 1.2rem, 0);
		filter: blur(4px);
		transition:
			opacity 1160ms cubic-bezier(0.16, 1, 0.3, 1),
			transform 1160ms cubic-bezier(0.16, 1, 0.3, 1),
			filter 1160ms cubic-bezier(0.16, 1, 0.3, 1);
		transition-delay: calc(var(--reveal-delay, 0ms) + var(--word-delay, 0ms) + 255ms);
		will-change: opacity, transform, filter;
	}

	:global(.hero-title[data-revealed='true'] .hero-word) {
		opacity: 1;
		transform: translate3d(0, 0, 0);
		filter: blur(0);
	}

	@media (prefers-reduced-motion: reduce) {
		.fade-up,
		.hero-word {
			opacity: 1;
			transform: none;
			filter: none;
			transition: none;
		}
	}
</style>
