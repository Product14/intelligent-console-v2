"use client"

import {
  LotSummary,
  LotVehicleTable,
  AgingDistribution,
} from "@/components/max-2/lot-view"

export default function LotViewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lot View</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Full inventory at a glance — every unit, every status, every number
        </p>
      </div>

      <LotSummary />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <AgingDistribution />
        </div>
      </div>

      <LotVehicleTable />
    </div>
  )
}
