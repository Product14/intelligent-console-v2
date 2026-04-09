"use client"

import { useRouter } from "next/navigation"
import { mockLotVehicles } from "@/lib/max-2-mocks"
import type { LotVehicle } from "@/services/max-2/max-2.types"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

/**
 * Shared row layout for inventory analysis tabs.
 * Note: avoid minmax() with commas inside Tailwind arbitrary grid-cols — it breaks parsing and collapses the grid to one column.
 */
export const LOT_ANALYSIS_ROW_GRID =
  "grid w-full grid-cols-[128px_1fr_72px_100px_120px_80px_76px] gap-4 items-center"

/** Primary line for the "% of gross" column (matches other tabular metric cells). */
export function formatHoldingVsGrossPctValue(
  accumulated: number,
  grossMargin: number,
): string {
  if (grossMargin <= 0) return "—"
  const p = (accumulated / grossMargin) * 100
  return `${p.toFixed(1)}%`
}

const BUCKETS = [
  {
    label: "0–15 days",
    min: 0, max: 15,
    phase: "Fresh",
    dot: "bg-spyne-success",
    barColor: "bg-spyne-success",
    urgency: 0,
    ageParam: "0-15",
  },
  {
    label: "16–30 days",
    min: 16, max: 30,
    phase: "Monitor",
    dot: "bg-spyne-info",
    barColor: "bg-spyne-info",
    urgency: 1,
    ageParam: "16-30",
  },
  {
    label: "31–45 days",
    min: 31, max: 45,
    phase: "Reprice",
    dot: "bg-spyne-warning",
    barColor: "bg-spyne-warning",
    urgency: 2,
    ageParam: "31-45",
  },
  {
    label: "46–60 days",
    min: 46, max: 60,
    phase: "Liquidate",
    dot: "bg-spyne-error",
    barColor: "bg-spyne-error",
    urgency: 3,
    ageParam: "45+",
  },
  {
    label: "60+ days",
    min: 61, max: Infinity,
    phase: "Exit Now",
    dot: "bg-spyne-error",
    barColor: "bg-spyne-error",
    urgency: 4,
    ageParam: "45+",
  },
]

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  good:  { label: "Healthy",  cls: "spyne-row-positive text-spyne-success" },
  watch: { label: "Monitor",  cls: "spyne-row-warn text-spyne-text"     },
  risk:  { label: "At Risk",  cls: "border border-spyne-border bg-spyne-surface text-spyne-error" },
}

export function LotAgeDistributionPanel({
  className,
  vehicles: vehiclesProp,
}: {
  className?: string
  /** When set, uses this list (caller should already exclude non-lot units if desired). */
  vehicles?: LotVehicle[]
}) {
  const router = useRouter()

  const active =
    vehiclesProp ??
    mockLotVehicles.filter(
      (v) => v.lotStatus !== "arriving" && v.lotStatus !== "in-recon",
    )
  const total = active.length

  const rows = BUCKETS.map((b) => {
    const vehicles = active.filter(
      (v) => v.daysInStock >= b.min && v.daysInStock <= b.max,
    )
    const grossMargin = vehicles.reduce((s, v) => s + v.estimatedFrontGross, 0)
    const avgDays =
      vehicles.length > 0
        ? vehicles.reduce((s, v) => s + v.daysInStock, 0) / vehicles.length
        : 0
    const agedCount = vehicles.filter((v) => v.daysInStock >= 45).length
    const status =
      agedCount > 0 ? "risk" : avgDays > 28 ? "watch" : "good"
    return {
      ...b,
      vehicles,
      count: vehicles.length,
      pct: total > 0 ? (vehicles.length / total) * 100 : 0,
      accumulated: vehicles.reduce((s, v) => s + v.totalHoldingCost, 0),
      grossMargin,
      status,
    }
  })

  const maxCount = Math.max(...rows.map((r) => r.count), 1)

  const headers = [
    "Phase / age",
    "Distribution",
    "Cars",
    "Gross Margin",
    "Holding Cost",
    "% of gross",
    "Status",
  ]

  return (
    <div className={cn("pt-1 pb-5", className)}>
      <div className="overflow-x-auto">
        <div className="min-w-[720px] space-y-3">
          <div className={cn(LOT_ANALYSIS_ROW_GRID, "px-3")}>
            {headers.map((h, i) => (
              <p
                key={`${h}-${i}`}
                className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {h}
              </p>
            ))}
          </div>

          {rows.map((row) => {
            const status = STATUS_CFG[row.status]
            return (
            <div
              key={row.label}
              onClick={row.count > 0 ? () => router.push(`/max-2/studio/media-lot/inventory?age=${encodeURIComponent(row.ageParam)}`) : undefined}
              className={cn(
                LOT_ANALYSIS_ROW_GRID,
                "rounded-lg border bg-muted/10 px-3 py-3.5 group",
                row.count === 0 ? "opacity-40" : "cursor-pointer transition-colors hover:bg-muted/20",
              )}
            >
              <div className="flex items-start gap-2">
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", row.dot)} />
                <div>
                  <p className="text-sm font-semibold leading-tight">{row.phase}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{row.label}</p>
                </div>
              </div>

              <div>
                <div className="mb-0.5 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", row.barColor)}
                      style={{
                        width: `${(row.count / maxCount) * 100}%`,
                        minWidth: row.count > 0 ? "4px" : "0",
                      }}
                    />
                  </div>
                  <span className="w-[34px] shrink-0" aria-hidden />
                </div>
                <p className="text-[10px] text-muted-foreground">by unit count</p>
              </div>

              <div>
                <p className={cn(
                  "text-sm font-bold tabular-nums",
                  row.urgency >= 2 && row.count > 0 ? "text-spyne-error" : "text-foreground",
                )}>
                  {row.count}
                </p>
                <p className="text-[10px] text-muted-foreground tabular-nums">
                  {row.pct.toFixed(0)}%
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {row.count > 0 ? `$${row.grossMargin.toLocaleString()}` : "—"}
                </p>
                <p className="text-[10px] text-muted-foreground">est. gross</p>
              </div>

              <div>
                <p className={cn(
                  "text-sm font-semibold tabular-nums",
                  row.urgency >= 2 && row.count > 0 ? "text-spyne-error" : "text-foreground",
                )}>
                  {row.count > 0 ? `$${row.accumulated.toLocaleString()}` : "—"}
                </p>
              </div>

              <div>
                <p className={cn(
                  "text-sm font-semibold tabular-nums",
                  row.urgency >= 2 && row.count > 0 ? "text-spyne-error" : "text-foreground",
                )}>
                  {row.count > 0
                    ? formatHoldingVsGrossPctValue(row.accumulated, row.grossMargin)
                    : "—"}
                </p>
                <p className="text-[10px] text-muted-foreground">of gross margin</p>
              </div>

              <div className="flex items-center justify-center gap-1.5">
                {row.count > 0 ? (
                  <>
                    <span
                      className={cn(
                        "inline-flex justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        status.cls,
                      )}
                    >
                      {status.label}
                    </span>
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground"
                      aria-hidden
                    />
                  </>
                ) : (
                  <span className="h-4 w-4" />
                )}
              </div>
            </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function LotAgeAnalysis() {
  return (
    <Card className="shadow-none gap-0">
      <CardHeader className="pb-4">
        <CardTitle>Age Distribution &amp; Holding Cost</CardTitle>
        <CardDescription>
          Each bucket shows vehicle count and total holding cost accrued
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0">
        <LotAgeDistributionPanel />
      </CardContent>
    </Card>
  )
}
