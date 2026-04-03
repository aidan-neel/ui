<script lang="ts">
	import { states } from '$lib/silk/internals/state.svelte.ts';
	import { getContext } from 'svelte';
	import type { DialogConfirmProps, DialogState } from '.';
	import { Button } from '$lib/silk/components/button';
	import { cn } from '$lib/silk/utils';

	let { class: className, children, onclick, ...rest }: DialogConfirmProps = $props();
	const key = getContext<string>('key');
	const uiState = states[key].data as DialogState;
</script>

<Button
	onclick={() => {
		uiState.open = false;
		onclick?.();
	}}
	{...rest}
	class={cn(className, `flex sm:w-fit w-full flex-row gap-2 justify-center items-center`)}
>
	{@render children?.()}
</Button>
