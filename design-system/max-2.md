# Spyne Console — Max 2.0 design system

**Mandatory reference** for any new Max 2 screen or component under the scoped routes below. This document mirrors the product spec for **console.spyne.ai** visual DNA: same colors, typography rhythm, spacing scale, radii, surfaces, and icon system.

## Scope

| In scope (use `Max2SpyneScope` + tokens) | Out of scope (do not impose this system without an explicit migration) |
|------------------------------------------|--------------------------------------------------------------------------|
| `/max-2/studio` (Studio AI) | `/max-2` dashboard |
| `/max-2/lot-view` | `/max-2/sales` (Console V2 / `styles/console-v2-sales.css`) |
| `/max-2/recon` | `/max-2/service` |
| `/max-2/sourcing` | `/max-2/marketing` |
| | `/max-2/customers` |

Shell chrome (sidebar, mobile bar, page gutters) uses the same Spyne tokens on **all** Max 2 routes so the app feels one product; **feature UI** inside excluded routes is not required to use `.max2-spyne` overrides.

## Source of truth (machine-readable)

| Layer | Location |
|--------|----------|
| CSS variables, `.max2-spyne` subtree rules, sidebar nav utilities | `app/globals.css` (`:root` Spyne block, `@layer components`) |
| Typed exports, route helper | `lib/design-system/max-2.ts` |
| Scope wrapper | `components/max-2/max2-spyne-scope.tsx` |
| Action tab cards | `components/max-2/max2-action-tab.tsx` |
| Material Symbols helper | `components/max-2/material-symbol.tsx` |
| Inventory filter drawer | `components/max-2/inventory-filter-panel.tsx` |
| Collapsed sidebar rail (icon + label stack, dividers) | `components/max-2/max2-sidebar-rail.tsx` |
| Reusable Spyne UI (chips, filter tags, domain status) | `components/max-2/spyne-ui/` (barrel: `spyne-chip.tsx` re-exports) |
| Domain chip presets (lot / media / publish / pricing labels + tones) | `lib/design-system/spyne-chip-presets.ts` (also re-exported from `lib/design-system/max-2.ts`) |
| Font link | `app/layout.tsx` (Google Material Symbols Outlined) |

## Canonical tokens (exact)

### Colors

- Primary: `#4600F2`
- Secondary / soft primary: `#4600F214`
- Page background: `#F4F5F8`
- Surface: `#FFFFFF`
- Text primary: `#1A1A1A`
- Text secondary: `#6B7280`
- Border: `#E5E7EB`
- Success: `#027A48`
- Warning: `#FACC15`
- Error: `#D13313`
- Info: `#3B82F6`

### Typography

- Font: **Inter** (body already uses Inter in root layout; `.max2-spyne` reinforces `Inter, sans-serif`).
- Page heading: **20px**, **600**, line-height **1.4** — class `max2-page-title` inside `.max2-spyne`.
- Subheading / description: **14px**, **400**, line-height **1.5** — `max2-page-description`.
- Body: **14px**.
- Small: **12px**.

### Buttons (border-radius **8px** always for buttons)

| Size | Height | Horizontal padding | Font | Icon |
|------|--------|-------------------|------|------|
| Large | 44px | 16px | 16px | 24px |
| Medium | 40px | 14px | 14px | 20px |
| Small | 36px | 12px | 12px | 16px |

CSS classes (only valid inside `.max2-spyne`): `spyne-btn-primary-lg`, `spyne-btn-primary-md`, `spyne-btn-secondary-md`. See `app/globals.css`.

### Border radius

- sm **4px**, md **6px**, lg **8px**, xl **12px**, full **9999px**
- Mapping: Button **8px**, Input **6px**, Card **8px**, Modal **12px**, Chip **full**, Avatar **full**

### Action tabs (issue / filter row)

Horizontal row of tappable cards for “actions required” (e.g. Studio AI, Lot view). Each card stacks **icon (24px)** → **title (14px / 600)** → **“N vehicles →”** (14px / 500). Pass icons as **`<MaterialSymbol name="snake_case" size={24} />`** only (not Lucide or ad-hoc SVG), per the Icons section below.

**Selected:** border, icon, and title **`--spyne-primary`**; surface **`--spyne-surface`**.

**Vehicle count** (“N vehicles →”): always **`--spyne-error`** (canonical red), including unselected tabs — no amber or other semantic tints on the number line.

Default (unselected) chrome: background `#F9FAFB`, border `--spyne-border`; icon `--spyne-text-secondary`, title `--spyne-text-primary`.

- **Strip container**: class `spyne-action-tab-strip` — `display: grid`, `gap: 12px`, `padding: 16px`, bottom border. Add responsive column classes on the element (e.g. `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`).
- **React**: `Max2ActionTab` + `Max2ActionTabStrip` in `components/max-2/max2-action-tab.tsx`; CSS under `.max2-spyne` in `app/globals.css`.

### Spacing

Base unit **4px**. Allowed steps: 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80, 96.

### Sidebar rail (shell)

Desktop Max 2 layout uses a **narrow collapsed rail**: **toggle** in the top row (centered when collapsed; **Max 2.0** label + toggle when expanded), then primary links as **icon (24px) above a 10px centered label** (max two lines). **Horizontal dividers** (`spyne-sidebar-rail__divider`) group sections; optional **footer** slot on `Max2SidebarRail` for bottom-pinned items. Expanded width **220px**; collapsed **76px**. Classes: `spyneComponentClasses.sidebarRail*` in `lib/design-system/max-2.ts`, `.spyne-sidebar-rail__*` in `app/globals.css`. Active link: `max2Classes.navActive`.

### Layout padding

- **24px** on **left, right, top, and bottom** for every Max 2 screen (main content column).

Tailwind (from `@theme` `--spacing-max2-page`): `p-max2-page` for full inset; `px-max2-page` for horizontal-only (e.g. mobile menu bar).

Combined main column: `max2Layout.pagePadding` (`p-max2-page`) in `lib/design-system/max-2.ts`.

### Icons

- Default: **Material Symbols Outlined** via `<MaterialSymbol name="snake_case" size={16|20|24} />`.
- Use Lucide (or other) only when no Material Symbol exists; prefer adding a Material name when possible.

## Implementation rules

1. **Wrap** in-scope pages automatically: `app/max-2/layout.tsx` uses `isMax2SpyneScopedPath()` and `Max2SpyneScope`. Do not nest a second `.max2-spyne` root.
2. **Do not** scatter raw hex for Spyne colors in new code — use `spyneConsoleTokens` (TS) or Tailwind theme colors `text-spyne-*`, `bg-spyne-*`, `border-spyne-*`, or component classes from `spyneComponentClasses`.
3. **Cards / inputs / dialogs / selects** under `.max2-spyne` are normalized via `[data-slot="..."]` rules in `globals.css`; prefer shadcn primitives without overriding radius unless necessary.
4. **Semantic status** (success / warning / error / info): use `spyneComponentClasses.badge*` and `rowWarn` / `rowError` / `rowPositive` for tables and lists.
5. **Chips / filters**: use **`<SpyneChip />`** (and **`SpyneRemovableFilterChip`** where only the dismiss control should remove a filter) on scoped routes — see **Chips (design system)**. Legacy classes `spyne-chip` / `spyne-chip-filter` / `spyne-inventory-quick-chip*` remain in CSS for reference but **inventory quick filters** are implemented with `SpyneChip` + `spyneDsChipMetricClass`.

### Chips (design system)

Pill-shaped tags (**border-radius full**), **12px** label, **500** weight, **6×12px** padding (with **6px** gap to icons). Three emphases:

| Emphasis | Look |
|----------|------|
| **outline** | Very light tint, thin border, label + icons in the tone color |
| **soft** | Stronger tint, border, same ink as outline |
| **solid** | Filled background in the tone; label + icons **white** (warning solid uses **dark ink** `#1A1A1A` on yellow for contrast) |

**Structure**

- **Text only** — `children` only.
- **Leading icon** — `leading={<MaterialSymbol name="check_circle" size={14} />}` or any node.
- **Trailing icon** — `trailing={…}` (e.g. close affordance).
- **Compact** — `compact` for dense tables (10px type, tighter padding).
- **Count disc** (Studio AI / Lot header shortcuts) — `trailing={<span className={spyneDsChipMetricClass}>{n}</span>}` with `variant="soft" | "outline"` and `tone="primary" | "neutral"`.
- **Removable row filters** (label + X only removes) — `<SpyneRemovableFilterChip label="…" onRemove={…} />`.

**Tones** (CSS variables in `:root` + `.spyne-ds-chip--{tone}`):

| Tone | Source |
|------|--------|
| `neutral` | `--spyne-chip-neutral` (#64748B) |
| `charcoal` | `--spyne-chip-charcoal` (#374151) |
| `success` | `--spyne-success` (#027A48) |
| `warning` | `--spyne-warning` / ink `--spyne-warning-ink` |
| `error` | `--spyne-error` |
| `info` | `--spyne-info` |
| `primary` | `--spyne-primary` |
| `cyan`, `pink`, `orange`, `crimson`, `rose` | `--spyne-chip-*` extended tokens |

**Composable exports** (`@/components/max-2/spyne-ui`)

| Component | Use when |
|-----------|----------|
| `SpyneChip` | Base pill — any `variant` × `tone`, optional `leading` / `trailing`, `compact`, `as="button"` |
| `SpyneMetricChip` | Label + count disc (inventory shortcuts) |
| `SpyneDismissibleChip` | Active filter row — whole control dismisses (`ariaLabel` required) |
| `SpyneRemovableFilterChip` | Label + **X only** removes (sheet filter rows) |
| `SpyneLotStatusChip` | `status: LotStatus` |
| `SpyneMediaStatusChip` | `mediaStatus: MediaStatus` |
| `SpynePublishStatusChip` | `publishStatus: PublishStatus` |
| `SpynePricingPositionChip` | `pricingPosition: PricingPosition` |
| `SpyneSeverityChip` | Issue tags — `severity: "error" \| "warning"` |

**Presets** — `spyneLotStatusChipPreset`, `spyneMediaStatusChipPreset`, `spynePublishStatusChipPreset`, `spynePricingPositionChipPreset`, `spyneLotStatusOrder`, `spynePricingPositionOrder` from `@/lib/design-system/max-2` for facets and custom layouts.

**React**

```tsx
import {
  SpyneChip,
  SpyneMetricChip,
  SpyneDismissibleChip,
  SpyneRemovableFilterChip,
  SpyneLotStatusChip,
} from "@/components/max-2/spyne-ui"
import { spyneDsChipMetricClass } from "@/lib/design-system/max-2"
import { MaterialSymbol } from "@/components/max-2/material-symbol"

<SpyneChip variant="outline" tone="success">Label</SpyneChip>
<SpyneChip variant="soft" tone="info" leading={<MaterialSymbol name="schedule" size={14} />}>
  With icon
</SpyneChip>
<SpyneChip as="button" variant="solid" tone="primary" type="button" onClick={…}>
  Dismissible
</SpyneChip>
```

**Plain classes** (inside `.max2-spyne`): `spyne-ds-chip spyne-ds-chip--outline spyne-ds-chip--success` + optional `spyne-ds-chip__icon` / `spyne-ds-chip__metric` / `spyne-ds-chip--compact`. Helpers: `spyneDsChipClassName`, `spyneDsChipIconClass`, `spyneDsChipMetricClass`, `spyneDsChipCompactClass` in `lib/design-system/max-2.ts`.

### Inventory filter drawer (Studio AI + Lot inventory)

Right-hand **Filters** sheet: light gray header row (`spyne-filter-panel__header`) with **tune** icon + “Filters” title and close control; **scrollable body** (`spyne-filter-panel__body` — `flex: 1 1 0; min-height: 0; overflow-y: auto`) with **accordion sections** (`spyne-filter-section`); each section has an uppercase label trigger (`spyne-filter-section__trigger`) and **checkbox rows** (`spyne-filter-option`) showing label + count in parentheses; overflow values use purple **+N MORE** (`spyne-filter-more`). Footer is sticky with **Clear Filters** (`spyne-btn-secondary-md` + `flex-1`) and **Show Vehicles** (`spyne-btn-primary-md` + `flex-1`).

| Layer | Location |
|--------|-----------|
| CSS (`.max2-spyne` subtree) | `app/globals.css` — `spyne-filter-panel*`, `spyne-filter-section*`, `spyne-filter-option*`, `spyne-filter-more`; buttons reuse `spyne-btn-secondary-md` / `spyne-btn-primary-md` |
| Typed class names | `spyneComponentClasses.filterPanel*` … `btnPrimaryMd` / `btnSecondaryMd` in `lib/design-system/max-2.ts` |
| React layout + sections | `components/max-2/inventory-filter-panel.tsx` — `SpyneFilterSheet`, `SpyneFilterFacetSection` |

**Portals:** Radix `Sheet` renders into `document.body`, so filter markup is **outside** the layout `Max2SpyneScope`. `SpyneFilterSheet` wraps its inner tree in **`max2Classes.spyneScope`** so `.max2-spyne .spyne-filter-*` rules in `globals.css` still match. Use the same pattern for any other portaled Spyne UI (dialogs, menus) that rely on scoped component classes.

## Inferred values (allowed for a11y / interaction)

Documented in `lib/design-system/max-2.ts` as `spyneConsoleTokens`:

- Primary hover / pressed for CTA backgrounds
- Disabled background and text
- **`warningInk`** / `--spyne-warning-ink`: readable brown for warning copy on white (same ink as `.spyne-badge-warning` text; pairs with canonical `--spyne-warning`)
- Soft tints for semantic badges (via `color-mix` in CSS classes)

## TypeScript quick reference

```ts
import {
  max2Classes,
  max2Layout,
  spyneConsoleTokens,
  spyneComponentClasses,
  isMax2SpyneScopedPath,
} from "@/lib/design-system/max-2"
import { Max2SpyneScope } from "@/components/max-2/max2-spyne-scope"
import { Max2ActionTab, Max2ActionTabStrip } from "@/components/max-2/max2-action-tab"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import {
  SpyneChip,
  SpyneRemovableFilterChip,
} from "@/components/max-2/spyne-ui"
import { SpyneFilterSheet, SpyneFilterFacetSection } from "@/components/max-2/inventory-filter-panel"
import { Max2SidebarRail, Max2SidebarRailDivider, Max2SidebarRailNavLink } from "@/components/max-2/max2-sidebar-rail"
```

## Sales exception

`/max-2/sales` keeps `ConsoleV2SalesExperience` and its stylesheet; layout does not wrap it in `Max2SpyneScope` and does not apply `max2-content` tone to that column.
