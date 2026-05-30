import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import StudioPreview from '$lib/components/themes/studio/studio-preview.svelte';

// Phase 3 acceptance: the Playground preview's Gallery screen must render a
// representative component from EVERY token group, so that every token has a
// live home in the preview. Groups are marked with `data-group` on each
// section; representative Silk components expose `data-ui`.
const GROUPS = ['controls', 'surfaces', 'menus', 'modals', 'nav'] as const;

async function openGallery() {
	const user = userEvent.setup();
	const { container } = render(StudioPreview);
	await user.click(screen.getByRole('tab', { name: 'Gallery' }));
	return container;
}

describe('StudioPreview — token-group coverage (Phase 3)', () => {
	it('renders a section for every token group on the Gallery screen', async () => {
		const container = await openGallery();
		for (const group of GROUPS) {
			expect(
				container.querySelector(`[data-group="${group}"]`),
				`missing preview section for token group "${group}"`
			).not.toBeNull();
		}
	});

	it('renders representative Silk components inside their group sections', async () => {
		const container = await openGallery();
		// Controls group exposes control geometry/state tokens.
		expect(container.querySelector('[data-group="controls"] [data-ui="slider"]')).not.toBeNull();
		expect(container.querySelector('[data-group="controls"] [data-ui="textarea"]')).not.toBeNull();
		// Surfaces group exposes card/surface padding, radius, elevation tokens.
		expect(container.querySelector('[data-group="surfaces"] [data-ui="card"]')).not.toBeNull();
		// Nav/Data group exposes calendar + progress tokens.
		expect(container.querySelector('[data-group="nav"] [data-ui="calendar"]')).not.toBeNull();
		expect(container.querySelector('[data-group="nav"] [data-ui="progress"]')).not.toBeNull();
	});
});
