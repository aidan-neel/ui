<script lang="ts">
	import { cn } from '$lib/ui/utils';
	import type { ContextMenuSeparatorProps } from '.';

    let { children, class: className, ...rest }: ContextMenuSeparatorProps = $props();
</script>

<div {...rest} class={cn(className, "h-[var(--border-size)] w-[calc(100%-1rem)] rounded-full mx-auto bg-input/50 my-1")}>
    {@render children?.()}
</div>