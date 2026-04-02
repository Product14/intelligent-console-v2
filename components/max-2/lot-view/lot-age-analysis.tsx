"use client"

import { useRouter } from "next/navigation"
import { mockLotVehicles } from "@/lib/max-2-mocks"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

const BUCKETS = [
  {
    label: "0–15 days",
    min: 0, max: 15,
    phase: "Fresh",
    phaseBg: "bg-blue-50 border-blue-200",
    barColor: "bg-blue-200",
    accent: "border-l-blue-200",
    urgency: 0,
    ageParam: "0-15",
  },
  {
    label: "16–30 days",
    min: 16, max: 30,
    phase: "Monitor",
    phaseBg: "bg-blue-50 border-blue-300",
    barColor: "bg-blue-400",
    accent: "border-l-blue-400",
    urgency: 1,
    ageParam: "16-30",
  },
  {
    label: "31–45 days",
    min: 31, max: 45,
    phase: "Reprice",
    phaseBg: "bg-blue-50 border-blue-400",
    barColor: "bg-blue-600",
    accent: "border-l-blue-600",
    urgency: 2,
    ageParam: "31-45",
  },
  {
    label: "46–60 days",
    min: 46, max: 60,
    phase: "Liquidate",
    phaseBg: "bg-blue-100 border-blue-500",
    barColor: "bg-blue-800",
    accent: "border-l-blue-800",
    urgency: 3,
    ageParam: "45+",
  },
  {
    label: "60+ days",
    min: 61, max: Infinity,
    phase: "Exit Now",
    phaseBg: "bg-blue-100 border-blue-700",
    barColor: "bg-blue-950",
    accent: "border-l-blue-950",
    urgency: 4,
    ageParam: "45+",
  },
]

export function LotAgeAnalysis() {
  const router = useRouter()

  const active = mockLotVehicles.filter(
    (v) => v.lotStatus !== "arriving" && v.lotStatus !== "in-recon",
  )
  const total = active.length

  const rows = BUCKETS.map((b) => {
    const vehicles = active.filter(
      (v) => v.daysInStock >= b.min && v.daysInStock <= b.max,
    )
    const grossMargin = vehicles.reduce((s, v) => s + v.estimatedFrontGross, 0)
    return {
      ...b,
      vehicles,
      count: vehicles.length,
      pct: total > 0 ? (vehicles.length / total) * 100 : 0,
      dailyCost: vehicles.reduce((s, v) => s + v.holdingCostPerDay, 0),
      accumulated: vehicles.reduce((s, v) => s + v.totalHoldingCost, 0),
      grossMargin,
    }
  })

  const maxCount      = Math.max(...rows.map((r) => r.count), 1)
  const riskRows      = rows.filter((r) => r.urgency >= 2)
  const riskCount     = riskRows.reduce((s, r) => s + r.count, 0)
  const riskDailyCost = riskRows.reduce((s, r) => s + r.dailyCost, 0)
  const totalAccum    = rows.reduce((s, r) => s + r.accumulated, 0)
  const totalGross    = rows.reduce((s, r) => s + r.grossMargin, 0)

  return (
    <Card className="shadow-none gap-0">
      <CardHeader className="pb-4">
        <CardTitle>Age Distribution &amp; Holding Cost</CardTitle>
        <CardDescription>
          Each bucket shows vehicle count and total holding cost accrued
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-1 px-5 pb-5">
        {/* Scrollable table */}
        <div className="overflow-x-auto">
          <div className="min-w-[540px]">

            {/* Column headers */}
            <div className="grid grid-cols-[96px_80px_1fr_56px_110px_110px_16px] gap-3 px-3 mb-2">
              {[
                { label: "Phase",          right: false },
                { label: "Age Range",      right: false },
                { label: "Distribution",   right: false },
                { label: "Cars",           right: true  },
                { label: "Gross Margin",   right: true  },
                { label: "Holding Cost",   right: true  },
              ].map(({ label, right }) => (
                <p key={label} className={`text-[10px] font-semibold uppercase tracking-wide text-muted-foreground${right ? " text-right" : ""}`}>
                  {label}
                </p>
              ))}
            </div>

            {/* Rows */}
            <div className="space-y-2">
              {rows.map((row) => (
                <div
                  key={row.label}
                  onClick={row.count > 0 ? () => router.push(`/max-2/lot-view/inventory?age=${encodeURIComponent(row.ageParam)}`) : undefined}
                  className={cn(
                    "grid grid-cols-[96px_80px_1fr_56px_110px_110px_16px] gap-3 items-center",
                    "rounded-lg border-l-[3px] px-3 py-2.5 bg-muted/20 group",
                    row.accent,
                    row.count === 0 ? "opacity-40" : "cursor-pointer transition-all duration-150 hover:bg-muted/50 hover:shadow-sm active:scale-[0.995]",
                  )}
                >
                  {/* Phase */}
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[10px] font-semibold w-fit",
                      row.phaseBg,
                      row.urgency === 0 ? "text-blue-500"
                        : row.urgency === 1 ? "text-blue-600"
                        : row.urgency === 2 ? "text-blue-700"
                        : row.urgency === 3 ? "text-blue-800"
                        : "text-blue-950",
                    )}
                  >
                    {row.phase}
                  </span>

                  {/* Age range */}
                  <span className="text-xs text-muted-foreground">{row.label}</span>

                  {/* Bar */}
                  <div className="h-5 bg-muted/50 rounded-md overflow-hidden">
                    <div
                      className={cn("h-full rounded-md transition-all duration-500", row.barColor)}
                      style={{
                        width: `${(row.count / maxCount) * 100}%`,
                        minWidth: row.count > 0 ? "4px" : "0",
                      }}
                    />
                  </div>

                  {/* Count */}
                  <div className="text-right">
                    <p className={cn("text-sm font-bold tabular-nums", row.urgency >= 2 && row.count > 0 ? "text-red-600" : "text-foreground")}>
                      {row.count}
                    </p>
                    <p className="text-[10px] text-muted-foreground tabular-nums">
                      {row.pct.toFixed(0)}%
                    </p>
                  </div>

                  {/* Gross Margin */}
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-foreground">
                      {row.count > 0 ? `$${row.grossMargin.toLocaleString()}` : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">est. gross</p>
                  </div>

                  {/* Accumulated holding cost */}
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-semibold tabular-nums",
                      row.urgency >= 2 && row.count > 0 ? "text-red-600" : "text-foreground",
                    )}>
                      {row.count > 0 ? `$${row.accumulated.toLocaleString()}` : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">accrued</p>
                  </div>

                  {/* Chevron */}
                  {row.count > 0 ? (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                  ) : (
                    <span />
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="grid grid-cols-[96px_80px_1fr_56px_110px_110px_16px] gap-3 items-center px-3 pt-3 mt-2 border-t">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</p>
              <span />
              <span />
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums">{total}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums text-foreground">${totalGross.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums">${totalAccum.toLocaleString()}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Insight callout */}
        {riskCount > 0 && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border-l-[3px] border-l-blue-400 bg-blue-50/60 px-4 py-3">
            <p className="text-sm text-foreground leading-relaxed">
              <strong className="text-red-600">{riskCount} cars</strong> in the 31+ day risk zone are
              burning{" "}
              <strong className="text-red-600">${riskDailyCost}/day</strong> in holding costs. Move to
              liquidation pricing to recover gross before further depreciation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
