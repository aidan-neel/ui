<script lang="ts">
	import { cn } from '$lib/silk/utils';
	import { type Snippet } from 'svelte';

	let {
		children,
		class: classProp,
		...rest
	}: {
		children: Snippet;
		class?: string;
	} = $props();
</script>

<p
	{...rest}
	class={cn(
		classProp,
		`m-0 text-[0.86rem] font-semibold leading-tight tracking-[-0.01em] text-foreground`
	)}
>
	{@render children?.()}
</p>
