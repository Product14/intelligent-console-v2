"use client"

import { AddVehiclePage } from "@/components/max-2/studio/add-vehicle-page"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { max2Classes } from "@/lib/design-system/max-2"

export default function AddVehicleRoute() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-spyne-primary-soft flex items-center justify-center">
          <MaterialSymbol name="add" size={24} className="text-spyne-primary" />
        </div>
        <div>
          <h1 className={max2Classes.pageTitle}>Add New Vehicle</h1>
          <p className={max2Classes.pageDescription}>
            Choose how to add vehicles to your inventory.
          </p>
        </div>
      </div>

      <AddVehiclePage />
    </div>
  )
}
