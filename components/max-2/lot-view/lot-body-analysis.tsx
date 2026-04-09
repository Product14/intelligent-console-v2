"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  LotAgeDistributionPanel,
  LOT_ANALYSIS_ROW_GRID,
  formatHoldingVsGrossPctValue,
} from "./lot-age-analysis"
import { mockLotVehicles } from "@/lib/max-2-mocks"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  SpyneSegmentedButton,
  SpyneSegmentedControl,
} from "@/components/max-2/spyne-toolbar-controls"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

type AnalysisTabId = "ageing-distribution" | "body-type" | "avg-sale-price"

const ANALYSIS_TABS: { id: AnalysisTabId; label: string }[] = [
  { id: "ageing-distribution", label: "Ageing Distribution" },
  { id: "body-type", label: "Body Type Distribution" },
  { id: "avg-sale-price", label: "Average Sale Price" },
]

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
  SUV:   { bar: "bg-spyne-primary", dot: "bg-spyne-primary", text: "text-spyne-primary", bg: "bg-spyne-primary-soft" },
  Sedan: { bar: "bg-spyne-info", dot: "bg-spyne-info", text: "text-spyne-info", bg: "bg-spyne-primary-soft" },
  Truck: { bar: "bg-spyne-success", dot: "bg-spyne-success", text: "text-spyne-success", bg: "bg-spyne-primary-soft" },
}

// ── Price bucket config ───────────────────────────────────────────────────
const PRICE_BUCKETS = [
  { label: "Under $15K",  min: 0,     max: 15000,    rangeParam: "under-15k" as const },
  { label: "$15K–$25K",   min: 15000, max: 25000,    rangeParam: "15k-25k" as const },
  { label: "$25K–$35K",   min: 25000, max: 35000,    rangeParam: "25k-35k" as const },
  { label: "$35K–$50K",   min: 35000, max: 50000,    rangeParam: "35k-50k" as const },
  { label: "$50K+",       min: 50000, max: Infinity, rangeParam: "50k+" as const },
] as const

const PRICE_STYLE = [
  { bar: "bg-spyne-border", dot: "bg-spyne-border" },
  { bar: "bg-spyne-text-secondary", dot: "bg-spyne-text-secondary" },
  { bar: "bg-spyne-primary/50", dot: "bg-spyne-primary/50" },
  { bar: "bg-spyne-primary", dot: "bg-spyne-primary" },
  { bar: "bg-[var(--spyne-primary-pressed)]", dot: "bg-[var(--spyne-primary-pressed)]" },
]

/** Cost share column: grow with cell up to a cap; gap keeps air before the % and Cars column */
const costShareBarTrackClass =
  "h-2 min-w-0 flex-1 max-w-[28rem] overflow-hidden rounded-full bg-muted"

export function LotBodyAnalysis() {
  const router = useRouter()
  const [analysisTab, setAnalysisTab] =
    React.useState<AnalysisTabId>("ageing-distribution")

  const active = mockLotVehicles.filter(
    (v) => v.lotStatus !== "arriving" && v.lotStatus !== "in-recon",
  )

  // ── Body type data ──────────────────────────────────────────────────────
  const groups = BODY_TYPES.map((bodyType) => {
    const vehicles = active.filter((v) => MODEL_TO_BODY[v.model] === bodyType)
    const sellable = vehicles.filter(
      (v) => v.lotStatus === "frontline" || v.lotStatus === "wholesale-candidate",
    )
    const avgDays =
      vehicles.length > 0
        ? vehicles.reduce((s, v) => s + v.daysInStock, 0) / vehicles.length
        : 0
    const accumulated= vehicles.reduce((s, v) => s + v.totalHoldingCost, 0)
    const grossMargin = vehicles.reduce((s, v) => s + v.estimatedFrontGross, 0)
    const agedCount  = vehicles.filter((v) => v.daysInStock >= 45).length

    const status =
      agedCount > 0 ? "risk" : avgDays > 28 ? "watch" : "good"

    return {
      bodyType,
      count: vehicles.length,
      sellableCount: sellable.length,
      avgDays: Math.round(avgDays * 10) / 10,
      accumulated,
      grossMargin,
      agedCount,
      status,
    }
  })

  const totalAccumulated = groups.reduce((s, g) => s + g.accumulated, 0)
  const maxAccumulated   = Math.max(...groups.map((g) => g.accumulated), 1)

  const best  = [...groups].sort((a, b) => a.avgDays - b.avgDays)[0]
  const worst = [...groups].sort((a, b) => b.avgDays - a.avgDays)[0]

  const STATUS_CFG: Record<string, { label: string; cls: string }> = {
    good:  { label: "Healthy",  cls: "spyne-row-positive text-spyne-success" },
    watch: { label: "Monitor",  cls: "spyne-row-warn text-spyne-text"     },
    risk:  { label: "At Risk",  cls: "border border-spyne-border bg-spyne-surface text-spyne-error" },
  }

  // ── Price bucket data ───────────────────────────────────────────────────
  const priceBuckets = PRICE_BUCKETS.map((bucket, i) => {
    const vehicles = active.filter(
      (v) => v.listPrice >= bucket.min && v.listPrice < bucket.max,
    )
    const avgPrice =
      vehicles.length > 0
        ? vehicles.reduce((s, v) => s + v.listPrice, 0) / vehicles.length
        : 0
    const avgDays =
      vehicles.length > 0
        ? vehicles.reduce((s, v) => s + v.daysInStock, 0) / vehicles.length
        : 0
    const accumulated = vehicles.reduce((s, v) => s + v.totalHoldingCost, 0)
    const grossMargin = vehicles.reduce((s, v) => s + v.estimatedFrontGross, 0)
    const agedCount = vehicles.filter((v) => v.daysInStock >= 45).length
    const status = agedCount > 0 ? "risk" : avgDays > 28 ? "watch" : "good"

    return {
      label: bucket.label,
      rangeParam: bucket.rangeParam,
      styleIdx: i,
      count: vehicles.length,
      avgPrice: Math.round(avgPrice),
      avgDays: Math.round(avgDays * 10) / 10,
      accumulated,
      grossMargin,
      agedCount,
      status,
    }
  }).filter((b) => b.count > 0)

  const totalPriceAccumulated = priceBuckets.reduce((s, b) => s + b.accumulated, 0)
  const maxPriceAccumulated   = Math.max(...priceBuckets.map((b) => b.accumulated), 1)

  const bestPrice  = [...priceBuckets].sort((a, b) => a.avgDays - b.avgDays)[0]
  const worstPrice = [...priceBuckets].sort((a, b) => b.avgDays - a.avgDays)[0]

  return (
    <Card className="shadow-none gap-0">
      <CardHeader className="pt-0 pb-5">
        <CardTitle>Inventory Analysis</CardTitle>
        <CardDescription>
          Which segments are turning fast, which are aging — and where your money is tied up
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="min-w-0 overflow-x-auto pb-5">
          <SpyneSegmentedControl aria-label="Inventory analysis view" className="w-max max-w-none">
            {ANALYSIS_TABS.map((t) => (
              <SpyneSegmentedButton
                key={t.id}
                active={analysisTab === t.id}
                onClick={() => setAnalysisTab(t.id)}
                className="shrink-0 whitespace-nowrap text-xs sm:text-sm"
              >
                {t.label}
              </SpyneSegmentedButton>
            ))}
          </SpyneSegmentedControl>
        </div>

        {analysisTab === "ageing-distribution" ? (
          <LotAgeDistributionPanel className="pt-0 pb-5" />
        ) : null}

        {analysisTab === "body-type" ? (
          <>
            <div className="overflow-x-auto pt-0">
              <div className="min-w-[720px] space-y-3">
                <div className={cn(LOT_ANALYSIS_ROW_GRID, "px-3")}>
                  {["Body Type", "Cost Share", "Cars", "Avg Days", "Holding Cost", "% of gross", "Status"].map((h) => (
                    <p key={h} className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</p>
                  ))}
                </div>

                {groups.map((g) => {
                  const style  = BODY_STYLE[g.bodyType]
                  const pct    = totalAccumulated > 0 ? (g.accumulated / totalAccumulated) * 100 : 0
                  const status = STATUS_CFG[g.status]

                  return (
                    <div
                      key={g.bodyType}
                      onClick={g.count > 0 ? () => router.push(`/max-2/studio/media-lot/inventory?bodyType=${encodeURIComponent(g.bodyType)}`) : undefined}
                      className={cn(
                        LOT_ANALYSIS_ROW_GRID,
                        "rounded-lg border bg-muted/10 px-3 py-3.5 group",
                        g.count > 0 && "cursor-pointer transition-colors hover:bg-muted/20",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 shrink-0 rounded-full", style.dot)} />
                        <span className="text-sm font-semibold">{g.bodyType}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="mb-0.5 flex w-full min-w-0 items-center gap-3 pr-1">
                          <div className={costShareBarTrackClass}>
                            <div className={cn("h-full rounded-full transition-all duration-500", style.bar)} style={{ width: `${(g.accumulated / maxAccumulated) * 100}%` }} />
                          </div>
                          <span className="w-[34px] shrink-0 text-right text-xs font-semibold tabular-nums">{pct.toFixed(0)}%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">of total holding cost</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold">{g.count}</p>
                        <p className="text-[10px] text-muted-foreground">{g.sellableCount} avail.</p>
                      </div>
                      <div>
                        <p className={cn("text-sm font-bold tabular-nums", g.avgDays > 35 ? "text-spyne-error" : g.avgDays > 22 ? "text-spyne-text" : "text-spyne-success")}>{g.avgDays}d</p>
                        <p className="text-[10px] text-muted-foreground">avg in stock</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold tabular-nums">${g.accumulated.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold tabular-nums">
                          {g.count > 0
                            ? formatHoldingVsGrossPctValue(g.accumulated, g.grossMargin)
                            : "—"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">of gross margin</p>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={cn("inline-flex justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold", status.cls)}>{status.label}</span>
                        {g.count > 0 ? (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" aria-hidden />
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border-l-[3px] border-l-spyne-success spyne-row-positive px-4 py-3">
                <p className="text-[11px] font-semibold text-spyne-success mb-1">Best Performer</p>
                <p className="text-sm text-spyne-text leading-snug">
                  <strong>{best.bodyType}</strong> moving fastest at {best.avgDays}d avg — consider increasing buying in this segment to maintain velocity
                </p>
              </div>
              <div className="rounded-lg border-l-[3px] border-l-spyne-warning spyne-row-warn px-4 py-3">
                <p className="text-[11px] font-semibold text-spyne-text mb-1">Needs Attention</p>
                <p className="text-sm text-spyne-text leading-snug">
                  <strong>{worst.bodyType}</strong> averaging {worst.avgDays}d — {worst.agedCount > 0 ? `${worst.agedCount} aged unit${worst.agedCount !== 1 ? "s" : ""} need immediate repricing or liquidation` : "monitor pricing and online visibility to prevent aging"}
                </p>
              </div>
            </div>
          </>
        ) : null}

        {analysisTab === "avg-sale-price" ? (
          <>
            <div className="overflow-x-auto pt-0">
              <div className="min-w-[720px] space-y-3">
                <div className={cn(LOT_ANALYSIS_ROW_GRID, "px-3")}>
                  {["Price Range", "Cost Share", "Cars", "Avg Price", "Holding Cost", "% of gross", "Status"].map((h) => (
                    <p key={h} className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</p>
                  ))}
                </div>

                {priceBuckets.map((b) => {
                  const style  = PRICE_STYLE[b.styleIdx]
                  const pct    = totalPriceAccumulated > 0 ? (b.accumulated / totalPriceAccumulated) * 100 : 0
                  const status = STATUS_CFG[b.status]

                  return (
                    <div
                      key={b.label}
                      onClick={() => router.push(`/max-2/studio/media-lot/inventory?priceRange=${encodeURIComponent(b.rangeParam)}`)}
                      className={cn(
                        LOT_ANALYSIS_ROW_GRID,
                        "cursor-pointer rounded-lg border bg-muted/10 px-3 py-3.5 transition-colors hover:bg-muted/20 group",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 shrink-0 rounded-full", style.dot)} />
                        <span className="text-sm font-semibold">{b.label}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="mb-0.5 flex w-full min-w-0 items-center gap-3 pr-1">
                          <div className={costShareBarTrackClass}>
                            <div className={cn("h-full rounded-full transition-all duration-500", style.bar)} style={{ width: `${(b.accumulated / maxPriceAccumulated) * 100}%` }} />
                          </div>
                          <span className="w-[34px] shrink-0 text-right text-xs font-semibold tabular-nums">{pct.toFixed(0)}%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">of total holding cost</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold">{b.count}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold tabular-nums">${b.avgPrice.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">{b.avgDays}d avg</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold tabular-nums">${b.accumulated.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold tabular-nums">
                          {formatHoldingVsGrossPctValue(b.accumulated, b.grossMargin)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">of gross margin</p>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={cn("inline-flex justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold", status.cls)}>{status.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" aria-hidden />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {bestPrice && worstPrice && (
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border-l-[3px] border-l-spyne-success spyne-row-positive px-4 py-3">
                  <p className="text-[11px] font-semibold text-spyne-success mb-1">Fastest Moving</p>
                  <p className="text-sm text-spyne-text leading-snug">
                    <strong>{bestPrice.label}</strong> turning fastest at {bestPrice.avgDays}d avg — strong demand in this price segment
                  </p>
                </div>
                <div className="rounded-lg border-l-[3px] border-l-spyne-warning spyne-row-warn px-4 py-3">
                  <p className="text-[11px] font-semibold text-spyne-text mb-1">Slowest Moving</p>
                  <p className="text-sm text-spyne-text leading-snug">
                    <strong>{worstPrice.label}</strong> averaging {worstPrice.avgDays}d — {worstPrice.agedCount > 0 ? `${worstPrice.agedCount} aged unit${worstPrice.agedCount !== 1 ? "s" : ""} may need repricing` : "consider adjusting pricing or marketing focus"}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
