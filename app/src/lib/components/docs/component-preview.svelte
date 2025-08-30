<script lang="ts">
	import type { Snippet } from 'svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import { fade } from 'svelte/transition';
	import { cn } from '$lib/ui/utils';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
    import * as Tooltip from '$lib/ui/components/tooltip';
    import Button from '$lib/ui/components/button';
    import Copy from "@lucide/svelte/icons/copy";
    import Check from "@lucide/svelte/icons/check";
	import { flyAndScale } from '$lib/ui/internals/transition';

	let {
		children,
		selectedTab = 1,
		code,
		class: classProp,
		...rest
	}: {
		children?: Snippet;
		selectedTab?: number;
		code: string;
		class?: string;
	} = $props();

	// Smooth tab indicator motion
	let indicatorX = new Tween(0, { duration: 50, easing: cubicOut });
	let indicatorRef = $state(null);

	function selectTab(tab: number, index: number) {
		selectedTab = tab;
		indicatorX.target = index * 112; // Assuming each tab button is w-28 (112px)
	}

    let copying = $state<boolean>(false);
</script>

<div class="flex flex-col w-[102%] mx-[-1%]">
    <div class="pb-3 flex flex-row gap-4 px-[1%]">
        <button onclick={() => selectedTab = 1} class="{selectedTab === 1 ? 'text-foreground' : 'text-foreground-muted'} font-medium duration-200">
            Preview
        </button>
        <button onclick={() => selectedTab = 2} class="{selectedTab === 2 ? 'text-foreground' : 'text-foreground-muted'} font-medium duration-200">
            Code
        </button>
    </div>
    <div
        {...rest}
        class={cn(classProp, `w-full ${selectedTab === 1 ? 'border items-center justify-center min-h-[22rem] py-24' : 'items-start justify-start'} rounded-xl flex flex-col overflow-auto max-w-full`)}
    >   
        <div class={cn(classProp, "w-full relative flex items-center justify-center")}>
            {#if selectedTab === 1}
                {@render children?.()}
            {:else}
                <Tooltip.Root placement={'top'} delay={0}>
                    <Tooltip.Trigger onclick={() => {
                        copying = true;
                        console.log('n')
                        navigator.clipboard.writeText(code)
                        setTimeout(() => {
                            copying = false;
                        }, 3000);
                    }} variant="ghost" class="size-8 z-50 absolute top-4 right-4">
                        {#if copying}
                            <div in:flyAndScale={{ duration: 400 }}>
                                <Check size={20} class="text-foreground-muted" />
                            </div>
                        {:else}
                            <div in:flyAndScale={{ duration: 400 }}>
                                <Copy size={20} class="text-foreground-muted" />
                            </div>
                        {/if}
                    </Tooltip.Trigger>  
                    <Tooltip.Content>
                        {#if copying}
                            <div in:flyAndScale={{ duration: 400 }}>
                                Copied
                            </div>
                        {:else}
                            <div in:flyAndScale={{ duration: 400 }}>
                                Copy to clipboard
                            </div>
                        {/if}
                    </Tooltip.Content>
                </Tooltip.Root>
                <CodeBlock code={code} />
            {/if}
        </div>
    </div>
</div>

<!--<div {...rest} class={cn(classProp, 'w-full flex flex-col overflow-auto max-w-full gap-4')}>
	<div class="relative w-full flex flex-row">
		<button onclick={() => selectTab(1, 0)} class="p-3 w-28 text-center"> Preview </button>
		<button onclick={() => selectTab(2, 1)} class="p-3 w-28 text-center"> Code </button>

		<div
			bind:this={indicatorRef}
			class="absolute bottom-0 h-0.5 w-28 bg-black rounded-lg-full"
			style="transform: translateX({indicatorX.current}px); transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);"
		></div>
	</div>

	<div
		class="flex items-center justify-center overflow-auto {selectedTab === 1
			? 'min-h-[18rem] py-16 border rounded-lg '
			: ''}"
	>
		{#if selectedTab === 1}
			<div in:fade={{ duration: 100 }}>
				{@render children?.()}
			</div>
		{:else if selectedTab === 2}
			<CodeBlock {code} />
		{/if}
	</div>
</div>
-->
