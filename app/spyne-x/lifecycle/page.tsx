"use client"

import * as React from "react"
import {
  RiskTable, FiltersPanel, RiskViewToggle, CapitalOverviewBar, AgingHeatmap,
  CampaignActivationModal, CampaignPerformanceModal, RealMediaUpgradeModal, AddVehicleModal,
} from "@/components/inventory"
import { getMockVehicleDetail, mockCapitalOverview } from "@/lib/inventory-mocks"
import { getScenarioData } from "@/lib/demo-scenarios"
import { useScenario } from "@/lib/scenario-context"
import type { VehicleStage, DashboardFilters, CampaignActivation, RiskViewMode } from "@/services/inventory/inventory.types"
import { useVehicles } from "@/hooks/use-vehicles"
import { Layers, Plus, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LifecyclePage() {
  const { activeScenario } = useScenario()
  const scenarioData = React.useMemo(() => getScenarioData(activeScenario), [activeScenario])
  const { vehicles: apiVehicles, loading: apiLoading, error: apiError, refetch } = useVehicles({ page: 1, perPage: 50, query: "*" })
  const useApiData = activeScenario === "default" && apiVehicles.length > 0
  const vehicles = useApiData ? apiVehicles : scenarioData.vehicles
  const overview = useApiData
    ? { ...mockCapitalOverview, totalVehicles: apiVehicles.length, totalCapitalLocked: apiVehicles.reduce((s, v) => s + v.acquisitionCost, 0), totalDailyBurn: apiVehicles.reduce((s, v) => s + v.dailyBurn, 0), capitalAtRisk: apiVehicles.filter(v => v.stage === "risk" || v.stage === "critical").reduce((s, v) => s + v.acquisitionCost, 0), vehiclesInRisk: apiVehicles.filter(v => v.stage === "risk").length, vehiclesInCritical: apiVehicles.filter(v => v.stage === "critical").length }
    : scenarioData.overview
  const aging = scenarioData.aging

  const [filters, setFilters] = React.useState<DashboardFilters>({ stage: "all", campaignStatus: "all", mediaType: "all", search: "", sortBy: "marginRemaining", sortDir: "asc" })
  const [riskViewMode, setRiskViewMode] = React.useState<RiskViewMode>("capital")
  const [segmentView, setSegmentView] = React.useState<"stage" | "priceBand" | "source" | "mediaType">("stage")
  const [campaignModal, setCampaignModal] = React.useState<{ open: boolean; data: CampaignActivation | null; vehicleName?: string; stage?: VehicleStage; daysInStock?: number; dailyBurn?: number }>({ open: false, data: null })
  const [mediaUpgrade, setMediaUpgrade] = React.useState<{ open: boolean; vin: string | null }>({ open: false, vin: null })
  const [addVehicleOpen, setAddVehicleOpen] = React.useState(false)
  const [perfModal, setPerfModal] = React.useState<{ open: boolean; vehicleName?: string; daysActive?: number }>({ open: false })

  const handleAccelerate = (vin: string) => {
    const v = vehicles.find(x => x.vin === vin)
    if (!v) return
    setCampaignModal({ open: true, data: { vin, marginRemaining: v.marginRemaining, estimatedLeadLift: Math.round(Math.random() * 8 + 4), estimatedLeadLiftPercent: Math.round(Math.random() * 30 + 20), estimatedMarginProtection: Math.round(Math.max(0, v.marginRemaining) * 0.6), estimatedDaysSaved: Math.round(Math.random() * 6 + 3) }, vehicleName: `${v.year} ${v.make} ${v.model}`, stage: v.stage, daysInStock: v.daysInStock, dailyBurn: v.dailyBurn })
  }

  if (activeScenario === "default" && apiLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="space-y-0">
      <div className="border-b bg-white -mx-6 -mt-6 px-6 py-5 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white"><Layers className="h-5 w-5" /></div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Inventory Lifecycle</h1>
              <p className="text-sm text-muted-foreground">{overview.totalVehicles} vehicles · ${(overview.totalCapitalLocked / 1_000_000).toFixed(1)}M capital</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {apiError && <span className="text-xs text-amber-600 mr-2">Using cached data</span>}
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={refetch}><RefreshCw className="h-3 w-3" />Refresh</Button>
            <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setAddVehicleOpen(true)}><Plus className="h-3.5 w-3.5" />New Vehicle</Button>
          </div>
        </div>
      </div>
      <CapitalOverviewBar data={overview} />
      <div className="mt-6"><AgingHeatmap data={aging} activeStage={filters.stage} onStageClick={(s) => setFilters(f => ({ ...f, stage: s }))} totalVehicles={overview.totalVehicles} /></div>
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <FiltersPanel filters={filters} onFiltersChange={p => setFilters(f => ({ ...f, ...p }))} segmentView={segmentView} onSegmentViewChange={setSegmentView} />
          <RiskViewToggle value={riskViewMode} onChange={setRiskViewMode} />
        </div>
        <RiskTable vehicles={vehicles} filters={filters} onFiltersChange={p => setFilters(f => ({ ...f, ...p }))} onAccelerate={handleAccelerate} onViewPerformance={vin => { const v = vehicles.find(x => x.vin === vin); if (v) setPerfModal({ open: true, vehicleName: `${v.year} ${v.make} ${v.model}`, daysActive: Math.max(1, Math.min(v.daysInStock - 2, 12)) }) }} />
      </div>
      <CampaignActivationModal open={campaignModal.open} onOpenChange={o => setCampaignModal(s => ({ ...s, open: o }))} data={campaignModal.data} vehicleName={campaignModal.vehicleName} stage={campaignModal.stage} daysInStock={campaignModal.daysInStock} dailyBurn={campaignModal.dailyBurn} upsellMode={null} />
      <RealMediaUpgradeModal open={mediaUpgrade.open} onOpenChange={o => setMediaUpgrade(s => ({ ...s, open: o }))} vehicle={mediaUpgrade.vin ? getMockVehicleDetail(mediaUpgrade.vin) : null} />
      <CampaignPerformanceModal open={perfModal.open} onOpenChange={o => setPerfModal(s => ({ ...s, open: o }))} vehicleName={perfModal.vehicleName} channelType="both" daysActive={perfModal.daysActive} />
      <AddVehicleModal open={addVehicleOpen} onOpenChange={setAddVehicleOpen} onComplete={() => refetch()} />
    </div>
  )
}
