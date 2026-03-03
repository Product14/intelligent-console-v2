"use client"

import * as React from "react"
import { SourcingPanel } from "@/components/spyne-x"
import { getScenarioData } from "@/lib/demo-scenarios"
import { useScenario } from "@/lib/scenario-context"
import { useVehicles } from "@/hooks/use-vehicles"
import { BarChart3, Loader2, Lock, TrendingUp, MapPin, Target } from "lucide-react"

export default function SourcingPage() {
  const { activeScenario } = useScenario()
  const scenarioData = React.useMemo(() => getScenarioData(activeScenario), [activeScenario])
  const { vehicles: apiVehicles, loading } = useVehicles({ page: 1, perPage: 50, query: "*" })
  const vehicles = (activeScenario === "default" && apiVehicles.length > 0) ? apiVehicles : scenarioData.vehicles

  if (activeScenario === "default" && loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="space-y-0">
      <div className="border-b bg-white -mx-6 -mt-6 px-6 py-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white"><BarChart3 className="h-5 w-5" /></div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Sourcing Insights</h1>
            <p className="text-sm text-muted-foreground">Category performance & buy/avoid recommendations</p>
          </div>
        </div>
      </div>

      <SourcingPanel vehicles={vehicles} />

      {/* Future: Market demand by zip */}
      <div className="mt-6 rounded-xl border bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground/50" />
          <h3 className="text-sm font-bold text-muted-foreground/60">Coming Soon</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: MapPin, label: "Market Demand by Zip", desc: "See which categories are hot in your area" },
            { icon: TrendingUp, label: "Sourcing Recommendations", desc: "AI-powered buy/avoid signals from market data" },
            { icon: Target, label: "Competitor Pricing Intel", desc: "How your pricing compares to local competition" },
          ].map(item => (
            <div key={item.label} className="p-4 rounded-lg border bg-gray-50/30 opacity-50">
              <item.icon className="h-5 w-5 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-muted-foreground/60">{item.label}</p>
              <p className="text-xs text-muted-foreground/40 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
