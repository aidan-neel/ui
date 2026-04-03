<script lang="ts">
	import SideNavbar from '$lib/components/docs/side-navbar.svelte';
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();
</script>

<main class="min-h-screen w-screen bg-background pt-14">
	<div
		class="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-[1400px] flex-col gap-5 px-4 md:px-8 lg:flex-row lg:gap-8"
	>
		<SideNavbar
			class="hidden sticky top-14 h-[calc(100vh-3.5rem)] w-56 flex-shrink-0 pt-8 lg:flex"
		/>
		<div
			class="flex min-h-[calc(100vh-3.5rem)] w-full min-w-0 max-w-[920px] flex-col overflow-y-auto py-6 lg:py-8"
		>
			{@render children?.()}
		</div>
	</div>
</main>
