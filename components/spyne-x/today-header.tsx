"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle, Target, TrendingDown, Zap, Timer, DollarSign } from "lucide-react"
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

  const capitalVelocity = vehicles.length > 0
    ? Math.round(vehicles.reduce((s, v) => s + v.acquisitionCost, 0) / 1000)
    : 0

  const totalDailyBurn = vehicles.reduce((s, v) => s + v.dailyBurn, 0)

  const now = new Date()
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening"
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  return (
    <div className="border-b bg-white -mx-6 -mt-6 px-6 pt-5 pb-5 mb-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{greeting}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{dateStr} · Spyne X Operating Console</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Anchor: Time to Sell */}
        <div className="col-span-1 rounded-xl border-2 border-foreground/10 bg-gray-50/50 p-4 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-foreground/20 via-foreground to-foreground/20" />
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Timer className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Time to Sell
            </p>
          </div>
          <div className="flex items-baseline gap-2 justify-center">
            <span className={cn(
              "text-4xl font-black tabular-nums tracking-tight",
              isAboveTarget ? "text-red-600" : "text-emerald-600"
            )}>
              {avgTimeToSell}
            </span>
            <span className="text-sm font-medium text-muted-foreground">days</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center mt-1.5">
            <Target className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">T-Max: {target}d</span>
            {gap !== 0 && (
              <span className={cn(
                "text-xs font-bold",
                isAboveTarget ? "text-red-600" : "text-emerald-600"
              )}>
                {isAboveTarget ? `+${gap}d breach` : `${Math.abs(gap)}d under`}
              </span>
            )}
          </div>
        </div>

        {/* Margin at Risk */}
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Margin at Risk
          </p>
          <div className="flex items-baseline gap-1 justify-center">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-2xl font-bold tabular-nums text-red-600">
              ${totalMarginAtRisk > 999 ? `${(totalMarginAtRisk / 1000).toFixed(1)}K` : totalMarginAtRisk.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {overview.vehiclesInRisk + overview.vehiclesInCritical} at-risk vehicles
          </p>
        </div>

        {/* Need Action */}
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Need Action
          </p>
          <div className="flex items-baseline gap-1 justify-center">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {vehiclesNeedingAction}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            of {overview.totalVehicles} total
          </p>
        </div>

        {/* Turnover Health */}
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
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
          <p className="text-[11px] text-muted-foreground mt-1">within target</p>
        </div>

        {/* Daily Burn */}
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Daily Burn
          </p>
          <div className="flex items-baseline gap-1 justify-center">
            <DollarSign className="h-4 w-4 text-amber-500" />
            <span className="text-2xl font-bold tabular-nums text-foreground">
              ${totalDailyBurn > 999 ? `${(totalDailyBurn / 1000).toFixed(1)}K` : totalDailyBurn.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">${capitalVelocity}K capital locked</p>
        </div>
      </div>
    </div>
  )
}
