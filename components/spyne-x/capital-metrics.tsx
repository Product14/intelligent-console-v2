"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { VehicleSummary, CapitalOverview } from "@/services/inventory/inventory.types"
import { DollarSign, TrendingUp, TrendingDown, Timer, Skull, AlertTriangle, ArrowRight } from "lucide-react"

interface TurnoverBand {
  label: string
  range: string
  count: number
  capitalLocked: number
  avgMargin: number
  color: string
  bgColor: string
}

function computeTurnoverBands(vehicles: VehicleSummary[]): TurnoverBand[] {
  const bands = [
    { label: "Fast Movers", range: "0-15d", min: 0, max: 15, color: "text-emerald-700", bgColor: "bg-emerald-50" },
    { label: "On Target", range: "16-30d", min: 16, max: 30, color: "text-blue-700", bgColor: "bg-blue-50" },
    { label: "Aging", range: "31-45d", min: 31, max: 45, color: "text-amber-700", bgColor: "bg-amber-50" },
    { label: "Critical Age", range: "46-60d", min: 46, max: 60, color: "text-orange-700", bgColor: "bg-orange-50" },
    { label: "Stale", range: "60+d", min: 61, max: Infinity, color: "text-red-700", bgColor: "bg-red-50" },
  ]

  return bands.map(band => {
    const vehs = vehicles.filter(v => v.daysInStock >= band.min && v.daysInStock <= band.max)
    return {
      label: band.label,
      range: band.range,
      count: vehs.length,
      capitalLocked: vehs.reduce((s, v) => s + v.acquisitionCost, 0),
      avgMargin: vehs.length > 0 ? Math.round(vehs.reduce((s, v) => s + v.marginRemaining, 0) / vehs.length) : 0,
      color: band.color,
      bgColor: band.bgColor,
    }
  })
}

interface CapitalMetricsProps {
  vehicles: VehicleSummary[]
  overview: CapitalOverview
}

export function CapitalMetrics({ vehicles, overview }: CapitalMetricsProps) {
  const bands = React.useMemo(() => computeTurnoverBands(vehicles), [vehicles])
  const totalCapital = vehicles.reduce((s, v) => s + v.acquisitionCost, 0)
  const totalDailyBurn = vehicles.reduce((s, v) => s + v.dailyBurn, 0)
  const deadCount = vehicles.filter(v => v.marginRemaining <= 0).length
  const deadCapital = vehicles.filter(v => v.marginRemaining <= 0).reduce((s, v) => s + v.acquisitionCost, 0)
  const avgTurnover = vehicles.length > 0 ? Math.round(vehicles.reduce((s, v) => s + v.daysInStock, 0) / vehicles.length) : 0

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Total Capital</p>
          </div>
          <p className="text-2xl font-bold tabular-nums">${(totalCapital / 1_000_000).toFixed(2)}M</p>
          <p className="text-xs text-muted-foreground mt-1">{vehicles.length} vehicles on lot</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Avg Turnover</p>
          </div>
          <p className={cn("text-2xl font-bold tabular-nums", avgTurnover > overview.marketBenchmarkDaysToLive ? "text-red-600" : "text-emerald-600")}>
            {avgTurnover}d
          </p>
          <p className="text-xs text-muted-foreground mt-1">target: {overview.marketBenchmarkDaysToLive}d</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Daily Burn</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-red-600">${totalDailyBurn.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">${(totalDailyBurn * 30).toLocaleString()}/month</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Skull className="h-4 w-4 text-red-600" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Dead Capital</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-red-600">${(deadCapital / 1000).toFixed(0)}K</p>
          <p className="text-xs text-muted-foreground mt-1">{deadCount} vehicles beyond recovery</p>
        </div>
      </div>

      {/* Turnover bands */}
      <div className="rounded-xl border bg-white p-5">
        <h3 className="text-sm font-bold tracking-tight mb-1">Capital by Age Band</h3>
        <p className="text-xs text-muted-foreground mb-4">Where your capital sits across the inventory lifecycle</p>

        <div className="space-y-2">
          {bands.map(band => {
            const pct = totalCapital > 0 ? (band.capitalLocked / totalCapital) * 100 : 0
            return (
              <div key={band.label} className="flex items-center gap-3">
                <div className="w-28 flex-shrink-0">
                  <p className={cn("text-xs font-semibold", band.color)}>{band.label}</p>
                  <p className="text-[10px] text-muted-foreground">{band.range}</p>
                </div>
                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                  <div
                    className={cn("h-full rounded-lg transition-all duration-500", band.bgColor)}
                    style={{ width: `${Math.max(pct, band.count > 0 ? 2 : 0)}%` }}
                  />
                  {band.count > 0 && (
                    <span className="absolute inset-0 flex items-center px-3 text-xs font-medium">
                      {band.count} vehicles · ${(band.capitalLocked / 1000).toFixed(0)}K
                    </span>
                  )}
                </div>
                <div className="w-20 text-right flex-shrink-0">
                  <p className={cn("text-xs font-semibold tabular-nums", band.avgMargin <= 0 ? "text-red-600" : "text-foreground")}>
                    ${band.avgMargin.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">avg margin</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
