import Root from './popover.svelte';
import Trigger from './popover-trigger.svelte';
import Content from './popover-content.svelte';
import Title from './popover-title.svelte';

import type { DefaultProps } from '$lib/ui/utils';
import type { Snippet } from 'svelte';

export type PopoverContentProps = {
	children: Snippet;
	class?: string;
	allowClickOutside?: boolean;
	portal?: boolean;
} & DefaultProps;

export { Root, Trigger, Content, Title };
