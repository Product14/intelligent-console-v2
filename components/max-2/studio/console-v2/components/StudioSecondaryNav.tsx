"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneLineTabBadge, SpyneLineTabStrip } from "@/components/max-2/spyne-line-tabs"
import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import { max2Classes, spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

const inventoryVehicleCount = mockMerchandisingVehicles.length

/** Studio AI secondary tabs (URL-based); mirrors `sales/console-v2/components/SecondaryNav.jsx` item shape + strip primitives. */
const STUDIO_NAV_ITEMS: readonly {
  href: string
  label: string
  symbol: string
  exact: boolean
  badge: number | null
}[] = [
  { href: "/max-2/studio", label: "Studio Overview", symbol: "dashboard", exact: true, badge: null },
  {
    href: "/max-2/studio/media-lot",
    label: "Lot Services",
    symbol: "photo_library",
    exact: false,
    badge: null,
  },
  {
    href: "/max-2/studio/inventory",
    label: "Inventory",
    symbol: "inventory_2",
    exact: false,
    badge: inventoryVehicleCount,
  },
  { href: "/max-2/studio/add", label: "Add Media", symbol: "post_add", exact: true, badge: null },
  { href: "/max-2/studio/sold-inventory", label: "Sold Inventory", symbol: "sell", exact: true, badge: null },
]

function isTabActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function StudioSecondaryNav() {
  const pathname = usePathname()

  return (
    <div className={cn(max2Classes.moduleSecondaryNavShell)}>
      <div className="min-w-0 w-full px-max2-page">
        <SpyneLineTabStrip embedded className="min-h-0 w-full min-w-0">
          {STUDIO_NAV_ITEMS.map((item) => {
            const active = isTabActive(pathname, item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                role="tab"
                aria-selected={active}
                aria-current={active ? "page" : undefined}
                className={cn(
                  spyneComponentClasses.lineTab,
                  active && spyneComponentClasses.lineTabActive,
                  "no-underline",
                )}
              >
                <MaterialSymbol name={item.symbol} size={14} className="text-current" />
                {item.label}
                {item.badge != null ? <SpyneLineTabBadge>{item.badge}</SpyneLineTabBadge> : null}
              </Link>
            )
          })}
        </SpyneLineTabStrip>
      </div>
    </div>
  )
}
