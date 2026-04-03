<script lang="ts">
	import { states } from '$lib/silk/internals/state.svelte.ts';
	import { getContext } from 'svelte';
	import type { DialogState, DialogTriggerProps } from '.';
	import { Button } from '$lib/silk/components/button';
	import { cn } from '$lib/silk/utils';

	let { class: className, children, ...rest }: DialogTriggerProps = $props();

	const key = getContext<string>('key');
	const uiState = states[key].data as DialogState;
</script>

<Button
	aria-haspopup="dialog"
	aria-expanded={uiState.open}
	aria-controls={`dialog-${key}`}
	onclick={() => {
		uiState.open = true;
	}}
	class={cn(className, ``)}
	{...rest}
>
	{@render children?.()}
</Button>
