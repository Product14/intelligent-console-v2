"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import { VehicleMediaTable } from "@/components/max-2/studio/vehicle-media-table"
import {
  InventoryFilterBar,
  applyFilters,
  defaultFilters,
  filtersFromSearchParams,
} from "@/components/max-2/studio/inventory-filters"

function InventoryContent() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = React.useState(() =>
    filtersFromSearchParams(searchParams)
  )

  const allVehicles = mockMerchandisingVehicles
  const filtered = applyFilters(allVehicles, filters)

  const tabCounts = {
    all: allVehicles.length,
    new: allVehicles.filter((v) => v.isNew).length,
    used: allVehicles.filter((v) => !v.isNew).length,
  }

  return (
    <div className="flex flex-col gap-6">
      <InventoryFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        allVehicles={allVehicles}
        tabCounts={tabCounts}
      />

      <VehicleMediaTable
        vehicles={filtered}
        title={`${filtered.length} vehicle${filtered.length !== 1 ? "s" : ""}`}
      />
    </div>
  )
}

export default function ActiveInventoryPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <p className="text-sm text-spyne-text-secondary">Loading inventory…</p>
        </div>
      }
    >
      <InventoryContent />
    </React.Suspense>
  )
}
