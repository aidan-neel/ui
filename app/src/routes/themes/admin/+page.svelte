<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import { Button } from '$lib/silk/components/button';
	import { Input } from '$lib/silk/components/input';
	import { Badge } from '$lib/silk/components/badge';
	import * as Dialog from '$lib/silk/components/dialog';
	import * as Alert from '$lib/silk/components/alert';
	import { toast } from '$lib/silk/components/toast';
	import type { RegistryTheme } from '$lib/server/theme-registry';

	import Lock from '@lucide/svelte/icons/lock';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Trash from '@lucide/svelte/icons/trash-2';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Search from '@lucide/svelte/icons/search';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import Inbox from '@lucide/svelte/icons/inbox';

	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	// ── login form state ──────────────────────────────────────────────────
	let loginUsername = $state('');
	let loginPassword = $state('');
	let loginError = $state('');
	let loginBusy = $state(false);
	let showPassword = $state(false);

	async function handleLogin(event: SubmitEvent) {
		event.preventDefault();
		const username = loginUsername.trim();
		const password = loginPassword;
		if (!username || !password) {
			loginError = 'Username and password are required.';
			return;
		}
		loginBusy = true;
		loginError = '';
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ username, password })
			});
			if (!res.ok) {
				loginError = (await res.text()) || 'Login failed.';
				return;
			}
			loginPassword = '';
			await invalidateAll();
		} catch (err) {
			loginError = err instanceof Error ? err.message : 'Network error.';
		} finally {
			loginBusy = false;
		}
	}

	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		toast({
			title: 'Signed out',
			description: 'See you next time.',
			duration: 1600,
			type: 'success'
		});
		await invalidateAll();
	}

	// ── dashboard state ───────────────────────────────────────────────────
	let searchQuery = $state('');
	let deleteTarget = $state<RegistryTheme | null>(null);
	let editTarget = $state<RegistryTheme | null>(null);
	let editName = $state('');
	let editDescription = $state('');
	let editPublisher = $state('');
	let actionBusy = $state(false);

	const themes: RegistryTheme[] = $derived(data.authed ? (data.themes ?? []) : []);

	const filteredThemes = $derived.by(() => {
		const needle = searchQuery.trim().toLowerCase();
		if (!needle) return themes;
		return themes.filter((theme) => {
			const haystack = [theme.name, theme.slug, theme.description, theme.publisher ?? '']
				.join(' ')
				.toLowerCase();
			return haystack.includes(needle);
		});
	});

	const totalCount = $derived(themes.length);
	const last7d = $derived(
		themes.filter((t) => {
			const d = new Date(t.createdAt);
			if (Number.isNaN(d.getTime())) return false;
			return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
		}).length
	);
	const lastUpdated = $derived(
		themes.reduce((acc, t) => (t.updatedAt > acc ? t.updatedAt : acc), '')
	);

	function formatDate(iso: string) {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return '—';
		return d.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function openEdit(theme: RegistryTheme) {
		editTarget = theme;
		editName = theme.name;
		editDescription = theme.description;
		editPublisher = theme.publisher ?? '';
	}

	function closeEdit() {
		editTarget = null;
	}

	function openDelete(theme: RegistryTheme) {
		deleteTarget = theme;
	}

	function closeDelete() {
		deleteTarget = null;
	}

	async function confirmDelete() {
		if (!deleteTarget) return;
		actionBusy = true;
		try {
			const res = await fetch(`/api/themes/${encodeURIComponent(deleteTarget.slug)}`, {
				method: 'DELETE'
			});
			if (!res.ok) {
				const message = (await res.text()) || 'Delete failed.';
				if (res.status === 401) {
					toast({
						title: 'Session expired',
						description: 'Please sign in again.',
						duration: 2400,
						type: 'error'
					});
					await invalidateAll();
					return;
				}
				throw new Error(message);
			}
			toast({
				title: `${deleteTarget.name} deleted`,
				description: 'Removed from the registry.',
				duration: 2000,
				type: 'success'
			});
			deleteTarget = null;
			await invalidateAll();
		} catch (err) {
			toast({
				title: 'Delete failed',
				description: err instanceof Error ? err.message : 'Unknown error.',
				duration: 3000,
				type: 'error'
			});
		} finally {
			actionBusy = false;
		}
	}

	async function confirmEdit() {
		if (!editTarget) return;
		const name = editName.trim();
		const description = editDescription.trim();
		if (!name) {
			toast({
				title: 'Name required',
				description: 'Add a theme name before saving.',
				duration: 2400,
				type: 'error'
			});
			return;
		}
		actionBusy = true;
		try {
			const res = await fetch(`/api/themes/${encodeURIComponent(editTarget.slug)}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					name,
					description: description || editTarget.description,
					publisher: editPublisher.trim() || undefined
				})
			});
			if (!res.ok) {
				const message = (await res.text()) || 'Update failed.';
				if (res.status === 401) {
					toast({
						title: 'Session expired',
						description: 'Please sign in again.',
						duration: 2400,
						type: 'error'
					});
					await invalidateAll();
					return;
				}
				throw new Error(message);
			}
			toast({
				title: 'Theme updated',
				description: `${name} saved.`,
				duration: 2000,
				type: 'success'
			});
			editTarget = null;
			await invalidateAll();
		} catch (err) {
			toast({
				title: 'Update failed',
				description: err instanceof Error ? err.message : 'Unknown error.',
				duration: 3000,
				type: 'error'
			});
		} finally {
			actionBusy = false;
		}
	}

	async function refresh() {
		await invalidateAll();
	}
</script>

<svelte:head>
	<title>Silk · Theme Admin</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="mt-16 min-h-[calc(100vh-4rem)] bg-background">
	{#if !data.authed}
		<!-- ─── Login ─── -->
		<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
			<div
				class="w-full max-w-[24rem] overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-sm)]"
			>
				<div class="flex flex-col items-center gap-2 px-6 pb-2 pt-7">
					<div
						class="grid size-11 place-items-center rounded-full bg-primary/12 text-primary"
					>
						<ShieldCheck size={18} />
					</div>
					<h1
						class="m-0 text-[1.15rem] font-medium tracking-tight"
						style="font-family: var(--font-header);"
					>
						Admin sign in
					</h1>
					<p class="m-0 text-center text-[0.78rem] text-foreground-muted">
						Authorized access only. Credentials live on the registry server.
					</p>
				</div>
				<form class="flex flex-col gap-3 px-6 pb-6 pt-4" onsubmit={handleLogin}>
					<Input
						label="Username"
						variant="outlined"
						bind:value={loginUsername}
						placeholder="admin"
						autocomplete="username"
					/>
					<div class="flex flex-col gap-1.5">
						<label
							for="admin-password"
							class="text-[0.78rem] font-medium text-foreground"
						>
							Password
						</label>
						<div class="relative">
							<input
								id="admin-password"
								type={showPassword ? 'text' : 'password'}
								autocomplete="current-password"
								bind:value={loginPassword}
								class="h-9 w-full rounded-[var(--radius-md)] border border-border bg-[var(--color-field)] px-3 pr-9 text-[0.86rem] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-foreground-muted focus:border-[var(--field-focus-border)] focus:shadow-[0_0_0_3px_var(--color-ring)]"
								placeholder="••••••••"
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-foreground-muted transition-colors hover:bg-secondary/60 hover:text-foreground"
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{#if showPassword}
									<EyeOff size={13} />
								{:else}
									<Eye size={13} />
								{/if}
							</button>
						</div>
					</div>
					{#if loginError}
						<Alert.Root variant="error">
							<Alert.Description>{loginError}</Alert.Description>
						</Alert.Root>
					{/if}
					<Button
						type="submit"
						variant="primary"
						size="sm"
						class="h-9 gap-1.5 text-[0.82rem]"
						disabled={loginBusy}
					>
						<Lock size={13} />
						{loginBusy ? 'Signing in…' : 'Sign in'}
					</Button>
				</form>
			</div>
		</div>
	{:else}
		<!-- ─── Dashboard ─── -->
		<div class="mx-auto w-full max-w-[1200px] px-4 py-10 md:px-8">
			<!-- Top bar -->
			<div class="flex items-start justify-between gap-3">
				<div class="flex flex-col gap-1.5">
					<div
						class="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/80 bg-card/60 px-2.5 py-1 text-[0.7rem] font-medium text-foreground-muted"
					>
						<Sparkles size={11} class="text-primary" />
						Admin · {totalCount} {totalCount === 1 ? 'theme' : 'themes'}
					</div>
					<h1
						class="m-0 text-[1.75rem] font-medium leading-tight tracking-tight md:text-[2rem]"
						style="font-family: var(--font-header);"
					>
						Theme registry
					</h1>
					<p class="m-0 text-[0.86rem] text-foreground-muted">
						Edit titles, rotate publishers, or remove themes that no longer fit.
					</p>
				</div>
				<div class="flex items-center gap-2">
					<Button
						variant="outlined"
						size="sm"
						class="h-9 gap-1.5 text-[0.78rem]"
						onclick={refresh}
					>
						<RefreshCw size={13} />
						Refresh
					</Button>
					<Button
						variant="ghost"
						size="sm"
						class="h-9 gap-1.5 text-[0.78rem]"
						onclick={handleLogout}
					>
						<LogOut size={13} />
						Sign out
					</Button>
				</div>
			</div>

			<!-- Stats strip -->
			<div
				class="mt-6 grid grid-cols-3 gap-3 rounded-[var(--radius-lg)] border border-border bg-card/60 p-4 max-sm:grid-cols-1"
			>
				<div class="flex flex-col gap-0.5">
					<span class="text-[0.7rem] font-medium uppercase tracking-wide text-foreground-muted">
						Total themes
					</span>
					<span
						class="text-[1.5rem] font-medium tracking-tight"
						style="font-family: var(--font-header);"
					>
						{totalCount}
					</span>
				</div>
				<div class="flex flex-col gap-0.5">
					<span class="text-[0.7rem] font-medium uppercase tracking-wide text-foreground-muted">
						Last 7 days
					</span>
					<span
						class="text-[1.5rem] font-medium tracking-tight"
						style="font-family: var(--font-header);"
					>
						{last7d}
					</span>
				</div>
				<div class="flex flex-col gap-0.5">
					<span class="text-[0.7rem] font-medium uppercase tracking-wide text-foreground-muted">
						Last activity
					</span>
					<span class="text-[0.92rem] font-medium">
						{lastUpdated ? formatDate(lastUpdated) : '—'}
					</span>
				</div>
			</div>

			{#if !data.registryAvailable}
				<div class="mt-6">
					<Alert.Root variant="warning">
						<Alert.Title>Registry unreachable</Alert.Title>
						<Alert.Description>
							Couldn't load themes. The registry server might be down — try Refresh.
						</Alert.Description>
					</Alert.Root>
				</div>
			{:else}
				<!-- Search -->
				<div class="mt-6 flex items-center gap-2">
					<div class="relative flex-1">
						<Search
							size={14}
							class="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-foreground-muted"
						/>
						<Input
							variant="outlined"
							class="pl-9"
							placeholder="Filter by name, slug, publisher…"
							bind:value={searchQuery}
						/>
					</div>
				</div>

				<!-- Table -->
				{#if filteredThemes.length === 0}
					<div
						class="mt-6 flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-border/80 bg-card/40 px-6 py-14 text-center"
					>
						<div
							class="grid size-12 place-items-center rounded-full bg-secondary text-foreground-muted"
						>
							<Inbox size={20} />
						</div>
						<div class="flex flex-col gap-1">
							<p class="m-0 text-[1rem] font-medium">
								{searchQuery.trim() ? 'No matches' : 'Registry is empty'}
							</p>
							<p class="m-0 text-[0.84rem] text-foreground-muted">
								{searchQuery.trim()
									? 'Try a different keyword, or clear your search.'
									: 'Publish a theme from the studio to see it here.'}
							</p>
						</div>
						{#if searchQuery.trim()}
							<Button variant="ghost" size="sm" onclick={() => (searchQuery = '')}>
								Clear search
							</Button>
						{/if}
					</div>
				{:else}
					<div
						class="mt-6 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card"
					>
						<div
							class="grid grid-cols-[1.6fr_1fr_0.9fr_0.9fr_auto] gap-3 border-b border-border/70 bg-secondary/40 px-4 py-2.5 text-[0.7rem] font-medium uppercase tracking-wide text-foreground-muted max-md:hidden"
						>
							<span>Theme</span>
							<span>Publisher</span>
							<span>Created</span>
							<span>Updated</span>
							<span class="text-right">Actions</span>
						</div>
						<ul class="flex flex-col divide-y divide-border/60">
							{#each filteredThemes as theme (theme.slug)}
								{@const isProtected = theme.slug === 'default'}
								<li
									class="grid grid-cols-[1.6fr_1fr_0.9fr_0.9fr_auto] gap-3 px-4 py-3 transition-colors hover:bg-secondary/30 max-md:grid-cols-1"
								>
									<div class="flex items-center gap-3 min-w-0">
										<div class="flex flex-col gap-0.5 shrink-0">
											<span class="flex gap-0.5">
												<span
													class="size-2 rounded-sm ring-1 ring-inset ring-black/10"
													style={`background:${theme.light.primary};`}
													aria-hidden="true"
												></span>
												<span
													class="size-2 rounded-sm ring-1 ring-inset ring-black/10"
													style={`background:${theme.light.background};`}
													aria-hidden="true"
												></span>
											</span>
											<span class="flex gap-0.5">
												<span
													class="size-2 rounded-sm ring-1 ring-inset ring-black/10"
													style={`background:${theme.dark.primary};`}
													aria-hidden="true"
												></span>
												<span
													class="size-2 rounded-sm ring-1 ring-inset ring-black/10"
													style={`background:${theme.dark.background};`}
													aria-hidden="true"
												></span>
											</span>
										</div>
										<div class="min-w-0 flex-1">
											<p
												class="m-0 flex items-center gap-1.5 truncate text-[0.9rem] font-medium leading-tight"
												style="font-family: var(--font-header);"
											>
												{theme.name}
												{#if isProtected}
													<span
														class="rounded-full border border-border bg-secondary/60 px-1.5 py-0.5 font-sans text-[0.6rem] font-medium uppercase tracking-wide text-foreground-muted"
													>
														Protected
													</span>
												{/if}
											</p>
											<p
												class="m-0 truncate font-mono text-[0.7rem] text-foreground-muted"
											>
												{theme.slug}
											</p>
										</div>
									</div>
									<div class="flex items-center text-[0.82rem]">
										{#if theme.publisher?.trim()}
											<span class="text-foreground">{theme.publisher.trim()}</span>
										{:else}
											<span class="text-foreground-muted">Anonymous</span>
										{/if}
									</div>
									<div class="flex items-center text-[0.78rem] text-foreground-muted">
										{formatDate(theme.createdAt)}
									</div>
									<div class="flex items-center text-[0.78rem] text-foreground-muted">
										{formatDate(theme.updatedAt)}
									</div>
									<div class="flex items-center justify-end gap-1.5">
										<Button
											variant="ghost"
											size="sm"
											class="h-8 gap-1 text-[0.76rem]"
											onclick={() => goto(`/themes/studio`)}
										>
											<Eye size={12} />
											<span class="max-sm:hidden">View</span>
										</Button>
										<Button
											variant="outlined"
											size="sm"
											class="h-8 gap-1 text-[0.76rem]"
											onclick={() => openEdit(theme)}
											disabled={isProtected}
											title={isProtected ? 'The default theme is protected.' : ''}
										>
											<Pencil size={12} />
											<span class="max-sm:hidden">Edit</span>
										</Button>
										<Button
											variant="destructive"
											size="sm"
											class="h-8 gap-1 text-[0.76rem]"
											onclick={() => openDelete(theme)}
											disabled={isProtected}
											title={isProtected ? 'The default theme is protected.' : ''}
										>
											<Trash size={12} />
											<span class="max-sm:hidden">Delete</span>
										</Button>
									</div>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			{/if}
		</div>

		<!-- ─── Edit dialog ─── -->
		<Dialog.Root bind:open={() => editTarget !== null, (v) => (v ? null : closeEdit())}>
			<Dialog.Content
				class="w-full max-w-[min(30rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0"
			>
				<div
					class="flex shrink-0 items-start justify-between px-5 py-4"
				>
					<div class="flex flex-col gap-1">
						<Dialog.Title>Edit theme</Dialog.Title>
						<Dialog.Description>
							{editTarget?.name ?? ''} · <span class="font-mono"
								>{editTarget?.slug ?? ''}</span
							>
						</Dialog.Description>
					</div>
					<Dialog.Exit
						variant="ghost"
						size="icon"
						class="size-8 shrink-0"
						aria-label="Close"
					>
						<svg
							viewBox="0 0 16 16"
							aria-hidden="true"
							class="size-3.5 fill-none stroke-current"
							stroke-width="1.5"
						>
							<path d="M3 3l10 10M13 3L3 13" stroke-linecap="round" />
						</svg>
					</Dialog.Exit>
				</div>
				<div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
					<Input
						label="Theme name"
						variant="outlined"
						placeholder="e.g. Soft Aurora"
						bind:value={editName}
					/>
					<div class="flex flex-col gap-1.5">
						<label
							for="admin-edit-description"
							class="text-[0.78rem] font-medium text-foreground"
						>
							Description
						</label>
						<textarea
							id="admin-edit-description"
							rows="3"
							bind:value={editDescription}
							class="min-h-[5rem] resize-y rounded-[var(--radius-md)] border border-border bg-[var(--color-field)] px-3 py-2 text-[0.86rem] leading-relaxed text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-foreground-muted focus:border-[var(--field-focus-border)] focus:shadow-[0_0_0_3px_var(--color-ring)]"
						></textarea>
					</div>
					<Input
						label="Publisher"
						variant="outlined"
						placeholder="Your name or handle"
						bind:value={editPublisher}
					/>
				</div>
				<div
					class="flex shrink-0 items-center justify-end gap-2 px-5 py-3"
				>
					<Dialog.Exit variant="ghost" size="sm" class="h-8 text-[0.8rem]">
						Cancel
					</Dialog.Exit>
					<Button
						variant="primary"
						size="sm"
						class="h-8 gap-1.5 text-[0.8rem]"
						onclick={confirmEdit}
						disabled={actionBusy || !editName.trim()}
					>
						<Pencil size={12} />
						{actionBusy ? 'Saving…' : 'Save changes'}
					</Button>
				</div>
			</Dialog.Content>
		</Dialog.Root>

		<!-- ─── Delete dialog ─── -->
		<Dialog.Root bind:open={() => deleteTarget !== null, (v) => (v ? null : closeDelete())}>
			<Dialog.Content
				class="w-full max-w-[min(26rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0"
			>
				<div
					class="flex shrink-0 items-start justify-between px-5 py-4"
				>
					<div class="flex flex-col gap-1">
						<Dialog.Title>Delete theme?</Dialog.Title>
						<Dialog.Description>
							This permanently removes
							<span class="font-medium text-foreground">{deleteTarget?.name ?? ''}</span> from the
							registry.
						</Dialog.Description>
					</div>
					<Dialog.Exit
						variant="ghost"
						size="icon"
						class="size-8 shrink-0"
						aria-label="Close"
					>
						<svg
							viewBox="0 0 16 16"
							aria-hidden="true"
							class="size-3.5 fill-none stroke-current"
							stroke-width="1.5"
						>
							<path d="M3 3l10 10M13 3L3 13" stroke-linecap="round" />
						</svg>
					</Dialog.Exit>
				</div>
				<div class="px-5 py-4">
					<Alert.Root variant="error">
						<Alert.Title>This cannot be undone</Alert.Title>
						<Alert.Description>
							Anyone currently using this theme will keep their cached copy, but new
							downloads will fail.
						</Alert.Description>
					</Alert.Root>
				</div>
				<div
					class="flex shrink-0 items-center justify-end gap-2 px-5 py-3"
				>
					<Dialog.Exit variant="ghost" size="sm" class="h-8 text-[0.8rem]">
						Cancel
					</Dialog.Exit>
					<Button
						variant="destructive"
						size="sm"
						class="h-8 gap-1.5 text-[0.8rem]"
						onclick={confirmDelete}
						disabled={actionBusy}
					>
						<Trash size={12} />
						{actionBusy ? 'Deleting…' : 'Delete theme'}
					</Button>
				</div>
			</Dialog.Content>
		</Dialog.Root>
	{/if}
</div>
