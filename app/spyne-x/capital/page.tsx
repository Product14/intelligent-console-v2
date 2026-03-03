"use client"

import * as React from "react"
import { CapitalOverviewBar } from "@/components/inventory"
import { SourcingPanel } from "@/components/spyne-x"
import { mockCapitalOverview } from "@/lib/inventory-mocks"
import { getScenarioData } from "@/lib/demo-scenarios"
import { useScenario } from "@/lib/scenario-context"
import { useVehicles } from "@/hooks/use-vehicles"
import { DollarSign, Loader2, TrendingDown, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CapitalPage() {
  const { activeScenario } = useScenario()
  const scenarioData = React.useMemo(() => getScenarioData(activeScenario), [activeScenario])
  const { vehicles: apiVehicles, loading } = useVehicles({ page: 1, perPage: 50, query: "*" })
  const useApi = activeScenario === "default" && apiVehicles.length > 0
  const vehicles = useApi ? apiVehicles : scenarioData.vehicles
  const overview = useApi
    ? { ...mockCapitalOverview, totalVehicles: apiVehicles.length, totalCapitalLocked: apiVehicles.reduce((s, v) => s + v.acquisitionCost, 0), totalDailyBurn: apiVehicles.reduce((s, v) => s + v.dailyBurn, 0), capitalAtRisk: apiVehicles.filter(v => v.stage === "risk" || v.stage === "critical").reduce((s, v) => s + v.acquisitionCost, 0), vehiclesInRisk: apiVehicles.filter(v => v.stage === "risk").length, vehiclesInCritical: apiVehicles.filter(v => v.stage === "critical").length }
    : scenarioData.overview

  if (activeScenario === "default" && loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  const dailyBurnRate = overview.totalDailyBurn
  const totalLocked = overview.totalCapitalLocked
  const avgTurnover = vehicles.length > 0 ? Math.round(vehicles.reduce((s, v) => s + v.daysInStock, 0) / vehicles.length) : 0
  const deadCapital = vehicles.filter(v => v.marginRemaining <= 0).reduce((s, v) => s + v.acquisitionCost, 0)

  return (
    <div className="space-y-0">
      <div className="border-b bg-white -mx-6 -mt-6 px-6 py-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white"><DollarSign className="h-5 w-5" /></div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Capital & Turnover</h1>
            <p className="text-sm text-muted-foreground">${(totalLocked / 1_000_000).toFixed(1)}M deployed · ${dailyBurnRate.toLocaleString()}/day burn</p>
          </div>
        </div>
      </div>

      <CapitalOverviewBar data={overview} />

      {/* Capital velocity cards */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Avg. Turnover</p>
          </div>
          <span className={cn("text-3xl font-extrabold tabular-nums", avgTurnover > overview.marketBenchmarkDaysToLive ? "text-red-600" : "text-emerald-600")}>{avgTurnover}</span>
          <span className="text-sm text-muted-foreground ml-1">days</span>
          <p className="text-xs text-muted-foreground mt-1">Target: {overview.marketBenchmarkDaysToLive}d</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Daily Burn</p>
          </div>
          <span className="text-3xl font-extrabold tabular-nums text-foreground">${dailyBurnRate.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground ml-1">/day</span>
          <p className="text-xs text-muted-foreground mt-1">across {overview.totalVehicles} vehicles</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Dead Capital</p>
          </div>
          <span className="text-3xl font-extrabold tabular-nums text-red-600">${deadCapital > 999 ? `${(deadCapital / 1000).toFixed(0)}K` : deadCapital.toLocaleString()}</span>
          <p className="text-xs text-muted-foreground mt-1">locked in margin-depleted vehicles</p>
        </div>
      </div>

      <div className="mt-6">
        <SourcingPanel vehicles={vehicles} />
      </div>
    </div>
  )
}
