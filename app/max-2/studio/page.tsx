"use client"

import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import { MerchandisingSummary } from "@/components/max-2/studio/merchandising-summary"
import { VehicleMediaTable } from "@/components/max-2/studio/vehicle-media-table"

export default function StudioPage() {
  const vehiclesNeedingAttention = mockMerchandisingVehicles
    .filter(
      (v) =>
        v.listingScore < 70 ||
        v.mediaStatus !== "real-photos" ||
        v.daysInStock >= 30 ||
        !v.hasDescription
    )
    .sort((a, b) => {
      if (a.mediaStatus === "no-photos" && b.mediaStatus !== "no-photos") return -1
      if (b.mediaStatus === "no-photos" && a.mediaStatus !== "no-photos") return 1
      return a.listingScore - b.listingScore
    })

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Merchandising Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Inventory health, media quality, and what needs your attention today.
        </p>
      </div>

      <MerchandisingSummary />

      <VehicleMediaTable
        vehicles={vehiclesNeedingAttention}
        title={`Vehicles Needing Attention (${vehiclesNeedingAttention.length})`}
      />
    </div>
  )
}
