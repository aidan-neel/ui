<script lang="ts">
	import { useState } from '$lib/silk/internals/state.svelte.ts';
	import { setContext } from 'svelte';
	import type { AlertDialogState, AlertDialogProps } from '.';

	let { open = $bindable(false), class: className, children }: AlertDialogProps = $props();

	const uiState = useState<AlertDialogState>({
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
