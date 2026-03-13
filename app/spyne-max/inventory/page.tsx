"use client"

import {
  LotView,
  SegmentMix,
  BuyingStrategy,
} from "@/components/spyne-max/inventory"

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          What&apos;s on my lot and what needs attention?
        </p>
      </div>

      <LotView />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SegmentMix />
        <BuyingStrategy />
      </div>
    </div>
  )
}
