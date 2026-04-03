<script lang="ts">
	import { states } from '$lib/silk/internals/state.svelte.ts';
	import { getContext } from 'svelte';
	import type { AlertDialogState } from '.';
	import { Button, type ButtonVariant } from '$lib/silk/components/button';
	import { cn } from '$lib/silk/utils';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = {
		class?: string;
		children?: import('svelte').Snippet;
		variant?: ButtonVariant;
		size?: 'default' | 'icon';
		onclick?: () => void;
	} & Partial<HTMLButtonAttributes>;

	let { class: className, children, onclick, ...rest }: Props = $props();

	const key = getContext<string>('key');
	const uiState = states[key].data as AlertDialogState;
</script>

<Button
	aria-haspopup="dialog"
	aria-expanded={uiState.open}
	aria-controls={`alert-dialog-${key}`}
	onclick={() => {
		uiState.open = true;
		onclick?.();
	}}
	class={cn(className, ``)}
	{...rest}
>
	{@render children?.()}
</Button>
