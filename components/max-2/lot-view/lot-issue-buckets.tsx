"use client"

import * as React from "react"
import Link from "next/link"
import { mockLotVehicles } from "@/lib/max-2-mocks"
import type { LotVehicle, LotStatus } from "@/services/max-2/max-2.types"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { SpyneLotStatusChip, SpyneSeverityChip } from "@/components/max-2/spyne-ui"
import { Max2ActionTab, Max2ActionTabStrip } from "@/components/max-2/max2-action-tab"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { max2Classes } from "@/lib/design-system/max-2"

// ── Configs ───────────────────────────────────────────────────────────────

const fmt$ = (n: number) => `$${n.toLocaleString()}`

// ── Vehicle row (matches lot inventory table) ────────────────────────────

function VehicleRow({ v, issueBadge }: { v: LotVehicle; issueBadge?: React.ReactNode }) {
  const isAged = v.daysInStock >= 45

  return (
    <tr className="border-b last:border-0 border-spyne-border">
      <td className={cn("py-3.5 pr-4 pl-5 text-xs text-muted-foreground tabular-nums", isAged && spyneComponentClasses.overviewIssueRowAccent)}>
        {v.stockNumber}
      </td>
      <td className="py-3.5 pr-4 font-medium whitespace-nowrap">{v.year} {v.make} {v.model} {v.trim}</td>
      <td className="py-3.5 pr-4 text-muted-foreground whitespace-nowrap">{v.color}</td>
      <td className="py-3.5 pr-4 text-right tabular-nums">{fmt$(v.listPrice)}</td>
      <td className={cn("py-3.5 pr-4 text-right tabular-nums font-semibold", isAged && "text-spyne-error")}>{v.daysInStock}</td>
      <td className="py-3.5 pr-4">
        <SpyneLotStatusChip status={v.lotStatus} compact />
      </td>
      <td className={cn(
        "py-3.5 pr-4 text-right tabular-nums font-semibold",
        v.totalHoldingCost >= 2000 ? "text-spyne-error" : v.totalHoldingCost >= 1000 ? "text-spyne-text" : "text-muted-foreground",
      )}>{fmt$(v.totalHoldingCost)}</td>
      <td className="py-3.5 pr-5">{issueBadge}</td>
    </tr>
  )
}

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
      href: "/max-2/lot-view/inventory?age=45%2B",
    },
    {
      key: "smart-campaign",
      label: "Smart Campaign",
      icon: <MaterialSymbol name="campaign" size={24} />,
      filter: (v) => v.lotStatus === "frontline" && v.leads === 0 && v.daysInStock >= 10,
      href: "/max-2/lot-view/inventory?leads=no-leads",
    },
    {
      key: "reprice",
      label: "Reprice",
      icon: <MaterialSymbol name="refresh" size={24} />,
      filter: (v) => v.daysInStock >= 31 && v.daysInStock <= 45 && v.lotStatus === "frontline",
      href: "/max-2/lot-view/inventory?age=31-45",
    },
    {
      key: "liquidate",
      label: "Liquidate",
      icon: <MaterialSymbol name="trending_down" size={24} />,
      filter: (v) => v.daysInStock >= 46 && v.daysInStock <= 60 && v.lotStatus !== "sold-pending",
      href: "/max-2/lot-view/inventory?age=45%2B",
    },
    {
      key: "exit-now",
      label: "Exit Now",
      icon: <MaterialSymbol name="logout" size={24} />,
      filter: (v) => v.daysInStock > 60 && v.lotStatus !== "sold-pending",
      href: "/max-2/lot-view/inventory?age=45%2B",
    },
    {
      key: "high-holding",
      label: "High Holding Cost",
      icon: <MaterialSymbol name="payments" size={24} />,
      filter: (v) => v.totalHoldingCost >= 1500,
      href: "/max-2/lot-view/inventory?sort=holdingCost",
    },
  ]

  const tab = tabDefs[activeTab]
  const matched = vehicles.filter(tab.filter)
  const shown = matched.slice(0, 9)
  const hasMore = matched.length > 9

  const issueBadges: Record<string, (v: LotVehicle) => React.ReactNode> = {
    "aged-45": (v) => (
      <SpyneSeverityChip severity="error" compact>{v.daysInStock}d aged</SpyneSeverityChip>
    ),
    "smart-campaign": (v) => (
      <SpyneSeverityChip severity="warning" compact>{v.daysInStock}d, 0 leads</SpyneSeverityChip>
    ),
    "reprice": (v) => (
      <SpyneSeverityChip severity="warning" compact>{v.daysInStock}d on lot</SpyneSeverityChip>
    ),
    "liquidate": (v) => (
      <SpyneSeverityChip severity="error" compact>{v.daysInStock}d, liquidate</SpyneSeverityChip>
    ),
    "exit-now": (v) => (
      <SpyneSeverityChip severity="error" compact>{v.daysInStock}d, exit now</SpyneSeverityChip>
    ),
    "high-holding": (v) => (
      <SpyneSeverityChip severity="warning" compact>{fmt$(v.totalHoldingCost)}</SpyneSeverityChip>
    ),
  }

  return (
    <div>
      <div className="mb-3">
        <h2 className={max2Classes.sectionTitle}>Action Items</h2>
        <p className={cn("text-xs mt-0.5", "text-spyne-text-secondary")}>
          Vehicles grouped by lot issue. Click a tab to review.
        </p>
      </div>

      <div className="rounded-[8px] border border-spyne-border bg-spyne-surface shadow-none overflow-hidden">
        <Max2ActionTabStrip className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
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

        {/* Vehicle table */}
        <div>
          {shown.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No vehicles in this category.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 pt-4 pr-4 pl-5 text-xs font-semibold text-muted-foreground whitespace-nowrap">Stock #</th>
                    <th className="pb-3 pt-4 pr-4 text-xs font-semibold text-muted-foreground">Vehicle</th>
                    <th className="pb-3 pt-4 pr-4 text-xs font-semibold text-muted-foreground">Color</th>
                    <th className="pb-3 pt-4 pr-4 text-xs font-semibold text-muted-foreground text-right">List Price</th>
                    <th className="pb-3 pt-4 pr-4 text-xs font-semibold text-muted-foreground text-right">Days</th>
                    <th className="pb-3 pt-4 pr-4 text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="pb-3 pt-4 pr-4 text-xs font-semibold text-muted-foreground text-right whitespace-nowrap">Holding Cost</th>
                    <th className="pb-3 pt-4 pr-5 text-xs font-semibold text-muted-foreground">Issue</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((v) => (
                    <VehicleRow
                      key={v.vin}
                      v={v}
                      issueBadge={issueBadges[tab.key]?.(v)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {hasMore && (
            <div className="px-5 py-4 border-t flex justify-end">
              <Link
                href={tab.href}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
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
