"use client"

import * as React from "react"
import {
  CapitalOverviewBar,
  VelocityScore,
  DealerBenchmark,
  AgingHeatmap,
  OpportunityQueue,
  PrioritySidebar,
  RiskTable,
  FiltersPanel,
  CampaignActivationModal,
  CampaignPerformanceModal,
  RealMediaUpgradeModal,
  WelcomeFlow,
  BehavioralNudge,
  MarginAlerts,
  WebsiteScoreTile,
  ConversionFunnel,
  RiskViewToggle,
  AddVehicleModal,
  AIPageSummary,
  WelcomeBackBrief,
  UpsellBanner,
  UpsellModal,
} from "@/components/inventory"
import {
  getMockOpportunities,
  getMockVehicleDetail,
  mockWebsiteScore,
  mockConversionFunnel,
  mockCapitalOverview,
  mockAgingStages,
} from "@/lib/inventory-mocks"
import { getScenarioData } from "@/lib/demo-scenarios"
import { useScenario } from "@/lib/scenario-context"
import type {
  VehicleStage,
  DashboardFilters,
  CampaignActivation,
  SegmentView,
  RiskViewMode,
} from "@/services/inventory/inventory.types"
import { useVehicles } from "@/hooks/use-vehicles"
import { Gauge, RefreshCw, PackageOpen, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function InventoryDashboard() {
  const { activeScenario, scenarioConfig } = useScenario()

  const scenarioData = React.useMemo(
    () => getScenarioData(activeScenario),
    [activeScenario]
  )

  const { vehicles: apiVehicles, loading: apiLoading, error: apiError, refetch } = useVehicles({
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
        capitalAtRisk: apiVehicles
          .filter((v) => v.stage === "risk" || v.stage === "critical")
          .reduce((s, v) => s + v.acquisitionCost, 0),
        vehiclesInRisk: apiVehicles.filter((v) => v.stage === "risk").length,
        vehiclesInCritical: apiVehicles.filter((v) => v.stage === "critical").length,
      }
    : scenarioData.overview
  const aging = scenarioData.aging

  const [filters, setFilters] = React.useState<DashboardFilters>({
    stage: "all",
    campaignStatus: "all",
    mediaType: "all",
    search: "",
    sortBy: "marginRemaining",
    sortDir: "asc",
  })

  const [segmentView, setSegmentView] = React.useState<SegmentView>("stage")
  const [riskViewMode, setRiskViewMode] = React.useState<RiskViewMode>("capital")

  const [campaignModal, setCampaignModal] = React.useState<{
    open: boolean
    data: CampaignActivation | null
    vehicleName?: string
    stage?: VehicleStage
    daysInStock?: number
    dailyBurn?: number
  }>({ open: false, data: null })

  const [mediaUpgrade, setMediaUpgrade] = React.useState<{
    open: boolean
    vin: string | null
  }>({ open: false, vin: null })

  const [addVehicleOpen, setAddVehicleOpen] = React.useState(false)
  const [upsellModalOpen, setUpsellModalOpen] = React.useState(false)
  const [performanceModal, setPerformanceModal] = React.useState<{
    open: boolean
    vehicleName?: string
    daysActive?: number
  }>({ open: false })

  const [showWelcome, setShowWelcome] = React.useState(scenarioConfig.showWelcome)
  const [showBrief, setShowBrief] = React.useState(scenarioConfig.showBrief)
  const [showNudge, setShowNudge] = React.useState(scenarioConfig.showNudge)
  const [showAlerts, setShowAlerts] = React.useState(scenarioConfig.showAlerts)
  const upsellNudgeTypes = ["upsell-cloning-campaign", "upsell-vini-call", "upsell-real-media"] as const
  const [showUpsell, setShowUpsell] = React.useState(
    (upsellNudgeTypes as readonly string[]).includes(scenarioConfig.nudgeType)
  )

  const isUpsellScenario = (upsellNudgeTypes as readonly string[]).includes(scenarioConfig.nudgeType)

  React.useEffect(() => {
    setShowWelcome(scenarioConfig.showWelcome)
    setShowBrief(scenarioConfig.showBrief)
    setShowNudge(scenarioConfig.showNudge)
    setShowAlerts(scenarioConfig.showAlerts)
    setShowUpsell(
      (upsellNudgeTypes as readonly string[]).includes(scenarioConfig.nudgeType)
    )
  }, [scenarioConfig])

  const opportunities = React.useMemo(
    () => getMockOpportunities(vehicles),
    [vehicles]
  )

  const topRiskVehicles = React.useMemo(
    () => vehicles
      .filter((v) => v.stage === "critical" || v.stage === "risk")
      .sort((a, b) => a.marginRemaining - b.marginRemaining)
      .slice(0, 3),
    [vehicles]
  )

  const handleWelcomeComplete = () => {
    setShowWelcome(false)
  }

  const handleStageClick = (stage: VehicleStage | "all") => {
    setFilters((f) => ({ ...f, stage }))
  }

  const handleFiltersChange = (partial: Partial<DashboardFilters>) => {
    setFilters((f) => ({ ...f, ...partial }))
  }

  const handleUpgradeMedia = (vin: string) => {
    setMediaUpgrade({ open: true, vin })
  }

  const mediaUpgradeVehicle = mediaUpgrade.vin
    ? getMockVehicleDetail(mediaUpgrade.vin)
    : null

  const handleAccelerate = (vin: string) => {
    const vehicle = vehicles.find((v) => v.vin === vin)
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

  const isEmpty = vehicles.length === 0 && !(activeScenario === "default" && apiLoading)

  if (activeScenario === "default" && apiLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <div>
            <p className="text-sm font-medium">Loading inventory data...</p>
            <p className="text-xs text-muted-foreground mt-1">Fetching from /api/vehicles</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Welcome Flow (first-time users) */}
      <WelcomeFlow
        open={showWelcome}
        onComplete={handleWelcomeComplete}
        overview={overview}
        topRiskVehicles={topRiskVehicles}
      />

      {/* Welcome Back Brief (returning users) */}
      <WelcomeBackBrief
        open={showBrief && !showWelcome}
        onDismiss={() => setShowBrief(false)}
        vehicles={vehicles}
        overview={overview}
        onAccelerate={handleAccelerate}
      />

      <div className="space-y-0">
        {/* Page Header */}
        <div className="border-b bg-white -mx-6 -mt-6 px-6 py-5 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                  <Gauge className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Spyne Velocity</h1>
                  <p className="text-sm text-muted-foreground">
                    {isEmpty
                      ? "No vehicles in inventory"
                      : `${overview.totalVehicles} vehicles · $${(overview.totalCapitalLocked / 1_000_000).toFixed(1)}M capital deployed`
                    }
                  </p>
                </div>
              </div>
              {!isEmpty && <DealerBenchmark data={overview} />}
            </div>

            <div className="flex items-center gap-3">
              {!isEmpty && <VelocityScore data={overview} />}
              <div className="flex items-center gap-2.5 border-l pl-3">
                {apiError && (
                  <span className="text-xs text-amber-600 mr-2">Using cached data</span>
                )}
                <span className="text-xs text-muted-foreground">
                  Last sync: {new Date().toLocaleTimeString()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                  onClick={refetch}
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                  onClick={() => setAddVehicleOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Vehicle
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Upsell Banner for plan-limited scenarios */}
        {showUpsell && isUpsellScenario && (
          <UpsellBanner
            type={scenarioConfig.nudgeType as "upsell-cloning-campaign" | "upsell-vini-call" | "upsell-real-media"}
            onDismiss={() => setShowUpsell(false)}
            onUpgrade={() => setUpsellModalOpen(true)}
          />
        )}

        {/* ── Empty State ── */}
        {isEmpty ? (
          <div className="flex items-center justify-center min-h-[60vh] -mx-6 px-6">
            <div className="text-center max-w-md space-y-6">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                <PackageOpen className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Your Lot is Empty</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Add vehicles to your inventory to start tracking capital velocity,
                  margin depletion, and acceleration opportunities.
                </p>
              </div>
              <div className="p-5 rounded-xl bg-gray-50 border text-left space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Get started</p>
                <div className="space-y-2.5">
                  {[
                    { step: "1", text: "Add your first VIN to inventory" },
                    { step: "2", text: "AI Instant Media goes live in minutes" },
                    { step: "3", text: "Start monitoring capital and margin in real-time" },
                  ].map((s) => (
                    <div key={s.step} className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary">
                        {s.step}
                      </span>
                      <span className="text-sm">{s.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button className="h-11 px-6 gap-2" onClick={() => setAddVehicleOpen(true)}>
                <Plus className="h-4 w-4" />
                Add First Vehicle
              </Button>
            </div>
          </div>
        ) : (
          /* ── Dashboard Content — Main + Sidebar ── */
          <div className="flex -mx-6">
            {/* Main content */}
            <div className="flex-1 min-w-0 px-6 space-y-6">
              {/* AI Summary */}
              <AIPageSummary
                summary={`Your lot velocity is ${overview.velocityScore}/100 with $${(overview.totalDailyBurn).toLocaleString()}/day burn across ${overview.totalVehicles} vehicles. ${overview.vehiclesInCritical > 0 ? `${overview.vehiclesInCritical} critical vehicles are bleeding $${Math.round(overview.capitalAtRisk / 1000)}K in locked capital — ` : ""}${overview.vehiclesInRisk > 0 ? `${overview.vehiclesInRisk} risk-stage vehicles need campaign activation today to protect remaining margin.` : "Lot is in strong shape — focus on keeping watch vehicles from aging into risk."}`}
              />

              {/* Behavioral Nudge */}
              {showNudge && (
                <BehavioralNudge
                  type={scenarioConfig.nudgeType}
                  onDismiss={() => setShowNudge(false)}
                />
              )}

              {/* Capital Overview KPIs */}
              <CapitalOverviewBar data={overview} />

              {/* Website Score + Conversion Funnel */}
              <div className="grid grid-cols-[auto_1fr] gap-4">
                <WebsiteScoreTile data={mockWebsiteScore} />
                <ConversionFunnel data={mockConversionFunnel} />
              </div>

              {/* Aging Heatmap */}
              <AgingHeatmap
                data={aging}
                activeStage={filters.stage}
                onStageClick={handleStageClick}
                totalVehicles={overview.totalVehicles}
              />

              {/* Opportunity Queue — moved to PrioritySidebar */}

              {/* Filters + Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <FiltersPanel
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    segmentView={segmentView}
                    onSegmentViewChange={setSegmentView}
                  />
                  <RiskViewToggle value={riskViewMode} onChange={setRiskViewMode} />
                </div>
                <RiskTable
                  vehicles={vehicles}
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onAccelerate={handleAccelerate}
                  onViewPerformance={(vin) => {
                    const v = vehicles.find((veh) => veh.vin === vin)
                    if (v) {
                      setPerformanceModal({
                        open: true,
                        vehicleName: `${v.year} ${v.make} ${v.model}`,
                        daysActive: Math.max(1, Math.min(v.daysInStock - 2, 12)),
                      })
                    }
                  }}
                  upsellMode={isUpsellScenario ? scenarioConfig.nudgeType as "upsell-cloning-campaign" | "upsell-vini-call" | "upsell-real-media" : null}
                  onUpsell={() => setUpsellModalOpen(true)}
                />
              </div>
            </div>

            {/* Priority Sidebar — persistent right rail */}
            <div className="hidden xl:block w-72 flex-shrink-0 border-l bg-gray-50/50 p-5 sticky top-0 self-start max-h-screen overflow-y-auto space-y-6">
              <PrioritySidebar
                vehicles={vehicles}
                opportunities={opportunities}
                onAccelerate={handleAccelerate}
                onUpgradeMedia={handleUpgradeMedia}
              />
              {showAlerts && (
                <MarginAlerts onDismiss={() => setShowAlerts(false)} />
              )}
            </div>
          </div>
        )}

        {/* Campaign Activation Modal */}
        <CampaignActivationModal
          open={campaignModal.open}
          onOpenChange={(open) => setCampaignModal((s) => ({ ...s, open }))}
          data={campaignModal.data}
          vehicleName={campaignModal.vehicleName}
          stage={campaignModal.stage}
          daysInStock={campaignModal.daysInStock}
          dailyBurn={campaignModal.dailyBurn}
          upsellMode={isUpsellScenario ? scenarioConfig.nudgeType as "upsell-cloning-campaign" | "upsell-vini-call" | "upsell-real-media" : null}
        />

        {/* Real Media Upgrade Modal */}
        <RealMediaUpgradeModal
          open={mediaUpgrade.open}
          onOpenChange={(open) => setMediaUpgrade((s) => ({ ...s, open }))}
          vehicle={mediaUpgradeVehicle}
        />

        {/* Campaign Performance Modal */}
        <CampaignPerformanceModal
          open={performanceModal.open}
          onOpenChange={(open) => setPerformanceModal((s) => ({ ...s, open }))}
          vehicleName={performanceModal.vehicleName}
          channelType="both"
          daysActive={performanceModal.daysActive}
        />

        {/* Add Vehicle Modal */}
        <AddVehicleModal
          open={addVehicleOpen}
          onOpenChange={setAddVehicleOpen}
          onComplete={() => refetch()}
        />

        {/* Upsell Modal for plan-limited scenarios */}
        {isUpsellScenario && (
          <UpsellModal
            open={upsellModalOpen}
            onOpenChange={setUpsellModalOpen}
            type={scenarioConfig.nudgeType as "upsell-cloning-campaign" | "upsell-vini-call" | "upsell-real-media"}
          />
        )}
      </div>
    </>
  )
}
