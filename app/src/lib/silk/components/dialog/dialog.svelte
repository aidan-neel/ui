<script lang="ts">
	import { useState } from '$lib/silk/internals/state.svelte.ts';
	import { setContext } from 'svelte';
	import type { DialogState, DialogProps } from '.';

	let { open = $bindable(false), class: className, children }: DialogProps = $props();

	const uiState = useState<DialogState>({
		open,
		triggerRef: null
	});
	let syncedOpen = $state(open);

	$effect(() => {
		if (open !== syncedOpen) {
			syncedOpen = open;
			uiState.data.open = open;
		}
	});

	$effect(() => {
		if (uiState.data.open !== syncedOpen) {
			syncedOpen = uiState.data.open;
			open = uiState.data.open;
		}
	});

	setContext('key', uiState.key);
</script>

{@render children?.()}
