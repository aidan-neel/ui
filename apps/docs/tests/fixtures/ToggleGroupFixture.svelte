<script lang="ts">
	import * as ToggleGroup from '@silk/ui/components/toggle-group';

	let {
		type = 'single' as 'single' | 'multiple',
		value = $bindable<string | string[]>(''),
		disabled = false
	} = $props();
</script>

<ToggleGroup.Root {type} bind:value {disabled}>
	<ToggleGroup.Item value="bold">B</ToggleGroup.Item>
	<ToggleGroup.Item value="italic">I</ToggleGroup.Item>
	<ToggleGroup.Item value="underline">U</ToggleGroup.Item>
</ToggleGroup.Root>
