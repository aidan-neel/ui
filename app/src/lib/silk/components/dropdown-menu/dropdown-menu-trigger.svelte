<script lang="ts">
	import * as Popover from '$lib/silk/components/popover';
	import { cn } from '$lib/silk/utils';
	import { getContext, type Snippet } from 'svelte';
	import type { ButtonVariant } from '$lib/silk/components/button';

	type Props = {
		children: Snippet;
		class?: string;
		variant?: ButtonVariant;
	} & Omit<Popover.PopoverTriggerProps, 'children' | 'class' | 'variant'>;

	let { children, class: className, variant, ...rest }: Props = $props();
</script>

<Popover.Trigger class={cn(className, ``)} {variant} {...rest}>
	{@render children?.()}
</Popover.Trigger>
