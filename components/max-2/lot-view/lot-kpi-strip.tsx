"use client"

import { mockLotVehicles } from "@/lib/max-2-mocks"
import type { LotVehicle } from "@/services/max-2/max-2.types"
import { cn } from "@/lib/utils"

const fmt$ = (n: number) => `$${n.toLocaleString()}`

// Only count vehicles that are actually on the lot (no recon / arriving)
const ACTIVE_STATUSES = ["frontline", "wholesale-candidate", "sold-pending"]

type Status = "good" | "watch" | "bad"

const statusDot: Record<Status, string> = {
  good:  "bg-spyne-success",
  watch: "bg-spyne-warning",
  bad:   "bg-spyne-error",
}

const statusLabel: Record<Status, { text: string; color: string; bg: string }> = {
  good:  { text: "Good",    color: "text-spyne-success", bg: "spyne-row-positive"  },
  watch: { text: "Monitor", color: "text-spyne-text",   bg: "spyne-row-warn"    },
  bad:   { text: "Action",  color: "text-spyne-error",     bg: "spyne-row-error"      },
}

export function LotKPIStrip() {
  const activeVehicles = mockLotVehicles.filter((v) =>
    ACTIVE_STATUSES.includes(v.lotStatus),
  )
  const total        = activeVehicles.length
  const frontlineCount = activeVehicles.filter((v) => v.lotStatus === "frontline").length
  const wholesaleCount = activeVehicles.filter((v) => v.lotStatus === "wholesale-candidate").length

  const mtdCost = activeVehicles.reduce((sum, v) => sum + v.totalHoldingCost, 0)
  const dailyCost = activeVehicles.reduce((sum, v) => sum + v.holdingCostPerDay, 0)

  const avgDays = activeVehicles.filter((v) => v.lotStatus !== "sold-pending").length > 0
    ? activeVehicles
        .filter((v) => v.lotStatus !== "sold-pending")
        .reduce((s, v) => s + v.daysInStock, 0) /
      activeVehicles.filter((v) => v.lotStatus !== "sold-pending").length
    : 0

  const frontlinePct = total > 0 ? frontlineCount / total : 0
  const daysStatus: Status  = avgDays < 20 ? "good" : avgDays < 30 ? "watch" : "bad"
  const readyStatus: Status = frontlinePct >= 0.55 ? "good" : frontlinePct >= 0.4 ? "watch" : "bad"
  const aged45 = activeVehicles.filter(
    (v) => v.daysInStock >= 45 && v.lotStatus !== "sold-pending",
  ).length

  return (
    <div className="rounded-lg border bg-card  overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x">

        {/* 1 - Total Units */}
        <Metric
          label="Total Units"
          value={String(total)}
          status="good"
          sub={`${frontlineCount} frontline · ${wholesaleCount} wholesale`}
        />

        {/* 2 - Frontline Ready */}
        <Metric
          label="Frontline Ready"
          value={String(frontlineCount)}
          status={readyStatus}
          sub={`${(frontlinePct * 100).toFixed(0)}% of lot available`}
          statusOverride={readyStatus === "good" ? "Strong" : readyStatus === "watch" ? "Moderate" : "Low"}
        />

        {/* 3 - Disposition (Retail vs Wholesale) */}
        <DispositionPanel vehicles={activeVehicles} />

        {/* 4 - Avg Days in Stock */}
        <Metric
          label="Avg Days in Stock"
          value={`${avgDays.toFixed(1)}d`}
          status={daysStatus}
          sub={aged45 > 0 ? `${aged45} cars past 45-day mark` : "All within healthy range"}
        />

        {/* 5 - MTD Holding Cost */}
        <Metric
          label="MTD Holding Cost"
          value={fmt$(mtdCost)}
          status="watch"
          sub={`${fmt$(dailyCost)}/day burn rate`}
          valueColor="text-spyne-error"
        />

      </div>
    </div>
  )
}

function DispositionPanel({ vehicles }: { vehicles: LotVehicle[] }) {
  const retail    = vehicles.filter((v) => v.lotStatus === "frontline").length
  const wholesale = vehicles.filter((v) => v.lotStatus === "wholesale-candidate").length
  const total     = vehicles.length

  const rows = [
    { label: "Retail",    count: retail,    bar: "bg-spyne-success", dot: "bg-spyne-success", val: "text-spyne-success" },
    { label: "Wholesale", count: wholesale, bar: "bg-spyne-error",     dot: "bg-spyne-error",     val: "text-spyne-error"     },
  ]

  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Disposition
        </p>
      </div>

      {/* Stacked bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-px mb-3">
        {rows.map((r) =>
          r.count > 0 ? (
            <div key={r.label} className={r.bar} style={{ width: `${total > 0 ? (r.count / total) * 100 : 0}%` }} />
          ) : null,
        )}
      </div>

      {/* Compact legend */}
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", r.dot)} />
              <span className="text-xs text-muted-foreground">{r.label}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={cn("text-xs font-bold tabular-nums", r.val)}>{r.count}</span>
              <span className="text-[10px] text-muted-foreground tabular-nums w-[28px] text-right">
                {total > 0 ? `${((r.count / total) * 100).toFixed(0)}%` : "0%"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Metric({
  label, value, status, sub, valueColor, statusOverride,
}: {
  label: string
  value: string
  status: Status
  sub: string
  valueColor?: string
  statusOverride?: string
}) {
  const dot = statusDot[status]
  const sl  = statusLabel[status]

  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-1.5 mb-3">
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot)} />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
      </div>
      <p className={cn("text-3xl font-bold tracking-tight mb-1.5", valueColor)}>
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground leading-snug">{sub}</p>
    </div>
  )
}
