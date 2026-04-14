"use client"

import * as React from "react"
import Link from "next/link"
import { mockLotVehicles } from "@/lib/max-2-mocks"
import { lotVehicleToMerchandising } from "@/lib/lot-vehicle-to-merchandising"
import type { LotVehicle } from "@/services/max-2/max-2.types"
import { cn } from "@/lib/utils"
import { max2Classes, spyneComponentClasses } from "@/lib/design-system/max-2"
import { Max2ActionTab, Max2ActionTabStrip } from "@/components/max-2/max2-action-tab"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { VehicleMediaTable } from "@/components/max-2/studio/vehicle-media-table"

// ── Main component ────────────────────────────────────────────────────────

export function LotIssueBuckets() {
  const [activeTab, setActiveTab] = React.useState(0)

  const vehicles = mockLotVehicles

  const tabDefs: {
    key: string
    label: string
    icon: React.ReactNode
    filter: (v: LotVehicle) => boolean
    href: string
  }[] = [
    {
      key: "aged-45",
      label: "Aged 45+ Days",
      icon: <MaterialSymbol name="warning" size={24} />,
      filter: (v) => v.daysInStock >= 45,
      href: "/max-2/studio/inventory?focus=aged-45",
    },
    {
      key: "smart-campaign",
      label: "Smart Campaign",
      icon: <MaterialSymbol name="campaign" size={24} />,
      filter: (v) => v.lotStatus === "frontline" && v.leads === 0 && v.daysInStock >= 10,
      href: "/max-2/studio/inventory?focus=smart-campaign",
    },
    {
      key: "reprice",
      label: "Reprice",
      icon: <MaterialSymbol name="refresh" size={24} />,
      filter: (v) => v.daysInStock >= 31 && v.daysInStock <= 45 && v.lotStatus === "frontline",
      href: "/max-2/studio/inventory?focus=reprice",
    },
    {
      key: "liquidate",
      label: "Liquidate",
      icon: <MaterialSymbol name="trending_down" size={24} />,
      filter: (v) => v.daysInStock >= 46 && v.daysInStock <= 60 && v.lotStatus !== "sold-pending",
      href: "/max-2/studio/inventory?focus=liquidate",
    },
    {
      key: "exit-now",
      label: "Exit Now",
      icon: <MaterialSymbol name="logout" size={24} />,
      filter: (v) => v.daysInStock > 60 && v.lotStatus !== "sold-pending",
      href: "/max-2/studio/inventory?focus=exit-now",
    },
    {
      key: "high-holding",
      label: "High Holding Cost",
      icon: <MaterialSymbol name="payments" size={24} />,
      filter: (v) => v.totalHoldingCost >= 1500,
      href: "/max-2/studio/inventory?focus=high-holding",
    },
  ]

  const tab = tabDefs[activeTab]
  const matched = vehicles.filter(tab.filter)
  const shown = matched.slice(0, 5).map(lotVehicleToMerchandising)
  const hasMore = matched.length > 5

  return (
    <div className={max2Classes.overviewPanelShell}>
      <div className={max2Classes.overviewPanelHeader}>
        <p className={spyneComponentClasses.cardTitle}>Action Items</p>
        <p className={max2Classes.overviewPanelDescription}>
          Vehicles grouped by lot issue. Click a tab to review.
        </p>
      </div>

      <div>
        <Max2ActionTabStrip className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 !pt-0 !px-5">
          {tabDefs.map((t, i) => {
            const count = vehicles.filter(t.filter).length
            return (
              <Max2ActionTab
                    key={t.key}
                    icon={t.icon}
                    title={t.label}
                    count={count}
                    selected={activeTab === i}
                    onClick={() => setActiveTab(i)}
                  />
            )
          })}
        </Max2ActionTabStrip>

        <div>
          {shown.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No vehicles in this category.
            </p>
          ) : (
            <VehicleMediaTable vehicles={shown} showCheckboxes={false} embedded />
          )}

          {hasMore && (
            <div className={cn(max2Classes.overviewPanelFooterRow, "flex justify-end")}>
              <Link
                href={tab.href}
                className="flex items-center gap-1.5 text-sm font-medium text-spyne-primary hover:underline"
              >
                View all {matched.length} vehicles
                <MaterialSymbol name="arrow_forward" size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
