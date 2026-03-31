"use client"

import {
  LotKPIStrip,
  LotAgeAnalysis,
  LotActions,
  LotInsights,
  LotBodyAnalysis,
  LotVehicleTable,
  LotHoldingCostWidget,
} from "@/components/max-2/lot-view"

export default function LotViewPage() {
  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lot View</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Inventory control panel - aged stock, holding cost, and what to do
            today
          </p>
        </div>

        {/* Holding Cost dropdown widget */}
        <LotHoldingCostWidget />
      </div>

      {/* ── 1. KPI Strip ── */}
      <LotKPIStrip />

      {/* ── 2. Age Distribution + Actions (same row) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5">
        <LotAgeAnalysis />
        <LotActions />
      </div>

      {/* ── 3. Insights ── */}
      <LotInsights />

      {/* ── 4. Body Type Distribution + Holding Cost ── */}
      <LotBodyAnalysis />

      {/* ── 5. Full Inventory Table ── */}
      <LotVehicleTable />

    </div>
  )
}
