<script lang="ts">
    import * as Popover from '$lib/ui/components/popover';
	import { cn } from '$lib/ui/utils';
	import { getContext, type Snippet } from 'svelte';

    const key = getContext('key')

    type Props = Popover.PopoverContentProps;

    let { children, class: className, ...rest }: Props = $props();
</script>

<Popover.Content {...rest} portal={true} allowClickOutside={false} class={cn(className, "p-1.5 px-2 shadow-none rounded-[0.4rem] border-none bg-foreground text-foreground-opposite font-medium text-xs")}>
    {@render children?.()}
</Popover.Content>