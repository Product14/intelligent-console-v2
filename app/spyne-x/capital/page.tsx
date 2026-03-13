"use client"

import * as React from "react"
import { CapitalOverviewBar, CampaignActivationModal } from "@/components/inventory"
import { CapitalMetrics, SourcingPanel, WholesaleAdvisor } from "@/components/spyne-x"
import { mockCapitalOverview } from "@/lib/inventory-mocks"
import { getScenarioData } from "@/lib/demo-scenarios"
import { useScenario } from "@/lib/scenario-context"
import { useVehicles } from "@/hooks/use-vehicles"
import type { VehicleStage, CampaignActivation } from "@/services/inventory/inventory.types"
import { DollarSign, Loader2 } from "lucide-react"

export default function CapitalPage() {
  const { activeScenario } = useScenario()
  const scenarioData = React.useMemo(() => getScenarioData(activeScenario), [activeScenario])
  const { vehicles: apiVehicles, loading } = useVehicles({ page: 1, perPage: 50, query: "*" })
  const useApi = activeScenario === "default" && apiVehicles.length > 0
  const vehicles = useApi ? apiVehicles : scenarioData.vehicles
  const overview = useApi
    ? { ...mockCapitalOverview, totalVehicles: apiVehicles.length, totalCapitalLocked: apiVehicles.reduce((s, v) => s + v.acquisitionCost, 0), totalDailyBurn: apiVehicles.reduce((s, v) => s + v.dailyBurn, 0), capitalAtRisk: apiVehicles.filter(v => v.stage === "risk" || v.stage === "critical").reduce((s, v) => s + v.acquisitionCost, 0), vehiclesInRisk: apiVehicles.filter(v => v.stage === "risk").length, vehiclesInCritical: apiVehicles.filter(v => v.stage === "critical").length }
    : scenarioData.overview

  const [campaignModal, setCampaignModal] = React.useState<{ open: boolean; data: CampaignActivation | null; vehicleName?: string; stage?: VehicleStage; daysInStock?: number; dailyBurn?: number }>({ open: false, data: null })

  const handleAccelerate = (vin: string) => {
    const v = vehicles.find(x => x.vin === vin)
    if (!v) return
    setCampaignModal({ open: true, data: { vin, marginRemaining: v.marginRemaining, estimatedLeadLift: Math.round(Math.random() * 8 + 4), estimatedLeadLiftPercent: Math.round(Math.random() * 30 + 20), estimatedMarginProtection: Math.round(Math.max(0, v.marginRemaining) * 0.6), estimatedDaysSaved: Math.round(Math.random() * 6 + 3) }, vehicleName: `${v.year} ${v.make} ${v.model}`, stage: v.stage, daysInStock: v.daysInStock, dailyBurn: v.dailyBurn })
  }

  if (activeScenario === "default" && loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  const totalLocked = overview.totalCapitalLocked
  const dailyBurnRate = overview.totalDailyBurn

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

      <div className="mt-6">
        <CapitalMetrics vehicles={vehicles} overview={overview} />
      </div>

      <div className="mt-6">
        <WholesaleAdvisor vehicles={vehicles} onAccelerate={handleAccelerate} />
      </div>

      <div className="mt-6">
        <SourcingPanel vehicles={vehicles} />
      </div>

      <CampaignActivationModal open={campaignModal.open} onOpenChange={o => setCampaignModal(s => ({ ...s, open: o }))} data={campaignModal.data} vehicleName={campaignModal.vehicleName} stage={campaignModal.stage} daysInStock={campaignModal.daysInStock} dailyBurn={campaignModal.dailyBurn} upsellMode={null} />
    </div>
  )
}
