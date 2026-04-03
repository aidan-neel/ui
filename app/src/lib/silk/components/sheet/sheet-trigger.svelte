<script lang="ts">
	import { states } from '$lib/silk/internals/state.svelte.ts';
	import { getContext } from 'svelte';
	import type { SheetState, SheetTriggerProps } from '.';
	import { Button } from '$lib/silk/components/button';
	import { cn } from '$lib/silk/utils';

	let { class: className, children, ...rest }: SheetTriggerProps = $props();

	const key = getContext<string>('key');
	const uiState = states[key].data as SheetState;
</script>

<Button
	aria-haspopup="dialog"
	aria-expanded={uiState.open}
	aria-controls={`sheet-${key}`}
	onclick={() => {
		uiState.open = !uiState.open;
	}}
	class={cn(className, ``)}
	{...rest}
>
	{@render children?.()}
</Button>
