"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import { VehicleMediaTable } from "@/components/max-2/studio/vehicle-media-table"
import {
  InventoryTabBar,
  InventoryFilterBar,
  applyFilters,
  defaultFilters,
  filtersFromSearchParams,
  type InventoryFilters,
} from "@/components/max-2/studio/inventory-filters"
import { max2Classes } from "@/lib/design-system/max-2"

type VehicleType = "all" | "new" | "used"

function InventoryContent() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = React.useState<InventoryFilters>(() =>
    filtersFromSearchParams(searchParams)
  )

  const handleTypeChange = (t: VehicleType) => {
    setFilters((prev) => ({ ...prev, vehicleType: t }))
  }

  const allVehicles = mockMerchandisingVehicles
  const filtered = applyFilters(allVehicles, filters)

  const counts = {
    all: allVehicles.length,
    new: allVehicles.filter((v) => v.isNew).length,
    used: allVehicles.filter((v) => !v.isNew).length,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={max2Classes.pageTitle}>Active Inventory</h1>
          <p className={max2Classes.pageDescription}>
            Browse, filter, and manage all vehicles.
          </p>
        </div>
        <InventoryTabBar
          activeType={filters.vehicleType}
          onTypeChange={handleTypeChange}
          counts={counts}
        />
      </div>

      <InventoryFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        allVehicles={allVehicles}
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
    <React.Suspense fallback={<div className="flex flex-col gap-4"><p className="text-sm text-muted-foreground">Loading inventory…</p></div>}>
      <InventoryContent />
    </React.Suspense>
  )
}
