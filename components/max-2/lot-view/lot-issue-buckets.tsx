"use client"

import * as React from "react"
import Link from "next/link"
import { mockLotVehicles } from "@/lib/max-2-mocks"
import type { LotVehicle, LotStatus } from "@/services/max-2/max-2.types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ArrowRight, AlertTriangle, Megaphone, DollarSign, TrendingDown, LogOut, RefreshCw } from "lucide-react"

// ── Configs ───────────────────────────────────────────────────────────────

const statusBadge: Record<LotStatus, { label: string; className: string }> = {
  frontline: { label: "Frontline", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  "in-recon": { label: "In Recon", className: "bg-amber-100 text-amber-700 border-amber-200" },
  arriving: { label: "Arriving", className: "bg-blue-100 text-blue-700 border-blue-200" },
  "wholesale-candidate": { label: "Wholesale", className: "bg-red-100 text-red-700 border-red-200" },
  "sold-pending": { label: "Sold Pending", className: "bg-gray-100 text-gray-500 border-gray-200" },
}

const fmt$ = (n: number) => `$${n.toLocaleString()}`

type TabSeverity = "critical" | "warning" | "info"

const severityStyles: Record<TabSeverity, {
  icon: string; count: string; activeBg: string; activeBorder: string; hoverBg: string; dot: string
}> = {
  critical: {
    icon: "text-red-500",
    count: "text-red-600",
    activeBg: "bg-red-50/60",
    activeBorder: "border-b-red-500",
    hoverBg: "hover:bg-red-50/40",
    dot: "bg-red-500",
  },
  warning: {
    icon: "text-amber-500",
    count: "text-amber-600",
    activeBg: "bg-amber-50/60",
    activeBorder: "border-b-amber-500",
    hoverBg: "hover:bg-amber-50/40",
    dot: "bg-amber-500",
  },
  info: {
    icon: "text-slate-400",
    count: "text-slate-500",
    activeBg: "bg-slate-50/60",
    activeBorder: "border-b-slate-400",
    hoverBg: "hover:bg-slate-50/40",
    dot: "bg-slate-400",
  },
}

// ── Vehicle row (matches lot inventory table) ────────────────────────────

function VehicleRow({ v, issueBadge }: { v: LotVehicle; issueBadge?: React.ReactNode }) {
  const sb = statusBadge[v.lotStatus]
  const isAged = v.daysInStock >= 45

  return (
    <tr className={cn("border-b last:border-0", isAged && "bg-red-50/50")}>
      <td className="py-3.5 pr-4 pl-5 text-xs text-muted-foreground tabular-nums">{v.stockNumber}</td>
      <td className="py-3.5 pr-4 font-medium whitespace-nowrap">{v.year} {v.make} {v.model} {v.trim}</td>
      <td className="py-3.5 pr-4 text-muted-foreground whitespace-nowrap">{v.color}</td>
      <td className="py-3.5 pr-4 text-right tabular-nums">{fmt$(v.listPrice)}</td>
      <td className={cn("py-3.5 pr-4 text-right tabular-nums font-semibold", isAged && "text-red-600")}>{v.daysInStock}</td>
      <td className="py-3.5 pr-4">
        <Badge variant="outline" className={sb.className}>{sb.label}</Badge>
      </td>
      <td className={cn(
        "py-3.5 pr-4 text-right tabular-nums font-semibold",
        v.totalHoldingCost >= 2000 ? "text-red-600" : v.totalHoldingCost >= 1000 ? "text-amber-600" : "text-muted-foreground",
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
    key: string; label: string; severity: TabSeverity
    icon: React.ReactNode
    filter: (v: LotVehicle) => boolean
    href: string
  }[] = [
    {
      key: "aged-45",
      label: "Aged 45+ Days",
      severity: "critical",
      icon: <AlertTriangle className="h-4 w-4" />,
      filter: (v) => v.daysInStock >= 45,
      href: "/max-2/lot-view/inventory?age=45%2B",
    },
    {
      key: "smart-campaign",
      label: "Smart Campaign",
      severity: "warning",
      icon: <Megaphone className="h-4 w-4" />,
      filter: (v) => v.lotStatus === "frontline" && v.leads === 0 && v.daysInStock >= 10,
      href: "/max-2/lot-view/inventory?leads=no-leads",
    },
    {
      key: "reprice",
      label: "Reprice",
      severity: "warning",
      icon: <RefreshCw className="h-4 w-4" />,
      filter: (v) => v.daysInStock >= 31 && v.daysInStock <= 45 && v.lotStatus === "frontline",
      href: "/max-2/lot-view/inventory?age=31-45",
    },
    {
      key: "liquidate",
      label: "Liquidate",
      severity: "critical",
      icon: <TrendingDown className="h-4 w-4" />,
      filter: (v) => v.daysInStock >= 46 && v.daysInStock <= 60 && v.lotStatus !== "sold-pending",
      href: "/max-2/lot-view/inventory?age=45%2B",
    },
    {
      key: "exit-now",
      label: "Exit Now",
      severity: "critical",
      icon: <LogOut className="h-4 w-4" />,
      filter: (v) => v.daysInStock > 60 && v.lotStatus !== "sold-pending",
      href: "/max-2/lot-view/inventory?age=45%2B",
    },
    {
      key: "high-holding",
      label: "High Holding Cost",
      severity: "warning",
      icon: <DollarSign className="h-4 w-4" />,
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
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-red-50 text-red-700 border-red-200">
        {v.daysInStock}d aged
      </span>
    ),
    "smart-campaign": (v) => (
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
        {v.daysInStock}d, 0 leads
      </span>
    ),
    "reprice": (v) => (
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
        {v.daysInStock}d on lot
      </span>
    ),
    "liquidate": (v) => (
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-red-50 text-red-700 border-red-200">
        {v.daysInStock}d — liquidate
      </span>
    ),
    "exit-now": (v) => (
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-red-50 text-red-700 border-red-200">
        {v.daysInStock}d — exit now
      </span>
    ),
    "high-holding": (v) => (
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
        {fmt$(v.totalHoldingCost)}
      </span>
    ),
  }

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-sm font-semibold tracking-tight">Action Items</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Vehicles grouped by lot issue — click a tab to review
        </p>
      </div>

      <div className="rounded-xl border bg-card shadow-none overflow-hidden">
        {/* Tab strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-b divide-x">
          {tabDefs.map((t, i) => {
            const count = vehicles.filter(t.filter).length
            const isActive = activeTab === i
            const sty = severityStyles[t.severity]
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "w-full flex flex-col items-start gap-2.5 px-5 py-4 transition-all text-left border-b-2",
                  isActive
                    ? cn(sty.activeBg, sty.activeBorder)
                    : cn("border-b-transparent", sty.hoverBg),
                )}
              >
                <span className={cn("transition-colors", isActive ? sty.icon : "text-muted-foreground/60")}>
                  {t.icon}
                </span>
                <div>
                  <p className={cn("text-xs font-semibold leading-tight", isActive ? "text-foreground" : "text-muted-foreground")}>
                    {t.label}
                  </p>
                  <div className={cn("flex items-center gap-1 mt-1", isActive ? sty.count : "text-muted-foreground")}>
                    <span className={cn("inline-block h-1.5 w-1.5 rounded-full shrink-0", isActive ? sty.dot : "bg-muted-foreground/40")} />
                    <span className="text-xs font-semibold tabular-nums">
                      {count} vehicle{count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

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
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
