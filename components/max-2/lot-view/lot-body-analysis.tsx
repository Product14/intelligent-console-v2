"use client"

import { mockLotVehicles } from "@/lib/max-2-mocks"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

// ── Body type mapping ─────────────────────────────────────────────────────
const MODEL_TO_BODY: Record<string, string> = {
  "F-150":    "Truck",
  "Silverado":"Truck",
  "RAV4":     "SUV",
  "Q5":       "SUV",
  "CX-5":     "SUV",
  "Equinox":  "SUV",
  "Sportage": "SUV",
  "Tucson":   "SUV",
  "Forester": "SUV",
  "3 Series": "Sedan",
  "Altima":   "Sedan",
  "Sonata":   "Sedan",
  "Corolla":  "Sedan",
  "Civic":    "Sedan",
  "Camry":    "Sedan",
}

const BODY_TYPES = ["SUV", "Sedan", "Truck"] as const

const BODY_STYLE: Record<
  string,
  { bar: string; dot: string; text: string; bg: string }
> = {
  SUV:   { bar: "bg-rose-400",  dot: "bg-rose-400",  text: "text-rose-700",  bg: "bg-rose-50"  },
  Sedan: { bar: "bg-rose-600",  dot: "bg-rose-600",  text: "text-rose-800",  bg: "bg-rose-50"  },
  Truck: { bar: "bg-rose-800",  dot: "bg-rose-800",  text: "text-rose-900",  bg: "bg-rose-50"  },
}

export function LotBodyAnalysis() {
  const active = mockLotVehicles.filter(
    (v) => v.lotStatus !== "arriving" && v.lotStatus !== "in-recon",
  )

  const groups = BODY_TYPES.map((bodyType) => {
    const vehicles = active.filter((v) => MODEL_TO_BODY[v.model] === bodyType)
    const sellable = vehicles.filter(
      (v) => v.lotStatus === "frontline" || v.lotStatus === "wholesale-candidate",
    )
    const avgDays =
      vehicles.length > 0
        ? vehicles.reduce((s, v) => s + v.daysInStock, 0) / vehicles.length
        : 0
    const dailyCost  = vehicles.reduce((s, v) => s + v.holdingCostPerDay, 0)
    const accumulated= vehicles.reduce((s, v) => s + v.totalHoldingCost, 0)
    const avgGross   =
      sellable.length > 0
        ? sellable.reduce((s, v) => s + v.estimatedFrontGross, 0) / sellable.length
        : 0
    const agedCount  = vehicles.filter((v) => v.daysInStock >= 45).length

    const status =
      agedCount > 0 ? "risk" : avgDays > 28 ? "watch" : "good"

    return {
      bodyType,
      count: vehicles.length,
      sellableCount: sellable.length,
      avgDays: Math.round(avgDays * 10) / 10,
      dailyCost,
      accumulated,
      avgGross: Math.round(avgGross),
      agedCount,
      status,
    }
  })

  const totalAccumulated = groups.reduce((s, g) => s + g.accumulated, 0)
  const maxAccumulated   = Math.max(...groups.map((g) => g.accumulated), 1)

  const best  = [...groups].sort((a, b) => a.avgDays - b.avgDays)[0]
  const worst = [...groups].sort((a, b) => b.avgDays - a.avgDays)[0]

  const STATUS_CFG: Record<string, { label: string; cls: string }> = {
    good:  { label: "Healthy",  cls: "bg-emerald-50 text-emerald-700" },
    watch: { label: "Monitor",  cls: "bg-amber-50 text-amber-700"     },
    risk:  { label: "At Risk",  cls: "bg-red-50 text-red-700"         },
  }

  return (
    <Card className="shadow-none gap-0">
      <CardHeader className="pb-4">
        <CardTitle>Body Type Distribution &amp; Holding Cost</CardTitle>
        <CardDescription>
          Which segments are turning fast, which are aging - and where your money is tied up
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-1">
        <div className="overflow-x-auto">
          <div className="min-w-[600px] space-y-3">

            {/* Header */}
            <div className="grid grid-cols-[120px_1fr_72px_80px_120px_76px] gap-4 px-3">
              {[
                "Body Type",
                "Cost Share",
                "Cars",
                "Avg Days",
                "Holding Cost",
                "Status",
              ].map((h) => (
                <p
                  key={h}
                  className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {h}
                </p>
              ))}
            </div>

            {/* Rows */}
            {groups.map((g) => {
              const style  = BODY_STYLE[g.bodyType]
              const pct    = totalAccumulated > 0 ? (g.accumulated / totalAccumulated) * 100 : 0
              const status = STATUS_CFG[g.status]

              return (
                <div
                  key={g.bodyType}
                  className="grid grid-cols-[120px_1fr_72px_80px_120px_76px] gap-4 items-center rounded-xl border bg-muted/10 px-3 py-3.5"
                >
                  {/* Body type */}
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full shrink-0", style.dot)} />
                    <span className="text-sm font-semibold">{g.bodyType}</span>
                  </div>

                  {/* Cost share bar */}
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-500", style.bar)}
                          style={{ width: `${(g.accumulated / maxAccumulated) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold tabular-nums w-[34px] text-right">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">of total holding cost</p>
                  </div>

                  {/* Count */}
                  <div>
                    <p className="text-sm font-bold">{g.count}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {g.sellableCount} avail.
                    </p>
                  </div>

                  {/* Avg days */}
                  <div>
                    <p
                      className={cn(
                        "text-sm font-bold tabular-nums",
                        g.avgDays > 35
                          ? "text-red-600"
                          : g.avgDays > 22
                          ? "text-amber-600"
                          : "text-emerald-600",
                      )}
                    >
                      {g.avgDays}d
                    </p>
                    <p className="text-[10px] text-muted-foreground">avg in stock</p>
                  </div>

                  {/* Accumulated holding cost */}
                  <div>
                    <p className="text-sm font-semibold tabular-nums">
                      ${g.accumulated.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">accrued so far</p>
                  </div>

                  {/* Status */}
                  <span
                    className={cn(
                      "inline-flex justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      status.cls,
                    )}
                  >
                    {status.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Insights footer */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border-l-[3px] border-l-emerald-500 bg-emerald-50/60 px-4 py-3">
            <p className="text-[11px] font-semibold text-emerald-700 mb-1">
              Best Performer
            </p>
            <p className="text-sm text-emerald-800 leading-snug">
              <strong>{best.bodyType}</strong> moving fastest at{" "}
              {best.avgDays}d avg - consider increasing buying in this segment
              to maintain velocity
            </p>
          </div>
          <div className="rounded-xl border-l-[3px] border-l-amber-500 bg-amber-50/60 px-4 py-3">
            <p className="text-[11px] font-semibold text-amber-700 mb-1">
              Needs Attention
            </p>
            <p className="text-sm text-amber-800 leading-snug">
              <strong>{worst.bodyType}</strong> averaging {worst.avgDays}d —{" "}
              {worst.agedCount > 0
                ? `${worst.agedCount} aged unit${worst.agedCount !== 1 ? "s" : ""} need immediate repricing or liquidation`
                : "monitor pricing and online visibility to prevent aging"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
