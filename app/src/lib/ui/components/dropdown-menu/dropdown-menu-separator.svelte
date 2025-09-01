<script lang="ts">
    import * as Popover from '$lib/ui/components/popover';
	import { cn } from '$lib/ui/utils';
	import { getContext, type Snippet } from 'svelte';

    const key = getContext('key')

    type Props = {
        children: Snippet;
        class: string;
    }

    let { children, class: className, ...rest }: Props = $props();
</script>

<div {...rest} class={cn(className, "h-[var(--border-size)] w-[calc(100%-1rem)] rounded-full mx-auto bg-input/50 my-1")}>
    {@render children?.()}
</div>