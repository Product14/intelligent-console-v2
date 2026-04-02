# Max 2.0 design tokens

Applies to **Max 2.0** routes under `/max-2` **except** **Sales** (`/max-2/sales`). The Sales experience uses the Console V2 / Spyne stylesheet (`styles/console-v2-sales.css`) and its own spacing and typography.

## Source of truth

| Layer | Location |
|--------|----------|
| CSS variables + Tailwind theme + component classes | `app/globals.css` (`:root`, `@theme inline`, `.max2-*` in `@layer components`) |
| Typed names for imports | `lib/design-system/max-2.ts` |

### TypeScript exports (`lib/design-system/max-2.ts`)

| Export | Use |
|--------|-----|
| `max2Classes.pageTitle` | `<h1 className={max2Classes.pageTitle}>` |
| `max2Classes.pageDescription` | Subtitle `<p>` under the page title |
| `max2Layout.pagePadding` | Main content wrapper (`p-max2-page`) |
| `max2Layout.pageGutterX` | Horizontal padding only (`px-max2-page`), e.g. mobile bars |
| `max2Tokens` | Raw string values for docs, tests, or non-Tailwind contexts |

## Spacing

| Token | CSS variable | Tailwind |
|--------|----------------|----------|
| Page inset (all sides) | `--max2-page-padding` (`1.5rem`) | `p-max2-page`, `px-max2-page`, `m-max2-page`, etc. (via `--spacing-max2-page`) |

**Usage:** The main column wrapper in `app/max-2/layout.tsx` uses `p-max2-page`. The mobile menu strip uses `px-max2-page` so horizontal gutters match the content area.

Do **not** add `max-w-7xl mx-auto` on individual Max 2 pages unless there is a product reason; full-width within the padded column keeps margins consistent.

## Shell

| Token | CSS variable | Tailwind |
|--------|----------------|----------|
| Background behind main + sidebar row | `--max2-shell-bg` (`#f4f6f9`) | `bg-max2-shell` |

## Typography (page header)

| Role | Component class | Equivalent utilities |
|------|-----------------|----------------------|
| Main page title | `.max2-page-title` | `text-xl font-semibold tracking-tight text-foreground` |
| Subtitle under title | `.max2-page-description` | `text-sm text-muted-foreground mt-1` |

**Usage:** Prefer the classes on `<h1>` and `<p>` so updates stay centralized.

## Sales (out of scope)

`ConsoleV2SalesExperience` negates the layout padding with negative margins and applies `px-6 py-5` internally. Do not replace Sales markup with Max 2 tokens without a dedicated migration.
