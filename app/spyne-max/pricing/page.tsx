"use client"

import {
  PricingTriangle,
  CostToMarketGrid,
  RepricingSchedule,
  PriceRankHistory,
} from "@/components/spyne-max/pricing"

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pricing</h1>
        <p className="text-muted-foreground">
          Am I priced to move, or priced to sit?
        </p>
      </div>

      <PricingTriangle />

      <CostToMarketGrid />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RepricingSchedule />
        <PriceRankHistory />
      </div>
    </div>
  )
}
