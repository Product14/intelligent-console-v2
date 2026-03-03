"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle, Target, TrendingDown, Zap } from "lucide-react"
import type { CapitalOverview, VehicleSummary } from "@/services/inventory/inventory.types"

interface TodayHeaderProps {
  overview: CapitalOverview
  vehicles: VehicleSummary[]
}

export function TodayHeader({ overview, vehicles }: TodayHeaderProps) {
  const avgTimeToSell = vehicles.length > 0
    ? Math.round(vehicles.reduce((s, v) => s + v.daysInStock, 0) / vehicles.length)
    : 0
  const target = overview.marketBenchmarkDaysToLive
  const isAboveTarget = avgTimeToSell > target
  const gap = avgTimeToSell - target

  const vehiclesNeedingAction = vehicles.filter(v =>
    v.stage === "risk" || v.stage === "critical" ||
    (v.leads === 0 && v.daysInStock >= 5) ||
    (v.marginRemaining > 0 && v.marginRemaining / v.dailyBurn <= 5)
  ).length

  const totalMarginAtRisk = vehicles
    .filter(v => v.stage === "risk" || v.stage === "critical")
    .reduce((s, v) => s + Math.max(0, v.marginRemaining), 0)

  const turnoverRate = vehicles.length > 0
    ? Math.round((vehicles.filter(v => v.daysInStock <= target).length / vehicles.length) * 100)
    : 0

  const now = new Date()
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening"
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  return (
    <div className="border-b bg-white -mx-6 -mt-6 px-6 py-6 mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{greeting}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{dateStr} · Spyne X Operating Console</p>
        </div>

        <div className="flex items-center gap-6">
          {/* Anchor: Time to Sell */}
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Avg. Time to Sell
            </p>
            <div className="flex items-baseline gap-2 justify-center">
              <span className={cn(
                "text-3xl font-extrabold tabular-nums tracking-tight",
                isAboveTarget ? "text-red-600" : "text-emerald-600"
              )}>
                {avgTimeToSell}
              </span>
              <span className="text-sm font-medium text-muted-foreground">days</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center mt-1">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">T-Max: {target}d</span>
              {gap !== 0 && (
                <span className={cn(
                  "text-xs font-semibold",
                  isAboveTarget ? "text-red-600" : "text-emerald-600"
                )}>
                  {isAboveTarget ? `+${gap}d breach` : `${Math.abs(gap)}d under`}
                </span>
              )}
            </div>
          </div>

          <div className="h-12 w-px bg-gray-200" />

          {/* Margin at Risk */}
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Margin at Risk
            </p>
            <div className="flex items-baseline gap-1 justify-center">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold tabular-nums text-red-600">
                ${totalMarginAtRisk > 999 ? `${(totalMarginAtRisk / 1000).toFixed(1)}K` : totalMarginAtRisk.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {overview.vehiclesInRisk + overview.vehiclesInCritical} at-risk vehicles
            </p>
          </div>

          <div className="h-12 w-px bg-gray-200" />

          {/* Need Action */}
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Need Action
            </p>
            <div className="flex items-baseline gap-1 justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-2xl font-bold tabular-nums text-foreground">
                {vehiclesNeedingAction}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              of {overview.totalVehicles} total
            </p>
          </div>

          <div className="h-12 w-px bg-gray-200" />

          {/* Turnover Health */}
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Turnover Health
            </p>
            <div className="flex items-baseline gap-1 justify-center">
              <Zap className={cn("h-4 w-4", turnoverRate >= 70 ? "text-emerald-500" : turnoverRate >= 50 ? "text-amber-500" : "text-red-500")} />
              <span className={cn(
                "text-2xl font-bold tabular-nums",
                turnoverRate >= 70 ? "text-emerald-600" : turnoverRate >= 50 ? "text-amber-600" : "text-red-600"
              )}>
                {turnoverRate}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">within target</p>
          </div>
        </div>
      </div>
    </div>
  )
}
