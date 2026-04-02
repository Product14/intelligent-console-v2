/**
 * Max 2.0 console design tokens (non–Sales).
 *
 * CSS variables and component classes live in `app/globals.css`.
 * Human-readable spec: `design-system/max-2.md`.
 *
 * Sales (`/max-2/sales`) uses `styles/console-v2-sales.css` / Spyne tokens — do not use these there.
 */
export const max2Tokens = {
  /** Matches `--max2-page-padding` in globals.css */
  pagePadding: "1.5rem",
  /** Matches `--max2-shell-bg` */
  shellBackground: "#f4f6f9",
} as const

/** Class names from `@layer components` in globals.css */
export const max2Classes = {
  pageTitle: "max2-page-title",
  pageDescription: "max2-page-description",
} as const

/**
 * Tailwind utilities backed by `@theme` (`--spacing-max2-page`).
 * Use for layout gutters so padding stays aligned with tokens.
 */
export const max2Layout = {
  pagePadding: "p-max2-page",
  pageGutterX: "px-max2-page",
  /** Applied to main column only when not on Sales; soft type ramp via CSS (see globals.css). */
  contentTone: "max2-content",
} as const
