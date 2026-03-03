"use client"

import * as React from "react"
import {
  TodayHeader,
  DailyTaskEngine,
  SignalBuckets,
  MobilePromotion,
  SourcingPanel,
} from "@/components/spyne-x"
import {
  CampaignActivationModal,
  RealMediaUpgradeModal,
  AddVehicleModal,
  WelcomeFlow,
  WelcomeBackBrief,
} from "@/components/inventory"
import {
  getMockVehicleDetail,
  mockCapitalOverview,
} from "@/lib/inventory-mocks"
import { getScenarioData } from "@/lib/demo-scenarios"
import { useScenario } from "@/lib/scenario-context"
import type { VehicleStage, CampaignActivation } from "@/services/inventory/inventory.types"
import { useVehicles } from "@/hooks/use-vehicles"
import { Loader2, PackageOpen, Plus } from "lucide-react"

export default function SpyneXToday() {
  const { activeScenario, scenarioConfig } = useScenario()

  const scenarioData = React.useMemo(() => getScenarioData(activeScenario), [activeScenario])

  const { vehicles: apiVehicles, loading: apiLoading, refetch } = useVehicles({
    page: 1,
    perPage: 50,
    query: "*",
  })

  const useApiData = activeScenario === "default" && apiVehicles.length > 0

  const vehicles = useApiData ? apiVehicles : scenarioData.vehicles
  const overview = useApiData
    ? {
        ...mockCapitalOverview,
        totalVehicles: apiVehicles.length,
        totalCapitalLocked: apiVehicles.reduce((s, v) => s + v.acquisitionCost, 0),
        totalDailyBurn: apiVehicles.reduce((s, v) => s + v.dailyBurn, 0),
        capitalAtRisk: apiVehicles.filter(v => v.stage === "risk" || v.stage === "critical").reduce((s, v) => s + v.acquisitionCost, 0),
        vehiclesInRisk: apiVehicles.filter(v => v.stage === "risk").length,
        vehiclesInCritical: apiVehicles.filter(v => v.stage === "critical").length,
      }
    : scenarioData.overview

  const [campaignModal, setCampaignModal] = React.useState<{
    open: boolean; data: CampaignActivation | null; vehicleName?: string; stage?: VehicleStage; daysInStock?: number; dailyBurn?: number
  }>({ open: false, data: null })

  const [mediaUpgrade, setMediaUpgrade] = React.useState<{ open: boolean; vin: string | null }>({ open: false, vin: null })
  const [addVehicleOpen, setAddVehicleOpen] = React.useState(false)
  const [showWelcome, setShowWelcome] = React.useState(scenarioConfig.showWelcome)
  const [showBrief, setShowBrief] = React.useState(scenarioConfig.showBrief)

  React.useEffect(() => {
    setShowWelcome(scenarioConfig.showWelcome)
    setShowBrief(scenarioConfig.showBrief)
  }, [scenarioConfig])

  const topRiskVehicles = React.useMemo(
    () => vehicles.filter(v => v.stage === "critical" || v.stage === "risk").sort((a, b) => a.marginRemaining - b.marginRemaining).slice(0, 3),
    [vehicles]
  )

  const handleAccelerate = (vin: string) => {
    const vehicle = vehicles.find(v => v.vin === vin)
    if (!vehicle) return
    setCampaignModal({
      open: true,
      data: {
        vin,
        marginRemaining: vehicle.marginRemaining,
        estimatedLeadLift: Math.round(Math.random() * 8 + 4),
        estimatedLeadLiftPercent: Math.round(Math.random() * 30 + 20),
        estimatedMarginProtection: Math.round(Math.max(0, vehicle.marginRemaining) * 0.6),
        estimatedDaysSaved: Math.round(Math.random() * 6 + 3),
      },
      vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      stage: vehicle.stage,
      daysInStock: vehicle.daysInStock,
      dailyBurn: vehicle.dailyBurn,
    })
  }

  const handleUpgradeMedia = (vin: string) => {
    setMediaUpgrade({ open: true, vin })
  }

  const mediaUpgradeVehicle = mediaUpgrade.vin ? getMockVehicleDetail(mediaUpgrade.vin) : null

  if (activeScenario === "default" && apiLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm font-medium">Loading operating data...</p>
        </div>
      </div>
    )
  }

  const isEmpty = vehicles.length === 0

  return (
    <>
      <WelcomeFlow open={showWelcome} onComplete={() => setShowWelcome(false)} overview={overview} topRiskVehicles={topRiskVehicles} />
      <WelcomeBackBrief open={showBrief && !showWelcome} onDismiss={() => setShowBrief(false)} vehicles={vehicles} overview={overview} onAccelerate={handleAccelerate} />

      <div className="space-y-0">
        <TodayHeader overview={overview} vehicles={vehicles} />

        {isEmpty ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center max-w-md space-y-5">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <PackageOpen className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight">No Vehicles Yet</h2>
                <p className="text-sm text-muted-foreground">Add vehicles to activate the Time-to-Sell operating system.</p>
              </div>
              <button onClick={() => setAddVehicleOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors">
                <Plus className="h-4 w-4" />
                Add First Vehicle
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <DailyTaskEngine vehicles={vehicles} onAccelerate={handleAccelerate} onUpgradeMedia={handleUpgradeMedia} />
            <SignalBuckets vehicles={vehicles} onAccelerate={handleAccelerate} onUpgradeMedia={handleUpgradeMedia} />
            <SourcingPanel vehicles={vehicles} compact />
            <MobilePromotion />
          </div>
        )}

        <CampaignActivationModal
          open={campaignModal.open}
          onOpenChange={open => setCampaignModal(s => ({ ...s, open }))}
          data={campaignModal.data}
          vehicleName={campaignModal.vehicleName}
          stage={campaignModal.stage}
          daysInStock={campaignModal.daysInStock}
          dailyBurn={campaignModal.dailyBurn}
          upsellMode={null}
        />
        <RealMediaUpgradeModal
          open={mediaUpgrade.open}
          onOpenChange={open => setMediaUpgrade(s => ({ ...s, open }))}
          vehicle={mediaUpgradeVehicle}
        />
        <AddVehicleModal open={addVehicleOpen} onOpenChange={setAddVehicleOpen} onComplete={() => refetch()} />
      </div>
    </>
  )
}
