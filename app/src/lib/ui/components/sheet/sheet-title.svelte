<script lang="ts">
	import { cn } from "$lib/ui/utils";
	import type { SheetTitleProps } from ".";

    let { class: className, children, ...rest }: SheetTitleProps = $props();
</script>

<h1 {...rest} class={cn(className, `text-lg font-semibold`)}>
    {@render children?.()}
</h1>