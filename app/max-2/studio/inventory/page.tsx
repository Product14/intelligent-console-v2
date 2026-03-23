"use client"

import * as React from "react"
import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import { VehicleMediaTable } from "@/components/max-2/studio/vehicle-media-table"
import {
  InventoryTabBar,
  InventoryFilterBar,
  applyFilters,
  defaultFilters,
  type InventoryFilters,
} from "@/components/max-2/studio/inventory-filters"

type VehicleType = "all" | "new" | "used"

export default function ActiveInventoryPage() {
  const [filters, setFilters] = React.useState<InventoryFilters>(defaultFilters)

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
    <div className="flex flex-col gap-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Active Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
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
