"use client"

import {
  CostCalculator,
  WhatItReallyCosts,
  BurnByAgeBucket,
  ROIPerDay,
  MonthlyTrend,
} from "@/components/spyne-max/holding-cost"

export default function HoldingCostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Holding Cost</h1>
        <p className="text-muted-foreground">
          What&rsquo;s it really costing me every day these cars sit?
        </p>
      </div>

      <CostCalculator />

      <WhatItReallyCosts />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BurnByAgeBucket />
        <ROIPerDay />
      </div>

      <MonthlyTrend />
    </div>
  )
}
