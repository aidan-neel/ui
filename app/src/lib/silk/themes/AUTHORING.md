# Authoring Themes

How Claude (or any contributor) should add a new Silk theme. Drop a `.ts` file into
`presets/` exporting `preset` and it gets picked up automatically by the theme
studio, the registry, and the `themes/` page.

## The 30-second version

1. Decide the **mood**: light or dark dominant? bright accent or muted?
2. Pick **5 core colors per mode** (background, card, text, primary; secondary is optional).
3. Copy `presets/_starter.ts` → `presets/<slug>.ts`.
4. Fill in metadata + the base palettes.
5. `bun run check` and visit `/themes` to verify.

If you need more control than the base palette gives you, switch to the full-palette
pattern (see *default.ts*) and write all 22 color fields per mode.

## Schema reference

A theme is a `ThemeDraft` (see `presets.ts`). The studio + registry both consume
this exact shape, so anything you ship as a preset can also be edited live.

### Metadata

| field         | type     | notes                                           |
| ------------- | -------- | ----------------------------------------------- |
| `slug`        | string   | kebab-case, must be unique                      |
| `name`        | string   | display name, e.g. "Supabase"                   |
| `description` | string   | one short sentence, no period                   |
| `publisher`   | string?  | optional, defaults to "Silk UI"                 |

### Typography

| field         | example                          |
| ------------- | -------------------------------- |
| `fontSans`    | `'Geist, sans-serif'`            |
| `fontMono`    | `'"SF Mono", monospace'`         |
| `fontHeader`  | `'Geist, sans-serif'`            |

### Radii

`radiusBase` drives the rest of the scale automatically. Override the others only if
you need a non-uniform scale.

- `0.18rem` → sharp / Linear / Vercel feel
- `0.35rem` → moderate / Stripe / GitHub
- `0.55rem` → soft / default Silk
- `0.85rem` → playful / Notion-ish

### Behavior

- `primaryButtonOutline: true` → primary buttons get a subtle border (good for dark themes)
- `invertedPanels: true` → floating panels (popovers, dropdowns) use the *dark* palette even in light mode. Great for "command palette feels like an editor" looks.

### Motion

Pick a `durationPreset` slug. Common ones: `'default'`, `'snappy'`, `'gentle'`. The
`motion` object lets you override individual durations or offsets — most themes can
just inherit from the preset.

### Palette (per light / dark)

The full palette has 22 fields. If you use `generatePaletteFromBase()`, you only
need 4 (background, card, text, primary), and the helper fills in the rest.

| field                 | what it controls                                        |
| --------------------- | ------------------------------------------------------- |
| `background`          | page background                                        |
| `card`                | card / panel surface                                   |
| `panel`, `modal`      | floating surfaces; usually = card                      |
| `secondary`           | subtle filled surfaces (chips, hover states)           |
| `muted`               | slightly recessed surfaces                             |
| `accent`              | tinted card (subtle hint of primary)                   |
| `foreground`          | main text color                                         |
| `foregroundMuted`     | secondary text                                          |
| `foregroundOpposite`  | text that sits on `foreground` itself (rare)            |
| `foregroundButton`    | text on primary buttons (white on dark primary, etc.)   |
| `primary`             | brand accent — buttons, focus rings, links             |
| `info`                | informational accent (often blue, even if primary isn't)|
| `success`, `warning`, `error`, `destructive` | status semantics                    |
| `border`, `borderStrong` | divider + focused border colors                      |
| `input`               | input border (usually = borderStrong)                  |
| `alternate`           | inverse text (used on alternate-styled buttons)        |
| `overlay`             | modal dim — should be rgba with low-ish alpha         |
| `ring`                | focus ring — rgba(primary, 0.2) is the convention      |

## Two authoring patterns

### Pattern A — Base palette + generator (recommended)

Best for new themes. Provide 4-6 colors per mode; the generator handles the rest.

```ts
import { generatePaletteFromBase, type ThemeDraft } from '$lib/silk/themes/presets';

export const preset: ThemeDraft = {
  slug: 'supabase',
  name: 'Supabase',
  description: 'Emerald accent on near-black surfaces, inspired by Supabase',
  publisher: 'Silk UI',
  fontSans: 'Inter, sans-serif',
  fontMono: '"JetBrains Mono", monospace',
  fontHeader: 'Inter, sans-serif',
  radiusBase: '0.4rem',
  radiusSm: '0.18rem',
  radiusMd: '0.4rem',
  radiusLg: '0.5rem',
  radiusXl: '0.62rem',
  primaryButtonOutline: false,
  invertedPanels: false,
  durationPreset: 'default',
  motion: {
    hoverDuration: '200ms',
    menuDuration: '140ms',
    panelDuration: '220ms',
    sheetDuration: '300ms',
    overlayDuration: '140ms',
    tooltipDuration: '120ms',
    toastInDuration: '400ms',
    toastOutDuration: '320ms',
    panelX: 0,
    panelY: 4,
    panelBlur: 0,
    panelScaleStart: 0.99,
    sheetOffset: 132,
    overlayBlur: 0
  },
  light: generatePaletteFromBase(
    {
      background: '#ffffff',
      card: '#fafafa',
      text: '#1c1c1c',
      primary: '#3ecf8e',
      secondary: '#f3f3f3'
    },
    'light'
  ),
  dark: generatePaletteFromBase(
    {
      background: '#0a0a0a',
      card: '#1a1a1a',
      text: '#ededed',
      primary: '#3ecf8e',
      secondary: '#222222'
    },
    'dark'
  )
};
```

### Pattern B — Full palette (more control)

Use when the generator's mixing doesn't get you where you want. See `default.ts` —
every field is filled in by hand.

## Brand color cheat sheet

Use these as starting points. Always verify with the brand's actual site if it matters.

| Brand         | Primary         | Background (dark) | Card (dark)   | Notes                          |
| ------------- | --------------- | ----------------- | ------------- | ------------------------------ |
| Supabase      | `#3ecf8e`       | `#0a0a0a`         | `#1a1a1a`     | Emerald on near-black          |
| shadcn (zinc) | `#fafafa` (text)| `#09090b`         | `#18181b`     | Achromatic — no real accent    |
| Linear        | `#5e6ad2`       | `#08090a`         | `#1c1c1f`     | Indigo, ultra-sharp radii      |
| Vercel        | `#000` / `#fff` | `#000000`         | `#0a0a0a`     | Pure mono, minimal radii       |
| Stripe        | `#635bff`       | `#0a0e27`         | `#1a1f3a`     | Purple, plenty of color tints  |
| Discord       | `#5865f2`       | `#1e1f22`         | `#2b2d31`     | Blurple, soft surfaces         |
| GitHub        | `#2f81f7`       | `#0d1117`         | `#161b22`     | Blue, restrained               |
| Notion        | `#2eaadc`       | `#191919`         | `#2f2f2f`     | Warm grays, playful radii      |
| Cursor        | `#dd6c4b`       | `#1a1a1a`         | `#252525`     | Warm orange accent             |
| Raycast       | `#ff4646`       | `#161616`         | `#212121`     | Coral red, deep black          |
| Anthropic     | `#cc785c`       | `#1d1c1a`         | `#262521`     | Warm tan / "claude orange"     |
| Sentry        | `#7553ff`       | `#181225`         | `#231a3a`     | Violet, slight warmth          |

For light-only versions of brands that are typically dark, start from white
backgrounds and use the same primary at slightly higher saturation.

## Workflow checklist

When the user says "make a `<brand>` theme":

1. Look up the brand in the cheat sheet above (or fetch their site if missing).
2. Copy `presets/_starter.ts` → `presets/<slug>.ts`.
3. Fill in metadata. The slug must match the filename.
4. Pick `radiusBase` based on the brand's feel (sharp / soft).
5. Plug brand colors into the `light` + `dark` base palettes. If the brand is dark-first, derive a sensible light variant by inverting backgrounds and keeping the same primary.
6. Tune `motion` only if the brand has a distinct feel (Linear = snappy, Notion = gentle, etc.).
7. Run `bun run check` from `app/` to confirm it compiles.
8. Visit `/themes` — the new preset should appear in the gallery.

## Tips

- **The primary should pop against the card surface, not the background.** Test by mentally placing a button on the card.
- **Use `secondary` for hover/pressed states.** It should sit one step toward primary from `card`.
- **`invertedPanels: true` is great for light themes** where you want dropdowns to feel like a code editor.
- **Don't overthink motion.** 99% of themes use `durationPreset: 'default'`.
- **Always test in both modes.** Even brand-dark themes need a passable light variant for users who force light.
