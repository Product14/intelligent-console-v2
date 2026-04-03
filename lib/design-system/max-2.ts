/**
 * Spyne Console design system for Max 2.0 (non-excluded routes).
 *
 * CSS variables and `.max2-spyne` rules: `app/globals.css`
 * Human spec: `design-system/max-2.md`
 *
 * Excluded from Spyne Max 2 UI scope (do not wrap with `Max2SpyneScope` / do not require these tokens in feature code):
 * - `/max-2` dashboard
 * - `/max-2/sales` (Console V2 stylesheet)
 * - `/max-2/service`
 * - `/max-2/marketing`
 * - `/max-2/customers`
 */

/** Raw token strings for tests, charts, or non-Tailwind contexts */
export const spyneConsoleTokens = {
  primary: "#4600F2",
  primarySoft: "#4600F214",
  pageBackground: "#F4F5F8",
  surface: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  success: "#027A48",
  warning: "#FACC15",
  error: "#D13313",
  info: "#3B82F6",
  /** Inferred — hover on primary CTA */
  primaryHover: "#3B00D1",
  /** Inferred — pressed primary */
  primaryPressed: "#3200B8",
  /** Inferred — disabled control surface */
  disabledBg: "#F3F4F6",
  /** Inferred — disabled label */
  disabledText: "#9CA3AF",
  /** Inferred — warning label on white (pairs with `warning`; matches `.spyne-badge-warning` text) */
  warningInk: "#854D0E",
  /** Extended chip tones (see `.spyne-ds-chip` in `app/globals.css`) */
  chipNeutral: "#64748B",
  chipCharcoal: "#374151",
  chipCyan: "#0891B2",
  chipPink: "#DB2777",
  chipOrange: "#EA580C",
  chipCrimson: "#B91C1C",
  chipRose: "#E11D48",
} as const

/** Chip visual emphasis (matches Figma-style reference: outline → soft → solid) */
export type SpyneChipVariant = "outline" | "soft" | "solid"

/** Chip color family — core semantic tokens + extended palette */
export type SpyneChipTone =
  | "neutral"
  | "charcoal"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "primary"
  | "cyan"
  | "pink"
  | "orange"
  | "crimson"
  | "rose"

/** Root + modifiers for custom markup (prefer `<SpyneChip />`) */
export function spyneDsChipClassName(opts: { variant: SpyneChipVariant; tone: SpyneChipTone }) {
  return `spyne-ds-chip spyne-ds-chip--${opts.variant} spyne-ds-chip--${opts.tone}`
}

export const spyneDsChipIconClass = "spyne-ds-chip__icon"

/** Numeric count pill inside `SpyneChip` (e.g. inventory quick filters) */
export const spyneDsChipMetricClass = "spyne-ds-chip__metric"

export const spyneDsChipCompactClass = "spyne-ds-chip--compact"

export const max2Tokens = {
  /** Main column padding — left, right, top, bottom */
  pagePadding: "24px",
  shellBackground: spyneConsoleTokens.pageBackground,
} as const

/** Class names from `@layer components` in globals.css */
export const max2Classes = {
  pageTitle: "max2-page-title",
  pageDescription: "max2-page-description",
  /** Applied by `Max2SpyneScope` — do not repeat on children */
  spyneScope: "max2-spyne",
  navActive: "max2-nav-active",
  navChildActive: "max2-nav-child-active",
} as const

/** Semantic badge/chip utilities (inside `.max2-spyne` only) */
export const spyneComponentClasses = {
  btnPrimaryLg: "spyne-btn-primary-lg",
  btnPrimaryMd: "spyne-btn-primary-md",
  btnSecondaryMd: "spyne-btn-secondary-md",
  chip: "spyne-chip",
  chipFilter: "spyne-chip-filter",
  badgeSuccess: "spyne-badge-success",
  badgeWarning: "spyne-badge-warning",
  badgeError: "spyne-badge-error",
  badgeInfo: "spyne-badge-info",
  badgeNeutral: "spyne-badge-neutral",
  rowSelected: "spyne-row-selected",
  rowWarn: "spyne-row-warn",
  rowError: "spyne-row-error",
  /** Subtle positive highlight (e.g. fresh trade-in) */
  rowPositive: "spyne-row-positive",
  kpiIcon: "spyne-kpi-icon",
  /** Row of action tab cards (grid columns set by consumer, e.g. lg:grid-cols-6) */
  actionTabStrip: "spyne-action-tab-strip",
  actionTab: "spyne-action-tab",
  actionTabSelected: "spyne-action-tab--selected",
  actionTabIcon: "spyne-action-tab__icon",
  actionTabTitle: "spyne-action-tab__title",
  actionTabCount: "spyne-action-tab__count",
  /** Inventory list header — underline tabs + quick chips */
  inventoryTab: "spyne-inventory-tab",
  inventoryTabActive: "spyne-inventory-tab--active",
  inventoryQuickChip: "spyne-inventory-quick-chip",
  inventoryQuickChipActive: "spyne-inventory-quick-chip--active",
  inventoryQuickChipCount: "spyne-inventory-quick-chip__count",
  /** Cycling placeholder line inside inventory search */
  inventorySearchHint: "spyne-inventory-search-hint",
  /** Inventory filter drawer (checkbox accordions) */
  filterPanelRoot: "spyne-filter-panel-root",
  filterPanel: "spyne-filter-panel",
  filterPanelHeader: "spyne-filter-panel__header",
  filterPanelTitle: "spyne-filter-panel__title",
  filterPanelClose: "spyne-filter-panel__close",
  filterPanelBody: "spyne-filter-panel__body",
  filterPanelFooter: "spyne-filter-panel__footer",
  filterSection: "spyne-filter-section",
  filterSectionTrigger: "spyne-filter-section__trigger",
  filterOption: "spyne-filter-option",
  filterOptionCount: "spyne-filter-option__count",
  filterMore: "spyne-filter-more",
  /** Collapsed sidebar rail — `components/max-2/max2-sidebar-rail.tsx` + `.spyne-sidebar-rail*` in `app/globals.css` */
  sidebarRailDivider: "spyne-sidebar-rail__divider",
  sidebarRailLink: "spyne-sidebar-rail__link",
  sidebarRailLinkCollapsed: "spyne-sidebar-rail__link--collapsed",
  sidebarRailLinkExpanded: "spyne-sidebar-rail__link--expanded",
  sidebarRailLabelCollapsed: "spyne-sidebar-rail__label-collapsed",
} as const

/**
 * Main column padding: 24px on all sides.
 */
export const max2Layout = {
  pagePadding: "p-max2-page",
  pageGutterX: "px-max2-page",
  /** Applied to main column when not on Sales (type ramp) */
  contentTone: "max2-content",
} as const

/** Routes that use `Max2SpyneScope` + `.max2-spyne` token overrides */
export const max2SpyneRoutePrefixes = [
  "/max-2/studio",
  "/max-2/lot-view",
  "/max-2/recon",
  "/max-2/sourcing",
] as const

export function isMax2SpyneScopedPath(pathname: string): boolean {
  return max2SpyneRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

/** Domain → chip label/tone presets for `SpyneLotStatusChip` and new screens */
export {
  spyneLotStatusChipPreset,
  spyneLotStatusOrder,
  spyneMediaStatusChipPreset,
  spynePricingPositionChipPreset,
  spynePricingPositionOrder,
  spynePublishStatusChipPreset,
  type SpyneDomainChipPreset,
} from "./spyne-chip-presets"
