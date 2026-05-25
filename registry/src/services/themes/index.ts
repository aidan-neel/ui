import { Elysia } from 'elysia';
import { authGuard } from '@lib/auth-guard';
import {
	adminErrorSchema,
	publishResponseSchema,
	slugConflictSchema,
	slugParamsSchema,
	themeDeleteResponseSchema,
	themeDraftSchema,
	themeListSchema,
	themeMutationConflictSchema,
	themeNotFoundSchema,
	themeRecordSchema,
	themeUpdateSchema
} from './model';
import {
	deleteTheme,
	getThemeBySlug,
	listThemes,
	publishTheme,
	updateTheme
} from './service';

export const themesController = new Elysia({
	prefix: '/themes',
	tags: ['themes']
})
	.use(authGuard)
	.get('/', () => listThemes(), {
		detail: { summary: 'List every built-in and published theme.' },
		response: { 200: themeListSchema }
	})
	.get('/:slug', ({ params }) => getThemeBySlug(params.slug), {
		params: slugParamsSchema,
		detail: { summary: 'Fetch a theme by its slug.' },
		response: {
			200: themeRecordSchema,
			404: themeNotFoundSchema
		}
	})
	.post('/', ({ body }) => publishTheme(body), {
		body: themeDraftSchema,
		detail: { summary: 'Publish a new theme to the registry.' },
		response: {
			200: publishResponseSchema,
			409: slugConflictSchema
		}
	})
	.delete(
		'/:slug',
		({ params, requireAdmin }) => {
			requireAdmin();
			return deleteTheme(params.slug);
		},
		{
			params: slugParamsSchema,
			detail: { summary: 'Delete a published theme (admin only).' },
			response: {
				200: themeDeleteResponseSchema,
				401: adminErrorSchema,
				404: themeNotFoundSchema,
				409: themeMutationConflictSchema
			}
		}
	)
	.patch(
		'/:slug',
		({ params, body, requireAdmin }) => {
			requireAdmin();
			return updateTheme(params.slug, body);
		},
		{
			params: slugParamsSchema,
			body: themeUpdateSchema,
			detail: { summary: 'Update a published theme (admin only).' },
			response: {
				200: themeRecordSchema,
				401: adminErrorSchema,
				404: themeNotFoundSchema,
				409: themeMutationConflictSchema
			}
		}
	);
