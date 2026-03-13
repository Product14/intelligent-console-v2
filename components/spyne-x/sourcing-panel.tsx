"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { VehicleSummary } from "@/services/inventory/inventory.types"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react"

interface CategoryInsight {
  category: string
  count: number
  avgDaysToSell: number
  target: number
  trend: "fast" | "normal" | "slow"
  recommendation: string
  avgMargin: number
}

function computeSourcingInsights(vehicles: VehicleSummary[]): CategoryInsight[] {
  const categories = new Map<string, VehicleSummary[]>()
  for (const v of vehicles) {
    const cat = v.model.includes("F-150") || v.model.includes("1500") ? "Truck"
      : v.model.includes("X3") || v.model.includes("Equinox") || v.model.includes("Tucson") || v.model.includes("Tiguan") || v.model.includes("Rogue") || v.model.includes("Sportage") || v.model.includes("Outback") || v.model.includes("Grand Cherokee") ? "SUV"
      : "Sedan"
    if (!categories.has(cat)) categories.set(cat, [])
    categories.get(cat)!.push(v)
  }

  const target = 24
  return Array.from(categories.entries()).map(([cat, vehs]) => {
    const avgDays = Math.round(vehs.reduce((s, v) => s + v.daysInStock, 0) / vehs.length)
    const avgMargin = Math.round(vehs.reduce((s, v) => s + v.marginRemaining, 0) / vehs.length)
    const trend: "fast" | "normal" | "slow" = avgDays <= target - 5 ? "fast" : avgDays <= target + 5 ? "normal" : "slow"
    const rec = trend === "fast" ? `Buy more ${cat}s — strong turnover`
      : trend === "slow" ? `Avoid ${cat}s — ${avgDays}d avg sell time`
      : `${cat} turnover within target`
    return { category: cat, count: vehs.length, avgDaysToSell: avgDays, target, trend, recommendation: rec, avgMargin }
  }).sort((a, b) => a.avgDaysToSell - b.avgDaysToSell)
}

interface SourcingPanelProps {
  vehicles: VehicleSummary[]
  compact?: boolean
}

export function SourcingPanel({ vehicles, compact = false }: SourcingPanelProps) {
  const insights = React.useMemo(() => computeSourcingInsights(vehicles), [vehicles])

  return (
    <div className={cn("rounded-xl border bg-white", compact ? "p-4" : "p-5")}>
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <h3 className={cn("font-bold tracking-tight", compact ? "text-sm" : "text-base")}>Sourcing Intelligence</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Turnover by category — buy/avoid recommendations based on Time-to-Sell data</p>

      <div className="space-y-3">
        {insights.map(ins => (
          <div key={ins.category} className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50/50">
            <div className={cn(
              "p-1.5 rounded-lg",
              ins.trend === "fast" ? "bg-emerald-100" : ins.trend === "slow" ? "bg-red-100" : "bg-gray-100"
            )}>
              {ins.trend === "fast" ? <TrendingUp className="h-4 w-4 text-emerald-600" />
               : ins.trend === "slow" ? <TrendingDown className="h-4 w-4 text-red-600" />
               : <CheckCircle2 className="h-4 w-4 text-gray-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{ins.category}</span>
                <span className="text-xs text-muted-foreground">· {ins.count} vehicles</span>
                <span className="text-xs text-muted-foreground">· avg margin ${ins.avgMargin.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{ins.recommendation}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className={cn(
                "text-lg font-bold tabular-nums",
                ins.trend === "fast" ? "text-emerald-600" : ins.trend === "slow" ? "text-red-600" : "text-foreground"
              )}>
                {ins.avgDaysToSell}d
              </span>
              <p className="text-[10px] text-muted-foreground">avg sell</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
