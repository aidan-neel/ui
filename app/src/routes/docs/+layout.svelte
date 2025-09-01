<script lang="ts">
	import SideNavbar from '$lib/components/docs/side-navbar.svelte';
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();
</script>

<main class="h-screen flex items-center justify-center pt-14 w-screen bg-secondary dark:bg-secondary/20 flex-col">
    <div class="h-screen pt-4 w-3/5 flex overflow-hidden flex-row">
        <SideNavbar class="w-1/6 flex-shrink-0 h-screen">

        </SideNavbar>
        <div
            class="flex flex-col h-full w-full bg-background border-border/50 rounded-tl-xl rounded-tr-xl p-16 border overflow-y-auto"
        >
            {@render children?.()}
        </div>
    </div>
</main>
