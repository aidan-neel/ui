import { status } from 'elysia';
import { prisma } from '@lib/prisma';
import type { ThemeDraft, ThemeMotion, ThemePalette, ThemeRecord } from './model';
import { defaultThemeRecord, defaultThemes, findDefaultTheme, isDefaultSlug } from './defaults';

type PersistedTheme = Awaited<ReturnType<typeof prisma.theme.findFirst>>;

const FALLBACK_INFO_LIGHT = '#2563eb';
const FALLBACK_INFO_DARK = '#60a5fa';

function toIso(value: Date | string): string {
	return value instanceof Date ? value.toISOString() : value;
}

function normalizePalette(palette: unknown, fallbackInfo: string): ThemePalette {
	const value = palette as Partial<ThemePalette> & {
		info?: string;
		panel?: string;
		modal?: string;
	};
	const panel = value.panel ?? value.card ?? '#ffffff';
	const modal = value.modal ?? panel;
	return {
		...(value as ThemePalette),
		info: value.info ?? fallbackInfo,
		panel,
		modal
	};
}

function serialize(theme: NonNullable<PersistedTheme>): ThemeRecord {
	const { publisher, motion, light, dark, createdAt, updatedAt, ...rest } = theme;
	const record: ThemeRecord = {
		...rest,
		motion: motion as ThemeMotion,
		light: normalizePalette(light, FALLBACK_INFO_LIGHT),
		dark: normalizePalette(dark, FALLBACK_INFO_DARK),
		createdAt: toIso(createdAt),
		updatedAt: toIso(updatedAt)
	};
	if (publisher) record.publisher = publisher;
	return record;
}

export async function listThemes(): Promise<ThemeRecord[]> {
	const [rows, hidden] = await Promise.all([
		prisma.theme.findMany({ orderBy: { name: 'asc' } }),
		prisma.hiddenDefault.findMany({ select: { slug: true } })
	]);
	const published = rows.map(serialize);
	const publishedSlugs = new Set(published.map((theme) => theme.slug));
	const hiddenSlugs = new Set(hidden.map((row) => row.slug));

	const unshadowedDefaults = defaultThemes
		.filter((theme) => !publishedSlugs.has(theme.slug) && !hiddenSlugs.has(theme.slug))
		.map(defaultThemeRecord);

	return [...unshadowedDefaults, ...published].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getThemeBySlug(slug: string): Promise<ThemeRecord> {
	const builtIn = findDefaultTheme(slug);
	if (builtIn) return defaultThemeRecord(builtIn);

	const theme = await prisma.theme.findUnique({ where: { slug } });
	if (!theme) {
		throw status(404, 'A theme with this slug does not exist.' as const);
	}

	return serialize(theme);
}

export async function deleteTheme(slug: string) {
	if (slug === 'default') {
		throw status(409, 'The default theme cannot be deleted.' as const);
	}

	const existing = await prisma.theme.findUnique({ where: { slug }, select: { id: true } });
	if (existing) {
		await prisma.theme.delete({ where: { slug } });
		return { success: true as const, message: 'Successfully deleted theme.' as const };
	}

	// Not a published theme — fall back to hiding it if it's a built-in default
	// that hasn't already been tombstoned.
	if (findDefaultTheme(slug)) {
		await prisma.hiddenDefault.upsert({
			where: { slug },
			create: { slug },
			update: {}
		});
		return { success: true as const, message: 'Successfully deleted theme.' as const };
	}

	throw status(404, 'A theme with this slug does not exist.' as const);
}

export async function updateTheme(slug: string, input: Partial<ThemeDraft>) {
	if (slug === 'default') {
		throw status(409, 'The default theme cannot be edited.' as const);
	}
	const existing = await prisma.theme.findUnique({ where: { slug }, select: { id: true } });
	if (!existing) {
		throw status(404, 'A theme with this slug does not exist.' as const);
	}
	if (input.slug && input.slug !== slug) {
		const collision = await prisma.theme.findUnique({
			where: { slug: input.slug },
			select: { id: true }
		});
		if (collision) {
			throw status(409, 'A theme with this slug already exists, try another one.' as const);
		}
	}
	const { publisher, light, dark, ...rest } = input;
	const updated = await prisma.theme.update({
		where: { slug },
		data: {
			...rest,
			...(light ? { light: normalizePalette(light, FALLBACK_INFO_LIGHT) } : {}),
			...(dark ? { dark: normalizePalette(dark, FALLBACK_INFO_DARK) } : {}),
			...(publisher !== undefined ? { publisher: publisher ?? null } : {})
		}
	});
	return serialize(updated);
}

export async function publishTheme(input: ThemeDraft) {
	if (isDefaultSlug(input.slug)) {
		throw status(409, 'This slug is reserved for a built-in theme.' as const);
	}

	const existing = await prisma.theme.findUnique({
		where: { slug: input.slug },
		select: { id: true }
	});
	if (existing) {
		throw status(409, 'A theme with this slug already exists, try another one.' as const);
	}

	await prisma.theme.create({
		data: {
			...input,
			light: normalizePalette(input.light, FALLBACK_INFO_LIGHT),
			dark: normalizePalette(input.dark, FALLBACK_INFO_DARK),
			publisher: input.publisher ?? null
		}
	});

	return {
		success: true as const,
		message: 'Successfully published theme!' as const
	};
}
